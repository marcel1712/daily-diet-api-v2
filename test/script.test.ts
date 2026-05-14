import { expect, test } from "vitest";
import { message } from "../src/script.ts";

test("testing tests", () => {
  expect(message).toBe("test");
});
