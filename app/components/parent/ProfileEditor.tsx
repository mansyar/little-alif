import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { useI18nContext } from '~/lib/i18n';
import { createProfileSchema, updateProfileSchema } from '~/lib/validations/profiles';
import { createProfileFn, updateProfileFn } from '~/server/profiles';
import { useTypedMutation } from '~/lib/hooks/useTypedMutation';
import { AvatarPicker } from './AvatarPicker';
import type { AvatarKey } from '~/db/schema';
import type { CreateProfileInput, UpdateProfileInput } from '~/lib/validations/profiles';
import type { ZodError } from 'zod';

interface ProfileData {
  id: string;
  name: string;
  avatar: AvatarKey;
}

interface ProfileEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: ProfileData;
}

export function ProfileEditor({ open, onOpenChange, profile }: ProfileEditorProps) {
  const { LL } = useI18nContext();
  const queryClient = useQueryClient();
  const [name, setName] = useState(profile?.name ?? '');
  const [avatar, setAvatar] = useState<AvatarKey | null>(profile?.avatar ?? null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isEdit = !!profile;

  // Reset form when dialog opens
  function handleOpenChange(open: boolean) {
    if (!open) {
      // Reset on close only when not in middle of mutation
      setName(profile?.name ?? '');
      setAvatar(profile?.avatar ?? null);
      setFieldErrors({});
    }
    onOpenChange(open);
  }

  const mutation = useTypedMutation(
    {
      mutationFn: async () => {
        if (isEdit && profile) {
          const payload: UpdateProfileInput = {
            profileId: profile.id,
            name,
            avatar: avatar ?? undefined,
          };
          const result = updateProfileSchema.safeParse(payload);
          if (!result.success) {
            setFieldErrors(formatZodErrors(result.error));
            return;
          }
          setFieldErrors({});
          return updateProfileFn({ data: result.data });
        } else {
          const payload: CreateProfileInput = {
            name,
            avatar: avatar ?? 'alif-lamp',
          };
          const result = createProfileSchema.safeParse(payload);
          if (!result.success) {
            setFieldErrors(formatZodErrors(result.error));
            return;
          }
          setFieldErrors({});
          return createProfileFn({ data: result.data });
        }
      },
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['profiles'] });
        onOpenChange(false);
      },
    },
    LL,
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  const title = isEdit ? LL.PROFILE_EDIT_TITLE() : LL.PROFILE_ADD_TITLE();
  const submitLabel = isEdit ? LL.PROFILE_SAVE() : LL.PROFILE_SAVE();
  const isSubmitting = mutation.isPending;
  const submitError = mutation.isError && !mutation.isPending ? mutation.error?.message : null;

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-large bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-text-dark">{title}</Dialog.Title>
          <Dialog.Description className="sr-only">
            {isEdit
              ? 'Edit the child profile name and avatar'
              : 'Fill in the child profile name and select an avatar'}
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="profile-name"
                className="mb-1.5 block text-sm font-medium text-text-dark"
              >
                {LL.PROFILE_NAME()}
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-small border border-sand-dark/30 px-3 py-2 text-sm text-text-dark placeholder:text-text-muted focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
                placeholder="e.g. Aisyah"
                maxLength={50}
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
            </div>

            <AvatarPicker value={avatar} onValueChange={setAvatar} />
            {fieldErrors.avatar && (
              <p className="-mt-2 text-xs text-red-600">{fieldErrors.avatar}</p>
            )}

            {submitError && <p className="text-sm text-red-600">{submitError}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="rounded-small px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-sand-light disabled:opacity-50"
                >
                  {LL.PROFILE_CANCEL()}
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-small bg-green px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green/90 disabled:opacity-60"
              >
                {isSubmitting ? `${submitLabel}...` : submitLabel}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function formatZodErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root';
    errors[path] ??= issue.message;
  }
  return errors;
}
