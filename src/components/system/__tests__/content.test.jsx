import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import Badge from '../Badge';
import StatBlock from '../StatBlock';
import ExternalLink, { buildRel } from '../ExternalLink';
import TechBackdrop, { MAX_BACKDROP_OPACITY, resolveOpacity } from '../TechBackdrop';

/**
 * Component tests for the content primitives (task 6.2).
 * Requirements: 1.7, 4.3, 5.7, 6.6, 11.6, 12.6
 */

describe('ExternalLink', () => {
  it('always opens a new context with noopener and noreferrer', () => {
    render(<ExternalLink href="https://exflow.in">exflow.in</ExternalLink>);

    const link = screen.getByRole('link', { name: 'exflow.in' });
    expect(link).toHaveAttribute('href', 'https://exflow.in');
    expect(link).toHaveAttribute('target', '_blank');

    const rel = link.getAttribute('rel').split(/\s+/);
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
  });

  it('cannot have target or the safety rel tokens overridden by a caller', () => {
    render(
      <ExternalLink href="https://example.com" target="_self" rel="nofollow">
        example
      </ExternalLink>,
    );

    const link = screen.getByRole('link', { name: 'example' });
    expect(link).toHaveAttribute('target', '_blank');

    const rel = link.getAttribute('rel').split(/\s+/);
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
    // Caller additions are merged, not substituted.
    expect(rel).toContain('nofollow');
  });

  it('still emits the safety attributes when newContext is false', () => {
    render(
      <ExternalLink href="https://example.com" newContext={false}>
        legacy
      </ExternalLink>,
    );

    const link = screen.getByRole('link', { name: 'legacy' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('de-duplicates rel tokens', () => {
    expect(buildRel('noopener noreferrer')).toBe('noopener noreferrer');
    expect(buildRel(undefined)).toBe('noopener noreferrer');
    expect(buildRel('noreferrer nofollow')).toBe('noopener noreferrer nofollow');
  });
});

describe('Badge', () => {
  it('defaults to the cyan tech accent, not the brand accent', () => {
    render(<Badge>SaaS</Badge>);

    const badge = screen.getByText('SaaS');
    expect(badge).toHaveAttribute('data-accent', 'tech');
    expect(badge).toHaveAttribute('data-tone', 'soft');
    expect(badge.className).toContain('text-tech-cyan');
    expect(badge.className).not.toContain('text-brand');
    // Token-backed type role, never a px font size.
    expect(badge.className).toContain('var(--text-meta)');
    expect(badge.className).not.toMatch(/text-\[\d/);
  });

  it('paints the brand accent only when explicitly requested', () => {
    render(<Badge accent="brand">Book A Call</Badge>);

    const badge = screen.getByText('Book A Call');
    expect(badge).toHaveAttribute('data-accent', 'brand');
    expect(badge.className).toContain('text-brand');
  });

  it('renders the muted tone without any accent color', () => {
    render(<Badge tone="muted">Coming Soon</Badge>);

    const badge = screen.getByText('Coming Soon');
    expect(badge).toHaveAttribute('data-tone', 'muted');
    expect(badge.className).toContain('text-content-muted');
    expect(badge.className).not.toContain('text-tech-cyan');
    expect(badge.className).not.toContain('text-brand');
  });

  it('renders the outline tone with a transparent fill and accent border', () => {
    render(<Badge tone="outline" accent="blue">Fintech</Badge>);

    const badge = screen.getByText('Fintech');
    expect(badge.className).toContain('bg-transparent');
    expect(badge.className).toContain('border-tech-blue/40');
    expect(badge.className).toContain('text-tech-blue');
  });

  it('falls back to the tech accent for unknown accents', () => {
    render(<Badge accent="violet">Motif</Badge>);

    const badge = screen.getByText('Motif');
    expect(badge).toHaveAttribute('data-accent', 'tech');
    expect(badge.className).toContain('text-tech-cyan');
  });
});

describe('StatBlock', () => {
  it('renders the value, suffix, and label at their token type roles', () => {
    const { container } = render(<StatBlock value="150" suffix="+" label="Projects delivered" />);

    const value = container.querySelector('[data-slot="stat-value"]');
    expect(value).not.toBeNull();
    expect(value.textContent).toBe('150+');
    // Token type role written as an explicit length so a text color cannot
    // merge the font size away.
    expect(value.className).toContain('var(--text-display)');

    const label = container.querySelector('[data-slot="stat-label"]');
    expect(label).not.toBeNull();
    expect(label.textContent).toBe('Projects delivered');
    expect(label.className).toContain('var(--text-label)');
  });

  it('omits the suffix element when no suffix is given', () => {
    const { container } = render(<StatBlock value="24/7" label="Support" />);

    const value = container.querySelector('[data-slot="stat-value"]');
    expect(value.textContent).toBe('24/7');
    expect(value.querySelector('span')).toBeNull();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('accents the suffix with cyan rather than the brand color by default', () => {
    const { container } = render(<StatBlock value="98" suffix="%" label="Retention" />);

    const suffix = container.querySelector('[data-slot="stat-value"] span');
    expect(suffix.textContent).toBe('%');
    expect(suffix.className).toContain('text-tech-cyan');
  });
});

describe('TechBackdrop', () => {
  it('is hidden from assistive technologies and never intercepts pointer events', () => {
    const { container } = render(<TechBackdrop variant="mesh" />);

    const backdrop = container.firstElementChild;
    expect(backdrop).toHaveAttribute('aria-hidden', 'true');
    expect(backdrop.className).toContain('pointer-events-none');
    // Sits behind content, so it cannot overlap text or controls.
    expect(backdrop.className).toContain('absolute');
    expect(backdrop.className).toContain('-z-10');
    expect(backdrop.textContent).toBe('');
    expect(backdrop.querySelector('a, button, input, [tabindex]')).toBeNull();
  });

  it('caps opacity at the contrast-safe ceiling', () => {
    const { container } = render(<TechBackdrop variant="grid" intensity={0.9} />);

    const opacity = Number(container.firstElementChild.style.opacity);
    expect(opacity).toBeLessThanOrEqual(MAX_BACKDROP_OPACITY);
  });

  it('keeps every named intensity at or below the ceiling', () => {
    for (const intensity of ['subtle', 'base', 'strong']) {
      expect(resolveOpacity(intensity)).toBeLessThanOrEqual(MAX_BACKDROP_OPACITY);
      expect(resolveOpacity(intensity)).toBeGreaterThan(0);
    }
    expect(resolveOpacity(-1)).toBe(0);
    expect(resolveOpacity('nonsense')).toBe(resolveOpacity('base'));
  });

  it('renders each motif variant from token colors only', () => {
    for (const variant of ['grid', 'mesh', 'scanline']) {
      const { container, unmount } = render(<TechBackdrop variant={variant} />);
      const backdrop = container.firstElementChild;
      expect(backdrop).toHaveAttribute('data-variant', variant);
      expect(backdrop.style.backgroundImage).toContain('var(--color-');
      expect(backdrop.style.backgroundImage).not.toMatch(/#[0-9a-f]{3,8}/i);
      unmount();
    }
  });

  it('falls back to the grid variant and cannot be un-hidden by a caller', () => {
    const { container } = render(<TechBackdrop variant="nope" aria-hidden={false} />);

    const backdrop = container.firstElementChild;
    expect(backdrop).toHaveAttribute('data-variant', 'grid');
    expect(backdrop).toHaveAttribute('aria-hidden', 'true');
  });
});
