// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { AvatarPicker } from './AvatarPicker';
import type { AvatarKey } from '~/db/schema';

vi.mock('~/lib/i18n', () => ({
  useI18nContext: () => ({
    LL: {
      PROFILE_AVATAR: () => 'Avatar' as const,
    },
  }),
}));

describe('AvatarPicker', () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    value: null as AvatarKey | null,
    onValueChange: vi.fn(),
  };

  it('renders the avatar label', () => {
    render(<AvatarPicker {...defaultProps} />);
    expect(screen.getByText('Avatar')).toBeTruthy();
  });

  it('renders all avatar options as radio items', () => {
    render(<AvatarPicker {...defaultProps} />);
    // AVATAR_KEYS: alif-lamp, ba-boat, ta-table, tsa-butterfly, jim-mountain, ha-jar, kho-hat, dal-book
    expect(screen.getByLabelText('alif-lamp')).toBeTruthy();
    expect(screen.getByLabelText('ba-boat')).toBeTruthy();
    expect(screen.getByLabelText('ta-table')).toBeTruthy();
    expect(screen.getByLabelText('tsa-butterfly')).toBeTruthy();
    expect(screen.getByLabelText('jim-mountain')).toBeTruthy();
    expect(screen.getByLabelText('ha-jar')).toBeTruthy();
    expect(screen.getByLabelText('kho-hat')).toBeTruthy();
    expect(screen.getByLabelText('dal-book')).toBeTruthy();
  });

  it('highlights the selected avatar', () => {
    render(<AvatarPicker {...defaultProps} value="ba-boat" />);
    const selected = screen.getByLabelText('ba-boat');
    expect(selected.className).toContain('border-green');
  });

  it('does not highlight unselected avatars', () => {
    render(<AvatarPicker {...defaultProps} value="ba-boat" />);
    const unselected = screen.getByLabelText('alif-lamp');
    expect(unselected.className).not.toContain('border-green');
  });
});
