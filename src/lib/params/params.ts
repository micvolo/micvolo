import './params.css';

/** Keys of T whose values are assignable to V. */
type KeyOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T] & string;

export type NumberFieldOptions = {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  /** Read-only display; kept in sync via ParamsApi.refresh(). */
  readonly?: boolean;
};

export type TextFieldOptions = {
  label?: string;
  placeholder?: string;
  multiline?: boolean;
};

export type FieldOptions = { label?: string };

/** Builds fields into a params row; available inside setup() and addGroup(). */
export type FieldsApi = {
  addNumber<T extends object>(target: T, key: KeyOfType<T, number>, opts?: NumberFieldOptions): void;
  addText<T extends object>(target: T, key: KeyOfType<T, string>, opts?: TextFieldOptions): void;
  addColor<T extends object>(target: T, key: KeyOfType<T, string>, opts?: FieldOptions): void;
  addBoolean<T extends object>(target: T, key: KeyOfType<T, boolean>, opts?: FieldOptions): void;
  addButton(title: string, onClick: () => void): void;
  addGroup(title: string, build: (fields: FieldsApi) => void): void;
};

export type ParamsOptions = {
  /** Description-area slot the fields render into (LabCard / LetterFlowCard header row). */
  root: HTMLElement;
  /** Toggle button text when `toggle` is set. Default 'Parameters'. */
  label?: string;
  /** Many-param layout: fields start collapsed behind the toggle button. */
  toggle?: boolean;
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

// Parameter fields live in the header, but pointer gestures on them must not
// reach window-level handlers (p5 letter drags listen on the window).
const INTERACTION_EVENTS = [
  'pointerdown', 'pointermove', 'pointerup', 'pointercancel',
  'mousedown', 'mousemove', 'mouseup',
  'touchstart', 'touchmove', 'touchend', 'touchcancel',
  'wheel', 'click', 'dblclick', 'contextmenu',
] as const;

const prettify = (key: string) =>
  key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());

/**
 * Shared inline parameter fields for experiment description areas. Each field
 * binds directly to a property of the experiment's param object and writes it
 * in place. Few params: fields render straight into the row (`toggle: false`);
 * many params: they collapse behind a "Parameters" button (`toggle: true`).
 */
export function createParams({ root, label = 'Parameters', toggle = false, onChange, setup }: ParamsOptions): ParamsApi {
  const syncs: Array<() => void> = [];

  const el = document.createElement('div');
  el.className = 'params';

  const row = document.createElement('div');
  row.className = 'params__row';

  let button: HTMLButtonElement | null = null;
  if (toggle) {
    row.id = `params-row-${++paramsCount}`;
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'params__toggle';
    button.textContent = label;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', row.id);
    row.hidden = true;
    el.append(button, row);
  } else {
    el.append(row);
  }

  const setOpen = (open: boolean) => {
    if (!button) return;
    row.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  };
  const isOpen = () => (button ? !row.hidden : true);

  if (button) {
    button.addEventListener('click', () => setOpen(!isOpen()));
    el.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !isOpen()) return;
      setOpen(false);
      button?.focus();
    });
  }
  for (const type of INTERACTION_EVENTS) {
    el.addEventListener(type, (event) => event.stopPropagation());
  }

  setup(fieldsFor(row, syncs, () => onChange?.()));
  root.appendChild(el);

  return {
    el,
    isOpen,
    setOpen,
    refresh: () => syncs.forEach((apply) => apply()),
    dispose: () => el.remove(),
  };
}

function fieldsFor(container: HTMLElement, syncs: Array<() => void>, notify: () => void): FieldsApi {
  const addField = (label: string | undefined, key: string, control: HTMLElement, extra = '') => {
    const field = document.createElement('label');
    field.className = `params__field${extra ? ` ${extra}` : ''}`;
    const text = document.createElement('span');
    text.className = 'params__label';
    text.textContent = label ?? prettify(key);
    field.append(text, control);
    container.append(field);
  };

  const track = (control: HTMLElement, apply: () => void) => {
    syncs.push(() => {
      if (control !== document.activeElement) apply();
    });
  };

  return {
    addNumber(target, key, opts = {}) {
      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'params__input params__input--number';
      if (opts.min !== undefined) input.min = String(opts.min);
      if (opts.max !== undefined) input.max = String(opts.max);
      if (opts.step !== undefined) input.step = String(opts.step);
      if (opts.readonly) { input.readOnly = true; input.tabIndex = -1; }
      input.value = String(Reflect.get(target, key));
      input.addEventListener('input', () => {
        if (input.value.trim() === '') return;
        const value = Number(input.value);
        if (!Number.isFinite(value)) return;
        Reflect.set(target, key, value);
        notify();
      });
      input.addEventListener('change', () => {
        const current = Number(Reflect.get(target, key));
        const parsed = input.value.trim() === '' ? Number.NaN : Number(input.value);
        const value = Number.isFinite(parsed) ? parsed : current;
        const clamped = Math.min(opts.max ?? Infinity, Math.max(opts.min ?? -Infinity, value));
        if (clamped !== current) {
          Reflect.set(target, key, clamped);
          notify();
        }
        input.value = String(clamped);
      });
      addField(opts.label, key, input, opts.readonly ? 'params__field--monitor' : '');
      track(input, () => { input.value = String(Reflect.get(target, key)); });
    },

    addText(target, key, opts = {}) {
      const control = opts.multiline ? document.createElement('textarea') : document.createElement('input');
      if (control instanceof HTMLInputElement) control.type = 'text';
      else control.rows = 3;
      control.className = 'params__input params__input--text';
      if (opts.placeholder) control.placeholder = opts.placeholder;
      control.value = String(Reflect.get(target, key) ?? '');
      control.addEventListener('input', () => {
        Reflect.set(target, key, control.value);
        notify();
      });
      addField(opts.label, key, control);
      track(control, () => { control.value = String(Reflect.get(target, key) ?? ''); });
    },

    addColor(target, key, opts = {}) {
      const input = document.createElement('input');
      input.type = 'color';
      input.className = 'params__input params__input--color';
      input.value = String(Reflect.get(target, key));
      input.addEventListener('input', () => {
        Reflect.set(target, key, input.value);
        notify();
      });
      addField(opts.label, key, input);
      track(input, () => { input.value = String(Reflect.get(target, key)); });
    },

    addBoolean(target, key, opts = {}) {
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.className = 'params__check';
      input.checked = Boolean(Reflect.get(target, key));
      input.addEventListener('input', () => {
        Reflect.set(target, key, input.checked);
        notify();
      });
      addField(opts.label, key, input, 'params__field--check');
      track(input, () => { input.checked = Boolean(Reflect.get(target, key)); });
    },

    addButton(title, onClick) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'params__button';
      button.textContent = title;
      button.addEventListener('click', onClick);
      container.append(button);
    },

    addGroup(title, build) {
      const group = document.createElement('details');
      group.className = 'params__group';
      const summary = document.createElement('summary');
      summary.className = 'params__group-title';
      summary.textContent = title;
      const inner = document.createElement('div');
      inner.className = 'params__row';
      group.append(summary, inner);
      container.append(group);
      build(fieldsFor(inner, syncs, notify));
    },
  };
}
