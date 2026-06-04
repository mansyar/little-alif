import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Users } from 'lucide-react';
import { listProfilesForSwitchFn } from '~/server/profiles';
import { enableChildModeFn } from '~/server/auth-fns';
import { useAuthStore } from '~/stores/auth-store';
import { AVATAR_MAP } from './avatars';
import type { AvatarKey } from '~/db/schema';

interface SwitcherProfile {
  id: string;
  name: string;
  avatar: AvatarKey;
}

interface ChildSwitcherProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Toggle handler — called on open/close. */
  onOpenChange: (open: boolean) => void;
  /** The currently active child profile id. Used to filter the list. */
  activeProfileId: string;
  /** Optional callback fired after a successful switch. */
  onSwitch?: (profileId: string) => void;
}

/**
 * Overlay for swapping to a different child profile mid-session.
 *
 * Renders inside a Radix Dialog at z-70 (above the parent-gate menu at
 * z-60 and LetterDetail at z-50). Shows one tappable tile per *other*
 * child profile owned by the parent. Filtering out the active profile
 * means a single-child household sees an empty state — they don't
 * need the switcher.
 */
export function ChildSwitcher({
  open,
  onOpenChange,
  activeProfileId,
  onSwitch,
}: ChildSwitcherProps) {
  const navigate = useNavigate();
  const setChildMode = useAuthStore((state) => state.setChildMode);
  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useQuery<SwitcherProfile[]>({
    queryKey: ['profilesForSwitch'],
    queryFn: () => listProfilesForSwitchFn(),
    enabled: open,
  });

  const switchMutation = useMutation({
    mutationFn: (profileId: string) => enableChildModeFn({ data: { profileId } }),
    onSuccess: (_data, profileId) => {
      setChildMode(profileId);
      void queryClient.invalidateQueries({ queryKey: ['activeProfile'] });
      void queryClient.invalidateQueries({ queryKey: ['visibleLetters'] });
      void queryClient.invalidateQueries({ queryKey: ['readingData'] });
      onOpenChange(false);
      onSwitch?.(profileId);
      void navigate({ to: '/learn' });
    },
  });

  const others = (profiles ?? []).filter((p) => p.id !== activeProfileId);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/40" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-[70] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-large bg-white p-6 shadow-large"
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-text-dark">
              Switch child
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close switch child"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-sand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sand-dark border-t-green" />
            </div>
          ) : others.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Users className="h-12 w-12 text-text-muted opacity-40" aria-hidden="true" />
              <p className="text-sm text-text-muted">No other children</p>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-small border-2 border-green bg-white px-4 py-2 text-sm font-medium text-green transition-colors hover:bg-green hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
                >
                  Close
                </button>
              </Dialog.Close>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {others.map((profile) => {
                const AvatarComponent = AVATAR_MAP[profile.avatar];
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => switchMutation.mutate(profile.id)}
                    disabled={switchMutation.isPending}
                    aria-label={`Switch to ${profile.name}`}
                    className="flex flex-col items-center gap-2 rounded-large bg-sand-light p-4 transition-shadow hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="h-14 w-14">
                      {AvatarComponent ? (
                        <AvatarComponent className="h-full w-full" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-sand-dark text-lg text-text-muted">
                          ?
                        </div>
                      )}
                    </div>
                    <span className="truncate text-sm font-medium text-text-dark">
                      {profile.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
