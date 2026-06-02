import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  variant?: 'danger' | 'default';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-large bg-white p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out">
          <AlertDialog.Title className="text-lg font-semibold text-text-dark">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-text-muted">
            {message}
          </AlertDialog.Description>

          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className="rounded-small px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-sand-light"
              >
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={onConfirm}
                className={
                  variant === 'danger'
                    ? 'rounded-small bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700'
                    : 'rounded-small bg-green px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green/90'
                }
              >
                {confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
