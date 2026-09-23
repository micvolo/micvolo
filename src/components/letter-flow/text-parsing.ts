import opentype from 'opentype.js';

export type ParsedText = {
  paths: opentype.Path[];
  width: number;
  heigth: number;
  size: number;
  traslate: { x: number; y: number };
  stroke: boolean;
  strokeWeight: number;
  strokecolor: string;
  textcolor: string;
  straEffect: boolean;
  back: boolean;
  lock: boolean;
  backSpeed: number;
  backDelay: number;
  layer?: any;
};

export type TextParams = {
  string: string;
  size: number;
  lineHeight: number;
  textcolor: string;
  strokecolor: string;
  stroke: boolean;
  strokeWeight: number;
  move: { x: number; y: number };
  straEffect: boolean;
  return: boolean;
  returnSpeed: number;
  delay: number;
  lock: boolean;
  font: string | null;
};

export async function getParsedTexts(texts: TextParams[], clientWidth: number, clientHeight: number): Promise<ParsedText[]> {
  const res: ParsedText[] = [];
  for (const text of texts) {
    const fontUrl = text.font || '';
    const r = await fetch(fontUrl);
    const blob = await r.blob();
    const font = opentype.parse(await new File([blob], 'f').arrayBuffer());

    const strings = text.string.split('\n');
    const totalLines = strings.length;
    const longest = strings.reduce((a, b) => (a.length > b.length ? a : b));

    let width = font.getAdvanceWidth(longest, text.size);
    const g = font.getPath('G', 0, 0, text.size).getBoundingBox();
    const h = Math.abs(g.y2 - g.y1) * text.lineHeight;
    const heigth = h * totalLines;

    const paths: opentype.Path[] = [];
    for (const [i, string] of strings.entries()) {
      const p = font.getPaths(string, 0, h * i, text.size);
      paths.push(...p);
    }

    for (const path of paths) {
      for (const c of path.commands as any[]) {
        c.startX = c.x; c.startY = c.y; c.startX1 = c.x1; c.startY1 = c.y1; c.startX2 = c.x2; c.startY2 = c.y2;
      }
    }

    const moveX = (clientWidth / 2) * text.move.x;
    const moveY = (clientHeight / 2) * text.move.y;

    res.push({
      paths,
      width,
      heigth,
      size: text.size,
      traslate: { x: (clientWidth - width) / 2 + moveX, y: (clientHeight - heigth) / 2 + h + moveY },
      stroke: text.stroke,
      strokeWeight: text.strokeWeight,
      strokecolor: text.strokecolor,
      textcolor: text.textcolor,
      straEffect: text.straEffect,
      back: text.return,
      lock: text.lock,
      backSpeed: text.returnSpeed,
      backDelay: text.delay,
    });
  }
  return res;
}
