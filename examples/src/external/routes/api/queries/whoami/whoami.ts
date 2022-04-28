import { doesModuleExist, ServeContext } from "@skulpture/serve";
import {
	GraphQLID,
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLString,
} from "graphql";
import { User } from "../../../../../entities/user/user";

export default function whoami(context: ServeContext) {
	doesModuleExist(context, "User");

	const User: User = context.get("User");

	const findUser = buildFindUser({ User });

	return Object.freeze({
		whoami: {
			type: new GraphQLNonNull(UserDetails),
			args: {
				uuid: {
					type: new GraphQLNonNull(GraphQLID),
					description: "The user's uuid",
				},
			},
			resolve: async (_: any, { uuid }: WhoAmIArguments) =>
				(await findUser({ uuid }))?.pop(),
		},
	});
}

interface WhoAmIArguments {
	uuid: string;
}

const UserDetails = new GraphQLObjectType({
	name: "UserDetails",
	description: "A user record",
	fields: () => ({
		uuid: {
			type: new GraphQLNonNull(GraphQLID),
			description: "The uuid of the user",
		},
		email: {
			type: new GraphQLNonNull(GraphQLString),
			description: "The user's email",
		},
		password: {
			type: new GraphQLNonNull(GraphQLString),
			description: "The user's password",
		},
	}),
});
