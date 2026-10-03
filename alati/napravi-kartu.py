# Pravi map-data.js iz world-atlas land-50m.json (Natural Earth, javni podaci).
# Pokretanje: python3 alati/napravi-kartu.py /putanja/do/land-50m.json
import json, sys

TOLERANCIJA = 0.08   # stepeni; manje = detaljnije, veći fajl
MIN_POVRSINA = 0.08  # izbacuje sitna ostrva (kvadratni stepeni)

topo = json.load(open(sys.argv[1]))
sx, sy = topo["transform"]["scale"]
tx, ty = topo["transform"]["translate"]

lukovi = []
for luk in topo["arcs"]:
    x = y = 0
    tacke = []
    for dx, dy in luk:
        x += dx; y += dy
        tacke.append((x * sx + tx, y * sy + ty))
    lukovi.append(tacke)

def prsten(indeksi):
    out = []
    for i in indeksi:
        t = lukovi[i] if i >= 0 else lukovi[~i][::-1]
        out.extend(t if not out else t[1:])
    return out

def bez_skokova(r):
    # Prsten koji prelazi 180. meridijan "odmotavamo" da ne bi presekao celu kartu
    out, pomak = [r[0]], 0
    for (x0, _), (x1, y1) in zip(r, r[1:]):
        if x1 - x0 > 180: pomak -= 360
        elif x0 - x1 > 180: pomak += 360
        out.append((x1 + pomak, y1))
    # Ceo prsten vraćamo tako da mu je sredina između -180 i 180
    sredina = sum(x for x, _ in out) / len(out)
    k = -360 * round(sredina / 360)
    return [(x + k, y) for x, y in out]

def povrsina(r):
    return abs(sum(r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1] for i in range(len(r) - 1))) / 2

def dp(t, eps):
    # Douglas–Peucker, iterativno
    if len(t) < 3:
        return t
    zadrzi = [False] * len(t); zadrzi[0] = zadrzi[-1] = True
    stek = [(0, len(t) - 1)]
    while stek:
        a, b = stek.pop()
        (x1, y1), (x2, y2) = t[a], t[b]
        dx, dy = x2 - x1, y2 - y1
        n = (dx * dx + dy * dy) ** 0.5
        best, bi = 0, -1
        for i in range(a + 1, b):
            if n < 1e-12:  # zatvoren prsten: početak i kraj su ista tačka
                d = ((t[i][0] - x1) ** 2 + (t[i][1] - y1) ** 2) ** 0.5
            else:
                d = abs(dy * (t[i][0] - x1) - dx * (t[i][1] - y1)) / n
            if d > best:
                best, bi = d, i
        if best > eps:
            zadrzi[bi] = True
            stek += [(a, bi), (bi, b)]
    return [p for p, k in zip(t, zadrzi) if k]

delovi = []
for geo in topo["objects"]["land"]["geometries"]:
    poligoni = geo["arcs"] if geo["type"] == "MultiPolygon" else [geo["arcs"]]
    for poligon in poligoni:
        for indeksi in poligon:
            r = bez_skokova(prsten(indeksi))
            if max(p[1] for p in r) < -60 or povrsina(r) < MIN_POVRSINA:
                continue
            r = dp(r, TOLERANCIJA)
            if len(r) < 4:
                continue
            delovi.append("M" + "L".join(f"{round(x, 2):g},{round(-y, 2):g}" for x, y in r) + "Z")

with open("map-data.js", "w") as f:
    f.write("// Obris kopna (Natural Earth preko world-atlas). Generisano: alati/napravi-kartu.py\n")
    f.write(f'const KOPNO = "{"".join(delovi)}";\n')
print(len(delovi), "oblika")
