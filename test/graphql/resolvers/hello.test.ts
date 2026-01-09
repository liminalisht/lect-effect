import { Arbitrary, Effect } from "effect"
import { describe, it, expect } from "@effect/vitest"
import * as fc from "fast-check"
import * as domain from "../../../src/domain"
import { makeSchema } from "../../../src/graphql/schema"
import { makeYoga } from "../../../src/graphql/yoga"
import { TestAppLayer } from "../../layers/app"

describe("GraphQL hello (property)", () => {
  it.effect("hello(name) matches handler semantics", () =>
    Effect.gen(function* () {
      const schema = makeSchema();
      const yoga = yield* makeYoga(schema);
      const arb = Arbitrary.make(domain.nameInputSchema)

      const query = /* GraphQL */ `
        query Hello($name: String) {
          hello(name: $name) { greeting }
        }
      `

      yield* Effect.tryPromise({
        try: () =>
          fc.assert(
            fc.asyncProperty(arb, async (input) => {
              // JSON cannot encode `undefined` → normalize to null
              const nameVar = input.name ?? null

              const res = await yoga.fetch("http://unused/graphql", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ query, variables: { name: nameVar } })
              })

              const json = await res.json() as any
              expect(json.errors).toBeUndefined()

              const greeting: string = json.data.hello.greeting
              const who = input.name ?? "World"
              expect(greeting).toContain(who)
            })
          ),
        catch: (e) => e as Error
      })
    }).pipe(Effect.provide(TestAppLayer))
  )
})
