import { doesModuleExist, gql, ServeContext } from "@skulpture/serve";
import { User } from "@entities/user/user";

export default function whoami(context: ServeContext) {
	doesModuleExist(context, "User");

	const User: User = context.get("User");

	const findUser = buildFindUser({ User });

	return {
		definition: "whoami(uuid: ID!): UserDetails!",
		types: gql`
			type UserDetails {
				uuid: ID!
				email: String!
				password: String!
				puzzle: String!
			}
		`,
		resolve: {
			whoami: async (_: any, { uuid }: WhoAmIArguments) =>
				(await findUser({ uuid }))?.pop(),
		},
	};
}

interface WhoAmIArguments {
	uuid: string;
}
