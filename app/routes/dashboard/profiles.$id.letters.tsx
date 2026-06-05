import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { validateSessionFn } from '~/server/auth-fns';
import { getActiveProfileFn } from '~/server/profiles';
import { LetterToggleGrid } from '~/components/parent/LetterToggleGrid';

export const Route = createFileRoute('/dashboard/profiles/$id/letters')({
  beforeLoad: async () => {
    const session = await validateSessionFn();
    if (session === null) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router idiom
      throw redirect({ to: '/login', search: { redirect: '/dashboard' } });
    }
    return { user: session.user };
  },
  component: ProfileLettersPage,
});

function ProfileLettersPage() {
  const { id } = Route.useParams();

  const { data: profile } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => getActiveProfileFn({ data: { profileId: id } }),
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        to="/dashboard"
        className="mb-6 inline-flex items-center text-sm text-text-muted transition-colors hover:text-text-dark"
      >
        &larr; Back to Profiles
      </Link>
      <LetterToggleGrid profileId={id} vowelMode={profile?.vowelMode ?? 'fathah'} />
    </div>
  );
}
