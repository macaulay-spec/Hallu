#!/usr/bin/env python3
"""Generate clean, annotatable technical line-art blueprint SVGs for Hallyu screens.

Each output is one phone-on-a-blueprint-grid drawing. Pure vector; no raster deps.
"""
import os

W, H = 1200, 800

# palette
BG     = "#081426"
GRID   = "#12315d"
FRAME  = "#1b3252"
SCREEN = "#0b1f3d"
INK    = "#e7f3ff"
MUTE   = "#8fb4de"
ACCENT = "#9ab8ff"
ACC2   = "#c39bff"
GOOD   = "#7ee8c0"
DANGER = "#ff8ba1"
GRAY   = "#4a6a94"

PX0, PY0, PW, PH = 450, 56, 300, 648

def grid():
    s = ""
    for x in range(0, W + 1, 40):
        s += f'<line x1="{x}" y1="0" x2="{x}" y2="{H}" stroke="{GRID}" stroke-width="0.5" opacity="0.55"/>'
    for y in range(0, H + 1, 40):
        s += f'<line x1="0" y1="{y}" x2="{W}" y2="{y}" stroke="{GRID}" stroke-width="0.5" opacity="0.55"/>'
    return s

def phone():
    s = f'<g id="device">'
    s += f'<rect x="{PX0-16}" y="{PY0-16}" width="{PW+32}" height="{PH+32}" rx="62" fill="#0a1428" stroke="#5c78a8" stroke-width="3"/>'
    s += f'<rect x="{PX0-8}" y="{PY0-8}" width="{PW+16}" height="{PH+16}" rx="54" fill="#122036" stroke="#33507a" stroke-width="1.5"/>'
    s += f'<rect x="{PX0}" y="{PY0}" width="{PW}" height="{PH}" rx="46" fill="{SCREEN}" stroke="#9cc0e8" stroke-width="1.5"/>'
    # dynamic island
    cx = PX0 + PW/2
    s += f'<rect x="{cx-52}" y="{PY0+13}" width="104" height="24" rx="12" fill="#02070f" stroke="#1d3a63" stroke-width="1"/>'
    # side buttons
    s += f'<rect x="{PX0-12}" y="{PY0+72}" width="4" height="42" rx="2" fill="#33507a"/>'
    s += f'<rect x="{PX0-12}" y="{PY0+132}" width="4" height="98" rx="2" fill="#33507a"/>'
    s += f'<rect x="{PX0-12}" y="{PY0+246}" width="4" height="64" rx="2" fill="#33507a"/>'
    s += f'<rect x="{PX0+PW+8}" y="{PY0+150}" width="4" height="70" rx="2" fill="#33507a"/>'
    return s + "</g>"

def statusbar():
    x = PX0
    s = f'<text x="{x+20}" y="{PY0+30}" fill="{INK}" font-family="sans-serif" font-size="13" font-weight="600">9:41</text>'
    rx = PX0 + PW - 24
    # signal / wifi / battery as simple glyphs
    for i in range(4):
        cx = rx - 54 + i*6
        s += f'<rect x="{cx}" y="{PY0+24-i*2}" width="3" height="{i*2+5}" fill="{INK}" opacity="0.9"/>'
    s += f'<rect x="{rx-28}" y="{PY0+22}" width="14" height="10" rx="2" fill="none" stroke="{INK}" stroke-width="1.4"/>'
    s += f'<rect x="{rx-27}" y="{PY0+24}" width="9" height="6" fill="{INK}"/>'
    return s

def home_indicator():
    cx = PX0 + PW/2
    return f'<rect x="{cx-58}" y="{PY0+PH-16}" width="116" height="5" rx="2.5" fill="#2b4a74"/>'

def text(x, y, t, size=13, fill=INK, weight="600", anchor="start", spacing=None):
    t = str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    extra = f' letter-spacing="{spacing}"' if spacing else ""
    return (f'<text x="{x}" y="{y}" fill="{fill}" font-family="sans-serif" '
            f'font-size="{size}" font-weight="{weight}" text-anchor="{anchor}"{extra}>{t}</text>')

def rrect(x, y, w, h, r=10, stroke="none", fill="none", sw=1.3):
    st = f'stroke="{stroke}" stroke-width="{sw}"' if stroke != "none" else ""
    fl = f'fill="{fill}"' if fill != "none" else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" {fl} {st}/>'

def circle(cx, cy, r, stroke="none", fill="none", sw=1.3):
    st = f'stroke="{stroke}" stroke-width="{sw}"' if stroke != "none" else ""
    fl = f'fill="{fill}"' if fill != "none" else ""
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" {fl} {st}/>'

def search_icon(x, y, size=12, color=INK):
    r = size*0.34
    return (f'<circle cx="{x}" cy="{y}" r="{r}" fill="none" stroke="{color}" stroke-width="1.6"/>'
            f'<line x1="{x+r*0.7}" y1="{y+r*0.7}" x2="{x+r*1.8}" y2="{y+r*1.8}" stroke="{color}" stroke-width="1.6" stroke-linecap="round"/>')

def arrow_right(x, y, size=12, color=INK):
    return (f'<path d="M {x} {y} l {size*0.6} -{size*0.6} l {size*0.6} {size*0.6} '
            f'l -{size*0.6} {size*0.6} z" fill="{color}"/>')

def heart(x, y, color=INK):
    return (f'<path d="M{x} {y+3} C{x-5} {y-3} {x-11} {y+3} {x} {y+11} '
            f'C{x+11} {y+3} {x+5} {y-3} {x} {y+3}" fill="{color}"/>')

def tabbar():
    y0 = PY0 + PH - 54
    x0 = PX0
    s = rrect(x0, y0, PW, 54, 0, stroke="none", fill="#0a1a34")
    s += f'<line x1="{x0}" y1="{y0}" x2="{x0+PW}" y2="{y0}" stroke="{GRID}" stroke-width="1"/>'
    xs = [x0+34, x0+94, PX0+PW/2, x0+206, x0+266]
    labels = ["Home", "Explore", "", "Notify", "Profile"]
    for i, cx in enumerate(xs):
        if i == 2:
            # create plus is drawn separately
            continue
        col = ACCENT if i == 0 else MUTE
        # simple home square circle icons
        s += circle(cx, y0+22, 7, stroke=col, sw=1.6)
        if i == 1:
            s += circle(cx+9, y0+17, 6, stroke=col, sw=1.6)
        elif i == 3:
            s += f'<path d="M{cx} {y0+17} l {5} {4} l -5 {4} l -5 -4 z" fill="none" stroke="{col}" stroke-width="1.6"/>'
        elif i == 4:
            s += rrect(cx-6, y0+17, 12, 9, 4, stroke=col, sw=1.6)
            s += f'<path d="M{cx-3} {y0+16} a3 3 0 0 1 6 0" fill="none" stroke="{col}" stroke-width="1.5"/>'
        s += text(cx, y0+46, labels[i], size=8.5, fill=col, anchor="middle")
    # create FAB
    s += circle(PX0+PW/2, y0+18, 15, fill=ACCENT)
    s += f'<path d="M{PX0+PW/2-6} {y0+18} h12 M{PX0+PW/2} {y0+12} v12" stroke="#04122a" stroke-width="3" stroke-linecap="round"/>'
    return s

def label_banner(x, y, t, sub=None):
    s = text(x, y, t, size=17, fill=INK, weight="700")
    if sub:
        s += text(x, y+20, sub, size=11, fill=MUTE, weight="400")
    return s

def callout(num, x, y, textstr):
    """A numbered callout box outside the phone with a leader line."""
    s = f'<circle cx="{x}" cy="{y}" r="10" fill="{ACCENT}"/>'
    s += text(x, y+4, str(num), size=11, fill="#04122a", weight="800", anchor="middle")
    s += f'<line x1="{x+8}" y1="{y}" x2="{x+34}" y2="{y}" stroke="{ACCENT}" stroke-width="1.2" opacity="0.7"/>'
    s += text(x+40, y+4, textstr, size=10.5, fill=MUTE, weight="400")
    return s

def title_block(t, subtitle):
    return (text(40, 34, t, size=26, fill=INK, weight="800")
            + text(40, 56, subtitle, size=12.5, fill=MUTE, weight="400"))

def bottom_anno(t):
    cx = PX0 + PW/2
    return text(cx, 782, t, size=15, fill=ACCENT, weight="800", anchor="middle")

def backdrop():
    return f'<rect width="{W}" height="{H}" fill="{BG}"/>' + grid()

# ---- shared small cards ----
def avatar(cx, cy, r=12):
    return circle(cx, cy, r, stroke=MUTE, sw=1.4) + circle(cx, cy, r*0.42, fill=MUTE)

def post_card(x, y, w, h, spoiler=False):
    s = rrect(x, y, w, h, 12, stroke=GRAY, sw=1.2, fill="#0d2446")
    s += avatar(x+18, y+20, 11)
    s += text(x+36, y+16, "@drama.fan", size=8.5, fill=INK)
    s += text(x+36, y+27, "2h · Queen of Tears · Ep 8", size=7.5, fill=MUTE)
    s += rrect(x+14, y+38, w-28, 14, 4, stroke=ACC2, sw=1)
    s += text(x+20, y+48, "EPISODE REACTION · EP 8", size=6.5, fill=ACC2)
    s += rrect(x+14, y+58, w-28, 86, 8, stroke=GRAY, sw=1, fill="#0a1c38")
    if spoiler:
        s += rrect(x+22, y+88, w-44, 22, 4, stroke=DANGER, sw=1)
        s += text(x+30, y+102, "SPOILER", size=7, fill=DANGER)
    s += text(x+16, y+160, "Action row", size=7, fill=MUTE)
    return s

# ---- individual screens ----
def s_splash():
    cx = PX0+PW/2
    s = statusbar()
    s += f'<path d="M{cx-100} {PY0+140} C {cx-40} {PY0+80}, {cx+60} {PY0+180}, {cx+120} {PY0+120}" stroke="{ACCENT}" stroke-width="2.2" fill="none" opacity="0.9"/>'
    s += f'<path d="M{cx-120} {PY0+220} C {cx-40} {PY0+150}, {cx+50} {PY0+260}, {cx+130} {PY0+190}" stroke="{ACC2}" stroke-width="2" fill="none" opacity="0.7"/>'
    s += circle(cx, PY0+300, 46, stroke=INK, sw=1.6)
    s += f'<path d="M{cx-16} {PY0+292} C {cx-6} {PY0+272}, {cx+18} {PY0+284}, {cx+10} {PY0+304} C {cx+4} {PY0+320}, {cx-16} {PY0+312}, {cx-12} {PY0+298}" fill="none" stroke="{INK}" stroke-width="3"/>'
    s += text(cx, PY0+392, "HALLYU", size=30, fill=INK, weight="900", anchor="middle", spacing="4")
    s += text(cx, PY0+414, "HALLYU · KR", size=13, fill=ACCENT, anchor="middle")
    s += text(cx, PY0+452, "Where the Wave Lives", size=11, fill=MUTE, anchor="middle")
    return s + home_indicator()

def s_welcome():
    y0 = PY0
    s = statusbar()
    s += rrect(PX0+16, y0+60, PW-32, 210, 18, stroke=GRAY, sw=1.2, fill="#0d2446")
    s += f'<path d="M{PX0+30} {y0+120} C {PX0+90} {y0+80}, {PX0+230} {y0+150}, {PX0+PW-30} {y0+100}" stroke="{ACCENT}" stroke-width="3" fill="none" opacity=".9"/>'
    s += f'<path d="M{PX0+30} {y0+170} C {PX0+110} {y0+140}, {PX0+210} {y0+200}, {PX0+PW-30} {y0+150}" stroke="{ACC2}" stroke-width="3" fill="none" opacity=".8"/>'
    s += text(PX0+PW/2, y0+250, "Frame", size=11, fill=MUTE, anchor="middle")
    s += text(PX0+16, y0+312, "Where the Wave Lives", size=20, fill=INK, weight="850")
    s += text(PX0+16, y0+336, "The social home for K-drama fandom.", size=11, fill=MUTE)
    s += text(PX0+16, y0+354, "Discuss, discover and connect.", size=11, fill=MUTE)
    # community bubbles
    for i in range(6):
        s += circle(PX0+32+i*26, y0+398, 10, stroke=MUTE, sw=1.2)
    s += rrect(PX0+16, y0+430, PW-32, 42, 21, stroke="none", fill=ACCENT)
    s += text(PX0+PW/2, y0+456, "Get Started", size=12, fill="#04122a", weight="800", anchor="middle")
    s += text(PX0+PW/2, y0+498, "Already have an account", size=10, fill=INK, anchor="middle")
    return s + home_indicator()

def s_auth():
    y0 = PY0
    s = statusbar()
    s += text(PX0+16, y0+96, "Join the fandom", size=22, fill=INK, weight="850")
    s += text(PX0+16, y0+118, "Connect with fellow K-drama fans.", size=10.5, fill=MUTE)
    s += rrect(PX0+16, y0+145, PW-32, 40, 12, stroke=GRAY, sw=1.2, fill="#0d2446")
    s += text(PX0+28, y0+170, "Email Address", size=9.5, fill=MUTE)
    s += rrect(PX0+16, y0+196, PW-32, 40, 12, stroke=GRAY, sw=1.2, fill="#0d2446")
    s += text(PX0+28, y0+221, "Password", size=9.5, fill=MUTE)
    s += rrect(PX0+16, y0+250, PW-32, 42, 21, stroke="none", fill=ACCENT)
    s += text(PX0+PW/2, y0+276, "Continue", size=12, fill="#04122a", weight="800", anchor="middle")
    s += text(PX0+PW/2, y0+318, "Or continue with", size=9.5, fill=MUTE, anchor="middle")
    for i in range(2):
        yy = y0+334+i*48
        s += rrect(PX0+16, yy, PW-32, 40, 12, stroke=GRAY, sw=1.2, fill="#0d2446")
        s += text(PX0+30, yy+25, ("G", "A")[i], size=13, fill=INK, weight="800")
        s += text(PX0+PW/2, yy+25, ("Continue with Google", "Continue with Apple")[i], size=10, fill=INK, anchor="middle")
    s += text(PX0+PW/2, y0+560, "Already a member? Log in", size=10, fill=INK, anchor="middle")
    return s + home_indicator()

def s_interests():
    y0 = PY0
    s = statusbar()
    s += text(PX0+16, y0+96, "What are you into?", size=20, fill=INK, weight="850")
    genres = ["Romance", "Thriller", "Historical", "Comedy", "Mystery", "Fantasy", "Healing", "Office"]
    for i, g in enumerate(genres):
        col = i % 3 == 0
        x = PX0+18 + (i%2)*142
        y = y0+130 + (i//2)*58
        s += rrect(x, y, 130, 42, 12, stroke=ACCENT if col else GRAY, sw=1.4, fill="#132c54" if col else "#0c2144")
        s += text(x+14, y+26, g, size=10.5, fill=INK if col else MUTE, weight="600")
    s += rrect(PX0+16, y0+560, PW-32, 42, 21, stroke="none", fill=ACCENT)
    s += text(PX0+PW/2, y0+586, "Continue", size=12, fill="#04122a", weight="800", anchor="middle")
    for i in range(4):
        s += circle(PX0+PW/2-18+ i*12, y0+536, 4, fill=ACCENT if i==0 else GRAY)
    return s + home_indicator()

def s_onboard_follow():
    y0 = PY0
    s = statusbar()
    s += text(PX0+16, y0+96, "Follow your world", size=20, fill=INK, weight="850")
    for i in range(3):
        x = PX0+16 + i*98
        s += rrect(x, y0+126, 88, 128, 12, stroke=GRAY, sw=1.2, fill="#0c2144")
        s += circle(x+44, y0+180, 26, stroke=ACCENT, sw=1.4)
        s += text(x+44, y0+272, ["Drama A","Drama B","Drama C"][i], size=7.5, fill=INK, anchor="middle")
        s += circle(x+70, y0+150, 9, fill=ACCENT)
        s += f'<path d="M{x+66} {y0+150} h8 M{x+70} {y0+146} v8" stroke="#04122a" stroke-width="2.2"/>'
    s += text(PX0+16, y0+286, "Recommended communities", size=11, fill=MUTE)
    for i in range(6):
        x = PX0+20+i*48
        s += circle(x, y0+326, 16, stroke=MUTE, sw=1.2)
        s += circle(x, y0+326, 6, fill=ACCENT)
        s += circle(x+22, y0+314, 7, fill=ACCENT)
        s += f'<path d="M{x+18} {y0+314} h8 M{x+22} {y0+310} v8" stroke="#04122a" stroke-width="2"/>'
    for i in range(4):
        y = y0+368+i*44
        s += rrect(PX0+16, y, PW-32, 34, 10, stroke=GRAY, sw=1.2, fill="#0c2144")
        s += circle(PX0+34, y+17, 10, stroke=MUTE, sw=1.2)
        s += text(PX0+52, y+21, ["Romance K-drama Fans","Thriller Fans","Theory Club","Meme Society"][i], size=9, fill=INK)
        s += text(PX0+PW-34, y+21, "Join", size=8, fill=ACCENT, anchor="end")
    s += rrect(PX0+16, y0+560, PW-32, 42, 21, stroke="none", fill=ACCENT)
    s += text(PX0+PW/2, y0+586, "Continue", size=12, fill="#04122a", weight="800", anchor="middle")
    return s + home_indicator()

def s_home():
    y0 = PY0
    s = statusbar()
    s += text(PX0+16, y0+62, "Hallyu", size=18, fill=INK, weight="900")
    s += circle(PX0+PW-38, y0+58, 9, stroke=INK, sw=1.4); s += search_icon(PX0+PW-60, y0+58, 10, INK)
    s += circle(PX0+PW-20, y0+58, 9, stroke=DANGER, sw=1.4)
    # segmented
    s += rrect(PX0+16, y0+84, PW-32, 26, 13, stroke=GRAY, sw=1, fill="#0a1c38")
    s += rrect(PX0+16, y0+84, (PW-32)/2, 26, 13, stroke="none", fill=ACCENT)
    s += text(PX0+16+ (PW-32)/4, y0+101, "For You", size=9, fill="#04122a", weight="800", anchor="middle")
    s += text(PX0+16+ (PW-32)*3/4, y0+101, "Following", size=9, fill=MUTE, anchor="middle")
    # rings
    for i in range(5):
        cx = PX0+36+i*56
        s += circle(cx, y0+142, 22, stroke=ACCENT if i<3 else GRAY, sw=1.8)
        s += circle(cx, y0+142, 15, stroke=GRAY, sw=1)
        s += text(cx, y0+180, ["R1","R2","R3","R4","R5"][i], size=7, fill=MUTE, anchor="middle")
    s += post_card(PX0+16, y0+200, PW-32, 320, spoiler=True)
    s += text(PX0+16, y0+540, "Next card...", size=8, fill=MUTE)
    return s + tabbar() + home_indicator()

def s_explore():
    y0 = PY0
    s = statusbar()
    s += text(PX0+16, y0+62, "Explore", size=18, fill=INK, weight="900")
    s += rrect(PX0+16, y0+86, PW-32, 38, 12, stroke=GRAY, sw=1.2, fill="#0a1c38")
    s += text(PX0+32, y0+110, "Search dramas, stars, posts...", size=9, fill=MUTE)
    s += search_icon(PX0+PW-36, y0+110, 11, INK)
    s += text(PX0+16, y0+150, "Trending Today", size=11, fill=INK, weight="800")
    tags = ["#QueenofTears","#LovelyRunner","#MyDemon","#BTS","#kdrama"]
    for i,t in enumerate(tags):
        x = PX0+16 + (i%3)*96
        y = y0+162 + (i//3)*26
        s += rrect(x, y, 88, 20, 10, stroke=ACCENT, sw=1, fill="#132c54")
        s += text(x+42, y+14, t, size=7, fill=INK, anchor="middle")
    s += text(PX0+16, y0+228, "Current Wave", size=11, fill=INK, weight="800")
    for i in range(3):
        x = PX0+16+i*94
        s += rrect(x, y0+242, 86, 138, 12, stroke=GRAY, sw=1.2, fill="#0c2144")
        s += circle(x+43, y0+298, 28, stroke=ACC2, sw=1.4)
        s += text(x+43, y0+366, f"Ep {8+i} Live", size=7, fill=INK, anchor="middle")
        s += rrect(x+14, y0+380, 58, 22, 6, stroke="none", fill=ACCENT)
        s += text(x+43, y0+395, "Join", size=7, fill="#04122a", weight="800", anchor="middle")
    s += text(PX0+16, y0+402, "Trending Now", size=11, fill=INK, weight="800")
    for i in range(3):
        x = PX0+16+i*94
        s += rrect(x, y0+416, 86, 70, 10, stroke=GRAY, sw=1.2, fill="#0c2144")
    s += text(PX0+16, y0+506, "Popular Communities", size=11, fill=INK, weight="800")
    for i in range(6):
        x = PX0+26+i*48
        s += circle(x, y0+548, 17, stroke=MUTE, sw=1.2)
        s += circle(x, y0+548, 6, fill=ACCENT)
        s += text(PX0+26+i*48, y0+572, "Com", size=6, fill=MUTE, anchor="middle")
    return s + tabbar() + home_indicator()

def s_create():
    y0 = PY0
    s = statusbar()
    s += text(PX0+16, y0+30, "Cancel", size=10, fill=INK)
    s += text(PX0+PW/2+6, y0+30, "New Post", size=12, fill=INK, weight="800", anchor="middle")
    s += rrect(PX0+PW-64, y0+16, 48, 24, 12, fill=ACCENT)
    s += text(PX0+PW-40, y0+32, "Post", size=9.5, fill="#04122a", weight="800")
    s += avatar(PX0+34, y0+74, 14)
    s += text(PX0+54, y0+70, "You", size=10, fill=INK, weight="800")
    s += text(PX0+16, y0+126, "Share what's happening in the fandom...", size=10, fill=MUTE)
    s += rrect(PX0+16, y0+156, PW-32, 24, 12, stroke=ACC2, sw=1, fill="#132c54")
    s += text(PX0+28, y0+172, "Queen of Tears · Ep 8", size=8, fill=ACC2)
    s += rrect(PX0+46, y0+156, 6, 24, 3, fill=ACC2)  # tag pill separator
    for i, h in enumerate(["#hashtag","#theories","#memes"]):
        x = PX0+16 + i*70
        s += rrect(x, y0+192, 64, 18, 9, stroke=GRAY, sw=1, fill="#0c2144")
        s += text(x+32, y0+205, h, size=7, fill=MUTE, anchor="middle")
    # spoiler toggle
    s += rrect(PX0+16, y0+224, PW-32, 30, 9, stroke=GRAY, sw=1, fill="#0c2144")
    s += text(PX0+26, y0+243, "Contains spoilers", size=8.5, fill=DANGER)
    s += rrect(PX0+PW-46, y0+229, 26, 20, 10, stroke=DANGER, sw=1, fill="#10243f")
    s += circle(PX0+PW-58, y0+239, 7, fill=DANGER)
    # media
    s += text(PX0+16, y0+274, "Media", size=9, fill=MUTE)
    for i in range(3):
        x = PX0+16+i*66
        s += rrect(x, y0+286, 58, 48, 8, stroke=GRAY, sw=1.2, fill="#0e2344")
        s += text(x+29, y0+310, "IMG", size=7, fill=MUTE, anchor="middle")
    s += text(PX0+16, y0+360, "Category", size=9, fill=MUTE)
    for i, c in enumerate(["Reaction","Discussion","Theory","Meme"]):
        x = PX0+16+i*74
        s += rrect(x, y0+372, 68, 22, 11, stroke=ACCENT if i==1 else GRAY, sw=1, fill="#132c54" if i==1 else "#0c2144")
        s += text(x+34, y0+387, c, size=7.5, fill=INK if i==1 else MUTE, anchor="middle")
    s += rrect(PX0+16, y0+560, PW-32, 42, 21, stroke="none", fill=ACCENT)
    s += text(PX0+PW/2, y0+586, "Preview & Publish", size=12, fill="#04122a", weight="800", anchor="middle")
    return s + home_indicator()

def s_notifications():
    y0 = PY0
    s = statusbar()
    s += text(PX0+16, y0+62, "Notifications", size=18, fill=INK, weight="900")
    for i, f in enumerate(["All","Replies","Mentions","Episodes"]):
        x = PX0+16+i*74
        s += rrect(x, y0+90, 68, 24, 12, stroke=ACCENT if i==0 else GRAY, sw=1, fill="#132c54" if i==0 else "#0c2144")
        s += text(x+34, y0+106, f, size=8, fill=INK if i==0 else MUTE, anchor="middle")
    # priority card
    s += rrect(PX0+16, y0+132, PW-32, 64, 12, stroke=ACCENT, sw=1.4, fill="#132c54")
    s += text(PX0+28, y0+156, "Queen of Tears · Ep 9 just aired", size=10, fill=INK, weight="800")
    s += text(PX0+28, y0+176, "Tap to join the live discussion", size=8, fill=MUTE)
    s += arrow_right(PX0+PW-36, y0+164, 12, ACCENT)
    rows = [
        ("@soojin replied to you", "2m", ACCENT),
        ("@drama_official mentioned you", "8m", GOOD),
        ("Community announcement · Romance Fans", "1h", ACC2),
        ("New post in Theories Club", "3h", MUTE),
        ("Followed actor update · Kim Soo-hyun", "5h", MUTE),
    ]
    for i,(t,d,col) in enumerate(rows):
        y = y0+216+i*58
        s += avatar(PX0+36, y+20, 14)
        s += text(PX0+56, y+17, t, size=9, fill=INK)
        s += text(PX0+56, y+31, d, size=8, fill=MUTE)
        s += text(PX0+PW-22, y+20, "›", size=14, fill=MUTE, anchor="end")
    s += text(PX0+PW/2, y0+566, "You're all caught up", size=9, fill=MUTE, anchor="middle")
    return s + tabbar() + home_indicator()

def s_profile():
    y0 = PY0
    s = statusbar()
    s += rrect(PX0, y0, PW, 96, 0, stroke="none", fill="#132c54")
    s += avatar(PX0+PW/2, y0+70, 24)
    s += text(PX0+PW/2, y0+118, "@kim_soojin", size=11, fill=INK, weight="800", anchor="middle")
    s += text(PX0+PW/2, y0+136, "Mostly romance & slow-burn", size=8, fill=MUTE, anchor="middle")
    s += text(PX0+24, y0+164, "192", size=10, fill=INK, weight="800", anchor="middle")
    s += text(PX0+24, y0+176, "Following", size=7, fill=MUTE, anchor="middle")
    s += text(PX0+PW/2, y0+164, "1.6K", size=10, fill=INK, weight="800", anchor="middle")
    s += text(PX0+PW/2, y0+176, "Followers", size=7, fill=MUTE, anchor="middle")
    s += text(PX0+PW-24, y0+164, "3.2K", size=10, fill=INK, weight="800", anchor="middle")
    s += text(PX0+PW-24, y0+176, "Likes", size=7, fill=MUTE, anchor="middle")
    s += text(PX0+16, y0+200, "Currently Watching", size=11, fill=INK, weight="800")
    for i in range(4):
        x = PX0+16+i*72
        s += rrect(x, y0+214, 64, 82, 10, stroke=GRAY, sw=1.2, fill="#0c2144")
        s += f'<path d="M{x+52} {y0+224} a10 10 0 1 0 8 4" fill="none" stroke="{GOOD}" stroke-width="1.6"/>'
    # tabs
    for i, t in enumerate(["Posts","Saved","Watchlist","Communities"]):
        x = PX0+20+i*72
        s += text(x, y0+324, t, size=8.5, fill=INK if i==0 else MUTE, anchor="middle")
        if i==0:
            s += f'<line x1="{x}" y1="{y0+330}" x2="{x}" y2="{y0+334}" stroke="{ACCENT}" stroke-width="2"/>'
    s += post_card(PX0+16, y0+348, PW-32, 180, spoiler=True)
    s += text(PX0+16, y0+552, "More posts...", size=8, fill=MUTE)
    return s + tabbar() + home_indicator()

def s_drama_hub():
    y0 = PY0
    s = statusbar()
    s += rrect(PX0, y0, PW, 156, 0, stroke="none", fill="#132c54")
    s += circle(PX0+56, y0+86, 34, stroke=ACCENT, sw=1.6)
    s += text(PX0+104, y0+54, "Queen of Tears", size=14, fill=INK, weight="900")
    s += text(PX0+104, y0+72, "Queen of Tears · KR", size=8, fill=ACC2)
    s += text(PX0+104, y0+96, "Romance · Comedy · Currently Airing", size=7.5, fill=MUTE)
    s += rrect(PX0+104, y0+112, 58, 20, 10, stroke=ACCENT, sw=1.2, fill="#3a2a6e")
    s += text(PX0+133, y0+126, "Follow", size=8, fill=INK, anchor="middle")
    s += rrect(PX0+170, y0+112, 44, 20, 10, stroke=GRAY, sw=1, fill="#0c2144")
    s += text(PX0+192, y0+126, "Watch", size=8, fill=MUTE, anchor="middle")
    s += text(PX0+16, y0+184, "Cast", size=10, fill=INK, weight="800")
    for i in range(5):
        cx = PX0+34+i*56
        s += circle(cx, y0+226, 20, stroke=MUTE, sw=1.2)
        s += text(cx, y0+262, ["Cast","Cast","Cast","Cast","Cast"][i], size="7", fill=MUTE, anchor="middle")
    s += text(PX0+16, y0+292, "Episodes", size=10, fill=INK, weight="800")
    for i in range(4):
        x = PX0+16+i*72
        s += rrect(x, y0+306, 64, 82, 10, stroke=GRAY, sw=1.2, fill="#0c2144")
        s += text(x+32, y0+340, f"Ep {i+6}", size=9, fill=INK, anchor="middle", weight="800")
        s += text(x+32, y0+356, "Live · 1.2K", size=6.5, fill=GOOD, anchor="middle")
    # community tabs
    for i, t in enumerate(["Discussions","Theories","Memes","Edits","Official"]):
        x = PX0+16+i*58
        s += text(x, y0+428, t, size=8, fill=INK if i==0 else MUTE, anchor="middle")
    s += text(PX0+16, y0+452, "Trending in this fandom", size=10, fill=INK, weight="800")
    s += post_card(PX0+16, y0+466, PW-32, 130, spoiler=False)
    return s + tabbar() + home_indicator()

def s_episode():
    y0 = PY0
    s = statusbar()
    s += rrect(PX0, y0, PW, 120, 0, stroke="none", fill="#132c54")
    s += circle(PX0+48, y0+54, 24, stroke=ACC2, sw=1.5)
    s += text(PX0+84, y0+36, "Episode 8", size=14, fill=INK, weight="900")
    s += text(PX0+84, y0+54, "Queen of Tears", size=8, fill=MUTE)
    s += text(PX0+84, y0+74, "Airs tonight · Live reaction 1.2K", size=7.5, fill=GOOD)
    s += rrect(PX0+16, y0+140, PW-32, 42, 12, stroke=GOOD, sw=1.4, fill="#11304c")
    s += text(PX0+28, y0+168, "You've watched through Ep 8 — safe to discuss", size=7.5, fill=GOOD)
    s += text(PX0+16, y0+214, "Live Reactions", size=10, fill=INK, weight="800")
    for i,(who,txt) in enumerate([("@drama.fan","Main lead is SO good"),("@soojin","That plot twist!"),("@memequeen","THE SOUNDTRACK"),("@theorist","Ep 9 setting up...")]):
        y = y0+228+i*56
        s += avatar(PX0+32, y+18, 12)
        s += text(PX0+50, y+14, who, size=8, fill=INK, weight="700")
        s += text(PX0+50, y+30, txt, size=8, fill=MUTE)
        s += text(PX0+PW-20, y+18, "♡ 1.2K", size=7.5, fill=MUTE, anchor="end")
    s += rrect(PX0+16, y0+548, PW-32, 34, 17, stroke=GRAY, sw=1.2, fill="#0c2144")
    s += text(PX0+30, y0+570, "Join the live discussion...", size=8, fill=MUTE)
    return s + tabbar() + home_indicator()

def s_post_detail():
    y0 = PY0
    s = statusbar()
    s += text(PX0+16, y0+30, "‹", size=16, fill=INK)
    s += text(PX0+PW/2+4, y0+30, "Post", size=12, fill=INK, weight="800", anchor="middle")
    s += post_card(PX0+16, y0+52, PW-32, 150, spoiler=False)
    s += text(PX0+16, y0+230, "Comments · 128", size=10, fill=INK, weight="800")
    # nested threads
    rows = [
        (0, "@soojin", "This is my favorite episode", 0),
        (34, "@reply1", "Same!! The OST got me", 1),
        (62, "@reply2", "That scene though", 2),
        (0, "@critic", "Pacing felt slower tonight", 0),
    ]
    for i,(indent,who,txt,_) in enumerate(rows):
        y = y0+254+i*52
        s += avatar(PX0+34+indent, y+20, 11)
        s += text(PX0+52+indent, y+16, who, size=8, fill=INK, weight="700")
        s += text(PX0+52+indent, y+32, txt, size=8, fill=MUTE)
        s += text(PX0+PW-20, y+20, "♡ 12", size=7.5, fill=MUTE, anchor="end")
    s += rrect(PX0+16, y0+548, PW-32, 34, 17, stroke=GRAY, sw=1.2, fill="#0c2144")
    s += text(PX0+30, y0+570, "Write a reply...", size=8, fill=MUTE)
    return s + tabbar() + home_indicator()

def s_community():
    y0 = PY0
    s = statusbar()
    s += rrect(PX0, y0, PW, 120, 0, stroke="none", fill="#132c54")
    s += circle(PX0+56, y0+70, 30, stroke=ACC2, sw=1.6)
    s += text(PX0+104, y0+52, "Romance K-drama Fans", size=12.5, fill=INK, weight="900")
    s += text(PX0+104, y0+72, "Soft romances, first kisses & chaos.", size=8, fill=MUTE)
    s += text(PX0+104, y0+94, "8.4K members · 12 rules", size=8, fill=MUTE)
    s += rrect(PX0+PW-106, y0+92, 84, 24, 12, stroke="none", fill=ACCENT)
    s += text(PX0+PW-64, y0+108, "Join", size=9, fill="#04122a", weight="800", anchor="middle")
    s += text(PX0+PW/2, y0+168, "Pinned", size=10, fill=INK, weight="800", anchor="middle")
    s += rrect(PX0+16, y0+184, PW-32, 40, 10, stroke=ACCENT, sw=1.2, fill="#132c54")
    s += text(PX0+28, y0+206, "PIN · Welcome! Read the rules before posting", size=8, fill=INK)
    for i,(who,txt,cat) in enumerate([("@soojin","Ep 8 live thread", "Discussion"),
                                      ("@memequeen","This edit (heart)","Meme"),
                                      ("@theorist","A theory about the ending","Theory")]):
        y = y0+240+i*62
        s += avatar(PX0+32, y+22, 12)
        s += text(PX0+50, y+18, who, size=8, fill=INK, weight="700")
        s += text(PX0+50, y+34, txt, size=8, fill=MUTE)
        s += rrect(PX0+PW-96, y+14, 78, 16, 8, stroke=ACC2, sw=1, fill="#132c54")
        s += text(PX0+PW-57, y+25, cat, size=6.5, fill=ACC2, anchor="middle")
        s += text(PX0+50, y+52, "♡ 240 · 68 replies", size=7, fill=MUTE)
    s += rrect(PX0+16, y0+548, PW-32, 34, 17, stroke=GRAY, sw=1.2, fill="#0c2144")
    s += text(PX0+30, y0+570, "Post to Romance K-drama Fans...", size=8, fill=MUTE)
    return s + tabbar() + home_indicator()

def s_search():
    y0 = PY0
    s = statusbar()
    s += rrect(PX0+16, y0+54, PW-32, 38, 12, stroke=GRAY, sw=1.2, fill="#0a1c38")
    s += text(PX0+32, y0+78, "Queen", size=9, fill=INK)
    s += search_icon(PX0+PW-36, y0+78, 11, INK)
    for i, f in enumerate(["All","Dramas","Actors","Users","Communities","Posts"]):
        x = PX0+16+i*50
        s += rrect(x, y0+108, 44, 20, 10, stroke=ACCENT if i==0 else GRAY, sw=1, fill="#132c54" if i==0 else "#0c2144")
        s += text(x+22, y0+122, f, size=6.8, fill=INK if i==0 else MUTE, anchor="middle")
    s += text(PX0+16, y0+150, "Dramas", size=10, fill=INK, weight="800")
    for i in range(2):
        x = PX0+16+i*94
        s += rrect(x, y0+164, 86, 128, 12, stroke=GRAY, sw=1.2, fill="#0c2144")
        s += circle(x+43, y0+216, 26, stroke=ACCENT, sw=1.4)
        s += text(x+43, y0+272, ["Queen of Tears","Queenmaker"][i], size=7.5, fill=INK, anchor="middle")
    s += text(PX0+16, y0+316, "Actors", size=10, fill=INK, weight="800")
    for i in range(3):
        x = PX0+34+i*72
        s += circle(x, y0+358, 20, stroke=MUTE, sw=1.2)
        s += text(x, y0+392, ["Actor A","Actor B","Actor C"][i], size=7, fill=MUTE, anchor="middle")
    s += text(PX0+16, y0+420, "Users & Communities", size=10, fill=INK, weight="800")
    for i,(who,k) in enumerate([("@soojin","User"),("Romance Fans","Community")]):
        y = y0+436+i*36
        s += avatar(PX0+34, y+16, 12)
        s += text(PX0+54, y+13, who, size=8.5, fill=INK)
        s += text(PX0+54, y+27, k, size=7, fill=MUTE)
    s += text(PX0+PW/2, y0+560, "End of results", size=8, fill=MUTE, anchor="middle")
    return s + tabbar() + home_indicator()

def s_account_recovery():
    y0 = PY0
    s = statusbar()
    s += text(PX0+16, y0+30, "‹", size=16, fill=INK)
    s += text(PX0+16, y0+106, "Forgot password?", size=21, fill=INK, weight="850")
    s += text(PX0+16, y0+132, "Enter your email and we'll send", size=10, fill=MUTE)
    s += text(PX0+16, y0+148, "a reset link.", size=10, fill=MUTE)
    s += rrect(PX0+16, y0+176, PW-32, 40, 12, stroke=GRAY, sw=1.2, fill="#0d2446")
    s += text(PX0+28, y0+200, "Email", size=9.5, fill=MUTE)
    s += rrect(PX0+16, y0+232, PW-32, 42, 21, stroke="none", fill=ACCENT)
    s += text(PX0+PW/2, y0+258, "Send reset link", size=12, fill="#04122a", weight="800", anchor="middle")
    s += text(PX0+PW/2, y0+306, "Back to sign in", size=10, fill=INK, anchor="middle")
    s += f'<path d="M{PX0+20} {y0+380} C {PX0+90} {y0+340}, {PX0+210} {y0+400}, {PX0+PW-20} {y0+350}" stroke="{ACC2}" stroke-width="2" fill="none" opacity=".55"/>'
    return s + home_indicator()

def s_onboard_actors():
    y0 = PY0
    s = statusbar()
    s += text(PX0+16, y0+96, "Pick the actors you love", size=19, fill=INK, weight="850")
    names = ["Kim", "Lee", "Park", "Choi", "Jung", "Han"]
    for i in range(6):
        x = PX0+22 + (i%2)*150
        y = y0+130 + (i//2)*92
        s += circle(x+52, y, 30, stroke=ACCENT if i in (0,3) else GRAY, sw=1.4)
        s += circle(x+52, y, 11, fill=MUTE)
        s += text(x+40, y+44, names[i], size=8.5, fill=INK, weight="700")
        if i in (0,3):
            s += circle(x+84, y-22, 9, fill=ACCENT)
            s += f'<path d="M{x+80} {y-22} l4 4 l6 -7" stroke="#04122a" stroke-width="2" fill="none"/>'
    s += rrect(PX0+16, y0+560, PW-32, 42, 21, stroke="none", fill=ACCENT)
    s += text(PX0+PW/2, y0+586, "Continue", size=12, fill="#04122a", weight="800", anchor="middle")
    for i in range(4):
        s += circle(PX0+PW/2-18+ i*12, y0+536, 4, fill=ACCENT if i==1 else GRAY)
    return s + home_indicator()

def s_onboard_communities():
    y0 = PY0
    s = statusbar()
    s += text(PX0+16, y0+96, "Join communities", size=19, fill=INK, weight="850")
    for i in range(4):
        y = y0+128+i*68
        s += rrect(PX0+16, y, PW-32, 56, 12, stroke=GRAY, sw=1.2, fill="#0c2144")
        s += circle(PX0+38, y+28, 16, stroke=MUTE, sw=1.2)
        s += text(PX0+62, y+22, ["Romance Fans","Thriller Fans","Theory Club","Meme Society"][i], size=9, fill=INK)
        s += text(PX0+62, y+38, ["8.4K members","12K members","5.1K members","9.3K members"][i], size=7.5, fill=MUTE)
        s += rrect(PX0+PW-74, y+16, 52, 24, 12, stroke="none", fill=ACCENT)
        s += text(PX0+PW-48, y+32, "Join", size=8, fill="#04122a", weight="800", anchor="middle")
    s += text(PX0+16, y0+410, "Official accounts", size=11, fill=INK, weight="800")
    for i in range(2):
        y = y0+426+i*56
        s += rrect(PX0+16, y, PW-32, 44, 10, stroke=GRAY, sw=1.2, fill="#0c2144")
        s += circle(PX0+34, y+22, 12, stroke=ACC2, sw=1.2)
        s += text(PX0+52, y+18, ["Broadcaster Official","Streaming Official"][i], size=8.5, fill=INK)
        s += text(PX0+52, y+32, "Verified", size=7, fill=ACC2)
    s += rrect(PX0+16, y0+560, PW-32, 42, 21, stroke="none", fill=ACCENT)
    s += text(PX0+PW/2, y0+586, "Continue", size=12, fill="#04122a", weight="800", anchor="middle")
    return s + home_indicator()

def s_onboard_complete():
    cx = PX0+PW/2
    y0 = PY0
    s = statusbar()
    s += f'<path d="M{cx-120} {y0+180} C {cx-50} {y0+120}, {cx+40} {y0+220}, {cx+130} {y0+150}" stroke="{ACCENT}" stroke-width="3" fill="none" opacity=".9"/>'
    s += f'<path d="M{cx-140} {y0+260} C {cx-50} {y0+200}, {cx+50} {y0+300}, {cx+140} {y0+230}" stroke="{ACC2}" stroke-width="3" fill="none" opacity=".7"/>'
    s += circle(cx, y0+330, 42, stroke=GOOD, sw=2)
    s += f'<path d="M{cx-18} {y0+334} l 12 12 l 24 -28" stroke="{GOOD}" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
    s += text(cx, y0+410, "Your wave is ready", size=18, fill=INK, weight="850", anchor="middle")
    s += text(cx, y0+438, "Your feed is personalized and", size=10, fill=MUTE, anchor="middle")
    s += text(cx, y0+454, "your fandom awaits.", size=10, fill=MUTE, anchor="middle")
    s += rrect(PX0+16, y0+560, PW-32, 42, 21, stroke="none", fill=ACCENT)
    s += text(PX0+PW/2, y0+586, "Start exploring", size=12, fill="#04122a", weight="800", anchor="middle")
    for i in range(4):
        s += circle(PX0+PW/2-18+ i*12, y0+536, 4, fill=ACCENT)
    return s + home_indicator()

def s_actor_page():
    y0 = PY0
    s = statusbar()
    s += rrect(PX0, y0, PW, 160, 0, stroke="none", fill="#132c54")
    s += circle(PX0+56, y0+90, 38, stroke=ACCENT, sw=1.6)
    s += text(PX0+108, y0+64, "Kim Soo-hyun", size=14, fill=INK, weight="900")
    s += text(PX0+108, y0+84, "Actor · Verified", size=8, fill=ACC2)
    s += text(PX0+108, y0+108, "9.2K followers · 1.4K following", size=7.5, fill=MUTE)
    s += rrect(PX0+108, y0+126, 58, 20, 10, stroke=ACCENT, sw=1.2, fill="#3a2a6e")
    s += text(PX0+137, y0+140, "Follow", size=8, fill=INK, anchor="middle")
    s += text(PX0+16, y0+188, "Known For", size=10, fill=INK, weight="800")
    for i in range(4):
        x = PX0+16+i*72
        s += rrect(x, y0+202, 64, 82, 10, stroke=GRAY, sw=1.2, fill="#0c2144")
        s += circle(x+32, y0+242, 20, stroke=MUTE, sw=1)
    s += text(PX0+16, y0+306, "Filmography", size=10, fill=INK, weight="800")
    for i, (t, sub) in enumerate([("Queen of Tears", "Lead · 2024"),
                                  ("The Moon Embracing the Sun", "Lead · 2012"),
                                  ("My Love from the Star", "Lead · 2013"),
                                  ("It's Okay to Not Be Okay", "Lead · 2020")]):
        y = y0+322+i*44
        s += rrect(PX0+16, y, PW-32, 36, 10, stroke=GRAY, sw=1.2, fill="#0c2144")
        s += circle(PX0+36, y+18, 11, stroke=MUTE, sw=1)
        s += text(PX0+54, y+15, t, size=8.5, fill=INK)
        s += text(PX0+54, y+29, sub, size=7, fill=MUTE)
    return s + tabbar() + home_indicator()

def s_hashtag():
    y0 = PY0
    s = statusbar()
    s += text(PX0+16, y0+64, "#QueenOfTears", size=16, fill=INK, weight="900")
    s += rrect(PX0+16, y0+90, PW-32, 34, 10, stroke=GRAY, sw=1.2, fill="#0c2144")
    s += text(PX0+28, y0+111, "12.4K posts · 3.1K fans", size=8, fill=MUTE)
    s += rrect(PX0+16, y0+140, PW-32, 52, 12, stroke=ACCENT, sw=1.2, fill="#132c54")
    s += text(PX0+28, y0+164, "A trending topic in this fandom", size=9, fill=INK, weight="700")
    s += text(PX0+28, y0+182, "Join the conversation with Hallyu", size=7.5, fill=MUTE)
    s += text(PX0+16, y0+220, "Feed", size=10, fill=INK, weight="800")
    s += post_card(PX0+16, y0+234, PW-32, 170, spoiler=True)
    s += text(PX0+16, y0+430, "Related topics", size=10, fill=INK, weight="800")
    for i, t in enumerate(["#KimSooHyun","#Ep8","#ItsOkay","#Kdrama"]):
        x = PX0+16+i*66
        s += rrect(x, y0+444, 60, 20, 10, stroke=ACCENT, sw=1, fill="#132c54")
        s += text(x+30, y0+458, t, size=7, fill=INK, anchor="middle")
    return s + tabbar() + home_indicator()

def s_saved():
    y0 = PY0
    s = statusbar()
    s += text(PX0+16, y0+62, "Saved", size=18, fill=INK, weight="900")
    for i, f in enumerate(["All","Posts","Dramas","Episodes"]):
        x = PX0+16+i*74
        s += rrect(x, y0+90, 68, 24, 12, stroke=ACCENT if i==0 else GRAY, sw=1, fill="#132c54" if i==0 else "#0c2144")
        s += text(x+34, y0+106, f, size=8, fill=INK if i==0 else MUTE, anchor="middle")
    for i,(t,ctx) in enumerate([("That plot twist!!","Queen of Tears · Ep 8"),
                                ("Best OST edit","My Demon · Meme"),
                                ("Cast announcement","Lovely Runner · News")]):
        y = y0+136+i*74
        s += rrect(PX0+16, y, PW-30, 62, 12, stroke=GRAY, sw=1.2, fill="#0c2144")
        s += rrect(PX0+24, y+12, 44, 38, 8, stroke=MUTE, sw=1, fill="#0e2344")
        s += text(PX0+78, y+24, t, size=9, fill=INK)
        s += text(PX0+78, y+42, ctx, size=7.5, fill=MUTE)
        s += f'<path d="M{PX0+PW-40} {y+24} v12 l8 -5 l8 5 v-12 z" fill="none" stroke="{ACCENT}" stroke-width="1.5"/>'
    s += text(PX0+PW/2, y0+560, "You're all caught up", size=9, fill=MUTE, anchor="middle")
    return s + tabbar() + home_indicator()

def s_followers():
    y0 = PY0
    s = statusbar()
    s += text(PX0+16, y0+62, "Followers", size=18, fill=INK, weight="900")
    s += rrect(PX0+16, y0+90, PW-32, 26, 13, stroke=GRAY, sw=1, fill="#0a1c38")
    s += rrect(PX0+16, y0+90, (PW-32)/2, 26, 13, stroke="none", fill=ACCENT)
    s += text(PX0+16+ (PW-32)/4, y0+107, "Followers", size=8, fill="#04122a", weight="800", anchor="middle")
    s += text(PX0+16+ (PW-32)*3/4, y0+107, "Following", size=8, fill=MUTE, anchor="middle")
    s += rrect(PX0+16, y0+126, PW-32, 32, 10, stroke=GRAY, sw=1.2, fill="#0a1c38")
    s += text(PX0+30, y0+146, "Search people", size=8, fill=MUTE)
    for i,(who,bio) in enumerate([("@drama.fan","Ep 8 live threads"),
                                  ("@soojin","Romance only"),
                                  ("@memequeen","Meme archivist"),
                                  ("@theorist","Ending theories"),
                                  ("@btslover","OST playlist")]):
        y = y0+176+i*62
        s += avatar(PX0+36, y+22, 15)
        s += text(PX0+60, y+18, who, size=9, fill=INK, weight="700")
        s += text(PX0+60, y+34, bio, size=7.5, fill=MUTE)
        s += rrect(PX0+PW-74, y+12, 52, 22, 11, stroke=ACCENT, sw=1, fill="#132c54")
        s += text(PX0+PW-48, y+27, "Follow", size=7.5, fill=INK, anchor="middle")
    return s + tabbar() + home_indicator()

def s_settings():
    y0 = PY0
    s = statusbar()
    s += text(PX0+16, y0+62, "Settings", size=18, fill=INK, weight="900")
    groups = [
        ("ACCOUNT & SECURITY", ["Email & password", "Session management"]),
        ("NOTIFICATIONS", ["Push notifications", "Per-drama alerts"]),
        ("SPOILER PREFERENCES", ["Watched through episode", "Keep spoilers hidden"]),
        ("PRIVACY & BLOCKS", ["Muted accounts", "Blocked users"]),
        ("APPEARANCE", ["Dark mode", "Reduce motion"]),
    ]
    y = y0+88
    for g, rows in groups:
        s += text(PX0+16, y+6, g, size=7, fill=ACC2, weight="700")
        y += 20
        for r in rows:
            s += rrect(PX0+16, y, PW-32, 36, 10, stroke=GRAY, sw=1.2, fill="#0c2144")
            s += text(PX0+30, y+23, r, size=8.5, fill=INK)
            # toggle for first row in relevant groups
            if r in ("Push notifications","Per-drama alerts","Keep spoilers hidden","Dark mode","Reduce motion"):
                s += rrect(PX0+PW-48, y+9, 28, 18, 9, stroke=ACCENT, sw=1.2, fill="#132c54")
                s += circle(PX0+PW-58, y+18, 6, fill=ACCENT)
            else:
                s += text(PX0+PW-30, y+23, "›", size=12, fill=MUTE, anchor="end")
            y += 42
    s += text(PX0+16, y0+566, "Log out", size=10, fill=DANGER, weight="700")
    return s + home_indicator()

def s_moderation():
    y0 = PY0
    s = statusbar()
    s += text(PX0+16, y0+62, "Moderation", size=18, fill=INK, weight="900")
    # summary cards
    cards = [("Pending","24",ACCENT),("Resolved","112",GOOD),("Actioned","8",DANGER)]
    for i,(label,val,col) in enumerate(cards):
        x = PX0+16+i*76
        s += rrect(x, y0+88, 68, 44, 10, stroke=GRAY, sw=1.2, fill="#0c2144")
        s += text(x+34, y0+112, val, size=14, fill=col, weight="800", anchor="middle")
        s += text(x+34, y0+126, label, size=7, fill=MUTE, anchor="middle")
    for i, f in enumerate(["All","Spam","Harassment","Spoiler","Copyright"]):
        x = PX0+16+i*60
        s += rrect(x, y0+150, 54, 20, 10, stroke=ACCENT if i==0 else GRAY, sw=1, fill="#132c54" if i==0 else "#0c2144")
        s += text(x+27, y0+164, f, size=7, fill=INK if i==0 else MUTE, anchor="middle")
    for i, (sev, who, reason) in enumerate([("HIGH","@abuse.user","Spam flood · repeated"),
                                            ("MED","@ghost","Possible spoiler"),
                                            ("LOW","@junk","Duplicate post")]):
        y = y0+188+i*92
        s += rrect(PX0+16, y, PW-32, 82, 12, stroke=GRAY, sw=1.2, fill="#0c2144")
        s += rrect(PX0+24, y+10, 46, 34, 8, stroke=MUTE, sw=1, fill="#0e2344")
        s += text(PX0+80, y+18, who, size=8.5, fill=INK, weight="700")
        s += text(PX0+80, y+34, reason, size=7, fill=MUTE)
        s += rrect(PX0+PW-96, y+14, 74, 16, 8, stroke=DANGER if sev=="HIGH" else ACCENT, sw=1, fill="#2a1d3f" if sev=="HIGH" else "#132c54")
        s += text(PX0+PW-59, y+25, sev, size=6.5, fill=DANGER if sev=="HIGH" else ACCENT, anchor="middle")
        # actions
        for j, act in enumerate(["Approve","Remove"]):
            cx = PX0+60+j*70
            s += rrect(cx-24, y+52, 48, 20, 10, stroke=GOOD if j==0 else DANGER, sw=1, fill="#11304c" if j==0 else "#2a1d3f")
            s += text(cx, y+66, act, size=7, fill=GOOD if j==0 else DANGER, anchor="middle")
        s += text(PX0+PW-40, y+66, "Dismiss", size=7, fill=MUTE, anchor="middle")
    return s + tabbar() + home_indicator()

def s_currently_watching():
    y0 = PY0
    s = statusbar()
    s += text(PX0+16, y0+62, "Currently Watching", size=17, fill=INK, weight="900")
    for i, (t, ep) in enumerate([("Queen of Tears", "Ep 8 of 16"),
                                 ("Lovely Runner", "Ep 9 of 16"),
                                 ("My Demon", "Ep 4 of 16"),
                                 ("The Atypical Family", "Ep 6 of 10")]):
        y = y0+86+i*74
        s += rrect(PX0+16, y, PW-30, 62, 12, stroke=GRAY, sw=1.2, fill="#0c2144")
        s += rrect(PX0+24, y+12, 44, 38, 8, stroke=ACCENT, sw=1, fill="#132c54")
        s += text(PX0+78, y+22, t, size=9, fill=INK, weight="700")
        s += text(PX0+78, y+40, ep, size=7.5, fill=MUTE)
        # progress ring
        s += f'<path d="M{PX0+PW-40} {y+30} a12 12 0 1 0 11 5" fill="none" stroke="{GOOD}" stroke-width="2"/>'
    s += rrect(PX0+16, y0+560, PW-32, 34, 17, stroke=GRAY, sw=1.2, fill="#0c2144")
    s += text(PX0+30, y0+582, "Add a new drama to track", size=8, fill=MUTE)
    return s + tabbar() + home_indicator()

SCREENS = [
    ("01-splash", "Splash / Brand", s_splash, ["Wave mark", "App name + KR wordmark", "Tagline"]),
    ("02-welcome", "Welcome / Get Started", s_welcome, ["Cinematic hero", "Primary CTA", "Community teaser"]),
    ("03-auth", "Sign Up / Log In", s_auth, ["Email + password", "Social sign-in", "Terms note"]),
    ("04-onboarding-interests", "Onboarding · Interests", s_interests, ["Genre chips", "Multi-select", "Progress dots"]),
    ("05-onboarding-follows", "Onboarding · Follows", s_onboard_follow, ["Drama cards", "Community join", "Personalization"]),
    ("06-home-foryou", "Home · For You", s_home, ["Segmented feed", "Update rings", "Spoiler post"]),
    ("07-home-following", "Home · Following", s_home, ["Chronological", "Followed graph", "Episode events"]),
    ("08-explore", "Explore", s_explore, ["Unified search", "Current Wave", "Trending + communities"]),
    ("09-create", "Create Composer", s_create, ["Drama/episode tag", "Spoiler toggle", "Category pills"]),
    ("10-notifications", "Notifications", s_notifications, ["Priority episode card", "Filter chips", "Deep links"]),
    ("11-profile", "Profile", s_profile, ["Cover + stats", "Currently Watching", "Content tabs"]),
    ("12-drama-hub", "Drama Hub", s_drama_hub, ["Backdrop + title", "Cast carousel", "Episode list"]),
    ("13-episode", "Episode Discussion", s_episode, ["Spoiler gate", "Live reactions", "Composer"]),
    ("14-post-detail", "Post Detail + Comments", s_post_detail, ["Threaded replies", "Reactions", "Reply bar"]),
    ("15-community", "Community Page", s_community, ["Banner + join", "Pinned rules", "Feed"]),
    ("16-search", "Search Results", s_search, ["Filter chips", "Unified results", "Empty state"]),
    ("17-account-recovery", "Account Recovery", s_account_recovery, ["Forgot password", "Email reset link", "Back to sign in"]),
    ("18-onboarding-actors", "Onboarding · Actors", s_onboard_actors, ["Actor portraits", "Multi-select", "Progress dots"]),
    ("19-onboarding-communities", "Onboarding · Communities", s_onboard_communities, ["Community join", "Verified official", "Continue CTA"]),
    ("20-onboarding-completion", "Onboarding · Completion", s_onboard_complete, ["Success wave", "Personalized feed", "Start CTA"]),
    ("21-actor-page", "Actor Page", s_actor_page, ["Portrait + verify", "Known For", "Filmography"]),
    ("22-hashtag-page", "Hashtag Page", s_hashtag, ["Topic header", "Hashtag feed", "Related topics"]),
    ("23-saved", "Saved / Bookmarks", s_saved, ["Filter chips", "Saved cards", "Empty hint"]),
    ("24-followers", "Followers", s_followers, ["Toggle list", "Search", "Follow buttons"]),
    ("25-settings", "Settings", s_settings, ["Grouped list", "Toggles", "Privacy + spoilers"]),
    ("26-moderation", "Moderation Queue", s_moderation, ["Summary cards", "Severity filters", "Approve/Remove"]),
    ("27-following", "Following List", s_followers, ["Toggle list", "Search", "Followed rows"]),
    ("28-currently-watching", "Currently Watching", s_currently_watching, ["Tracked dramas", "Episode progress", "Add drama"]),
]

def callouts(cx, cy, items):
    """Place numbered annotations along the right edge."""
    s = ""
    y = 150
    for i, t in enumerate(items):
        s += callout(i+1, cx, y, t)
        y += 34
    return s

def svg_header():
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" fill="none">'

def render(name, title, fn, annos):
    s = svg_header()
    s += backdrop()
    s += title_block(title, "Hallyu · Technical blueprint — screen " + name.split("-")[0])
    s += phone()
    s += fn()
    s += callouts(880, 130, annos)
    s += bottom_anno(title)
    s += "</svg>"
    return s

def main():
    out = os.path.join(os.path.dirname(__file__), "..", "blueprints", "line-art")
    os.makedirs(out, exist_ok=True)
    for name, title, fn, annos in SCREENS:
        svg = render(name, title, fn, annos)
        with open(os.path.join(out, name + ".svg"), "w") as f:
            f.write(svg)
        print("wrote", name + ".svg")

if __name__ == "__main__":
    main()
