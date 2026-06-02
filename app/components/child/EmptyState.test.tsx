// @vitest-environment jsdom
import { describe, expect, it, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the BookOpen icon (Lucide)', () => {
    const { container } = render(<EmptyState />);

    // Lucide's BookOpen icon renders an <svg class="lucide lucide-book-open">.
    const icon = container.querySelector('svg.lucide-book-open');
    expect(icon).toBeTruthy();
  });

  it('does not render any text nodes (icon-only per PRD REQ-5.8)', () => {
    const { container } = render(<EmptyState />);

    // Walk the rendered tree and collect all text nodes.
    const textNodes: string[] = [];
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const text = node.textContent?.trim();
      if (text) textNodes.push(text);
      node = walker.nextNode();
    }

    expect(textNodes).toEqual([]);
  });

  it('applies generous vertical padding so the empty state feels intentional', () => {
    const { container } = render(<EmptyState />);

    // The outermost element should carry py-24.
    const root = container.firstElementChild;
    expect(root?.className).toContain('py-24');
  });

  it('renders no buttons or links — purely decorative', () => {
    const { container } = render(<EmptyState />);

    expect(container.querySelector('button')).toBeNull();
    expect(container.querySelector('a')).toBeNull();
  });
});
