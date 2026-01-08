# todo

- [ ] address all todos inlined in project code
- [ ] write tests using arbitrary for schemas using effect
- [x] setup linting config as desired
- [x] assess whether runtime should be passed through or not to resolvers / handlers
- [ ] change any uses of Effect's default logger to grab from our custom logger layer
- [ ] show that we can mock layer implementations for tests
- [x] pull out functionality into services and call those from resolvers / handlers
- [ ] add NODE_ENV env var
- [ ] use that to determine whether to write graphql schema to disk, and create appropriate effect
- [ ] determine where to create error types and how to organize across project
- [ ] actually start separating domain
- [ ] create a service that helloHandler calls, basically reifying this interface of providing an (optional) name and getting a Greeting
- [ ] establish how it fits into layers / AppServices
- [ ] create first test with vitest (https://github.com/Effect-TS/effect/blob/main/packages/vitest/README.md)
- [ ] organize tests according to whether they test effects against the graphql boundary or not
- [ ] create first test that uses arbitraries
- [ ] create first test that hits graphql boundary, uses arbitraries for input, and makes property assertions about output
- [ ] i'm wondering whether we should organize our repo in a way that separates domain types, services, and service implementations
