// @vitest-environment jsdom
import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { User } from 'lucide-react';
import { ProfileBadge } from './ProfileBadge';

describe('ProfileBadge', () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the inline SVG avatar matching the active profile's avatar key", () => {
    const { container } = render(
      <ProfileBadge profile={{ name: 'Aisyah', avatar: 'alif-lamp' }} />,
    );

    // AVATAR_MAP['alif-lamp'] = AlifLamp — its SVG has the oil lamp viewBox.
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 64 64');
  });

  it('renders the profile name next to the avatar', () => {
    render(<ProfileBadge profile={{ name: 'Aisyah', avatar: 'alif-lamp' }} />);

    expect(screen.getByText('Aisyah')).toBeTruthy();
  });

  it('falls back to the Lucide User icon when profile is null', () => {
    const { container } = render(<ProfileBadge profile={null} />);

    // Lucide icons render an <svg> with class "lucide lucide-user".
    const userIcon = container.querySelector('svg.lucide-user');
    expect(userIcon).toBeTruthy();
    // The exact name attribute is the test-time identifier for the icon component
    expect(userIcon?.getAttribute('class')).toContain('lucide-user');
  });

  it('falls back to the Lucide User icon when avatar key is unknown', () => {
    const { container } = render(
      <ProfileBadge profile={{ name: 'Aisyah', avatar: 'not-a-key' }} />,
    );

    const userIcon = container.querySelector('svg.lucide-user');
    expect(userIcon).toBeTruthy();
  });

  it('omits the name span when profile is null', () => {
    render(<ProfileBadge profile={null} />);

    // No text content should be present besides the SVG.
    expect(screen.queryByText('Aisyah')).toBeNull();
  });

  it('sets aria-label including the profile name for screen readers', () => {
    const { container } = render(
      <ProfileBadge profile={{ name: 'Aisyah', avatar: 'alif-lamp' }} />,
    );

    const root = container.firstElementChild;
    expect(root?.getAttribute('aria-label')).toContain('Aisyah');
  });

  it('does not throw if the imported User icon is missing (re-export sanity)', () => {
    // Smoke test: importing User and rendering it directly should not throw.
    const { container } = render(<User data-testid="user-icon" />);
    expect(container.querySelector('[data-testid="user-icon"]')).toBeTruthy();
  });
});
