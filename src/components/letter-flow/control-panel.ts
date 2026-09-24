import { createParams, type FieldsApi, type ParamsApi } from '@/lib/params/params';
import { loadJson, removeJson, saveJson, STORAGE_KEYS } from '@/lib/storage';
import type { TextParams } from './text-parsing';

export type LetterFlowParams = {
  texts: TextParams[];
  mouseSize: number;
  selectCurves: boolean;
  export: { withBackground: boolean };
};

export const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const finite = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const color = (value: unknown, fallback: string) => typeof value === 'string' && /^#[\da-f]{6}$/i.test(value) ? value : fallback;

function validText(value: unknown, fallback: TextParams): TextParams | null {
  if (!value || typeof value !== 'object') return null;
  const text = value as Partial<TextParams>;
  if (typeof text.string !== 'string' || !text.string.trim() || typeof text.font !== 'string' || !text.font) return null;
  return {
    string: text.string,
    size: Math.max(1, finite(text.size, fallback.size)),
    lineHeight: finite(text.lineHeight, fallback.lineHeight),
    textcolor: color(text.textcolor, fallback.textcolor),
    strokecolor: color(text.strokecolor, fallback.strokecolor),
    stroke: Boolean(text.stroke),
    strokeWeight: Math.max(0, finite(text.strokeWeight, fallback.strokeWeight)),
    move: { x: finite(text.move?.x, fallback.move.x), y: finite(text.move?.y, fallback.move.y) },
    straEffect: Boolean(text.straEffect),
    return: text.return !== false,
    returnSpeed: Math.max(.001, finite(text.returnSpeed, fallback.returnSpeed)),
    delay: Math.max(0, finite(text.delay, fallback.delay)),
    lock: Boolean(text.lock),
    font: text.font,
  };
}

export function setupControlPanel(
  params: LetterFlowParams,
  resetValues: LetterFlowParams,
  refreshTexts: () => Promise<void>,
  saveScreen: () => void,
  reset: () => Promise<void>,
  root: HTMLElement,
  stage: HTMLElement,
): ParamsApi {
  return createParams({
    root,
    stage,
    label: 'Parameters',
    onChange: () => { saveCurrent(params); void refreshTexts(); },
    setup: (fields) => {
      fields.addNumber(params, 'mouseSize', { label: 'Mouse size', min: 0, max: 1000, step: 1 });
      fields.addBoolean(params.export, 'withBackground', { label: 'Export background' });
      fields.addButton('Create new', () => {
        params.texts.push(clone(resetValues.texts[0]));
        addTextFields(fields, params.texts.at(-1)!, params, refreshTexts, params.texts.length);
        saveCurrent(params);
        void refreshTexts();
      });
      fields.addButton('Save screenshot', saveScreen);
      fields.addButton('Reset all', () => void reset());
      params.texts.forEach((text, index) => addTextFields(fields, text, params, refreshTexts, index + 1));
    },
  });
}

export function saveCurrent(params: LetterFlowParams) {
  saveJson(localStorage, STORAGE_KEYS.letterFlowParams, params);
}

export function clearSavedParams() {
  removeJson(localStorage, STORAGE_KEYS.letterFlowParams);
}

export function loadParams(defaultParams: LetterFlowParams): LetterFlowParams {
  const fallback = clone(defaultParams);
  try {
    const candidate = loadJson(localStorage, STORAGE_KEYS.letterFlowParams) as Partial<LetterFlowParams> | undefined;
    if (!candidate || !Array.isArray(candidate.texts) || candidate.texts.length === 0) throw new Error('Invalid Letter Flow preset');
    const texts = candidate.texts.map((text) => validText(text, fallback.texts[0]));
    if (texts.some((text) => !text)) throw new Error('Invalid Letter Flow text');
    return {
      texts: texts as TextParams[],
      mouseSize: Math.max(0, finite(candidate.mouseSize, fallback.mouseSize)),
      selectCurves: candidate.selectCurves !== false,
      export: { withBackground: Boolean(candidate.export?.withBackground) },
    };
  } catch {
    clearSavedParams();
    return fallback;
  }
}

function getBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function addTextFields(fields: FieldsApi, text: TextParams, params: LetterFlowParams, refreshTexts: () => Promise<void>, index: number) {
  fields.addGroup(`TYPE ${index}: "${text.string}"`, (group) => {
    group.addText(text, 'string', { label: 'Text' });
    group.addNumber(text, 'lineHeight', { label: 'Line height', min: -50, max: 50, step: 0.1 });
    group.addNumber(text, 'size', { min: 0, max: 1000, step: 1 });
    group.addNumber(text.move, 'x', { label: 'Move x', min: -1, max: 1, step: 0.01 });
    group.addNumber(text.move, 'y', { label: 'Move y', min: -1, max: 1, step: 0.01 });
    group.addBoolean(text, 'straEffect');
    group.addBoolean(text, 'lock');
    group.addBoolean(text, 'stroke');
    group.addNumber(text, 'strokeWeight', { label: 'Stroke weight', min: 0, max: 10, step: 0.1 });
    group.addColor(text, 'textcolor', { label: 'Text color' });
    group.addColor(text, 'strokecolor', { label: 'Stroke color' });
    group.addBoolean(text, 'return');
    group.addNumber(text, 'delay', { min: 0, max: 3, step: 0.001 });
    group.addNumber(text, 'returnSpeed', { label: 'Return speed', min: 0.001, max: 0.1, step: 0.001 });
    group.addButton('Import font', () => {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = '.ttf,.otf,.woff'; input.hidden = true;
      document.body.appendChild(input);
      input.addEventListener('change', async () => {
        try {
          const file = input.files?.[0];
          if (file) { text.font = await getBase64(file); saveCurrent(params); await refreshTexts(); }
        } finally { input.remove(); }
      }, { once: true });
      input.click();
    });
  });
}
