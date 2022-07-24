![Tests](https://github.com/nmathew98/serve/actions/workflows/main.yml/badge.svg)

## About

A lightweight starting point for API applications.

It uses SWC under the hood for super fast build, run, and test times.

## Features

- HTTP 2.0 support with fallback to HTTP 1.1 ✅
- Minified builds for fast build, run and test times ✅
- Auto loaded entities and adapters ✅
- Auto loaded routes ✅
- Auto imported composables for better code reuse ✅
- Auto generated types for composables ✅
- Quick test times ✅
- GraphQL set up and ready to go with support for subscriptions using SSE (at `/api/subscriptions`) ✅
- Static file serving routes already set up ✅
- Sensible security headers set by default ✅
- Lightweight and easy to extend ✅
- Application monitoring with Sentry ✅

## Examples

- See the `examples` folder for a sudoku solver API built using this package

### Functionality demonstrated

- Entity objects and adapters ✅
- Auto loaded routes ✅
- Composables ✅
- GraphQL queries and mutations ✅
- Authorized routes and unauthorized routes ✅
- Setting CORS and other security headers ✅
- File upload to Amazon S3 ✅
- Serving files from Amazon S3 ✅
- Tests using Jest ✅

## Contributions

- Contributions are welcome, just make a pull request

## Building and testing

- To build the project run `npx @skulpture/serve build`
- To run Jest, run `npx @skulpture/serve jest --config`, where `--config` are any (optional) additional options you'd like to pass to Jest
- To check types, run `npx @skulpture/serve typecheck --config`, where `--config` are any (optional) additional options you'd like to pass to the TypeScript compiler

## Usage

- See `examples`
