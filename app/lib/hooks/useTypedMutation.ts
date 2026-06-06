import { useMutation, type UseMutationOptions, type UseMutationResult } from '@tanstack/react-query';
import { ServerFunctionError, ERROR_TOAST_VARIANT } from '~/lib/errors';
import { useUiStore } from '~/stores/ui-store';

/**
 * A thin wrapper around TanStack Query's `useMutation` that automatically
 * dispatches a contextual toast when the mutation fails.
 *
 * - ServerFunctionError errors: toast variant derived from `ERROR_TOAST_VARIANT`,
 *   message resolved from the passed `LL` using `error.userMessage` as the i18n key.
 * - Non-classified errors: falls back to `ERROR_UNKNOWN` toast.
 *
 * @example
 * ```tsx
 * const { LL } = useI18nContext();
 * const mutation = useTypedMutation({
 *   mutationFn: () => someServerFn({ data: args }),
 *   onSuccess: () => { ... },
 * }, LL);
 * mutation.mutate();
 * ```
 */
export function useTypedMutation<TData, TVariables = void, TContext = unknown>(
  options: Omit<UseMutationOptions<TData, Error, TVariables, TContext>, 'onError'>,
  LL: Record<string, () => string>,
): UseMutationResult<TData, Error, TVariables, TContext> {
  const pushToast = useUiStore((state) => state.pushToast);

  return useMutation({
    ...options,
    onError: (error: Error, _variables: TVariables, _context: TContext | undefined) => {
      if (error instanceof ServerFunctionError) {
        const variant = ERROR_TOAST_VARIANT[error.code] ?? 'error';
        const resolveMessage = LL[error.userMessage];
        const message = typeof resolveMessage === 'function' ? resolveMessage() : error.userMessage;
        pushToast({ variant, message });
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkResolver = LL.ERROR_NETWORK;
        const networkMessage =
          typeof networkResolver === 'function'
            ? networkResolver()
            : 'A network error occurred. Please check your connection.';
        pushToast({ variant: 'error', message: networkMessage });
      } else {
        const fallbackResolver = LL.ERROR_UNKNOWN;
        const fallbackMessage =
          typeof fallbackResolver === 'function'
            ? fallbackResolver()
            : 'Something went wrong. Please try again.';
        pushToast({ variant: 'error', message: fallbackMessage });
      }
    },
  });
}
