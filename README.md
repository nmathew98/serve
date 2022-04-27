![Tests](https://github.com/nmathew98/serve/actions/workflows/main.yml/badge.svg)

## About

A lightweight starting point for API applications.
It uses SWC under the hood for super fast build times and test times.

## Background information

The whole idea is around a standard design pattern and a standard directory structure.

The standard directory structure is as follows:

- Entities are placed in `src/entities`
- Adapters are placed in `src/external/adapters`
- Routes are placed in `src/external/routes`

The standard design pattern is as follows:

- Adapters are the packages used by the entity objects.
  Entity objects define the interface and the adapters adhere to them.

- Adapters must be a default export of the constant object that wraps around the package being used.
  Multiword adapter names like `Test Adapter` should be stored in `examples/adapters/test-adapter/test-adapter.ts`.

- Entities must have a default function export which returns a function.
  Multiword entity names like `Test Entity` will have the key `TestEntity` (the file this corresponds to would be `examples/entities/test-entity/test-entity.ts`).

- All routes must adhere to the `Route` interface.

  The top level function accepts an object of the adapters used by the entity. The returned function accepts a configuration object to configure the entity.

- The default function export must be named in the format `buildMake${entity}` where `entity` is its key (the entity `User` would have `entity` be equal to `User`).

- To use an entity in a route, get it from the context, the entity in `examples/entities/user/user.ts` will have the key `User` in the context.

- To set the configuration of an entity, set it in the context, the configuration must be an `object` and it must map to the key `configuration:entity:${entity}` where `entity` is its key.

- Add your mutations, queries, subscriptions and types to `examples/external/routes/api/mutations`, `examples/external/routes/api/queries`, `examples/external/routes/api/subscriptions` and `examples/external/routes/api/types` respectively.

  Each GraphQL query, mutation, type or subscription must be in a folder with the same name as the file within it with a default function export.

  Queries must adhere to the `GraphQLQueryHandler` type, mutations `GraphQLMutationHandler`, subscriptions `GraphQLSubscriptionHandler` and types `GraphQLTypeHandler`.

No need to worry about the initializations of the entities, adapters or routes. This is all done automatically!

## Usage (in a nutshell)

- Built around the hexagonal architecture.

  There are three main layers to all this (going from inside out): entities -> app -> external. Inner layers are not allowed to reach the outer layers.
  So, entities cannot have package imports, they contain the pure business rules.

  Application layers contain the application specific business rules (something like create a user). The external layer is where the adapters (and routes) belong, they allow for package imports.

- Entity objects should not be used directly.

  Instead, get them from the context and inject them into the desired use case. For example, see `examples/external/routes/api/queries/test-query/test-query.ts`

- Uses GraphQL to process requests, see `examples/routes/api` to see examples of mutations, queries, subscriptions and types.

- Any mutation, query, subscription or type will be loaded automatically.

  Just add them in a folder with a file in it with the same name. See `examples/external/routes/api/mutations/test-mutation/test-mutation.ts` for an example.

- Adding a new route is simple, add a folder under `examples/external/routes` with the name of the route and within it a file of the same name.

  In the file export a default constant that is of type `Route` (see `examples/external/routes/api/api.ts` and how the `api` route is structured for an example).

- The directory structures and filenames are very important.

## Building and testing

- To build the project run `npx @skulpture/serve build`
- To run Jest, run `npx @skulpture/serve jest --config`, where `--config` are any additional options you'd like to pass to Jest

## Planned functionality for next major release

- Dynamically generated TypeScript definition files for application use cases
- Dynamically generated TypeScript definition files for adapters
- Auto import application use cases
