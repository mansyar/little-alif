// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: 'Delete Profile',
    message: 'Are you sure you want to delete this profile?',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    onConfirm: vi.fn(),
  };

  it('renders title and message when open', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Delete Profile')).toBeTruthy();
    expect(screen.getByText('Are you sure you want to delete this profile?')).toBeTruthy();
  });

  it('renders confirm and cancel buttons', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Delete')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    screen.getByText('Delete').click();
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('renders with default variant when not specified', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const confirmBtn = screen.getByText('Delete');
    expect(confirmBtn.className).toContain('bg-red-600');
  });

  it('renders with default variant styling', () => {
    render(<ConfirmDialog {...defaultProps} variant="default" />);
    const confirmBtn = screen.getByText('Delete');
    expect(confirmBtn.className).toContain('bg-green');
  });
});
