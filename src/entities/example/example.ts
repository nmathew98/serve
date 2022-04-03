export interface Database {
	find: () => void;
	create: () => void;
	delete: () => void;
}

export interface Cache {
	set: () => void;
	get: () => void;
}

export interface Example {
	print: (x: string) => void;
	hello: (x: string) => void;
	world: (x: string) => void;
}

export default function buildMakeExample({
	Database,
	Cache,
}: {
	Database: Database;
	Cache: Cache;
}) {
	return function makeExample(configuration: Record<string, any>): Example {
		return Object.freeze({
			print: x => {
				Database.create();
				return;
			},
			hello: x => {
				return;
			},
			world: x => {
				return;
			},
		});
	};
}
