import { User, UserRecord } from "@entities/user/user";
import { ServeContext, Logger, doesModuleExist, gql } from "@skulpture/serve";

export default function setUser(context: ServeContext) {
	doesModuleExist(context, "Logger", "User");

	const Logger: Logger = context.get("Logger");
	const User: User = context.get("User");

	const updateUser = buildUpdateUser({ User });

	return {
		definition: "createUser(name: String!): Boolean!",
		types: gql`
			input UserUpdateInput {
				uuid: ID!
				password: String
				email: String
			}
		`,
		resolve: {
			createUser: async (_: any, { user }: SetUserArguments) => {
				try {
					return await updateUser({ uuid: user.uuid }, user);
				} catch (error: any) {
					Logger.error(error.message);

					return false;
				}
			},
		},
	};
}

interface SetUserArguments {
	user: Partial<UserRecord>;
}
