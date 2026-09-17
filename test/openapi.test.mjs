import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const document = JSON.parse(await readFile(new URL("../openapi.json", import.meta.url), "utf8"));
const source = await readFile(new URL("../workers/index.ts", import.meta.url), "utf8");

function collectRefs(value, refs = []) {
	if (!value || typeof value !== "object") return refs;
	if (value.$ref) refs.push(value.$ref);
	for (const child of Object.values(value)) collectRefs(child, refs);
	return refs;
}

function routePaths() {
	return [...source.matchAll(/app\.(get|post|put|delete)\(\s*["']([^"']+)["']/g)]
		.map(([, method, path]) => [method, path.replaceAll(/:([A-Za-z0-9_]+)/g, "{$1}")]);
}

test("OpenAPI document has valid structure, refs, and API authentication", () => {
	assert.equal(document.openapi, "3.1.0");
	assert.equal(document.servers[0].url, "https://inbox.birthpath.app");
	assert.deepEqual(document.security, [{ bearerAuth: [] }]);
	assert.equal(document.components.securitySchemes.bearerAuth.type, "http");
	assert.equal(document.components.securitySchemes.bearerAuth.scheme, "bearer");
	assert.deepEqual(document.paths["/api/openapi.json"].get.security, []);

	for (const ref of collectRefs(document)) {
		assert.match(ref, /^#\/(components|paths)\//, `unsupported local ref: ${ref}`);
		const target = ref.slice(2).split("/").reduce((value, key) => value?.[key], document);
		assert.notEqual(target, undefined, `missing OpenAPI ref target: ${ref}`);
	}
});

test("every REST route has a documented method and path", () => {
	const operationIds = new Set();
	for (const [method, path] of routePaths()) {
		assert.ok(document.paths[path], `missing OpenAPI path for ${method.toUpperCase()} ${path}`);
		assert.ok(document.paths[path][method], `missing OpenAPI method for ${method.toUpperCase()} ${path}`);
		const operation = document.paths[path][method];
		const operationId = operation.operationId;
		assert.ok(operationId, `missing operationId for ${method.toUpperCase()} ${path}`);
		if (operation.security?.length !== 0) {
			assert.deepEqual(operation.responses["403"], { $ref: "#/components/responses/Forbidden" });
		}
		assert.equal(operationIds.has(operationId), false, `duplicate operationId: ${operationId}`);
		operationIds.add(operationId);
	}
});
