import { Uuid as UserUuid } from "@entities/user/user";
import { v4 as uuidv4 } from "uuid";

const Uuid: UserUuid = {
	get: () => uuidv4(),
};

export default Uuid;
