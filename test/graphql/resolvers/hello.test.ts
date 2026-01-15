import { Arbitrary, Effect } from 'effect';
import { describe, it, expect } from '@effect/vitest';
import * as fc from 'fast-check';
import { nameInputSchema } from '../../../src/domain/hello/nameInput';
import { makeSchema } from '../../../src/graphql/schema';
import { handlersToResolvers } from '../../../src/graphql/generic';
import { helloHandlers } from '../../../src/handlers/hello';
import { itemHandlers } from '../../../src/handlers/item';
import { productHandlers } from '../../../src/handlers/product';
import { makeYoga } from '../../../src/graphql/yoga';
import { testAppLayer } from '../../layers/app';
import { AppServices } from '../../../src/services/app';

describe('GraphQL hello (property)', () => {
  it.effect('hello(name) matches handler semantics', () =>
    Effect.gen(function * () {
      const schema = makeSchema(handlersToResolvers([
        ...helloHandlers,
        ...itemHandlers,
        ...productHandlers,
      ]));
      const yoga = yield * makeYoga<AppServices>(schema);
      const arb = Arbitrary.make(nameInputSchema);

      const query = /* GraphQL */ `
        query Hello($name: String) {
          greet(name: $name) { greeting }
        }
      `;

      yield * Effect.tryPromise({
        try: () =>
          fc.assert(fc.asyncProperty(arb, async input => {
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
        catch: e => e as Error,
      });
    }).pipe(Effect.provide(testAppLayer)));
});
