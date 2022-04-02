![Tests](https://github.com/nmathew98/serve/actions/workflows/main.yml/badge.svg)

# About

A lightweight starting point for server side applications

# Usage

1. Add your entities to `src/entities`
2. Initialize them from `src/index.ts` in `initializeContext` and add them to `context`
3. Consume them from `src/external/routes`

# Additional Information

- Routes must adhere to the `Routes` interface
- Each route must be in a folder named after itself (for example: the route register would correspond to `src/external/routes/register/register.ts`)
