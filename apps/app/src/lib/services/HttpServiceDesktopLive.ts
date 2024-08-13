import { HttpService, HttpServiceError } from '$lib/services/HttpService';
import { Schema } from '@effect/schema';
import { Body, fetch, ResponseType } from '@tauri-apps/api/http';
import { Effect, Layer } from 'effect';

export const HttpServiceDesktopLive = Layer.succeed(
	HttpService,
	HttpService.of({
		post: ({ formData, url, schema }) =>
			Effect.gen(function* () {
				const formBody = Body.form(formData);
				const response = yield* Effect.tryPromise({
					try: () =>
						fetch(url, {
							method: 'POST',
							body: formBody,
							responseType: ResponseType.JSON,
							headers: { 'Content-Type': 'multipart/form-data' },
						}),
					catch: (error) =>
						new HttpServiceError({
							message: error instanceof Error ? error.message : 'Please try again later.',
						}),
				});
				if (!response.ok) {
					return yield* new HttpServiceError({
						message: `Request failed with status ${response.status}.`,
					});
				}
				const data = yield* Schema.decodeUnknown(schema)(response.data);
				return data;
			}),
	}),
);
