import { useState } from 'react';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logoutFn, validateSessionFn } from '~/server/auth-fns';
import { deleteProfileFn } from '~/server/profiles';
import { useI18nContext } from '~/lib/i18n';
import { LanguageToggle } from '~/components/parent/LanguageToggle';
import { ProfileList } from '~/components/parent/ProfileList';
import { ProfileEditor } from '~/components/parent/ProfileEditor';
import { ConfirmDialog } from '~/components/ui/ConfirmDialog';
import { ErrorBoundary } from '~/components/ui/ErrorBoundary';
import { useAuthStore } from '~/stores/auth-store';
import { useUiStore } from '~/stores/ui-store';
import type { AvatarKey } from '~/db/schema';

interface ProfileCard {
  id: string;
  name: string;
  avatar: AvatarKey;
  introducedCount: number;
}

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const session = await validateSessionFn();
    if (session === null) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router idiom: throw the redirect sentinel
      throw redirect({ to: '/login', search: { redirect: '/dashboard' } });
    }
    return { user: session.user };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { LL } = useI18nContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setChildMode = useAuthStore((state) => state.setChildMode);
  const pushToast = useUiStore((state) => state.pushToast);
  const [signingOut, setSigningOut] = useState(false);

  // ProfileEditor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ProfileCard | undefined>(undefined);

  // Letter toggle grid expand/collapse (accordion)
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null);

  // ConfirmDialog state
  const [deleteProfileId, setDeleteProfileId] = useState<string | null>(null);
  const deleteConfirmOpen = deleteProfileId !== null;

  const deleteMutation = useMutation({
    mutationFn: (profileId: string) => deleteProfileFn({ data: { profileId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profiles'] });
      setDeleteProfileId(null);
    },
    onError: (err: Error) => {
      pushToast({ variant: 'error', message: err.message ?? 'Could not save changes.' });
    },
  });

  function handleStartLearning(profileId: string) {
    setChildMode(profileId);
    void navigate({ to: '/learn' });
  }

  function handleAddChild() {
    setEditingProfile(undefined);
    setEditorOpen(true);
  }

  function handleEdit(profile: ProfileCard) {
    setEditingProfile(profile);
    setEditorOpen(true);
  }

  function handleDelete(profileId: string) {
    setDeleteProfileId(profileId);
  }

  function handleConfirmDelete() {
    if (deleteProfileId) {
      deleteMutation.mutate(deleteProfileId);
    }
  }

  async function handleLogout() {
    setSigningOut(true);
    try {
      await logoutFn();
      window.location.href = '/';
    } catch (err) {
      setSigningOut(false);
      pushToast({
        variant: 'error',
        message: err instanceof Error ? err.message : 'Connection error',
      });
    }
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="flex w-64 shrink-0 flex-col border-r border-sand-light bg-white px-5 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-dark">{LL.DASHBOARD_TITLE()}</h1>
          </div>

          <nav className="flex flex-col gap-2">
            <span className="rounded-small bg-sand-light px-3 py-2 text-sm font-semibold text-text-dark">
              {LL.PROFILE_NAME()}
            </span>
          </nav>

          <div className="mt-auto flex flex-col gap-3">
            <LanguageToggle />
            <button
              type="button"
              onClick={() => {
                void handleLogout();
              }}
              disabled={signingOut}
              className="rounded-small px-3 py-2 text-left text-sm text-text-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
            >
              {signingOut ? LL.DASHBOARD_SIGNING_OUT() : LL.DASHBOARD_SIGN_OUT()}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-8 py-8">
          <header className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-dark">{LL.PROFILE_NAME()}</h2>
            <button
              type="button"
              onClick={handleAddChild}
              className="rounded-small bg-green px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-green/90"
            >
              {LL.DASHBOARD_ADD_CHILD()}
            </button>
          </header>

          <ProfileList
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStartLearning={handleStartLearning}
            expandedProfileId={expandedProfileId}
            onToggleLetters={(profileId) =>
              setExpandedProfileId((prev) => (prev === profileId ? null : profileId))
            }
          />
        </main>

        {/* Profile Editor modal */}
        <ProfileEditor open={editorOpen} onOpenChange={setEditorOpen} profile={editingProfile} />

        {/* Delete confirmation dialog */}
        <ConfirmDialog
          open={deleteConfirmOpen}
          onOpenChange={(open) => {
            if (!open) setDeleteProfileId(null);
          }}
          title={LL.PROFILE_DELETE()}
          message={LL.PROFILE_DELETE_CONFIRM()}
          confirmLabel={LL.PROFILE_DELETE()}
          cancelLabel={LL.PROFILE_CANCEL()}
          onConfirm={handleConfirmDelete}
          variant="danger"
        />
      </div>
    </ErrorBoundary>
  );
}
