import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SelectionGroup, {
  SELECTION_ACCENTS,
  useSelectionGroup,
  useSelectionMember,
} from '../SelectionGroup';

/**
 * Component tests for the selection-group accent guard (task 6.9).
 * Requirements: 1.3, 4.8, 6.2
 */

/** A minimal group member: reports its accent and reads its selected state. */
function Chip({ id, accent = 'tech', label }) {
  const { selected, select, accent: resolvedAccent } = useSelectionMember({ id, accent });
  return (
    <button
      type="button"
      aria-pressed={selected}
      data-accent={resolvedAccent}
      onClick={select}
    >
      {label ?? id}
    </button>
  );
}

/** Reads the group context directly, so the exposed value is observable. */
function ValueProbe() {
  const group = useSelectionGroup();
  return <p data-testid="value">{String(group?.value)}</p>;
}

let warnSpy;

beforeEach(() => {
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  warnSpy.mockRestore();
});

const accentWarnings = () =>
  warnSpy.mock.calls.filter(
    (call) => typeof call[0] === 'string' && call[0].includes('accent="brand"'),
  );

describe('SelectionGroup context', () => {
  it('exposes the selected value to members and consumers', () => {
    render(
      <SelectionGroup name="services" defaultValue="web" label="Services">
        <ValueProbe />
        <Chip id="web" />
        <Chip id="apps" />
      </SelectionGroup>,
    );

    expect(screen.getByTestId('value')).toHaveTextContent('web');
    expect(screen.getByRole('button', { name: 'web' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'apps' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('group', { name: 'Services' })).toBeInTheDocument();
  });

  it('updates the exposed value on selection and keeps exactly one member selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SelectionGroup name="services" defaultValue="web" onChange={onChange}>
        <ValueProbe />
        <Chip id="web" />
        <Chip id="apps" />
        <Chip id="ai" />
      </SelectionGroup>,
    );

    await user.click(screen.getByRole('button', { name: 'ai' }));

    expect(onChange).toHaveBeenCalledWith('ai');
    expect(screen.getByTestId('value')).toHaveTextContent('ai');

    const pressed = screen
      .getAllByRole('button')
      .filter((node) => node.getAttribute('aria-pressed') === 'true');
    expect(pressed).toHaveLength(1);
    expect(pressed[0]).toHaveAccessibleName('ai');

    // No selected-state warning is emitted while selection stays unique.
    expect(warnSpy).not.toHaveBeenCalled();
  });
});

describe('SelectionGroup accent guard', () => {
  it('accepts a single brand-accent member without warning', () => {
    render(
      <SelectionGroup name="cards" defaultValue="a">
        <Chip id="a" accent="brand" />
        <Chip id="b" />
        <Chip id="c" />
      </SelectionGroup>,
    );

    expect(accentWarnings()).toHaveLength(0);
  });

  it('warns exactly once when two members request the brand accent', () => {
    render(
      <SelectionGroup name="cards" defaultValue="a">
        <Chip id="a" accent="brand" />
        <Chip id="b" accent="brand" />
        <Chip id="c" />
      </SelectionGroup>,
    );

    const warnings = accentWarnings();
    expect(warnings).toHaveLength(1);
    expect(warnings[0][0]).toContain('[SelectionGroup]');
    expect(warnings[0][0]).toContain('cards');
    expect(warnings[0][0]).toContain('a, b');
  });

  it('does not repeat the warning when the group re-renders on selection', async () => {
    const user = userEvent.setup();

    render(
      <SelectionGroup name="cards" defaultValue="a">
        <Chip id="a" accent="brand" />
        <Chip id="b" accent="brand" />
      </SelectionGroup>,
    );

    await user.click(screen.getByRole('button', { name: 'b' }));

    expect(accentWarnings()).toHaveLength(1);
  });

  it('falls back to the tech accent for unknown accents', () => {
    render(
      <SelectionGroup name="cards" defaultValue="a">
        <Chip id="a" accent="neon" />
        <Chip id="b" accent="neon" />
      </SelectionGroup>,
    );

    expect(SELECTION_ACCENTS).toEqual(['tech', 'brand']);
    expect(screen.getByRole('button', { name: 'a' })).toHaveAttribute('data-accent', 'tech');
    expect(accentWarnings()).toHaveLength(0);
  });
});
