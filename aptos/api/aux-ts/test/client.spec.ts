import * as assert from "assert";
import { parseTypeArgs } from "../src/client";

describe("Client wrapper tests", () => {
  it("parseTypeArgs single", () => {
    assert.deepEqual(parseTypeArgs("Coin<hello>"), ["hello"]);
  });

  it("parseTypeArgs multiple", () => {
    assert.deepEqual(parseTypeArgs("Coin<foo, bar,baz>"), [
      "foo",
      "bar",
      "baz",
    ]);
  });

  it("parseTypeArgs nested", () => {
    assert.deepEqual(parseTypeArgs("Coin<foo, A<B<C<bar>>>,baz>"), [
      "foo",
      "A<B<C<bar>>>",
      "baz",
    ]);
  });

  it("parseTypeArgs nested with comma", () => {
    assert.deepEqual(
      parseTypeArgs("Coin<foo, A<B<C<bar, baz>, D<hello>>>,baz>"),
      ["foo", "A<B<C<bar, baz>, D<hello>>>", "baz"]
    );
  });
});
