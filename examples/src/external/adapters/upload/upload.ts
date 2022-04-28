import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	PutObjectRequest,
	GetObjectCommand,
} from "@aws-sdk/client-s3";
import {
	H3,
	RouteError,
	Upload,
	useProduction,
	Winston,
} from "@skulpture/serve";
import busboy from "busboy";
import crypto from "crypto";
import { Readable } from "stream";

const s3Region = process.env.S3_REGION;
const s3AccessKey = useProduction(
	process.env.S3_ACCESS_PROD as string,
	process.env.S3_ACCESS_DEV as string,
);
const s3SecretAccessKey = useProduction(
	process.env.S3_SECRET_PROD as string,
	process.env.S3_SECRET_DEV as string,
);

const s3 = new S3Client({
	region: s3Region,
	credentials: {
		accessKeyId: s3AccessKey,
		secretAccessKey: s3SecretAccessKey,
	},
});

const Bucket = useProduction(
	process.env.S3_BUCKET_PROD as string,
	process.env.S3_BUCKET_DEV as string,
);

const Upload: Upload = {
	handle: request => {
		return new Promise((resolve, reject) => {
			const identifiers: Record<string, string> = Object.create(null);
			const uploadedFile: {
				filename: string;
				mimetype: string;
				encoding: BufferEncoding;
				data: Buffer;
			} = Object.create(null);

			const bb = busboy({ headers: request.headers });

			bb.on("file", (name, file, info) => {
				if (name !== "file") return;

				const { filename, encoding, mimeType } = info;

				uploadedFile.filename = filename;
				uploadedFile.encoding = encoding as BufferEncoding;
				uploadedFile.mimetype = mimeType.toLowerCase();

				let buffer: Buffer;
				file
					.on("data", data => {
						if (!buffer) buffer = data;
						else buffer = Buffer.concat([buffer, data]);
					})
					.on("close", () => {
						uploadedFile.data = buffer;
					});
			});

			bb.on("field", (name, value) => {
				identifiers[name] = value;
			});

			bb.on("close", () => {
				if (!identifiers.folder) return reject("Folder not specified");
				if (!identifiers.uuid) return reject("Uuid not specified");

				if (identifiers.folder !== "puzzles") reject("Invalid folder");

				const sizeOfUploadedFile = Buffer.byteLength(
					uploadedFile.data,
					uploadedFile.encoding,
				);

				const maximumFileSize = 1 * Math.pow(10, 6);

				if (sizeOfUploadedFile > maximumFileSize)
					return reject("Maximum file size is 1 MB");

				const acceptedMimetypes = ["text/plain"];

				if (!acceptedMimetypes.includes(uploadedFile.mimetype))
					return reject("Invalid file type");

				const md5 = crypto
					.createHash("md5")
					.update(uploadedFile.data)
					.digest("base64");

				const filename = `${identifiers.uuid}-${Date.now()}`;
				const parameters: PutObjectRequest = {
					Bucket,
					Key: `${identifiers.folder}/${filename}`,
					Body: uploadedFile.data,
					ContentMD5: md5,
					ContentType: uploadedFile.mimetype,
					ContentEncoding: uploadedFile.encoding,
				};

				return s3
					.send(new PutObjectCommand(parameters))
					.then(() =>
						resolve({
							upload: getFileUrl(identifiers.folder as string, filename),
						}),
					)
					.catch((error: any) => {
						Winston.error(error.message);
					});
			});

			request.pipe(bb);
		});
	},
	remove: async request => {
		const body = await H3.useBody(request);

		if (typeof body !== "object") throw new Error("Invalid request");

		if (!body.folder || !body.filename)
			throw new Error("Required field(s) not specified");

		return s3.send(
			new DeleteObjectCommand({
				Bucket,
				Key: `${body.folder}/${body.filename}`,
			}),
		);
	},
	stream: async (request, response) => {
		const parameters = request.context.params;

		if (!parameters.folder || !parameters.file)
			throw new RouteError("Invalid request", 500);

		const result = await s3.send(
			new GetObjectCommand({
				Key: `${parameters.folder}/${parameters.file}`,
				Bucket,
			}),
		);

		response.setHeader("Content-Encoding", result.ContentEncoding || "utf-8");
		response.setHeader("Content-Type", result.ContentType as string);

		return result.Body as unknown as Readable;
	},
};

export default Upload;

function getFileUrl(folder: string, filename: string) {
	const productionServerBase = process.env.PROD_SERVER_BASE as string;
	const fileBase = useProduction(
		`${productionServerBase}/storage`,
		"http://localhost:4000/storage",
	);

	return `${fileBase}/files/${folder}/${filename}`;
}

declare global {
	type ReadableStream = unknown;
}
