import { User } from 'lucide-react';
import { AVATAR_MAP } from '~/components/parent/avatars';
import type { AvatarKey } from '~/db/schema';

interface ProfileBadgeProps {
  /**
   * The active child's profile summary. `null` indicates that the profile
   * failed to load (e.g., `getActiveProfileFn` threw). The badge must
   * still render in that case — the child grid never crashes.
   */
  profile: { name: string; avatar: string } | null;
}

/**
 * Renders the active child's avatar + name at the top of `/learn`.
 *
 * - Known avatar key → inline SVG from `AVATAR_MAP`.
 * - Unknown avatar key (or null profile) → Lucide `User` icon.
 * - Null profile → no name span is rendered.
 * - `aria-label` includes the name so screen readers announce the active child.
 */
export function ProfileBadge({ profile }: ProfileBadgeProps) {
  const AvatarComponent = profile ? AVATAR_MAP[profile.avatar as AvatarKey] : undefined;
  const name = profile?.name;
  const ariaLabel = name ? `Active child: ${name}` : 'Active child';

  return (
    <div aria-label={ariaLabel} className="flex items-center gap-3">
      <div className="h-12 w-12 shrink-0">
        {AvatarComponent ? (
          <AvatarComponent className="h-full w-full" />
        ) : (
          <User
            className="h-full w-full text-text-muted"
            aria-hidden="true"
            data-testid="profile-badge-fallback-icon"
          />
        )}
      </div>
      {name && <span className="text-lg font-semibold text-text-dark">{name}</span>}
    </div>
  );
}
