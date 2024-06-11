import type { WhisperingErrorProperties } from '@repo/shared';
import { Effect } from 'effect';
import { toast } from 'svelte-sonner';

export const catchErrorsAsToast = <
	E extends Effect.Effect<any, WhisperingErrorProperties, never>,
	A = Effect.Effect.Success<E>,
>(
	program: E,
	options?: { defaultValue?: A; toastId?: number | string },
): Effect.Effect<A, never, never> =>
	Effect.catchAll(program, (error) => {
		toast.error(error.title, {
			id: options?.toastId,
			description: error.description,
			action: error.action,
		});
		return Effect.succeed(options?.defaultValue);
	});
