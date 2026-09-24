import { Pane, type FolderApi } from 'tweakpane';
import './params.css';

/** Keys of T whose values are assignable to V. */
type KeyOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T] & string;

export type NumberFieldOptions = {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  /** Read-only monitor; kept in sync via ParamsApi.refresh(). */
  readonly?: boolean;
};

export type TextFieldOptions = { label?: string };

export type FieldOptions = { label?: string };

/** Builds fields into a params pane; available inside setup() and addGroup(). */
export type FieldsApi = {
  addNumber<T extends Record<string, any>>(target: T, key: KeyOfType<T, number>, opts?: NumberFieldOptions): void;
  addText<T extends Record<string, any>>(target: T, key: KeyOfType<T, string>, opts?: TextFieldOptions): void;
  addColor<T extends Record<string, any>>(target: T, key: KeyOfType<T, string>, opts?: FieldOptions): void;
  addBoolean<T extends Record<string, any>>(target: T, key: KeyOfType<T, boolean>, opts?: FieldOptions): void;
  addButton(title: string, onClick: () => void): void;
  addGroup(title: string, build: (fields: FieldsApi) => void): void;
};

export type ParamsOptions = {
  /** Header slot the "Parameters" toggle button renders into (LabCard / LetterFlowCard). */
  root: HTMLElement;
  /** Stage the native Tweakpane pane host is attached to (it parks fixed at the right screen edge). */
  stage: HTMLElement;
  /** Toggle button text. Default 'Parameters'. */
  label?: string;
  /** Called after any field writes its target. */
  onChange?: () => void;
  setup: (fields: FieldsApi) => void;
};

export type ParamsApi = {
  el: HTMLElement;
  isOpen: () => boolean;
  setOpen: (open: boolean) => void;
  /** Re-sync displayed values from the bound targets (e.g. read-only monitors). */
  refresh: () => void;
  dispose: () => void;
};

let paramsCount = 0;

// Parameter controls must not reach window-level handlers (p5 letter drags
// listen on the window), neither from the toggle button nor from the pane.
const INTERACTION_EVENTS = [
  'pointerdown', 'pointermove', 'pointerup', 'pointercancel',
  'mousedown', 'mousemove', 'mouseup',
  'touchstart', 'touchmove', 'touchend', 'touchcancel',
  'wheel', 'click', 'dblclick', 'contextmenu',
] as const;

const prettify = (key: string) =>
  key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());

/**
 * Shared parameter pane backed by native Tweakpane (no theme overrides). Each
 * field binds directly to a property of the experiment's param object and Tweakpane
 * writes it in place. The pane starts closed behind a small brand "Parameters"
 * toggle in the header slot and parks fixed at the right screen edge, vertically
 * anchored under the toggle row (full-width bottom sheet on narrow screens).
 */
export function createParams({ root, stage, label = 'Parameters', onChange, setup }: ParamsOptions): ParamsApi {
  const syncs: Array<() => void> = [];
  const notify = () => onChange?.();

  const el = document.createElement('div');
  el.className = 'params';

  const paneBox = document.createElement('div');
  paneBox.className = 'params__pane';
  paneBox.id = `params-pane-${++paramsCount}`;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'params__toggle';
  button.textContent = label;
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', paneBox.id);
  el.appendChild(button);

  const pane = new Pane({ container: paneBox });

  const setOpen = (open: boolean) => {
    if (open) {
      // Anchor the fixed pane just under the toggle row (right screen edge).
      const rect = button.getBoundingClientRect();
      const top = Math.min(Math.max(8, Math.round(rect.bottom + 8)), window.innerHeight - 120);
      paneBox.style.setProperty('--params-top', `${top}px`);
    }
    paneBox.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  };
  const isOpen = () => !paneBox.hidden;
  setOpen(false);

  button.addEventListener('click', () => setOpen(!isOpen()));
  for (const host of [el, paneBox]) {
    host.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !isOpen()) return;
      setOpen(false);
      button.focus();
    });
    for (const type of INTERACTION_EVENTS) {
      host.addEventListener(type, (event) => event.stopPropagation());
    }
  }

  setup(fieldsFor(pane, syncs, notify));
  root.appendChild(el);
  stage.appendChild(paneBox);

  return {
    el,
    isOpen,
    setOpen,
    refresh: () => syncs.forEach((apply) => apply()),
    dispose: () => {
      pane.dispose();
      el.remove();
      paneBox.remove();
    },
  };
}

type AnyBinding = ReturnType<FolderApi['addBinding']>;

function fieldsFor(container: FolderApi, syncs: Array<() => void>, notify: () => void): FieldsApi {
  /** Input bindings report edits through notify(); monitors only re-sync on refresh(). */
  const track = (binding: AnyBinding, monitor: boolean) => {
    if (!monitor) binding.on('change', notify);
    // Never clobber a control the user is editing when re-syncing from the target.
    syncs.push(() => {
      if (!binding.element.contains(document.activeElement)) binding.refresh();
    });
  };

  return {
    addNumber(target, key, opts = {}) {
      const label = opts.label ?? prettify(key);
      track(opts.readonly
        ? container.addBinding(target, key, { label, readonly: true, min: opts.min, max: opts.max })
        : container.addBinding(target, key, { label, min: opts.min, max: opts.max, step: opts.step }),
      Boolean(opts.readonly));
    },

    addText(target, key, opts = {}) {
      track(container.addBinding(target, key, { label: opts.label ?? prettify(key) }), false);
    },

    addColor(target, key, opts = {}) {
      // A '#rrggbb' string auto-binds to Tweakpane's color input and keeps the string format.
      track(container.addBinding(target, key, { label: opts.label ?? prettify(key) }), false);
    },

    addBoolean(target, key, opts = {}) {
      track(container.addBinding(target, key, { label: opts.label ?? prettify(key) }), false);
    },

    addButton(title, onClick) {
      container.addButton({ title }).on('click', () => onClick());
    },

    addGroup(title, build) {
      build(fieldsFor(container.addFolder({ title, expanded: false }), syncs, notify));
    },
  };
}
