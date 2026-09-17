// Copyright (c) 2026 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

const encoder = new TextEncoder();

export async function hasValidApiKey(
	authorization: string | undefined,
	apiKey: string | undefined,
) {
	const token = authorization?.match(/^Bearer ([A-Za-z0-9._~+\/-]+=*)$/i)?.[1];
	if (!token || !apiKey) return false;

	const [provided, expected] = await Promise.all([
		crypto.subtle.digest("SHA-256", encoder.encode(token)),
		crypto.subtle.digest("SHA-256", encoder.encode(apiKey)),
	]);
	const providedBytes = new Uint8Array(provided);
	const expectedBytes = new Uint8Array(expected);
	let mismatch = 0;
	for (let i = 0; i < providedBytes.length; i++) {
		mismatch |= providedBytes[i] ^ expectedBytes[i];
	}
	return mismatch === 0;
}
