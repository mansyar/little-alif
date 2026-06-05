import { useState } from 'react';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { validateSessionFn } from '~/server/auth-fns';
import { deleteProfileFn } from '~/server/profiles';
import { useI18nContext } from '~/lib/i18n';
import { DashboardHeader } from '~/components/parent/DashboardHeader';
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
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router idiom
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

  // ProfileEditor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ProfileCard | undefined>(undefined);

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

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background-warm">
        <DashboardHeader />

        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
          <header className="mb-8 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-text-dark">{LL.PROFILE_NAME()}</h1>
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
