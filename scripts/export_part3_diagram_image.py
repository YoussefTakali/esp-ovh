from pathlib import Path
import math
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(r"c:\Users\Youssef\OneDrive\Desktop\esprithub")
OUT_PNG = ROOT / "Poster_Part3_Diagram.png"
OUT_PDF = ROOT / "Poster_Part3_Diagram.pdf"

WIDTH = 4200
HEIGHT = 1400

BG = "#f8fafc"
TEXT = "#0f172a"
ARROW = "#334155"
BORDER = "#1f2937"

NODE_COLORS = [
    "#dbeafe",
    "#dcfce7",
    "#fef3c7",
    "#e9d5ff",
    "#fde68a",
    "#bfdbfe",
    "#bbf7d0",
]


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = ["arial.ttf", "segoeui.ttf", "calibri.ttf"]
    for name in candidates:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def text_width(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont) -> int:
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0]


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""

    for word in words:
        trial = (current + " " + word).strip()
        if text_width(draw, trial, font) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word

    if current:
        lines.append(current)

    return lines


def draw_centered_text(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    text: str,
    font: ImageFont.ImageFont,
    fill: str,
    line_spacing: int = 8,
) -> None:
    x1, y1, x2, y2 = box
    max_width = x2 - x1 - 36
    paragraphs = text.split("\n")

    lines: list[str] = []
    for p in paragraphs:
        if p.strip() == "":
            lines.append("")
        else:
            lines.extend(wrap_text(draw, p.strip(), font, max_width))

    line_heights: list[int] = []
    for line in lines:
        h = draw.textbbox((0, 0), line or "A", font=font)[3]
        line_heights.append(h)

    total_h = sum(line_heights) + line_spacing * max(0, len(lines) - 1)
    y = y1 + ((y2 - y1) - total_h) // 2

    for i, line in enumerate(lines):
        w = text_width(draw, line, font)
        x = x1 + ((x2 - x1) - w) // 2
        draw.text((x, y), line, font=font, fill=fill)
        y += line_heights[i] + line_spacing


def draw_arrowhead(
    draw: ImageDraw.ImageDraw,
    start: tuple[float, float],
    end: tuple[float, float],
    color: str,
    size: float = 20.0,
) -> None:
    angle = math.atan2(end[1] - start[1], end[0] - start[0])
    p1 = end
    p2 = (
        end[0] - size * math.cos(angle - math.pi / 6),
        end[1] - size * math.sin(angle - math.pi / 6),
    )
    p3 = (
        end[0] - size * math.cos(angle + math.pi / 6),
        end[1] - size * math.sin(angle + math.pi / 6),
    )
    draw.polygon([p1, p2, p3], fill=color)


def draw_dashed_line(
    draw: ImageDraw.ImageDraw,
    start: tuple[float, float],
    end: tuple[float, float],
    color: str,
    width: int = 4,
    dash: float = 16.0,
    gap: float = 10.0,
) -> None:
    x1, y1 = start
    x2, y2 = end
    dx = x2 - x1
    dy = y2 - y1
    dist = math.hypot(dx, dy)
    if dist == 0:
        return

    ux = dx / dist
    uy = dy / dist
    pos = 0.0
    while pos < dist:
        nxt = min(pos + dash, dist)
        sx = x1 + ux * pos
        sy = y1 + uy * pos
        ex = x1 + ux * nxt
        ey = y1 + uy * nxt
        draw.line((sx, sy, ex, ey), fill=color, width=width)
        pos = nxt + gap


def draw_arrow(
    draw: ImageDraw.ImageDraw,
    start: tuple[float, float],
    end: tuple[float, float],
    color: str,
    width: int = 5,
    dashed: bool = False,
) -> None:
    if dashed:
        draw_dashed_line(draw, start, end, color=color, width=width)
    else:
        draw.line((start[0], start[1], end[0], end[1]), fill=color, width=width)
    draw_arrowhead(draw, start, end, color=color)


def main() -> None:
    img = Image.new("RGB", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(img)

    title_font = load_font(66)
    node_font = load_font(34)
    support_font = load_font(32)

    title = "EspriHub - Approach and Methodology"
    draw_centered_text(draw, (80, 40, WIDTH - 80, 170), title, title_font, TEXT, line_spacing=4)

    node_w = 500
    node_h = 280
    gap = 60
    top_y = 260
    start_x = 120

    labels = [
        "Academic Structure\nRoles, classes, groups, tasks",
        "Repository Creation\nAuto provisioning and linking",
        "Student Commits and Branches\nCode development activity",
        "Activity Tracking\nCommits, branches, deadlines, attempts",
        "AI-assisted Analysis\nRisk indicators and contribution insights",
        "Teacher Review\nValidation and pedagogical judgement",
        "Feedback and Grading\nPersonalized feedback and final evaluation",
    ]

    boxes: list[tuple[int, int, int, int]] = []
    for i, label in enumerate(labels):
        x1 = start_x + i * (node_w + gap)
        y1 = top_y
        x2 = x1 + node_w
        y2 = y1 + node_h
        boxes.append((x1, y1, x2, y2))

        draw.rounded_rectangle((x1, y1, x2, y2), radius=28, fill=NODE_COLORS[i], outline=BORDER, width=4)
        draw_centered_text(draw, (x1 + 10, y1 + 10, x2 - 10, y2 - 10), label, node_font, TEXT)

    for i in range(len(boxes) - 1):
        b1 = boxes[i]
        b2 = boxes[i + 1]
        start = (b1[2] + 12, (b1[1] + b1[3]) / 2)
        end = (b2[0] - 12, (b2[1] + b2[3]) / 2)
        draw_arrow(draw, start, end, ARROW, width=6, dashed=False)

    support_box = (1500, 900, 2700, 1220)
    draw.rounded_rectangle(support_box, radius=30, fill="#e2e8f0", outline=BORDER, width=4)
    support_text = "Security and Governance\nJWT, role-based access, webhook validation"
    draw_centered_text(draw, (support_box[0] + 20, support_box[1] + 16, support_box[2] - 20, support_box[3] - 16), support_text, support_font, TEXT)

    support_points = [
        ((support_box[0] + 140), support_box[1]),
        ((support_box[0] + support_box[2]) / 2, support_box[1]),
        ((support_box[2] - 140), support_box[1]),
    ]

    target_indices = [1, 3, 5]
    for s, idx in zip(support_points, target_indices):
        bx = boxes[idx]
        target = ((bx[0] + bx[2]) / 2, bx[3] + 14)
        draw_arrow(draw, s, target, "#475569", width=4, dashed=True)

    img.save(OUT_PNG, format="PNG")
    img.convert("RGB").save(OUT_PDF, "PDF", resolution=300.0)

    print(f"PNG written: {OUT_PNG}")
    print(f"PDF written: {OUT_PDF}")


if __name__ == "__main__":
    main()
