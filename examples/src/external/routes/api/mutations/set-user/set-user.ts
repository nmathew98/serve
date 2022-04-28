import { User, UserRecord } from "../../../../../entities/user/user";
import { ServeContext, Logger, doesModuleExist } from "@skulpture/serve";
import {
	GraphQLBoolean,
	GraphQLID,
	GraphQLInputObjectType,
	GraphQLNonNull,
	GraphQLString,
} from "graphql";

export default function setUser(context: ServeContext) {
	doesModuleExist(context, "Logger", "User");

	const Logger: Logger = context.get("Logger");
	const User: User = context.get("User");

	const updateUser = buildUpdateUser({ User });

	return Object.freeze({
		setUser: {
			type: GraphQLBoolean,
			args: {
				user: {
					type: UserUpdateInput,
				},
			},
			resolve: async (_: any, { user }: SetUserArguments) => {
				try {
					return await updateUser({ uuid: user.uuid }, user);
				} catch (error: any) {
					Logger.error(error.message);

					return false;
				}
			},
		},
	});
}

interface SetUserArguments {
	user: Partial<UserRecord>;
}

const UserUpdateInput = new GraphQLInputObjectType({
	name: "UserUpdateInput",
	description: "User update input",
	fields: () => ({
		uuid: {
			type: new GraphQLNonNull(GraphQLID),
		},
		password: {
			type: GraphQLString,
		},
		email: {
			type: GraphQLString,
		},
	}),
});
