## Simple TAF for API testing of "RealWorld" example app

For simplicity, app code is included in this repo (original - see [GitHub - avanelli/fastify-realworld-example-app: Fastify + Knex.js - Realworld Example App](https://github.com/avanelli/fastify-realworld-example-app))

#### Features

- vitest runner with HTML reporter
- winston-based logger
- app auto-start
- three API clients supported: axios, got, undici
- response schema validation using ajv, joi
- tests covering scenarios for available endpoints

#### Install

- `cd ./app`
- `npm i`
- `cd ..`
- `npm i` 

#### Run

- `npm test` - test using axios API client
- `npm run test-got` - test using got API client
- `npm run test-undici` - test using undici API client
