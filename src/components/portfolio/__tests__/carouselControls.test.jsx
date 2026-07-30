import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CarouselControls from '../CarouselControls';

/**
 * Component tests for the portfolio carousel controls (task 11.2).
 * Requirements: 6.3, 6.4, 6.5, 10.8
 */

const selectors = () =>
  screen.getAllByRole('button').filter((node) => node.dataset.slot === 'carousel-selector');

describe('CarouselControls naming', () => {
  it('renders previous and next as named icon controls', () => {
    render(<CarouselControls index={0} count={4} />);

    const prev = screen.getByRole('button', { name: 'Previous' });
    const next = screen.getByRole('button', { name: 'Next' });

    // Both arrows come from the IconButton primitive, which is what makes the
    // accessible name mandatory and the glyph decorative.
    expect(prev).toHaveAttribute('data-slot', 'icon-button');
    expect(prev).toHaveAttribute('data-control', 'prev');
    expect(next).toHaveAttribute('data-slot', 'icon-button');
    expect(next).toHaveAttribute('data-control', 'next');
    expect(prev).toHaveAccessibleName('Previous');
    expect(next).toHaveAccessibleName('Next');
  });

  it('renders one real button per project named "Show project N"', () => {
    render(<CarouselControls index={2} count={5} />);

    const list = selectors();
    expect(list).toHaveLength(5);

    list.forEach((node, i) => {
      expect(node.tagName).toBe('BUTTON');
      expect(node).toHaveAttribute('type', 'button');
      expect(node).toHaveAccessibleName(`Show project ${i + 1}`);
    });

    expect(screen.getByRole('button', { name: 'Show project 5' })).toBeInTheDocument();
  });
});

describe('CarouselControls cyclic requests', () => {
  it('requests the first project when next is activated on the final project', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();

    render(<CarouselControls index={3} count={4} onNext={onNext} />);
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledWith(0);
  });

  it('requests the final project when previous is activated on the first project', async () => {
    const user = userEvent.setup();
    const onPrev = vi.fn();

    render(<CarouselControls index={0} count={4} onPrev={onPrev} />);
    await user.click(screen.getByRole('button', { name: 'Previous' }));

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onPrev).toHaveBeenCalledWith(3);
  });

  it('requests the adjacent projects away from the ends', async () => {
    const user = userEvent.setup();
    const onPrev = vi.fn();
    const onNext = vi.fn();

    render(<CarouselControls index={1} count={4} onPrev={onPrev} onNext={onNext} />);

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Previous' }));

    expect(onNext).toHaveBeenCalledWith(2);
    expect(onPrev).toHaveBeenCalledWith(0);
  });

  it('requests the selected index when a slide selector is activated', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<CarouselControls index={0} count={4} onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: 'Show project 3' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(2);
  });
});

describe('CarouselControls selected state', () => {
  it('exposes the selected state on exactly one selector', () => {
    render(<CarouselControls index={2} count={4} />);

    const current = selectors().filter((node) => node.getAttribute('aria-current') === 'true');
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAccessibleName('Show project 3');

    selectors()
      .filter((node) => node !== current[0])
      .forEach((node) => {
        expect(node).not.toHaveAttribute('aria-current');
      });
  });

  it('marks the selected selector with a non-color signal the others lack', () => {
    render(<CarouselControls index={1} count={3} />);

    const marks = selectors().map((node) => node.querySelector('span').className);

    // The selected mark is wider; the others share one narrower width.
    expect(marks[1]).toContain('w-[var(--space-6)]');
    expect(marks[0]).toContain('w-[var(--space-3)]');
    expect(marks[2]).toContain('w-[var(--space-3)]');
    expect(marks[0]).not.toContain('w-[var(--space-6)]');
  });
});
