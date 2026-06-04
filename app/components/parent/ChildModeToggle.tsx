import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import * as Switch from '@radix-ui/react-switch';
import { enableChildModeFn, disableChildModeFn } from '~/server/auth-fns';
import { useI18nContext } from '~/lib/i18n';
import { useAuthStore } from '~/stores/auth-store';

interface ChildModeToggleProps {
  profileId: string;
  profileName: string;
}

/**
 * A Radix Switch that enables or disables child mode for a specific profile.
 *
 * When enabled, a signed `child_mode` cookie is set (persistent across page
 * refreshes) and the user is navigated to `/learn`.
 * When disabled, the cookie is cleared.
 *
 * The switch shows as ON for the profile that is currently the active child
 * mode profile.
 */
export function ChildModeToggle({ profileId, profileName }: ChildModeToggleProps) {
  const { LL } = useI18nContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const childProfileId = useAuthStore((state) => state.childProfileId);
  const setChildMode = useAuthStore((state) => state.setChildMode);
  const isActive = childProfileId === profileId;

  const enableMutation = useMutation({
    mutationFn: () => enableChildModeFn({ data: { profileId } }),
    onSuccess: () => {
      setChildMode(profileId);
      void queryClient.invalidateQueries({ queryKey: ['profiles'] });
      void navigate({ to: '/learn' });
    },
  });

  const disableMutation = useMutation({
    mutationFn: () => disableChildModeFn(),
    onSuccess: () => {
      setChildMode(null);
      void queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });

  const isPending = enableMutation.isPending || disableMutation.isPending;

  function handleToggle(checked: boolean) {
    if (checked) {
      enableMutation.mutate();
    } else {
      disableMutation.mutate();
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Switch.Root
        checked={isActive}
        onCheckedChange={handleToggle}
        disabled={isPending}
        aria-label={`${isActive ? 'Disable' : 'Enable'} child mode for ${profileName}`}
        className="relative h-6 w-11 rounded-full bg-sand-dark data-[state=checked]:bg-green"
      >
        <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[26px]" />
      </Switch.Root>
      <span className="text-xs font-medium text-text-muted">
        {isActive ? LL.CHILDMODE_ACTIVE() : LL.CHILDMODE_ENABLE()}
      </span>
    </div>
  );
}
