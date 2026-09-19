#!/usr/bin/env python3
"""Generate the site favicon set from the supplied pixel-art fish."""

from __future__ import annotations

import argparse
from collections import defaultdict
from pathlib import Path
from xml.sax.saxutils import quoteattr

from PIL import Image, ImageDraw

EXPECTED_SIZE = (148, 125)
EXPECTED_BBOX = (47, 39, 100, 85)
PLATE = (30, 30, 30, 255)
PALETTE_SIZE = 16


def clean_sprite(source: Path) -> Image.Image:
    image = Image.open(source).convert("RGBA")
    if image.size != EXPECTED_SIZE or image.getchannel("A").getbbox() != EXPECTED_BBOX:
        raise ValueError(
            f"Unexpected source geometry: {image.size}, {image.getchannel('A').getbbox()}"
        )

    sprite = image.crop(EXPECTED_BBOX)
    confident = [
        (x, y, sprite.getpixel((x, y))[:3])
        for y in range(sprite.height)
        for x in range(sprite.width)
        if sprite.getpixel((x, y))[3] >= 250
    ]

    hard = Image.new("RGBA", sprite.size, (0, 0, 0, 0))
    for y in range(sprite.height):
        for x in range(sprite.width):
            red, green, blue, alpha = sprite.getpixel((x, y))
            if alpha < 128:
                continue
            if alpha < 250:
                red, green, blue = min(
                    confident,
                    key=lambda item: (item[0] - x) ** 2 + (item[1] - y) ** 2,
                )[2]
            hard.putpixel((x, y), (red, green, blue, 255))

    quantized = hard.quantize(
        colors=PALETTE_SIZE,
        method=Image.Quantize.FASTOCTREE,
        dither=Image.Dither.NONE,
    ).convert("RGBA")
    quantized.putalpha(hard.getchannel("A"))

    # Re-trim after hardening alpha; the surviving silhouette is even-sized,
    # which allows exact integer centering in every square output.
    bbox = quantized.getchannel("A").getbbox()
    if not bbox:
        raise ValueError("The cleaned sprite is empty")
    return quantized.crop(bbox)


def maximal_rectangles(sprite: Image.Image) -> dict[tuple[int, int, int], list[tuple[int, int, int, int]]]:
    cells: dict[tuple[int, int, int], set[tuple[int, int]]] = defaultdict(set)
    for y in range(sprite.height):
        for x in range(sprite.width):
            red, green, blue, alpha = sprite.getpixel((x, y))
            if alpha:
                cells[(red, green, blue)].add((x, y))

    rectangles: dict[tuple[int, int, int], list[tuple[int, int, int, int]]] = defaultdict(list)
    for color, remaining in cells.items():
        while remaining:
            x, y = min(remaining, key=lambda point: (point[1], point[0]))
            best_width = best_height = 1
            width = sprite.width - x
            height = 0
            while y + height < sprite.height and (x, y + height) in remaining:
                row_width = 0
                while (x + row_width, y + height) in remaining:
                    row_width += 1
                width = min(width, row_width)
                height += 1
                if width * height > best_width * best_height:
                    best_width, best_height = width, height
            rectangles[color].append((x, y, best_width, best_height))
            for yy in range(y, y + best_height):
                for xx in range(x, x + best_width):
                    remaining.remove((xx, yy))
    return rectangles


def write_svg(sprite: Image.Image, destination: Path) -> None:
    groups = maximal_rectangles(sprite)
    lines = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Goldfish">',
        f'  <g transform="translate({(64 - sprite.width) // 2} {(64 - sprite.height) // 2})" shape-rendering="crispEdges">',
    ]
    for color, rectangles in sorted(groups.items()):
        fill = f"#{color[0]:02x}{color[1]:02x}{color[2]:02x}"
        lines.append(f"    <g fill={quoteattr(fill)}>")
        for x, y, width, height in rectangles:
            lines.append(f'      <rect x="{x}" y="{y}" width="{width}" height="{height}"/>')
        lines.append("    </g>")
    lines.extend(["  </g>", "</svg>", ""])
    destination.write_text("\n".join(lines))


def square_icon(sprite: Image.Image, size: int, scale: int, rounded: bool = False) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0) if rounded else PLATE)
    if rounded:
        draw = ImageDraw.Draw(canvas)
        draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=round(size * 0.22), fill=PLATE)
    fish = sprite.resize((sprite.width * scale, sprite.height * scale), Image.Resampling.NEAREST)
    position = ((size - fish.width) // 2, (size - fish.height) // 2)
    canvas.alpha_composite(fish, position)
    return canvas


def generate(source: Path, project_root: Path) -> None:
    public = project_root / "public"
    tool_dir = project_root / "tools" / "icon"
    tool_dir.mkdir(parents=True, exist_ok=True)

    sprite = clean_sprite(source)
    sprite.save(tool_dir / "fish.clean.png", optimize=True)
    sprite.resize((sprite.width * 16, sprite.height * 16), Image.Resampling.NEAREST).save(
        tool_dir / "fish.preview.png", optimize=True
    )
    write_svg(sprite, public / "favicon.svg")

    apple = square_icon(sprite, 180, 3).convert("RGB")
    apple.save(public / "apple-touch-icon.png", optimize=True)

    square_icon(sprite, 192, 2).convert("RGB").save(
        public / "web-app-manifest-192x192.png", optimize=True
    )
    square_icon(sprite, 512, 5).convert("RGB").save(
        public / "web-app-manifest-512x512.png", optimize=True
    )

    ico_master = square_icon(sprite, 256, 4, rounded=True)
    ico_master.save(
        public / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("--project-root", type=Path, default=Path(__file__).resolve().parents[2])
    args = parser.parse_args()
    generate(args.source.expanduser().resolve(), args.project_root.resolve())


if __name__ == "__main__":
    main()
