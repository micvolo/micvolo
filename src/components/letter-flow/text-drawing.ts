import type { ParsedText } from './text-parsing';

type PathCommand = { type: string; x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number };

function toCanvasPath(commands: PathCommand[]) {
  const outline = new Path2D();
  for (const command of commands) {
    switch (command.type) {
      case 'M': outline.moveTo(command.x!, command.y!); break;
      case 'L': outline.lineTo(command.x!, command.y!); break;
      case 'Q': outline.quadraticCurveTo(command.x1!, command.y1!, command.x!, command.y!); break;
      case 'C': outline.bezierCurveTo(command.x1!, command.y1!, command.x2!, command.y2!, command.x!, command.y!); break;
      case 'Z': outline.closePath(); break;
    }
  }
  return outline;
}

// sf-pro.ttf ships a single weight; glyphs are emboldened by stroking their outline with the fill color.
const BOLD_RATIO = 0.045;

export function drawText(_p5: any, text: ParsedText) {
  const context = text.layer.drawingContext as CanvasRenderingContext2D;
  context.save();
  context.translate(text.traslate.x, text.traslate.y);
  context.lineJoin = 'round';
  context.fillStyle = text.textcolor;
  context.strokeStyle = text.textcolor;
  context.lineWidth = text.size * BOLD_RATIO;

  for (const path of text.paths) {
    const outline = toCanvasPath(path.commands as PathCommand[]);
    context.stroke(outline);
    context.fill(outline, 'evenodd');
    if (text.stroke) {
      context.lineWidth = text.strokeWeight;
      context.strokeStyle = text.strokecolor;
      context.stroke(outline);
    }
  }
  context.restore();
}

export function calcReturnAnimation(p5: any, text: ParsedText, selectCurves: boolean) {
  for (const path of text.paths) {
    for (const c of path.commands as any[]) {
      if (c.lerp) {
        c.x = p5.lerp(c.startX, c.x, c.lerpValue);
        c.y = p5.lerp(c.startY, c.y, c.lerpValue);
        if (selectCurves) {
          c.x1 = p5.lerp(c.startX1, c.x1, c.lerpValue);
          c.y1 = p5.lerp(c.startY1, c.y1, c.lerpValue);
          c.x2 = p5.lerp(c.startX2, c.x2, c.lerpValue);
          c.y2 = p5.lerp(c.startY2, c.y2, c.lerpValue);
        }
        c.lerpValue -= text.backSpeed;
        if (c.lerpValue <= 0) {
          c.lerp = false;
          c.lerpValue = 1;
        }
      }
    }
  }
}

export function calcMousePressed(p5: any, tempLayer: any, translatingVertex: any[], mouseSize: number, selectCurves: boolean) {
  tempLayer.push();
  tempLayer.stroke('red');
  tempLayer.noFill();
  tempLayer.circle(p5.mouseX, p5.mouseY, mouseSize);
  tempLayer.pop();
  if (translatingVertex?.length > 0) {
    const list = translatingVertex[translatingVertex.length - 1];
    if (list) {
      for (const text of list.texts) {
        for (const v of text.vertex) {
          v.x += p5.mouseX - list.mouse.x;
          v.y += p5.mouseY - list.mouse.y;
          if (selectCurves) {
            v.x1 += p5.mouseX - list.mouse.x;
            v.y1 += p5.mouseY - list.mouse.y;
            v.x2 += p5.mouseX - list.mouse.x;
            v.y2 += p5.mouseY - list.mouse.y;
          }
        }
      }
      list.mouse.x = p5.mouseX;
      list.mouse.y = p5.mouseY;
    }
  }
}
