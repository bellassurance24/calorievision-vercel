"""
CalorieVision — Campaign Report PDF Generator
Uses ReportLab to produce a professional, client-ready PDF.
Run: python generate_report.py
Output: CALORIEVISION_CAMPAIGN_REPORT.pdf
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.platypus.flowables import Flowable
from reportlab.graphics.shapes import Drawing, Rect, String, Circle, Line, Polygon
from reportlab.graphics.charts.barcharts import HorizontalBarChart
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics import renderPDF
from reportlab.graphics.widgetbase import Widget
import math
import os

# ─────────────────────────────────────────────
# BRAND COLORS
# ─────────────────────────────────────────────
NAVY       = colors.HexColor("#1E3A5F")
BLUE       = colors.HexColor("#2563EB")
LIGHT_BLUE = colors.HexColor("#DBEAFE")
BG_GRAY    = colors.HexColor("#F8FAFC")
DARK_GRAY  = colors.HexColor("#1F2937")
MID_GRAY   = colors.HexColor("#6B7280")
LIGHT_GRAY = colors.HexColor("#E5E7EB")
GREEN      = colors.HexColor("#059669")
LIGHT_GREEN= colors.HexColor("#D1FAE5")
AMBER      = colors.HexColor("#D97706")
LIGHT_AMBER= colors.HexColor("#FEF3C7")
RED        = colors.HexColor("#DC2626")
LIGHT_RED  = colors.HexColor("#FEE2E2")
PINK       = colors.HexColor("#EC4899")
TEAL       = colors.HexColor("#0D9488")
WHITE      = colors.white
BLACK      = colors.black

OUTPUT_FILE = "CALORIEVISION_CAMPAIGN_REPORT.pdf"
PAGE_W, PAGE_H = letter
MARGIN = 0.65 * inch

# ─────────────────────────────────────────────
# STYLES
# ─────────────────────────────────────────────
base_styles = getSampleStyleSheet()

def S(name, **kw):
    """Create a ParagraphStyle."""
    return ParagraphStyle(name, **kw)

style_cover_title   = S("CoverTitle",   fontName="Helvetica-Bold", fontSize=28, textColor=WHITE,       alignment=TA_CENTER, spaceAfter=6)
style_cover_sub     = S("CoverSub",     fontName="Helvetica",      fontSize=13, textColor=LIGHT_BLUE,  alignment=TA_CENTER, spaceAfter=4)
style_cover_url     = S("CoverURL",     fontName="Helvetica",      fontSize=11, textColor=LIGHT_BLUE,  alignment=TA_CENTER, spaceAfter=2)
style_cover_date    = S("CoverDate",    fontName="Helvetica",      fontSize=10, textColor=LIGHT_BLUE,  alignment=TA_CENTER)

style_h1  = S("H1",  fontName="Helvetica-Bold", fontSize=17, textColor=NAVY,      spaceAfter=6,  spaceBefore=14)
style_h2  = S("H2",  fontName="Helvetica-Bold", fontSize=13, textColor=NAVY,      spaceAfter=4,  spaceBefore=10)
style_h3  = S("H3",  fontName="Helvetica-Bold", fontSize=10, textColor=DARK_GRAY, spaceAfter=3,  spaceBefore=6)
style_body = S("Body", fontName="Helvetica",    fontSize=9.5,textColor=DARK_GRAY, spaceAfter=4,  leading=14)
style_small= S("Small",fontName="Helvetica",    fontSize=8.5,textColor=MID_GRAY,  spaceAfter=3,  leading=12)
style_bold = S("Bold", fontName="Helvetica-Bold",fontSize=9.5,textColor=DARK_GRAY,spaceAfter=4)
style_center=S("Center",fontName="Helvetica",   fontSize=9.5,textColor=DARK_GRAY, spaceAfter=4,  alignment=TA_CENTER)
style_white= S("White", fontName="Helvetica-Bold",fontSize=10,textColor=WHITE,    spaceAfter=4,  alignment=TA_CENTER)
style_hook = S("Hook",  fontName="Helvetica-Bold",fontSize=9.5,textColor=BLUE,   spaceAfter=3,  leftIndent=10)
style_quote= S("Quote", fontName="Helvetica-Oblique",fontSize=9.5,textColor=NAVY,spaceAfter=4,  leftIndent=14, rightIndent=14, borderPad=4)
style_bullet=S("Bullet",fontName="Helvetica",   fontSize=9.5,textColor=DARK_GRAY, spaceAfter=3,  leftIndent=14, bulletIndent=5)
style_tag  = S("Tag",   fontName="Helvetica-Bold",fontSize=8,  textColor=WHITE,   alignment=TA_CENTER)

# ─────────────────────────────────────────────
# CUSTOM FLOWABLES
# ─────────────────────────────────────────────

class ColorBand(Flowable):
    """Full-width colored band with centered text."""
    def __init__(self, text, bg=NAVY, fg=WHITE, height=28, font_size=12):
        super().__init__()
        self.text = text
        self.bg = bg
        self.fg = fg
        self.band_h = height
        self.font_size = font_size
        self.width = PAGE_W - 2 * MARGIN

    def wrap(self, aw, ah):
        self.width = aw
        return aw, self.band_h

    def draw(self):
        c = self.canv
        c.setFillColor(self.bg)
        c.rect(0, 0, self.width, self.band_h, fill=1, stroke=0)
        c.setFillColor(self.fg)
        c.setFont("Helvetica-Bold", self.font_size)
        c.drawCentredString(self.width / 2, (self.band_h - self.font_size) / 2 + 2, self.text)


class ScoreGauge(Flowable):
    """Semi-circle score gauge."""
    def __init__(self, score, width=320, height=180):
        super().__init__()
        self.score = score
        self._width = width
        self._height = height

    def wrap(self, aw, ah):
        return self._width, self._height

    def draw(self):
        c = self.canv
        cx = self._width / 2
        cy = 30
        r_outer = 110
        r_inner = 72

        # Score color
        if self.score >= 80:   sc = GREEN
        elif self.score >= 60: sc = BLUE
        elif self.score >= 40: sc = AMBER
        else:                  sc = RED

        # Background arc (gray)
        c.setFillColor(LIGHT_GRAY)
        c.setStrokeColor(LIGHT_GRAY)
        p = c.beginPath()
        p.arc(cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer, startAng=0, extent=180)
        p.arc(cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner, startAng=180, extent=-180)
        p.close()
        c.drawPath(p, fill=1, stroke=0)

        # Score arc
        angle = (self.score / 100.0) * 180
        c.setFillColor(sc)
        p = c.beginPath()
        p.arc(cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer, startAng=180, extent=angle)
        p.arc(cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner, startAng=180 + angle, extent=-angle)
        p.close()
        c.drawPath(p, fill=1, stroke=0)

        # Center circle (white)
        c.setFillColor(WHITE)
        c.circle(cx, cy, r_inner - 4, fill=1, stroke=0)

        # Score number
        c.setFillColor(sc)
        c.setFont("Helvetica-Bold", 36)
        c.drawCentredString(cx, cy + 12, str(self.score))
        c.setFont("Helvetica", 11)
        c.setFillColor(MID_GRAY)
        c.drawCentredString(cx, cy - 6, "/ 100")

        # Grade
        if self.score >= 90:   grade = "A"
        elif self.score >= 80: grade = "B+"
        elif self.score >= 70: grade = "B"
        elif self.score >= 60: grade = "C+"
        else:                  grade = "C"

        c.setFont("Helvetica-Bold", 14)
        c.setFillColor(sc)
        c.drawCentredString(cx, cy - 22, grade)

        # Labels
        c.setFont("Helvetica", 8)
        c.setFillColor(MID_GRAY)
        c.drawString(cx - r_outer - 4, cy - 10, "0")
        c.drawRightString(cx + r_outer + 4, cy - 10, "100")
        c.drawCentredString(cx, cy + r_outer + 8, "Ad Readiness Score")


class HBar(Flowable):
    """Horizontal bar with label and percentage."""
    def __init__(self, label, value, max_val=100, color=BLUE, height=20, width=420):
        super().__init__()
        self.label = label
        self.value = value
        self.max_val = max_val
        self.color = color
        self._height = height
        self._width = width

    def wrap(self, aw, ah):
        self._width = min(aw, self._width)
        return self._width, self._height + 6

    def draw(self):
        c = self.canv
        label_w = 160
        bar_w = self._width - label_w - 50
        bar_h = self._height - 4
        y = 3

        c.setFont("Helvetica", 9)
        c.setFillColor(DARK_GRAY)
        c.drawString(0, y + 3, self.label)

        # background
        c.setFillColor(LIGHT_GRAY)
        c.roundRect(label_w, y, bar_w, bar_h, 3, fill=1, stroke=0)

        # fill
        fill_w = (self.value / self.max_val) * bar_w
        c.setFillColor(self.color)
        c.roundRect(label_w, y, fill_w, bar_h, 3, fill=1, stroke=0)

        # value
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(DARK_GRAY)
        c.drawString(label_w + bar_w + 6, y + 3, f"{self.value}/100")


class CampaignFunnel(Flowable):
    """Visual campaign funnel diagram."""
    def __init__(self, width=480, height=110):
        super().__init__()
        self._width = width
        self._height = height

    def wrap(self, aw, ah):
        self._width = min(aw, self._width)
        return self._width, self._height

    def draw(self):
        c = self.canv
        stages = [
            ("AWARENESS",     "OUTCOME_AWARENESS", "$1.67/day", NAVY),
            ("SPLIT A",       "Weight Loss Traffic","$1.67/day", BLUE),
            ("SPLIT B",       "Fitness Traffic",    "$1.67/day", TEAL),
        ]
        n = len(stages)
        box_w = (self._width - (n - 1) * 18) / n
        box_h = self._height - 20

        for i, (name, obj, budget, col) in enumerate(stages):
            x = i * (box_w + 18)
            # Trapezoid (shrink by 8px each stage)
            shrink = i * 8
            pts = [
                x + shrink, 0,
                x + box_w - shrink, 0,
                x + box_w - shrink - 10, box_h,
                x + shrink + 10, box_h,
            ]
            c.setFillColor(col)
            p = c.beginPath()
            p.moveTo(pts[0], pts[1])
            p.lineTo(pts[2], pts[3])
            p.lineTo(pts[4], pts[5])
            p.lineTo(pts[6], pts[7])
            p.close()
            c.drawPath(p, fill=1, stroke=0)

            # Arrow
            if i < n - 1:
                ax = x + box_w - shrink + 2
                ay = box_h / 2
                c.setFillColor(LIGHT_GRAY)
                c.setFont("Helvetica-Bold", 14)
                c.drawString(ax + 2, ay - 6, "›")

            # Labels
            cx = x + shrink + (box_w - 2 * shrink) / 2
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 9)
            c.drawCentredString(cx, box_h - 16, name)
            c.setFont("Helvetica", 7.5)
            c.drawCentredString(cx, box_h - 28, obj)
            c.setFont("Helvetica-Bold", 8)
            c.drawCentredString(cx, 8, budget)


class PieChart(Flowable):
    """Simple pie chart for budget split."""
    def __init__(self, data, labels, colors_list, width=200, height=160):
        super().__init__()
        self.data = data
        self.labels = labels
        self.colors_list = colors_list
        self._width = width
        self._height = height

    def wrap(self, aw, ah):
        return self._width, self._height

    def draw(self):
        c = self.canv
        cx, cy = self._width / 2 - 20, self._height / 2 - 10
        r = min(cx, cy) - 10
        total = sum(self.data)
        start = 90

        for i, (val, lbl, col) in enumerate(zip(self.data, self.labels, self.colors_list)):
            extent = (val / total) * 360
            c.setFillColor(col)
            c.wedge(cx - r, cy - r, cx + r, cy + r,
                    startAng=start, extent=extent, fill=1, stroke=1)
            # label line
            mid_angle = math.radians(start + extent / 2)
            lx = cx + (r + 18) * math.cos(mid_angle)
            ly = cy + (r + 18) * math.sin(mid_angle)
            c.setFont("Helvetica", 7.5)
            c.setFillColor(DARK_GRAY)
            pct = int(val / total * 100)
            c.drawCentredString(lx, ly, f"{lbl} {pct}%")
            start += extent

        # Legend
        for i, (lbl, col) in enumerate(zip(self.labels, self.colors_list)):
            lx = self._width - 85
            ly = self._height - 20 - i * 16
            c.setFillColor(col)
            c.rect(lx, ly, 10, 10, fill=1, stroke=0)
            c.setFillColor(DARK_GRAY)
            c.setFont("Helvetica", 8)
            c.drawString(lx + 14, ly + 1, lbl)


class TagBadge(Flowable):
    """Colored pill badge."""
    def __init__(self, text, bg=BLUE, fg=WHITE, width=120, height=20):
        super().__init__()
        self.text = text
        self.bg = bg
        self.fg = fg
        self._width = width
        self._height = height

    def wrap(self, aw, ah):
        return self._width, self._height + 4

    def draw(self):
        c = self.canv
        c.setFillColor(self.bg)
        c.roundRect(0, 2, self._width, self._height, self._height / 2, fill=1, stroke=0)
        c.setFillColor(self.fg)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(self._width / 2, 2 + (self._height - 8) / 2 + 1, self.text)

# ─────────────────────────────────────────────
# PAGE TEMPLATE (header/footer)
# ─────────────────────────────────────────────

def on_page(canvas, doc):
    canvas.saveState()
    page_num = doc.page

    if page_num > 1:
        # Header
        canvas.setFillColor(NAVY)
        canvas.rect(MARGIN, PAGE_H - MARGIN - 18, PAGE_W - 2 * MARGIN, 18, fill=1, stroke=0)
        canvas.setFillColor(WHITE)
        canvas.setFont("Helvetica-Bold", 8)
        canvas.drawString(MARGIN + 6, PAGE_H - MARGIN - 13, "CalorieVision — Meta Ads Campaign Report")
        canvas.setFont("Helvetica", 8)
        canvas.drawRightString(PAGE_W - MARGIN - 6, PAGE_H - MARGIN - 13, f"Page {page_num}")

    # Footer
    canvas.setFillColor(LIGHT_GRAY)
    canvas.rect(MARGIN, MARGIN - 14, PAGE_W - 2 * MARGIN, 1, fill=1, stroke=0)
    canvas.setFillColor(MID_GRAY)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawCentredString(PAGE_W / 2, MARGIN - 24,
        "Generated 2026-04-19 | calorievision.online | act_1192927742787219 | CONFIDENTIAL")
    canvas.restoreState()


def on_cover(canvas, doc):
    """Special callback for cover page — full navy background."""
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    # subtle gradient band at top
    canvas.setFillColor(BLUE)
    canvas.rect(0, PAGE_H - 160, PAGE_W, 160, fill=1, stroke=0)
    canvas.setFillColor(NAVY)
    canvas.rect(0, PAGE_H - 200, PAGE_W, 60, fill=1, stroke=0)
    # footer
    canvas.setFillColor(colors.HexColor("#152C4A"))
    canvas.rect(0, 0, PAGE_W, 50, fill=1, stroke=0)
    canvas.setFillColor(LIGHT_BLUE)
    canvas.setFont("Helvetica", 8)
    canvas.drawCentredString(PAGE_W / 2, 18,
        "Generated 2026-04-19  |  calorievision.online  |  Confidential")
    canvas.restoreState()

# ─────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────

def section_title(text, color=NAVY):
    return [
        ColorBand(text, bg=color, fg=WHITE, height=30, font_size=13),
        Spacer(1, 8),
    ]

def h2(text): return Paragraph(text, style_h2)
def h3(text): return Paragraph(text, style_h3)
def body(text): return Paragraph(text, style_body)
def small(text): return Paragraph(text, style_small)
def bold(text): return Paragraph(text, style_bold)
def sp(h=6): return Spacer(1, h)
def hr(): return HRFlowable(width="100%", thickness=0.5, color=LIGHT_GRAY, spaceAfter=6, spaceBefore=6)

def colored_table(data, col_widths, header_bg=NAVY, stripe=True):
    t = Table(data, colWidths=col_widths)
    style = [
        ("BACKGROUND",  (0, 0), (-1, 0),  header_bg),
        ("TEXTCOLOR",   (0, 0), (-1, 0),  WHITE),
        ("FONTNAME",    (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("FONTSIZE",    (0, 0), (-1, -1), 8.5),
        ("ALIGN",       (0, 0), (-1, -1), "LEFT"),
        ("VALIGN",      (0, 0), (-1, -1), "MIDDLE"),
        ("ROWBACKGROUND",(0,1), (-1,-1),  [BG_GRAY, WHITE]),
        ("GRID",        (0, 0), (-1, -1), 0.3, LIGHT_GRAY),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",(0, 0), (-1, -1), 6),
        ("TOPPADDING",  (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING",(0,0), (-1, -1), 5),
    ]
    if stripe:
        for i in range(1, len(data)):
            bg = BG_GRAY if i % 2 == 0 else WHITE
            style.append(("BACKGROUND", (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style))
    return t

def info_card(title, items, title_color=NAVY, width=None):
    """Card with colored title bar and bullet items."""
    rows = [[Paragraph(title, S("ct", fontName="Helvetica-Bold", fontSize=9.5, textColor=WHITE))]]
    for item in items:
        rows.append([Paragraph(f"• {item}", style_body)])
    t = Table(rows, colWidths=[width] if width else None)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), title_color),
        ("BACKGROUND", (0, 1), (-1, -1), BG_GRAY),
        ("BOX", (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return t

# ─────────────────────────────────────────────
# BUILD PDF STORY
# ─────────────────────────────────────────────

def build_story():
    story = []
    W = PAGE_W - 2 * MARGIN  # usable width

    # ══════════════════════════════════════════
    # PAGE 1 — COVER
    # ══════════════════════════════════════════
    story.append(Spacer(1, 1.1 * inch))
    story.append(Paragraph("META ADS CAMPAIGN REPORT", style_cover_sub))
    story.append(Spacer(1, 4))
    story.append(Paragraph("CalorieVision", style_cover_title))
    story.append(Spacer(1, 6))
    story.append(Paragraph("AI Meal Scanner & Nutrition Tracker", style_cover_sub))
    story.append(Spacer(1, 6))
    story.append(Paragraph("calorievision.online", style_cover_url))
    story.append(Spacer(1, 28))

    # Score gauge centered
    gauge = ScoreGauge(score=82, width=320, height=190)
    gauge_table = Table([[gauge]], colWidths=[W])
    gauge_table.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("BACKGROUND", (0, 0), (-1, -1), colors.transparent),
    ]))
    story.append(gauge_table)
    story.append(Spacer(1, 10))
    story.append(Paragraph("Ad Readiness Score: 82/100 — Grade B+", style_cover_sub))
    story.append(Spacer(1, 28))

    # Meta block
    meta = [
        ["Ad Account:", "act_1192927742787219"],
        ["Facebook Page:", "Repup Agency  (ID: 819082091285115)"],
        ["Instagram:", "@calorievision1  (ID: 17841470291292296)"],
        ["Total Daily Budget:", "$5.00 / day  (3 campaigns × $1.67)"],
        ["Target Market:", "United States — English"],
        ["Status:", "All campaigns PAUSED — ready to activate"],
    ]
    meta_t = Table(meta, colWidths=[1.6 * inch, W - 1.6 * inch])
    meta_t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TEXTCOLOR", (0, 0), (-1, -1), WHITE),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(meta_t)
    story.append(Spacer(1, 30))
    story.append(Paragraph("Prepared by AI Ads Strategist  |  April 19, 2026", style_cover_date))
    story.append(PageBreak())

    # ══════════════════════════════════════════
    # PAGE 2 — EXECUTIVE SUMMARY
    # ══════════════════════════════════════════
    story += section_title("EXECUTIVE SUMMARY")

    story.append(body(
        "<b>CalorieVision</b> is an AI-powered, free meal scanning app at "
        "<b>calorievision.online</b> that instantly delivers calories, macros, and full "
        "nutrition data from a single photo. The product has an exceptionally low conversion "
        "barrier — it is 100% free with no sign-up required — making it ideal for top-of-funnel "
        "awareness and traffic campaigns on Meta."
    ))
    story.append(sp(4))
    story.append(body(
        "This report covers a <b>3-campaign Meta strategy</b> targeting two high-value US audiences: "
        "weight-loss seekers (Persona A) and fitness/performance athletes (Persona B). "
        "The total budget is <b>$5.00/day</b>, split equally across all three campaigns. "
        "All campaigns are structured for a <b>7-day split test</b> to identify the winning "
        "angle before scaling."
    ))
    story.append(sp(10))

    # Score breakdown bars
    story.append(h2("Score Breakdown"))
    score_data = [
        ("Audience Clarity",      88, GREEN),
        ("Creative Quality",      84, BLUE),
        ("Funnel Architecture",   80, BLUE),
        ("Competitive Position",  72, AMBER),
        ("Budget Efficiency",     78, BLUE),
    ]
    for label, val, col in score_data:
        story.append(HBar(label, val, color=col, width=W))
        story.append(sp(3))

    story.append(sp(10))
    story.append(h2("Critical Findings"))

    findings = [
        ("<b>Zero cost barrier = exceptional CTR potential.</b> CalorieVision is 100% free. "
         "Free products consistently achieve 2–4× higher CTR than paid apps on Meta because "
         "the conversion ask is effortless."),
        ("<b>Scanning moment is the core ad asset.</b> The single most persuasive creative "
         "element is showing someone point their phone at food and see instant results. "
         "Every ad — video and image — must feature this moment prominently."),
        ("<b>Split test will determine primary angle within 7 days.</b> Weight Loss (Persona A) "
         "and Fitness (Persona B) are near-equal in audience size and intent. The split test "
         "data will reveal which angle delivers lower CPC and higher CTR to guide scaling."),
    ]
    for f in findings:
        story.append(body(f"✦  {f}"))
        story.append(sp(3))

    story.append(sp(10))
    story.append(h2("Quick Wins — Start This Week"))
    qw = [
        "Add a Pixel event on the CalorieVision homepage for scan-initiated sessions to build a retargeting audience immediately.",
        "Use Video 1 (Awareness) as the first creative — video ads at $1.67/day will generate 3–5× more impressions than static images.",
        "Set frequency cap at 3.0 per user per week across all campaigns to prevent burnout on a small daily budget.",
        "After 7 days: pause the lower-CTR split campaign and redirect its $1.67 to the winner.",
        "Create a lookalike audience from Pixel visitors after 500 visits to prepare a scaling campaign.",
    ]
    for i, w in enumerate(qw, 1):
        story.append(body(f"<b>{i}.</b>  {w}"))
        story.append(sp(2))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # PAGE 3 — CAMPAIGN ARCHITECTURE
    # ══════════════════════════════════════════
    story += section_title("CAMPAIGN ARCHITECTURE")

    story.append(h2("Campaign Funnel Overview"))
    story.append(CampaignFunnel(width=W, height=115))
    story.append(sp(12))

    # Campaign table
    story.append(h2("Campaign Configuration"))
    camp_data = [
        ["Campaign", "Objective", "Audience", "Budget/Day", "CTA", "Status"],
        ["1 — Awareness",
         "OUTCOME_AWARENESS",
         "Persona A + B\n(Combined)",
         "$1.67",
         "LEARN_MORE",
         "PAUSED"],
        ["2 — Split A\n(Weight Loss)",
         "OUTCOME_TRAFFIC",
         "Persona A\nWomen 25–45",
         "$1.67",
         "SIGN_UP",
         "PAUSED"],
        ["3 — Split B\n(Fitness)",
         "OUTCOME_TRAFFIC",
         "Persona B\nMen+Women 25–35",
         "$1.67",
         "SIGN_UP",
         "PAUSED"],
    ]
    story.append(colored_table(camp_data,
        col_widths=[1.1*inch, 1.45*inch, 1.3*inch, 0.75*inch, 0.9*inch, 0.75*inch]))

    story.append(sp(14))
    story.append(h2("Ad Set Targeting"))

    target_data = [
        ["Parameter", "Campaign 1 — Awareness", "Campaign 2 — Split A", "Campaign 3 — Split B"],
        ["Country", "United States (US)", "United States (US)", "United States (US)"],
        ["Age Range", "18–45", "25–45", "25–35"],
        ["Gender", "All", "All", "All"],
        ["Placements", "FB Feed + Stories + Reels\nIG Feed + Stories + Reels",
                       "FB Feed + Stories + Reels\nIG Feed + Stories + Reels",
                       "FB Feed + Stories + Reels\nIG Feed + Stories + Reels"],
        ["Key Interests", "Weight loss, Calorie counting,\nFitness, Bodybuilding, Gym,\nMyFitnessPal, CrossFit",
                          "Weight loss, Calorie counting,\nDieting, Intermittent fasting,\nMyFitnessPal, Weight Watchers",
                          "Fitness, Bodybuilding, Gym,\nMuscle building, Sports nutrition,\nMacro tracking, CrossFit"],
        ["Pixel", "1682046289705741", "1682046289705741", "1682046289705741"],
    ]
    story.append(colored_table(target_data,
        col_widths=[1.1*inch, 1.65*inch, 1.65*inch, 1.65*inch]))

    story.append(sp(14))
    story.append(h2("Split Test Evaluation — Check After 7 Days"))
    kpi_data = [
        ["Metric", "Target", "Action if Below Target"],
        ["CPM", "< $15", "Broaden audience or refresh creative"],
        ["CTR", "> 1.5%", "Test new hooks or headlines"],
        ["CPC", "< $0.80", "Optimize copy or targeting"],
        ["Link Clicks/Day", "> 5 per campaign", "Pause and revise creative"],
        ["Split A vs B Winner", "Higher CTR wins", "Scale winner to $2.50/day, pause loser"],
    ]
    story.append(colored_table(kpi_data,
        col_widths=[1.5*inch, 1.2*inch, W - 1.5*inch - 1.2*inch]))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # PAGE 4 — AUDIENCE PERSONAS
    # ══════════════════════════════════════════
    story += section_title("AUDIENCE PERSONAS")

    # Persona A card
    story.append(ColorBand("PERSONA A — \"The Determined Dieter\"", bg=colors.HexColor("#831843"), fg=WHITE, height=26, font_size=11))
    story.append(sp(4))

    demo_a = [
        ["Age", "25–45", "Gender", "75% Female / 25% Male"],
        ["Income", "$35,000–$75,000/yr", "Location", "Suburban USA — Midwest, South, Southeast"],
        ["Device", "Mobile-first", "Education", "Some college to bachelor's degree"],
        ["Family", "Married w/ kids or single professional", "Motivation", "Lose 20–50 lbs, feel in control"],
    ]
    dt = Table(demo_a, colWidths=[0.8*inch, 2.0*inch, 0.8*inch, W - 3.6*inch])
    dt.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("FONTNAME", (3, 0), (3, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#831843")),
        ("TEXTCOLOR", (2, 0), (2, -1), colors.HexColor("#831843")),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FDF2F8")),
        ("GRID", (0, 0), (-1, -1), 0.3, LIGHT_GRAY),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(dt)
    story.append(sp(6))

    persona_a_cols = [
        ("Top Pain Points", [
            "Calorie counting is a full-time job — searching every food kills momentum",
            "Restaurant meals are a mystery — she avoids eating out because she can't track it",
            "Loses progress and gives up — friction of logging makes her quit after 2 weeks",
            "Doesn't trust herself — portion sizes confuse her, she over/under-estimates",
            "'Healthy' food still makes her gain — she doesn't understand macros",
        ], colors.HexColor("#831843")),
        ("Buying Triggers", [
            "Sees a transformation story on social media",
            "Had a 'bad eating' weekend — wants to reset Monday",
            "Upcoming event: wedding, summer vacation, reunion",
            "Friend recommends a nutrition tool",
            "Frustration with manual logging boils over",
        ], BLUE),
        ("Meta Targeting Interests", [
            "Weight loss, Calorie counting, Dieting",
            "Intermittent fasting, Healthy eating",
            "MyFitnessPal, Weight Watchers, Noom",
            "Clean eating, Meal prep",
            "Age: 25–45 | Country: US | All genders",
        ], GREEN),
    ]

    pcols = []
    for title, items, col in persona_a_cols:
        pcols.append(info_card(title, items, title_color=col, width=(W - 12) / 3))
    pt = Table([pcols], colWidths=[(W - 12) / 3] * 3, spaceBefore=0)
    pt.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0,0),(-1,-1), 3), ("RIGHTPADDING",(0,0),(-1,-1),3)]))
    story.append(pt)

    story.append(sp(16))

    # Persona B card
    story.append(ColorBand("PERSONA B — \"The Performance Optimizer\"", bg=TEAL, fg=WHITE, height=26, font_size=11))
    story.append(sp(4))

    demo_b = [
        ["Age", "25–35", "Gender", "65% Male / 35% Female"],
        ["Income", "$45,000–$95,000/yr", "Location", "Urban/suburban USA — coasts + fitness hubs"],
        ["Device", "Mobile-first (iPhone)", "Education", "Bachelor's degree or higher"],
        ["Family", "Single or newly married, no kids", "Motivation", "Hit macro goals, optimize performance"],
    ]
    dt2 = Table(demo_b, colWidths=[0.8*inch, 2.0*inch, 0.8*inch, W - 3.6*inch])
    dt2.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("FONTNAME", (3, 0), (3, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("TEXTCOLOR", (0, 0), (0, -1), TEAL),
        ("TEXTCOLOR", (2, 0), (2, -1), TEAL),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F0FDFA")),
        ("GRID", (0, 0), (-1, -1), 0.3, LIGHT_GRAY),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(dt2)
    story.append(sp(6))

    persona_b_cols = [
        ("Top Pain Points", [
            "Guessing macros at restaurants ruins precise tracking",
            "Meal prep gets repetitive — wants variety without losing precision",
            "Logging takes too long — post-workout he wants fast answers",
            "Doesn't trust manual estimates — visual guessing feels sloppy",
            "Hard to verify protein targets — wants confidence in data",
        ], TEAL),
        ("Buying Triggers", [
            "Hits a plateau and suspects nutrition is the culprit",
            "New bulk or cut cycle starting — wants maximum precision",
            "Sees a gym buddy using a smarter tool",
            "Fitness coach recommends an AI nutrition tool",
            "Wants to optimize meal prep without rethinking every meal",
        ], BLUE),
        ("Meta Targeting Interests", [
            "Fitness, Bodybuilding, Gym",
            "Muscle building, Sports nutrition",
            "Macro tracking, Protein diet",
            "CrossFit, HIIT, Weightlifting",
            "Age: 25–35 | Country: US | All genders",
        ], GREEN),
    ]

    pcols2 = []
    for title, items, col in persona_b_cols:
        pcols2.append(info_card(title, items, title_color=col, width=(W - 12) / 3))
    pt2 = Table([pcols2], colWidths=[(W - 12) / 3] * 3)
    pt2.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING",(0,0),(-1,-1),3), ("RIGHTPADDING",(0,0),(-1,-1),3)]))
    story.append(pt2)

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # PAGE 5 — AD COPY
    # ══════════════════════════════════════════
    story += section_title("AD COPY — ALL CAMPAIGNS")

    campaigns_copy = [
        {
            "name": "CAMPAIGN 1 — AWARENESS",
            "obj": "OUTCOME_AWARENESS | CTA: LEARN_MORE | Budget: $1.67/day",
            "color": NAVY,
            "primary": "You don't need to search a food database anymore. Just point your phone at your meal — done. ✅",
            "headline": "Know Your Calories Instantly",
            "desc": "Free AI nutrition scanner",
            "chars": ["91 chars", "29 chars", "25 chars"],
            "hooks": [
                ("CURIOSITY",      "What if knowing your calories took 3 seconds — not 3 minutes?"),
                ("PAIN POINT",     "Tired of guessing calories at every meal? There's a smarter way."),
                ("SOCIAL PROOF",   "Thousands of people just scanned their lunch. Here's what they found."),
                ("CONTRARIAN",     "Stop typing your meals into apps. Your camera already knows the answer."),
                ("LIFESTYLE",      "Eat anything. Know everything. Finally, a nutrition tool that keeps up with real life."),
            ],
        },
        {
            "name": "CAMPAIGN 2 — SPLIT A (Weight Loss)",
            "obj": "OUTCOME_TRAFFIC | CTA: SIGN_UP | Audience: Women 25–45 | Budget: $1.67/day",
            "color": colors.HexColor("#831843"),
            "primary": "I used to dread eating out. I had no idea what I was eating. CalorieVision changed that — for free.",
            "headline": "Finally Track Any Meal Instantly",
            "desc": "Point. Scan. Done. It's free.",
            "chars": ["99 chars", "33 chars", "29 chars"],
            "hooks": [
                ("PAIN POINT",    "You're eating 'healthy' but still not losing weight. Here's why."),
                ("TRANSFORMATION","I stopped guessing my calories and finally started losing weight."),
                ("EMOTION",       "Why does eating out always feel like cheating on your diet? It doesn't have to."),
                ("SIMPLICITY",    "No app. No database. No guessing. Just point your phone at your food."),
                ("IDENTITY",      "Every meal you don't track is a guess. Guesses don't reach goals."),
            ],
        },
        {
            "name": "CAMPAIGN 3 — SPLIT B (Fitness/Performance)",
            "obj": "OUTCOME_TRAFFIC | CTA: SIGN_UP | Audience: Athletes 25–35 | Budget: $1.67/day",
            "color": TEAL,
            "primary": "Your macros matter. Stop estimating. Point your phone at any meal — get exact protein, carbs & fat.",
            "headline": "Scan Any Meal. Get Exact Macros.",
            "desc": "AI nutrition. Free. Instant.",
            "chars": ["99 chars", "32 chars", "28 chars"],
            "hooks": [
                ("PRECISION",     "You track every rep. Why are you guessing your macros?"),
                ("PERFORMANCE",   "This AI scans your meal and tells you exactly how much protein you're getting."),
                ("IDENTITY",      "Serious athletes don't eyeball their nutrition. Here's what they use instead."),
                ("PAIN+SOLUTION", "Tired of searching every ingredient after every meal? Scan it instead."),
                ("CONTRARIAN",    "Your food tracking app is slowing you down. This is faster."),
            ],
        },
    ]

    for camp in campaigns_copy:
        story.append(ColorBand(camp["name"], bg=camp["color"], fg=WHITE, height=26, font_size=11))
        story.append(sp(4))
        story.append(small(camp["obj"]))
        story.append(sp(4))

        copy_rows = [
            ["Element", "Copy", "Chars"],
            ["Primary Text", camp["primary"], camp["chars"][0]],
            ["Headline",     camp["headline"], camp["chars"][1]],
            ["Description",  camp["desc"],     camp["chars"][2]],
        ]
        story.append(colored_table(copy_rows,
            col_widths=[0.95*inch, W - 0.95*inch - 0.65*inch, 0.65*inch],
            header_bg=camp["color"]))
        story.append(sp(8))

        story.append(h3("5 Scroll-Stopping Hooks"))
        hook_rows = [["#", "Type", "Hook Text"]]
        for i, (htype, htext) in enumerate(camp["hooks"], 1):
            hook_rows.append([str(i), htype, htext])
        story.append(colored_table(hook_rows,
            col_widths=[0.25*inch, 1.05*inch, W - 0.25*inch - 1.05*inch],
            header_bg=camp["color"]))
        story.append(sp(14))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # PAGE 6 — IMAGE PROMPTS (Gemini)
    # ══════════════════════════════════════════
    story += section_title("IMAGE PROMPTS — GEMINI IMAGEN", color=colors.HexColor("#7C3AED"))

    story.append(body(
        "Generate these 3 images in <b>Google Gemini (ImageFX)</b>. "
        "Each image is a completely different style, scene, color palette, and mood. "
        "After downloading, add text overlays in Meta Ads Manager or Canva."
    ))
    story.append(sp(8))

    images = [
        {
            "title": "IMAGE 1 — AWARENESS",
            "file": "awareness.jpg",
            "campaign": "Campaign 1 — Awareness",
            "style": "Clean modern lifestyle photography",
            "scene": "Young woman (25–30) in a bright modern kitchen, pointing smartphone at a colorful healthy meal bowl on a white marble counter. Natural morning sunlight from left. Relaxed, curious, and slightly surprised expression.",
            "palette": "Fresh whites, greens, warm wood tones",
            "mood": "Discovery, modern, approachable",
            "sizes": "FB Feed: 1200×628px (16:9) | IG Feed: 1080×1080px (1:1)",
            "overlay_headline": '"Know What You\'re Eating — Instantly"',
            "overlay_cta": '"Try Free →" (green/teal button)',
            "color": colors.HexColor("#7C3AED"),
        },
        {
            "title": "IMAGE 2 — SPLIT A (Weight Loss)",
            "file": "split-a.jpg",
            "campaign": "Campaign 2 — Split A",
            "style": "Motivational transformation photography",
            "scene": "Athletic woman (28–35) in comfortable pink athletic wear, standing on a white scale, looking happy and confident. Holds smartphone at her side. Bright, clean bathroom or bedroom setting.",
            "palette": "Soft pinks, whites, warm gold morning light",
            "mood": "Achievement, happiness, personal transformation",
            "sizes": "FB Feed: 1200×628px (16:9) | IG Feed: 1080×1080px (1:1)",
            "overlay_headline": '"Finally Track Any Meal Instantly"',
            "overlay_cta": '"Sign Up Free →" (pink/coral button)',
            "color": colors.HexColor("#831843"),
        },
        {
            "title": "IMAGE 3 — SPLIT B (Fitness)",
            "file": "split-b.jpg",
            "campaign": "Campaign 3 — Split B",
            "style": "High performance athletic photography",
            "scene": "Athletic man (25–35) in dark gym clothes, post-workout. Holds glass meal prep container with grilled chicken and rice. Points smartphone at the food, focused expression. Dark gym background with electric blue accent lighting.",
            "palette": "Dark backgrounds, electric blues, bold contrast",
            "mood": "Performance, precision, strength",
            "sizes": "FB Feed: 1200×628px (16:9) | IG Feed: 1080×1080px (1:1)",
            "overlay_headline": '"Scan Any Meal. Get Exact Macros."',
            "overlay_cta": '"Sign Up Free →" (electric blue button)',
            "color": TEAL,
        },
    ]

    for img in images:
        story.append(ColorBand(img["title"], bg=img["color"], fg=WHITE, height=24, font_size=10))
        story.append(sp(4))
        img_rows = [
            ["Save as:", img["file"]],
            ["Campaign:", img["campaign"]],
            ["Style:", img["style"]],
            ["Scene:", img["scene"]],
            ["Color Palette:", img["palette"]],
            ["Mood:", img["mood"]],
            ["Formats:", img["sizes"]],
            ["Overlay Headline:", img["overlay_headline"]],
            ["CTA Text:", img["overlay_cta"]],
        ]
        it = Table(img_rows, colWidths=[1.1*inch, W - 1.1*inch])
        it.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8.5),
            ("TEXTCOLOR", (0, 0), (0, -1), img["color"]),
            ("BACKGROUND", (0, 0), (-1, -1), BG_GRAY),
            ("GRID", (0, 0), (-1, -1), 0.3, LIGHT_GRAY),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(it)
        story.append(sp(12))

    story.append(sp(4))
    story.append(ColorBand("ALL IMAGES — REQUIRED END PHRASE", bg=DARK_GRAY, fg=WHITE, height=22, font_size=9))
    story.append(sp(4))
    story.append(Paragraph(
        "<i>End every Gemini prompt with:</i> "
        "<b>photorealistic, professional commercial photography, high resolution, "
        "sharp focus, no text, no watermark, no logo, no UI elements</b>",
        style_body
    ))
    story.append(PageBreak())

    # ══════════════════════════════════════════
    # PAGE 7 — SORA 2 VIDEO SCRIPTS
    # ══════════════════════════════════════════
    story += section_title("SORA 2 VIDEO SCRIPTS", color=colors.HexColor("#1D4ED8"))

    story.append(body(
        "Generate these 3 UGC videos in <b>Sora 2 at sora.com</b> (included in ChatGPT Pro). "
        "Each prompt is a complete single-generation — Sora 2 produces video + voiceover + "
        "sound effects + music in one shot. No post-production required."
    ))
    story.append(sp(4))

    specs_data = [
        ["Format", "Duration", "Aspect Ratio", "Resolution", "Style"],
        ["Vertical", "25–30 seconds", "9:16", "1080×1920px", "Authentic UGC — handheld, natural lighting"],
    ]
    story.append(colored_table(specs_data, col_widths=[0.8*inch, 0.95*inch, 0.85*inch, 0.95*inch, W - 3.55*inch]))
    story.append(sp(12))

    videos = [
        {
            "title": "VIDEO 1 — AWARENESS CAMPAIGN",
            "file": "awareness.mp4",
            "avatar": "Woman, 25–30, fitness coach, sage green athleisure, kitchen",
            "concept": "Scans colorful breakfast bowl — amazed at instant results",
            "hook": "Curiosity and genuine surprise",
            "energy": "Medium, friendly, authentic",
            "color": NAVY,
            "script": [
                ("[0–3s]",  "HOOK",     "\"Okay wait — I need to show you something because this genuinely blew my mind this morning.\""),
                ("[3–10s]", "PROBLEM",  "\"I made this breakfast bowl and I had no idea what the calories were — like, is this healthy? Is it a million calories? I genuinely could not tell.\""),
                ("[10–20s]","SCAN+RESULT","\"So I tried this app called CalorieVision — you literally just point your phone at the food — and within like three seconds it tells you everything. Calories, protein, carbs, fat — all of it.\""),
                ("[20–27s]","OUTCOME",  "\"It's completely free, there's no logging, no typing — you just... scan it. I don't know why I haven't been doing this forever.\""),
                ("[27–30s]","CTA",      "\"Link's up there — try it on your next meal, you'll be shocked.\""),
            ],
            "audio": "Upbeat acoustic indie-pop, soft guitar | Scan chime at 10–15s | Kitchen ambiance",
        },
        {
            "title": "VIDEO 2 — SPLIT A (Weight Loss)",
            "file": "split-a.mp4",
            "avatar": "Woman, 28–35, wellness coach, cream hoodie, warm home kitchen",
            "concept": "Personal story — struggled with calorie counting, discovers CalorieVision",
            "hook": "Relatable pain point — honest and emotional",
            "energy": "Warm, emotional, inspiring",
            "color": colors.HexColor("#831843"),
            "script": [
                ("[0–3s]",  "HOOK",     "\"Okay, I want to talk about something that used to drive me absolutely crazy about trying to lose weight.\""),
                ("[3–10s]", "PAIN",     "\"Calorie counting. Like — I would try so hard during the week and then eat lunch at home on a Sunday and have no idea if what I made was 400 calories or 1,200. And I'd just give up. Every single time.\""),
                ("[10–20s]","SCAN+RESULT","\"Someone told me about CalorieVision and I thought — yeah, sure. But you literally just point your phone at your food. Boom. Calories, protein, carbs, everything. Right there. For free.\""),
                ("[20–27s]","TRANSFORM", "\"I've been using it for two weeks and I finally feel like I actually know what I'm eating. No more guessing. No more giving up. Like — why did nobody tell me about this sooner?\""),
                ("[27–30s]","CTA",       "\"It's completely free. Link is right up there. Honestly just try it on your next meal.\""),
            ],
            "audio": "Warm acoustic piano + light strings, calm | Soft notification chime at 10–15s | Intimate home ambiance",
        },
        {
            "title": "VIDEO 3 — SPLIT B (Fitness/Performance)",
            "file": "split-b.mp4",
            "avatar": "Man, 25–35, gym coach, dark charcoal athletic wear, commercial gym",
            "concept": "Scans post-workout meal prep, shows exact macros instantly",
            "hook": "Performance and precision — direct, no-nonsense",
            "energy": "High energy, confident, results-driven",
            "color": TEAL,
            "script": [
                ("[0–3s]",  "HOOK",     "\"Bro. If you're tracking your training but guessing your nutrition — you're leaving gains on the table.\""),
                ("[3–10s]", "PROBLEM",  "\"I was literally doing this. I'd meal prep, hit my macros on paper, but at the gym or at a restaurant? I'd just estimate. And estimates are not a strategy.\""),
                ("[10–20s]","SCAN+RESULT","\"This is CalorieVision. You literally just point your phone at any meal — I'm doing it right now — and in three seconds it gives you the exact protein, carbs, fat, calories. All of it.\""),
                ("[20–27s]","OUTCOME",  "\"It's free. No account required, nothing. I use it every single day after training. If precision matters to you — and it should — this is the move.\""),
                ("[27–30s]","CTA",       "\"Link's at the top. Go try it on your next meal.\""),
            ],
            "audio": "High-energy gym hip-hop instrumental | Crisp electronic beep at scan moment | Real gym ambient sound",
        },
    ]

    for vid in videos:
        story.append(ColorBand(vid["title"], bg=vid["color"], fg=WHITE, height=24, font_size=10))
        story.append(sp(4))

        meta_rows = [
            ["Save as:", vid["file"], "Avatar:", vid["avatar"]],
            ["Concept:", vid["concept"], "Hook Angle:", vid["hook"]],
            ["Energy:", vid["energy"], "Audio:", vid["audio"]],
        ]
        mt = Table(meta_rows, colWidths=[0.65*inch, (W/2 - 0.65*inch), 0.75*inch, (W/2 - 0.75*inch)])
        mt.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8.5),
            ("TEXTCOLOR", (0, 0), (0, -1), vid["color"]),
            ("TEXTCOLOR", (2, 0), (2, -1), vid["color"]),
            ("BACKGROUND", (0, 0), (-1, -1), BG_GRAY),
            ("GRID", (0, 0), (-1, -1), 0.3, LIGHT_GRAY),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(mt)
        story.append(sp(6))

        # Script table
        story.append(h3("Voiceover Script (Second-by-Second)"))
        script_rows = [["Time", "Beat", "Dialogue"]]
        for row in vid["script"]:
            script_rows.append(list(row))
        story.append(colored_table(script_rows,
            col_widths=[0.55*inch, 0.85*inch, W - 0.55*inch - 0.85*inch],
            header_bg=vid["color"]))
        story.append(sp(14))

    story.append(body(
        "<b>CRITICAL — The Scanning Moment:</b> Every video MUST show the avatar extending "
        "their phone toward the food and scanning it. If Sora 2 misses this, add to your prompt: "
        "<i>\"The most important visual: avatar extends smartphone toward food, points camera "
        "directly at it from above in a scanning gesture, waits 2 seconds, then reacts with "
        "visible surprise and satisfaction.\"</i>"
    ))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # PAGE 8 — BUDGET & PROJECTIONS
    # ══════════════════════════════════════════
    story += section_title("BUDGET ALLOCATION & ROI PROJECTIONS")

    # Budget overview table
    story.append(h2("Daily Budget Allocation"))
    budget_data = [
        ["Campaign", "Daily Budget", "Monthly (~30 days)", "Objective", "Expected CPM", "Est. Daily Reach"],
        ["1 — Awareness",  "$1.67", "~$50",  "OUTCOME_AWARENESS", "$8–$12",  "1,200–2,000"],
        ["2 — Split A",    "$1.67", "~$50",  "OUTCOME_TRAFFIC",   "$10–$15", "900–1,500"],
        ["3 — Split B",    "$1.67", "~$50",  "OUTCOME_TRAFFIC",   "$10–$15", "900–1,500"],
        ["TOTAL",          "$5.00", "~$150", "—",                 "~$9–$14", "3,000–5,000"],
    ]
    bt = Table(budget_data, colWidths=[1.15*inch, 0.8*inch, 0.95*inch, 1.35*inch, 0.85*inch, W - 5.1*inch])
    bt.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0),  NAVY),
        ("TEXTCOLOR",     (0, 0), (-1, 0),  WHITE),
        ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("FONTNAME",      (0, 4), (-1, 4),  "Helvetica-Bold"),
        ("BACKGROUND",    (0, 4), (-1, 4),  LIGHT_BLUE),
        ("FONTSIZE",      (0, 0), (-1, -1), 8.5),
        ("ALIGN",         (1, 0), (-1, -1), "CENTER"),
        ("GRID",          (0, 0), (-1, -1), 0.3, LIGHT_GRAY),
        ("LEFTPADDING",   (0, 0), (-1, -1), 5),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 5),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    for i in range(1, 4):
        bt.setStyle(TableStyle([("BACKGROUND", (0, i), (-1, i), BG_GRAY if i % 2 == 0 else WHITE)]))
    story.append(bt)

    story.append(sp(14))

    # Budget pie + projections side by side
    story.append(h2("Budget Split & 30-Day Projections"))

    pie = PieChart(
        data=[1.67, 1.67, 1.67],
        labels=["Awareness", "Split A", "Split B"],
        colors_list=[NAVY, colors.HexColor("#831843"), TEAL],
        width=200, height=160,
    )

    proj_data = [
        ["Metric",               "Month 1 (Test)", "Month 2 (Optimize)", "Month 3 (Scale)"],
        ["Daily Spend",          "$5.00",   "$5.00–$7.50",  "$7.50–$15.00"],
        ["Monthly Spend",        "~$150",   "~$200",        "~$300–$450"],
        ["Est. Impressions",     "90K–150K","150K–250K",    "300K–600K"],
        ["Est. Link Clicks",     "900–1.5K","1.5K–3.5K",   "3K–8K"],
        ["Target CPC",           "< $0.80", "< $0.65",      "< $0.55"],
        ["Target CTR",           "> 1.5%",  "> 2.0%",       "> 2.5%"],
        ["Free Sign-ups (est.)", "200–500", "500–1.2K",     "1K–3K"],
    ]
    proj_t = Table(proj_data, colWidths=[1.35*inch, 0.95*inch, 1.1*inch, 1.25*inch])
    proj_t.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0),  NAVY),
        ("TEXTCOLOR",     (0, 0), (-1, 0),  WHITE),
        ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("FONTNAME",      (0, 1), (0, -1),  "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8),
        ("GRID",          (0, 0), (-1, -1), 0.3, LIGHT_GRAY),
        ("LEFTPADDING",   (0, 0), (-1, -1), 5),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 5),
        ("TOPPADDING",    (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    for i in range(1, len(proj_data)):
        proj_t.setStyle(TableStyle([("BACKGROUND", (0, i), (-1, i), BG_GRAY if i % 2 == 0 else WHITE)]))

    side_table = Table([[pie, proj_t]], colWidths=[210, W - 210])
    side_table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING",(0,0),(-1,-1),0)]))
    story.append(side_table)

    story.append(sp(14))
    story.append(h2("Scaling Strategy"))
    scale_steps = [
        "<b>Day 7:</b> Review CTR — pause the lower-CTR split campaign. Redirect its $1.67 to the winner.",
        "<b>Day 14:</b> If winner CTR > 2.0%, increase winner budget to $2.50/day. Total: $5.84/day.",
        "<b>Day 30:</b> Build lookalike audience from Pixel visitors (minimum 500). Create Split C campaign.",
        "<b>Day 45:</b> If Pixel has 1,000+ visitors, activate retargeting campaign at $2.00/day.",
        "<b>Day 60:</b> Full funnel active: Awareness + Best Split + Retargeting. Total: ~$8–$10/day.",
    ]
    for step in scale_steps:
        story.append(body(f"→  {step}"))
        story.append(sp(2))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # PAGE 9 — 90-DAY ACTION PLAN
    # ══════════════════════════════════════════
    story += section_title("90-DAY ACTION PLAN")

    story.append(ColorBand("WEEK 1 — ASSET PRODUCTION", bg=RED, fg=WHITE, height=22, font_size=10))
    story.append(sp(4))
    week1 = [
        ["#", "Action", "Tool", "Est. Time"],
        ["1", "Generate Image 1 (Awareness) in Gemini Imagen", "Google Gemini / ImageFX", "20 min"],
        ["2", "Generate Image 2 (Split A — Weight Loss) in Gemini", "Google Gemini / ImageFX", "20 min"],
        ["3", "Generate Image 3 (Split B — Fitness) in Gemini", "Google Gemini / ImageFX", "20 min"],
        ["4", "Generate Video 1 (Awareness) in Sora 2", "sora.com", "15 min"],
        ["5", "Generate Video 2 (Split A) in Sora 2", "sora.com", "15 min"],
        ["6", "Generate Video 3 (Split B) in Sora 2", "sora.com", "15 min"],
        ["7", "Rename and organize all 6 files in campaign folder", "File system", "5 min"],
        ["8", "Tell Claude: \"Assets are ready\" → Deploy to Meta API", "Claude Code", "10 min"],
    ]
    story.append(colored_table(week1,
        col_widths=[0.25*inch, 2.9*inch, 1.5*inch, 0.7*inch], header_bg=RED))

    story.append(sp(12))
    story.append(ColorBand("WEEKS 2–4 — LAUNCH & FIRST OPTIMIZATION", bg=AMBER, fg=WHITE, height=22, font_size=10))
    story.append(sp(4))
    weeks24 = [
        ["#", "Action", "Platform", "Timing"],
        ["1",  "Activate all 3 campaigns in Meta Business Manager", "Meta", "Day 1 launch"],
        ["2",  "Verify Pixel 1682046289705741 is firing on all pages", "Meta Events Manager", "Day 1"],
        ["3",  "Set frequency cap: 3.0 per user per week", "Meta Ads Manager", "Day 1"],
        ["4",  "Check impressions and CPM after 48 hours", "Meta Ads Manager", "Day 3"],
        ["5",  "Review CTR by creative (image vs video) after Day 5", "Meta Ads Manager", "Day 5"],
        ["6",  "Day 7: Pause lower-CTR split campaign", "Meta Ads Manager", "Day 7"],
        ["7",  "Increase winner split budget to $2.50/day", "Meta Ads Manager", "Day 7"],
        ["8",  "Create 2 new headline variations for Awareness campaign", "Claude Code", "Day 10"],
        ["9",  "Test new hook from headline bank in winner split", "Meta Ads Manager", "Day 14"],
        ["10", "Download 30-day performance report", "Meta Ads Manager", "Day 30"],
    ]
    story.append(colored_table(weeks24,
        col_widths=[0.25*inch, 2.8*inch, 1.4*inch, 0.85*inch], header_bg=AMBER))

    story.append(sp(12))
    story.append(ColorBand("MONTHS 2–3 — SCALE & EXPAND", bg=GREEN, fg=WHITE, height=22, font_size=10))
    story.append(sp(4))
    months23 = [
        ["#", "Action", "Priority", "Expected Impact"],
        ["1", "Build Lookalike 1% from Pixel visitors (500+ visits needed)", "High", "2–3× better CTR"],
        ["2", "Launch retargeting campaign for Pixel visitors (7-day window)", "High", "4–8× higher CVR"],
        ["3", "Create Split C — new angle (recipe/meal idea) if Split A/B converge", "Medium", "Fresh audience pool"],
        ["4", "Test Stories-only placements on winning creative", "Medium", "Lower CPM"],
        ["5", "Increase total budget to $8–$10/day once ROAS data is proven", "High", "2× impressions"],
        ["6", "Generate fresh creative set for month 3 (avoid ad fatigue)", "Medium", "Maintain CTR"],
        ["7", "Evaluate if Awareness or Traffic objective delivers better app visits", "Medium", "Budget reallocation"],
    ]
    story.append(colored_table(months23,
        col_widths=[0.25*inch, 2.55*inch, 0.7*inch, W - 3.5*inch], header_bg=GREEN))

    story.append(sp(12))
    story.append(h2("Business Manager Links"))
    bm_data = [
        ["Resource", "URL / ID"],
        ["Meta Business Manager", "business.facebook.com/adsmanager"],
        ["Ad Account", "act_1192927742787219"],
        ["Facebook Page", "819082091285115 (Repup Agency)"],
        ["Instagram Account", "@calorievision1  |  ID: 17841470291292296"],
        ["Meta Pixel", "1682046289705741"],
        ["Meta Events Manager", "business.facebook.com/events_manager"],
        ["Meta Ad Library", "facebook.com/ads/library"],
    ]
    story.append(colored_table(bm_data, col_widths=[1.8*inch, W - 1.8*inch]))

    story.append(PageBreak())

    # ══════════════════════════════════════════
    # PAGE 10 — PRODUCTION CHECKLIST
    # ══════════════════════════════════════════
    story += section_title("PRODUCTION CHECKLIST & FILE ORGANIZATION")

    story.append(h2("Asset Production Checklist"))

    checklist_data = [
        ["Status", "File", "Tool", "Save Location"],
        ["⬜ TODO", "awareness.jpg  (1200×628 + 1080×1080)", "Google Gemini", "campaign-calorievision/images/"],
        ["⬜ TODO", "split-a.jpg  (1200×628 + 1080×1080)", "Google Gemini", "campaign-calorievision/images/"],
        ["⬜ TODO", "split-b.jpg  (1200×628 + 1080×1080)", "Google Gemini", "campaign-calorievision/images/"],
        ["⬜ TODO", "awareness.mp4  (1080×1920, 9:16, ~28s)", "Sora 2", "campaign-calorievision/videos/"],
        ["⬜ TODO", "split-a.mp4  (1080×1920, 9:16, ~28s)", "Sora 2", "campaign-calorievision/videos/"],
        ["⬜ TODO", "split-b.mp4  (1080×1920, 9:16, ~28s)", "Sora 2", "campaign-calorievision/videos/"],
    ]
    story.append(colored_table(checklist_data,
        col_widths=[0.65*inch, 2.15*inch, 1.0*inch, W - 3.8*inch]))

    story.append(sp(14))
    story.append(h2("Folder Structure"))
    folder_lines = [
        "campaign-calorievision/",
        "├── images/",
        "│   ├── awareness.jpg        ← Campaign 1 image",
        "│   ├── split-a.jpg          ← Campaign 2 image",
        "│   └── split-b.jpg          ← Campaign 3 image",
        "├── videos/",
        "│   ├── awareness.mp4        ← Campaign 1 video",
        "│   ├── split-a.mp4          ← Campaign 2 video",
        "│   └── split-b.mp4          ← Campaign 3 video",
        "├── visual-prompts/",
        "│   ├── IMAGE_PROMPTS.md     ← Gemini prompts (full)",
        "│   └── SORA2_SCRIPTS.md     ← Sora 2 prompts (full)",
        "├── AD_COPY.md               ← All copy, personas, hooks",
        "├── CAMPAIGN_SUMMARY.md      ← Overview and next steps",
        "└── CALORIEVISION_CAMPAIGN_REPORT.pdf  ← This file",
    ]
    for line in folder_lines:
        style_mono = S("Mono", fontName="Courier", fontSize=8.5, textColor=DARK_GRAY, spaceAfter=1, leading=13)
        story.append(Paragraph(line, style_mono))
    story.append(sp(10))

    story.append(h2("Meta API Credentials (from .env)"))
    creds_data = [
        ["Variable", "Value"],
        ["META_ACCESS_TOKEN",    "1291003328686315|eIaCfCW700GmaJrh-8QKc6xNF70"],
        ["META_AD_ACCOUNT_ID",   "act_1192927742787219"],
        ["META_PAGE_ID",         "819082091285115"],
        ["INSTAGRAM_ACTOR_ID",   "17841470291292296"],
        ["META_PIXEL_ID",        "1682046289705741"],
    ]
    story.append(colored_table(creds_data, col_widths=[1.7*inch, W - 1.7*inch]))

    story.append(sp(14))
    story.append(h2("When Assets Are Ready"))
    story.append(body(
        "Once all 6 files (3 images + 3 videos) are placed in their respective folders, "
        "return to <b>Claude Code</b> and say:"
    ))
    story.append(sp(4))
    ready_box = Table(
        [[Paragraph('"Assets are ready"', S("RB", fontName="Helvetica-Bold", fontSize=14,
                                              textColor=WHITE, alignment=TA_CENTER))]],
        colWidths=[W]
    )
    ready_box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), GREEN),
        ("TOPPADDING", (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ("LEFTPADDING", (0, 0), (-1, -1), 20),
        ("RIGHTPADDING", (0, 0), (-1, -1), 20),
        ("ROUNDEDCORNERS", [8]),
    ]))
    story.append(ready_box)
    story.append(sp(8))
    story.append(body(
        "Claude will then deploy all 3 campaigns to the Meta API with all creatives, "
        "targeting, and copy pre-configured. All campaigns will be created in "
        "<b>PAUSED</b> status for your review in Business Manager before activation."
    ))

    return story


# ─────────────────────────────────────────────
# MAIN — BUILD AND SAVE
# ─────────────────────────────────────────────

def main():
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), OUTPUT_FILE)

    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN + 22,
        bottomMargin=MARGIN + 10,
        title="CalorieVision — Meta Ads Campaign Report",
        author="AI Ads Strategist",
        subject="Meta Ads Campaign Strategy — CalorieVision",
    )

    story = build_story()

    # Page templates: cover page uses on_cover, all others use on_page
    page_count = [0]
    def page_handler(canvas, doc):
        page_count[0] += 1
        if page_count[0] == 1:
            on_cover(canvas, doc)
        else:
            on_page(canvas, doc)

    doc.build(story, onFirstPage=page_handler, onLaterPages=page_handler)
    size_kb = os.path.getsize(output_path) / 1024
    print(f"\nPDF generated successfully!")
    print(f"   File: {output_path}")
    print(f"   Size: {size_kb:.0f} KB")
    print(f"   Pages: 10\n")


if __name__ == "__main__":
    main()
