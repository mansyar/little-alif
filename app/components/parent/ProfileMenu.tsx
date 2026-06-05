import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { logoutFn } from '~/server/auth-fns';
import { listProfilesFn } from '~/server/profiles';
import { useI18nContext } from '~/lib/i18n';
import { useUiStore } from '~/stores/ui-store';
import { ConfirmDialog } from '~/components/ui/ConfirmDialog';
import { AVATAR_MAP } from './avatars';

export function ProfileMenu() {
  const { LL } = useI18nContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pushToast = useUiStore((state) => state.pushToast);
  const [signOutOpen, setSignOutOpen] = useState(false);

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => listProfilesFn(),
  });

  const logoutMutation = useMutation({
    mutationFn: () => logoutFn(),
    onSuccess: () => {
      void queryClient.clear();
      window.location.href = '/login';
    },
    onError: (err: Error) => {
      pushToast({
        variant: 'error',
        message: err instanceof Error ? err.message : LL.ERROR_GENERIC(),
      });
    },
  });

  function handleSignOut() {
    logoutMutation.mutate();
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label="Profile menu"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-sand-light text-text-muted transition-colors hover:bg-sand-dark/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="z-50 min-w-[180px] rounded-large border border-sand-light bg-white p-1 shadow-card data-[side=bottom]:animate-in data-[side=top]:animate-out"
          >
            <DropdownMenu.Label className="px-3 py-1.5 text-xs font-medium text-text-muted">
              {LL.PROFILE_NAME() ?? 'Profiles'}
            </DropdownMenu.Label>

            {profiles?.map((profile) => {
              const AvatarComponent = AVATAR_MAP[profile.avatar];
              return (
                <DropdownMenu.Item
                  key={profile.id}
                  onSelect={() => {
                    void navigate({
                      to: '/dashboard/profiles/$id/letters',
                      params: { id: profile.id },
                    });
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-small px-3 py-2 text-sm text-text-dark outline-none transition-colors hover:bg-sand-light data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <div className="h-6 w-6 shrink-0">
                    {AvatarComponent ? (
                      <AvatarComponent className="h-full w-full" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-sand-light text-xs text-text-muted">
                        ?
                      </div>
                    )}
                  </div>
                  <span>{profile.name}</span>
                </DropdownMenu.Item>
              );
            })}

            <DropdownMenu.Separator className="mx-2 my-1 h-px bg-sand-light" />

            <DropdownMenu.Item
              onSelect={(e) => {
                e.preventDefault();
                setSignOutOpen(true);
              }}
              className="flex cursor-pointer items-center rounded-small px-3 py-2 text-sm text-red-600 outline-none transition-colors hover:bg-red-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              {LL.DASHBOARD_SIGN_OUT()}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <ConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title={LL.DASHBOARD_SIGN_OUT()}
        message={LL.DASHBOARD_SIGN_OUT_CONFIRM()}
        confirmLabel={LL.DASHBOARD_SIGN_OUT()}
        cancelLabel={LL.PROFILE_CANCEL()}
        onConfirm={handleSignOut}
        variant="danger"
      />
    </>
  );
}
