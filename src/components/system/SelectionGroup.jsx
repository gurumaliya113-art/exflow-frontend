import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { cn } from '@/lib/utils';

/**
 * `SelectionGroup` - the shared selected-state context for a control group
 * (service chips, project cards, calendar days, slide selectors).
 *
 * Two jobs:
 *
 * 1. It owns "which member is selected". Members read the group value and ask
 *    for a change through `select`, so a group can only ever expose one
 *    selected value at a time (Requirements 4.8, 6.2).
 * 2. It enforces accent discipline. Selected states default to
 *    `--color-tech-cyan`; `accent="brand"` is allowed for at most one member of
 *    a group (Requirement 1.3). Members report their requested accent at
 *    registration and the group emits an `import.meta.env.DEV`-only
 *    `console.warn` when more than one asks for `brand`. The guard compiles out
 *    of production builds, exactly like the `SectionHeading` slot guard.
 *
 * Requirements: 1.3, 4.8, 6.2
 */

/** Accents a group member may request for its selected state. */
export const SELECTION_ACCENTS = ['tech', 'brand'];

const DEFAULT_ACCENT = 'tech';

const SelectionGroupContext = createContext(null);

/**
 * Read the enclosing group. Returns `null` outside a `SelectionGroup` so a
 * control can render standalone without a provider.
 *
 * @returns {{
 *   name: string,
 *   value: unknown,
 *   select: (value: unknown) => void,
 *   isSelected: (value: unknown) => boolean,
 *   registerMember: (member: { id: string, accent?: string, selected?: boolean }) => () => void,
 * } | null}
 */
export function useSelectionGroup() {
  return useContext(SelectionGroupContext);
}

function warnInDev(message) {
  if (import.meta.env?.DEV) {
    // eslint-disable-next-line no-console
    console.warn(`[SelectionGroup] ${message}`);
  }
}

/** Stable signature for a set of member ids, so one violation warns once. */
function signatureOf(ids) {
  return ids.slice().sort().join('|');
}

export function SelectionGroup({
  name = 'selection-group',
  value: controlledValue,
  defaultValue = null,
  onChange,
  label,
  as: Tag = 'div',
  className,
  children,
  ...rest
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const membersRef = useRef(new Map());
  // Warned signatures, not counters: members re-register whenever their
  // selected state changes, so the registry dips between cleanup and re-run.
  // Remembering which violations were already reported keeps one warning per
  // distinct violation instead of one per commit.
  const warnedAccentRef = useRef(new Set());
  const warnedSelectionRef = useRef(new Set());

  /**
   * Audit the registry. Runs after member registration and after every commit;
   * the signature refs make each distinct violation warn exactly once instead
   * of once per render.
   */
  const audit = useCallback(() => {
    if (!import.meta.env?.DEV) return;

    const members = [...membersRef.current.values()];

    const brand = members.filter((m) => m.accent === 'brand').map((m) => m.id);
    if (brand.length > 1) {
      const signature = signatureOf(brand);
      if (!warnedAccentRef.current.has(signature)) {
        warnedAccentRef.current.add(signature);
        warnInDev(
          `group "${name}" has ${brand.length} members requesting accent="brand" (${brand
            .slice()
            .sort()
            .join(', ')}). A control group may paint the Brand_Accent on at most one selected-state indicator; use accent="tech" for the rest.`,
        );
      }
    }

    const selected = members.filter((m) => m.selected).map((m) => m.id);
    if (selected.length > 1) {
      const signature = signatureOf(selected);
      if (!warnedSelectionRef.current.has(signature)) {
        warnedSelectionRef.current.add(signature);
        warnInDev(
          `group "${name}" reports ${selected.length} selected members (${selected
            .slice()
            .sort()
            .join(', ')}). Exactly one member of a control group may be selected at a time.`,
        );
      }
    }
  }, [name]);

  const registerMember = useCallback(
    ({ id, accent = DEFAULT_ACCENT, selected = false }) => {
      const memberId = id ?? `member-${membersRef.current.size + 1}`;
      membersRef.current.set(memberId, { id: memberId, accent, selected });
      audit();
      return () => {
        membersRef.current.delete(memberId);
        audit();
      };
    },
    [audit],
  );

  const select = useCallback(
    (next) => {
      if (!isControlled) setUncontrolledValue(next);
      if (onChange) onChange(next);
    },
    [isControlled, onChange],
  );

  const isSelected = useCallback((candidate) => candidate === value, [value]);

  // Child effects run before the parent's, so the registry is populated by the
  // time this runs on mount.
  useEffect(() => {
    audit();
  });

  const context = useMemo(
    () => ({ name, value, select, isSelected, registerMember }),
    [name, value, select, isSelected, registerMember],
  );

  return (
    <SelectionGroupContext.Provider value={context}>
      <Tag
        data-slot="selection-group"
        data-group={name}
        role="group"
        aria-label={label}
        className={cn(className)}
        {...rest}
      >
        {children}
      </Tag>
    </SelectionGroupContext.Provider>
  );
}

/**
 * Convenience hook for a group member: registers the member's requested accent
 * and selected state, and returns the resolved selected flag plus a `select`
 * callback. Works without a provider (the control then owns its own state).
 *
 * @param {{ id: string, value?: unknown, accent?: string, selected?: boolean }} options
 */
export function useSelectionMember({ id, value, accent = DEFAULT_ACCENT, selected }) {
  const group = useSelectionGroup();
  const resolvedAccent = SELECTION_ACCENTS.includes(accent) ? accent : DEFAULT_ACCENT;
  const memberValue = value === undefined ? id : value;
  const isSelected =
    selected !== undefined ? selected : group ? group.isSelected(memberValue) : false;

  const registerMember = group?.registerMember;
  useEffect(() => {
    if (!registerMember) return undefined;
    return registerMember({ id, accent: resolvedAccent, selected: isSelected });
  }, [registerMember, id, resolvedAccent, isSelected]);

  const select = useCallback(() => {
    if (group) group.select(memberValue);
  }, [group, memberValue]);

  return { selected: isSelected, accent: resolvedAccent, select, group };
}

export default SelectionGroup;
