import bcrypt from "bcryptjs";
import { Hasher as UserHasher } from "../../../entities/user/user";

const Hasher: UserHasher & RouteHasher = {
	hash: async (value: string) => {
		return new Promise((resolve, reject) => {
			return bcrypt.hash(value, 12, (err, hash) => {
				if (err) return reject(err);

				return resolve(hash);
			});
		});
	},
	verify: async (value: string, hash: string) => {
		return new Promise((resolve, reject) => {
			return bcrypt.compare(value, hash, (err, res) => {
				if (err) return reject(false);

				return resolve(res);
			});
		});
	},
};

export default Hasher;

interface RouteHasher {
	verify: (value: string, hash: string) => Promise<boolean>;
}
