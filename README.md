![Tests](https://github.com/nmathew98/serve/actions/workflows/main.yml/badge.svg)

## About

A lightweight starting point for API applications.

It uses SWC under the hood for super fast build, run, and test times.

## Features

- Minified builds for fast build, run and test times ✅
- Auto loaded entities and adapters ✅
- Auto imported composables for better code reuse ✅
- Auto generated types for composables ✅
- Quick test times ✅
- GraphQL set up and ready to go with support for subscriptions using WebSockets ✅
- Static file serving routes already set up ✅
- Sensible security headers set by default ✅
- Lightweight and easy to extend ✅

## Background information

### Introduction

The whole idea is around a standard design pattern and directory structure.

It is modelled around the hexagonal architecture.

The standard directory structure is as follows:

- Entities are placed in `src/entities`
- Adapters are placed in `src/external/adapters`
- Routes are placed in `src/external/routes`

The reason for the strict directory structure is to insulate the core business rules from external dependencies, ensuring the core of the application is not affected by external factors. If anything uses an external dependency, it belongs in `src/external`.

### Design pattern

- There are three main layers (going from inside out): `entities` -> `app` -> `external`. The inner layers are not allowed to reach the outer layers.

- Entity objects are the prime focus, they contain the business rules of the application

- Composables belong in the application layer, they are the application specific business rules and use entity objects to perform their responsibilities.

- The external layer is where the routes and adapters belong. It is here that we set up packages to conform to the interfaces specified by entities.

- Entities must have a default builder function export while adapters must have a default export of the constant that conforms to the interface.

  The builder function must be named in the format `buildMake${entity}` where `entity` is the name of the entity. Entities are accessible in the context which is provided to every route.

  The entity `Test Entity` would have a builder function called `buildMakeTestEntity` and it will be accessible in the context by the key `TestEntity` while the entity `User` would have a builder function called `buildMakeUser` and it will be accessible in the context by the key `User`.

- Entities and adapters must be placed in a file in a folder with the same name.

  For example, the adapter `Test Adapter` would be placed in `src/external/adapters/test-adapter/test-adapter.ts` and the entity `User` would be placed in a folder called `src/entities/user/user.ts`.

  The names of the file must always be lowercase and if it is multi-word, the words are separated by a hyphen.

- All routes must adhere to the `Route` interface.
- Add your mutations, queries, subscriptions and types to `src/external/routes/api/mutations`, `src/external/routes/api/queries`, `src/external/routes/api/subscriptions` and `src/external/routes/api/types` respectively.

  Each GraphQL query, mutation, type or subscription must be in a folder with the same name as the file within it with a default function export.

  Queries must adhere to the `GraphQLQueryHandler` type, mutations `GraphQLMutationHandler`, subscriptions `GraphQLSubscriptionHandler` and types `GraphQLTypeHandler`.

## Examples

- See the `examples` folder for a sudoku solver API built using this package

## Building and testing

- To build the project run `npx @skulpture/serve build`
- To run Jest, run `npx @skulpture/serve jest --config`, where `--config` are any (optional) additional options you'd like to pass to Jest
- To check types, run `npx @skulpture/serve typecheck --config`, where `--config` are any (optional) additional options you'd like to pass to the TypeScript compiler
