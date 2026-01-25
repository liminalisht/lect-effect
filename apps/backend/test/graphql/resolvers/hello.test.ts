import { Arbitrary, Effect } from 'effect';
import { describe, it, expect } from '@effect/vitest';
import * as fc from 'fast-check';
import { nameInputSchema, type NameInput } from '@lect-effect/domain/hello/nameInput';
import { helloHandlers } from '@lect-effect/handlers/hello';
import { itemHandlers } from '@lect-effect/handlers/item';
import { productHandlers } from '@lect-effect/handlers/product';
import { type AppServices } from '@lect-effect/services/app';
import { makeSchema, type GraphQLResolver } from '../../../src/graphql/schema.js';
import { handlersToResolvers } from '../../../src/graphql/resolvers.js';
import { makeYoga } from '../../../src/graphql/yoga.js';
import { withTestAppLayer } from '../../testRuntime.js';

describe('GraphQL hello (property)', () => {
  it.effect('hello(name) matches handler semantics', () =>
    withTestAppLayer(Effect.gen(function * () {
      const schema = makeSchema(handlersToResolvers([
        ...helloHandlers,
        ...itemHandlers,
        ...productHandlers,
      ]) as readonly GraphQLResolver[]);
      const yoga = yield * makeYoga<AppServices>(schema);
      const arb = Arbitrary.make(nameInputSchema);

      const query = /* GraphQL */ `
        query Hello($name: String) {
          greet(name: $name) { greeting }
        }
      `;

      yield * Effect.tryPromise({
        try: async () =>
          fc.assert(fc.asyncProperty(arb, async (input: NameInput) => {
            // JSON cannot encode `undefined` → normalize to null
            const nameVar = input.name ?? null;

            const res = await yoga.fetch('http://unused/graphql', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ query, variables: { name: nameVar } }),
            });

            const json = await res.json();
            expect(json.errors).toBeUndefined();

            const {greeting} = json.data.greet;
            const who = input.name ?? 'World';
            expect(greeting).toContain(who);
          })),
        catch: (e: unknown) => e as Error,
      });
    })));
});
