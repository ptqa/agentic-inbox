import assert from "node:assert/strict";
import test from "node:test";
import { hasValidApiKey } from "../workers/lib/api-auth.ts";

const key = "test-key_123";

test("accepts only a matching bearer token", async () => {
	assert.equal(await hasValidApiKey(`Bearer ${key}`, key), true);
	assert.equal(await hasValidApiKey(`bearer ${key}`, key), true);
	assert.equal(await hasValidApiKey("Bearer wrong", key), false);
});

test("rejects missing and malformed authorization", async () => {
	assert.equal(await hasValidApiKey(undefined, key), false);
	assert.equal(await hasValidApiKey("Bearer ", key), false);
	assert.equal(await hasValidApiKey(`Basic ${key}`, key), false);
	assert.equal(await hasValidApiKey(`Bearer  ${key}`, key), false);
	assert.equal(await hasValidApiKey(`Bearer ${key} trailing`, key), false);
	assert.equal(await hasValidApiKey(`Bearer ${key}`, undefined), false);
	assert.equal(await hasValidApiKey(`Bearer ${key}`, ""), false);
});
