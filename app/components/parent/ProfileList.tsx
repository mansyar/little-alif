import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { listProfilesFn } from '~/server/profiles';
import { AVATAR_MAP, AlifLamp } from './avatars';
import type { AvatarKey } from '~/db/schema';
import type { VowelMode } from '~/lib/utils/harakat';
import { useI18nContext } from '~/lib/i18n';
import { ChildModeToggle } from './ChildModeToggle';

interface ProfileCard {
  id: string;
  name: string;
  avatar: AvatarKey;
  vowelMode: VowelMode;
  introducedCount: number;
}

interface ProfileListProps {
  onEdit: (profile: ProfileCard) => void;
  onDelete: (profileId: string) => void;
  onStartLearning?: (profileId: string) => void;
}

export function ProfileList({ onEdit, onDelete, onStartLearning }: ProfileListProps) {
  const { LL } = useI18nContext();
  const {
    data: profiles,
    isLoading,
    error,
    refetch,
  } = useQuery<ProfileCard[]>({
    queryKey: ['profiles'],
    queryFn: () => listProfilesFn(),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex min-h-[140px] animate-pulse flex-col rounded-large bg-white p-5 shadow-card"
          >
            <div className="mb-3 flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-sand-light" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 rounded bg-sand-light" />
                <div className="h-3 w-16 rounded bg-sand-light" />
              </div>
            </div>
            <div className="mt-auto flex items-center gap-2 border-t border-sand-light pt-3">
              <div className="h-4 w-20 rounded bg-sand-light" />
              <div className="ml-auto h-4 w-16 rounded bg-sand-light" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-large bg-red-50 p-6 text-center">
        <p className="text-red-600">
          {error instanceof Error ? error.message : LL.ERROR_GENERIC()}
        </p>
        <button
          type="button"
          onClick={() => {
            void refetch();
          }}
          className="mt-3 text-sm font-semibold text-red-700 underline"
        >
          {LL.PROFILE_CANCEL()}
        </button>
      </div>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlifLamp className="mb-4 h-24 w-24 text-text-muted opacity-30" />
        <p className="text-lg font-medium text-text-muted">{LL.DASHBOARD_NO_CHILDREN()}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {profiles.map((profile) => {
        const AvatarComponent = AVATAR_MAP[profile.avatar];
        return (
          <div
            key={profile.id}
            className="flex min-h-[140px] flex-col rounded-large bg-white p-5 shadow-card transition-shadow hover:shadow-lg"
          >
            <button
              type="button"
              onClick={() => onStartLearning?.(profile.id)}
              className="mb-3 flex w-full items-center gap-4 text-left transition-opacity hover:opacity-80"
              aria-label={`Start learning with ${profile.name}`}
            >
              <div className="h-14 w-14 shrink-0">
                {AvatarComponent ? (
                  <AvatarComponent className="h-full w-full" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-sand-light text-lg text-text-muted">
                    ?
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-text-dark">{profile.name}</h3>
                <p className="text-sm text-text-muted">
                  {profile.introducedCount}
                  /28 {LL.PROFILE_LETTERS_LABEL()}
                </p>
              </div>
            </button>

            <div className="mt-auto flex items-center gap-2 border-t border-sand-light pt-3">
              <Link
                to="/dashboard/profiles/$id/letters"
                params={{ id: profile.id }}
                className="rounded-small px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
              >
                {LL.PROFILE_MANAGE_LETTERS()}
              </Link>
              <ChildModeToggle profileId={profile.id} profileName={profile.name} />
              <button
                type="button"
                onClick={() => onEdit(profile)}
                className="ml-auto rounded-small px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:bg-sand-light"
              >
                {LL.PROFILE_EDIT()}
              </button>
              <button
                type="button"
                onClick={() => onDelete(profile.id)}
                className="rounded-small px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
              >
                {LL.PROFILE_DELETE()}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
