(() => {
  const $ = (id) => document.getElementById(id);
  const TZ = "Europe/Belgrade";
  const pad = (n) => String(n).padStart(2, "0");
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const broj = new Intl.NumberFormat("sr-Latn-RS");

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };

  // Srpska množina: 1 dan, 21 dan, 2 dana, 11 dana...
  const danReci = (n) => (n % 10 === 1 && n % 100 !== 11 ? "dan" : "dana");
  const mesecReci = (n) => {
    const a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return "mesec";
    if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return "meseca";
    return "meseci";
  };
  const godinaReci = (n) => (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "godine" : "godina");

  // Sve računamo po beogradskom kalendaru, gde je ona.
  const beogradFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  function beograd(date = new Date()) {
    const o = {};
    for (const p of beogradFmt.formatToParts(date)) o[p.type] = p.value;
    return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour, min: +o.minute };
  }
  const danBroj = (y, m, d) => Math.floor(Date.UTC(y, m - 1, d) / 864e5);
  const danas = () => { const n = beograd(); return danBroj(n.y, n.m, n.d); };

  // ---------- Tajna poruka ----------
  function tajna(tekst) {
    const el = $("secret");
    $("secret-text").textContent = tekst;
    el.hidden = false;
    const otvoreno = Date.now();
    el.onclick = () => { if (Date.now() - otvoreno > 800) el.hidden = true; };
  }

  // ---------- Uvod ----------
  function uvod(gotovo) {
    const nateraj = new URLSearchParams(location.search).has("uvod");
    if (!nateraj && store.get("uvodVidjen", false)) return gotovo();
    const el = $("intro");
    $("intro-text").innerHTML = PODACI.uvod
      .map((red, i) => `<span style="animation-delay:${0.4 + i * 1.1}s">${esc(red)}</span>`)
      .join("");
    el.hidden = false;
    const moze = Date.now() + 2000;
    el.onclick = () => {
      if (Date.now() < moze) return;
      el.onclick = null;
      store.set("uvodVidjen", true);
      el.style.transition = "opacity 0.6s";
      el.style.opacity = "0";
      setTimeout(() => { el.hidden = true; el.style.opacity = ""; }, 600);
      gotovo();
    };
  }

  // ---------- Odbrojavanje ----------
  const cilj = () => store.get("cilj", Date.parse(PODACI.sledeceVidjenje));
  const ciljOd = () => store.get("ciljOd", Date.parse(PODACI.odbrojavanjeOd));

  function odbrojavanje() {
    const t = cilj(), sad = Date.now();
    const c = beograd(new Date(t));
    $("cd-label").textContent = `do ${pad(c.d)}.${pad(c.m)}. · ${pad(c.h)}:${pad(c.min)}`;

    let s = Math.max(0, Math.floor((t - sad) / 1000));
    const d = Math.floor(s / 86400);
    s %= 86400;
    $("cd-days").textContent = d;
    $("cd-unit").textContent = t <= sad ? "konačno zajedno" : danReci(d);
    $("cd-hms").textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;

    const od = ciljOd();
    const napredak = t > od ? Math.min(1, Math.max(0, (sad - od) / (t - od))) : 1;
    $("cd-bar").style.width = `${(napredak * 100).toFixed(2)}%`;
  }

  function podesiIzmenuDatuma() {
    const inp = $("cd-input");
    const upisi = () => {
      const d = new Date(cilj());
      inp.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    upisi();
    inp.addEventListener("change", () => {
      const ts = new Date(inp.value).getTime();
      if (!inp.value || isNaN(ts)) return upisi();
      store.set("cilj", ts);
      store.set("ciljOd", Date.now());
      odbrojavanje();
    });
  }

  // 7 brzih dodira na broj dana
  function podesiSedamDodira() {
    const el = $("cd-days");
    let dodiri = [];
    el.addEventListener("click", () => {
      const sad = Date.now();
      dodiri = dodiri.filter((t) => sad - t < 3000);
      dodiri.push(sad);
      el.classList.remove("tap-pulse");
      void el.offsetWidth;
      el.classList.add("tap-pulse");
      if (dodiri.length >= 7) { dodiri = []; tajna(PODACI.tajne.sedamDodira); }
    });
  }

  // ---------- Zajedno ----------
  function zajedno() {
    const [y, m, d] = PODACI.zajednoOd.split("-").map(Number);
    const n = beograd();
    const dani = danBroj(n.y, n.m, n.d) - danBroj(y, m, d);
    $("tg-days").textContent = `${broj.format(dani)} ${danReci(dani)}`;

    let meseci = (n.y - y) * 12 + (n.m - m) - (n.d < d ? 1 : 0);
    const ostatak = danBroj(n.y, n.m, n.d) - Math.floor(Date.UTC(y, m - 1 + meseci, d) / 864e5);
    const god = Math.floor(meseci / 12);
    meseci %= 12;

    const delovi = [];
    if (god) delovi.push(`${god} ${godinaReci(god)}`);
    if (meseci) delovi.push(`${meseci} ${mesecReci(meseci)}`);
    if (ostatak) delovi.push(`${ostatak} ${danReci(ostatak)}`);
    const godisnjica = n.m === m && n.d === d && n.y > y;
    $("tg-detail").textContent = godisnjica
      ? "srećna godišnjica"
      : `${delovi.join(" · ")}${delovi.length ? " · " : ""}od ${d}.${m}.${y}.`;
  }

  // ---------- Daljina ----------
  const RAD = Math.PI / 180;
  const gradovi = () => store.get("gradovi", PODACI.gradovi);

  function haversin(a, b) {
    const h = Math.sin(((b.lat - a.lat) * RAD) / 2) ** 2 +
      Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(((b.lon - a.lon) * RAD) / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(h));
  }

  function velikiKrug(a, b, n = 64) {
    const f1 = a.lat * RAD, l1 = a.lon * RAD, f2 = b.lat * RAD, l2 = b.lon * RAD;
    const d = haversin(a, b) / 6371;
    if (d < 1e-9) return [[a.lon, a.lat]];
    const out = [];
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      const A = Math.sin((1 - f) * d) / Math.sin(d), B = Math.sin(f * d) / Math.sin(d);
      const x = A * Math.cos(f1) * Math.cos(l1) + B * Math.cos(f2) * Math.cos(l2);
      const y = A * Math.cos(f1) * Math.sin(l1) + B * Math.cos(f2) * Math.sin(l2);
      const z = A * Math.sin(f1) + B * Math.sin(f2);
      out.push([Math.atan2(y, x) / RAD, Math.atan2(z, Math.hypot(x, y)) / RAD]);
    }
    return out;
  }

  // Zabavna poređenja, menjaju se na dodir broja
  let nacin = 0;
  const trajanje = (sati) => {
    const min = Math.round(sati * 60);
    return `${Math.floor(min / 60)}h ${pad(min % 60)}min`;
  };
  function prikaziDaljinu() {
    const [a, b] = gradovi();
    const km = haversin(a, b);
    const nacini = [
      ["vazdušnom linijom", broj.format(Math.round(km)), "km"],
      ["avionom, otprilike", trajanje(km / 780 + 0.5), "leta"],
      ["kolima, otprilike", trajanje((km * 1.3) / 85), "vožnje bez pauze"],
      ["vrani bi trebalo", trajanje(km / 45), "leta bez odmora"],
      ["peške", new Intl.NumberFormat("sr-Latn-RS", { maximumFractionDigits: 1 }).format(km / 0.00075 / 1e6), "miliona koraka"],
    ];
    const i = nacin % nacini.length;
    const [naslov, vr, jed] = nacini[i];
    const el = $("km");
    $("km-label").textContent = naslov;
    el.textContent = vr;
    el.style.fontSize = vr.length > 5 ? "clamp(48px, 15vw, 80px)" : "";
    $("km-unit").textContent = jed;
    $("km-dots").innerHTML = nacini.map((_, k) => `<i${k === i ? ' class="on"' : ""}></i>`).join("");
  }

  function podesiPoredjenja() {
    $("km").addEventListener("click", () => {
      nacin++;
      store.set("poredjenjaVidjena", true);
      $("km-hint").hidden = true;
      prikaziDaljinu();
    });
    $("km-hint").hidden = store.get("poredjenjaVidjena", false);
  }

  function koordinate(g) {
    const f = (v, p, n) => `${Math.abs(v).toFixed(2)}°${v >= 0 ? p : n}`;
    return `${f(g.lat, "N", "S")}<br>${f(g.lon, "E", "W")}`;
  }

  function prikaziGradove() {
    // Zapadni grad levo, istočni desno, kao na karti
    const lista = [...gradovi()].sort((a, b) => a.lon - b.lon);
    $("cities").innerHTML = lista
      .map((g, i) => `
        <div class="city${i ? " right" : ""}" data-tz="${esc(g.tz || "")}" data-key="${g.lat},${g.lon}">
          <div class="name">${esc(g.ime)}</div>
          ${g.ko ? `<div class="ko">${esc(g.ko)}</div>` : ""}
          <div class="coords mono">${koordinate(g)}</div>
          <div class="now mono"><span class="t">--:--</span><br><span class="w">--°</span></div>
        </div>`)
      .join("");
    satiGradova();
    vreme();
  }

  function satiGradova() {
    for (const el of document.querySelectorAll(".city")) {
      const tz = el.dataset.tz;
      if (!tz) continue;
      el.querySelector(".t").textContent = new Intl.DateTimeFormat("en-GB", {
        timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
      }).format(new Date());
    }
  }

  const opisVremena = (k) =>
    k === 0 ? "vedro" : k <= 2 ? "malo oblačno" : k === 3 ? "oblačno" : k <= 48 ? "magla" :
    k <= 57 ? "rosulja" : k <= 67 ? "kiša" : k <= 77 ? "sneg" : k <= 82 ? "pljusak" : k <= 86 ? "sneg" : "grmljavina";

  async function vreme() {
    for (const el of document.querySelectorAll(".city")) {
      const kljuc = `vreme:${el.dataset.key}`;
      const upisi = (v) => { el.querySelector(".w").textContent = `${Math.round(v.temp)}° ${opisVremena(v.kod)}`; };
      const kes = store.get(kljuc, null);
      if (kes) upisi(kes);
      if (kes && Date.now() - kes.ts < 20 * 60e3) continue;
      const [lat, lon] = el.dataset.key.split(",");
      try {
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`);
        const j = await r.json();
        const v = { temp: j.current.temperature_2m, kod: j.current.weather_code, ts: Date.now() };
        store.set(kljuc, v);
        upisi(v);
      } catch {}
    }
  }

  function crtajMapu() {
    const svg = $("map");
    const [a, b] = gradovi();
    const W = svg.clientWidth || 375, H = svg.clientHeight || 300;
    const k = Math.cos(((a.lat + b.lat) / 2) * RAD);
    const pr = ([lon, lat]) => [lon * k, -lat];
    const ruta = velikiKrug(a, b).map(pr);

    // Uvek se vidi cela Evropa; ako je neki grad van nje, karta se raširi
    const okvir = [...ruta, pr([-11, 35]), pr([32, 61])];
    const xs = okvir.map((p) => p[0]), ys = okvir.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    let w = (Math.max(...xs) - Math.min(...xs)) * 1.08;
    let h = (Math.max(...ys) - Math.min(...ys)) * 1.08;
    if (w / h < W / H) w = (h * W) / H; else h = (w * H) / W;
    svg.setAttribute("viewBox", `${cx - w / 2} ${cy - h / 2} ${w} ${h}`);
    const px = w / W; // koliko jedinica karte je jedan piksel

    const tacka = (g, klasa) => { const [x, y] = pr([g.lon, g.lat]); return `<circle class="${klasa}" cx="${x}" cy="${y}" r="${4.5 * px}"/>`; };
    // Njegov grad je onaj sa njegovim imenom, inače prvi
    const on = [a, b].find((g) => g.ko === PODACI.ime) || a;
    const ona = on === a ? b : a;
    const [ox, oy] = pr([on.lon, on.lat]);
    const obim = 2 * Math.PI * 13 * px;

    svg.innerHTML = `
      ${typeof KOPNO === "string" ? `<path class="kopno" transform="scale(${k} 1)" d="${KOPNO}"/>` : ""}
      <path class="ruta ruta-anim" d="M${ruta.map((p) => p.join(",")).join("L")}"/>
      ${tacka(ona, "tacka-ona")}
      ${tacka(on, "tacka-on")}
      <circle class="hold-ring" id="hold-ring" cx="${ox}" cy="${oy}" r="${13 * px}" stroke-width="${2 * px}"
        stroke-dasharray="${obim}" stroke-dashoffset="${obim}" transform="rotate(-90 ${ox} ${oy})"/>
      <circle id="hold-hit" cx="${ox}" cy="${oy}" r="${26 * px}" fill="transparent" style="touch-action:none"/>`;

    podesiDugoDrzanje(obim);
  }

  // Dugo držanje (1,2 s) na njegovoj tački
  function podesiDugoDrzanje(obim) {
    const hit = $("hold-hit"), ring = $("hold-ring");
    let tajmer = null;
    const pocni = (e) => {
      e.preventDefault();
      ring.style.transition = "stroke-dashoffset 1.2s linear";
      ring.style.strokeDashoffset = "0";
      tajmer = setTimeout(() => { prekini(); tajna(PODACI.tajne.dugoDrzanje); }, 1200);
    };
    const prekini = () => {
      clearTimeout(tajmer);
      ring.style.transition = "stroke-dashoffset 0.2s";
      ring.style.strokeDashoffset = String(obim);
    };
    hit.addEventListener("pointerdown", pocni);
    for (const ev of ["pointerup", "pointerleave", "pointercancel"]) hit.addEventListener(ev, prekini);
    hit.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  // ---------- Promena gradova ----------
  const CIR = { а: "a", б: "b", в: "v", г: "g", д: "d", ђ: "đ", е: "e", ё: "e", ж: "ž", з: "z", и: "i", й: "j", ј: "j", к: "k",
    л: "l", љ: "lj", м: "m", н: "n", њ: "nj", о: "o", п: "p", р: "r", с: "s", т: "t", ћ: "ć", у: "u", ф: "f", х: "h",
    ц: "c", ч: "č", џ: "dž", ш: "š", щ: "šč", ъ: "", ы: "y", ь: "", э: "e", ю: "ju", я: "ja" };
  const latinica = (s) => (s || "").replace(/[Ѐ-ӿ]/g, (c) => {
    const l = CIR[c.toLowerCase()];
    if (l === undefined) return c;
    return c === c.toLowerCase() ? l : l.charAt(0).toUpperCase() + l.slice(1);
  });

  // Pretraga zna srpska imena (Pariz, Beč, Njujork) samo na ćirilici, pa tražimo oba
  const LAT = { a: "а", b: "б", v: "в", g: "г", d: "д", đ: "ђ", e: "е", ž: "ж", z: "з", i: "и", j: "ј", k: "к", l: "л",
    m: "м", n: "н", o: "о", p: "п", r: "р", s: "с", t: "т", ć: "ћ", u: "у", f: "ф", h: "х", c: "ц", č: "ч", š: "ш" };
  const cirilica = (s) => s
    .replace(/dž|lj|nj/gi, (d) => {
      const c = { dž: "џ", lj: "љ", nj: "њ" }[d.toLowerCase()];
      return d[0] === d[0].toLowerCase() ? c : c.toUpperCase();
    })
    .replace(/[a-zđžćčš]/gi, (c) => {
      const l = LAT[c.toLowerCase()];
      if (!l) return c;
      return c === c.toLowerCase() ? l : l.toUpperCase();
    });

  async function trazi(q) {
    const upiti = [...new Set([q, cirilica(q)])].map((u) =>
      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(u)}&count=8&language=sr&format=json`)
        .then((r) => r.json()).then((j) => j.results || []));
    const svi = (await Promise.all(upiti)).flat();
    const jedinstveni = [...new Map(svi.map((g) => [g.id, g])).values()];
    return jedinstveni.sort((a, b) => (b.population || 0) - (a.population || 0)).slice(0, 6);
  }

  function podesiGradove() {
    const sheet = $("sheet"), inp = $("sheet-input"), lista = $("sheet-results");
    let izabrani = [], tajmer = null, rezultati = [];

    const otvori = () => {
      izabrani = [];
      $("sheet-step").textContent = "njegov grad";
      inp.value = ""; lista.innerHTML = "";
      sheet.hidden = false;
      setTimeout(() => inp.focus(), 50);
    };
    const zatvori = () => { sheet.hidden = true; inp.blur(); };

    $("cities-edit").onclick = otvori;
    $("sheet-close").onclick = zatvori;
    sheet.onclick = (e) => { if (e.target === sheet) zatvori(); };
    $("sheet-reset").onclick = () => { store.del("gradovi"); zatvori(); osveziDaljinu(); };

    inp.addEventListener("input", () => {
      clearTimeout(tajmer);
      const q = inp.value.trim();
      if (q.length < 2) { lista.innerHTML = ""; return; }
      tajmer = setTimeout(async () => {
        try {
          const nadjeni = await trazi(q);
          if (inp.value.trim() !== q) return;
          rezultati = nadjeni;
          lista.innerHTML = rezultati.length
            ? rezultati.map((g, i) => `<li data-i="${i}">${esc(latinica(g.name))}<span>${esc(latinica(g.country || ""))}</span></li>`).join("")
            : `<li><span>nema rezultata</span></li>`;
        } catch {
          lista.innerHTML = `<li><span>nema interneta</span></li>`;
        }
      }, 300);
    });

    lista.addEventListener("click", (e) => {
      const li = e.target.closest("li[data-i]");
      if (!li) return;
      const g = rezultati[+li.dataset.i];
      // Prvi izabrani je njegov grad, drugi njen
      const ko = izabrani.length ? "ti" : PODACI.ime;
      izabrani.push({ ime: latinica(g.name), lat: g.latitude, lon: g.longitude, tz: g.timezone, ko });
      if (izabrani.length === 2) {
        store.set("gradovi", izabrani);
        zatvori();
        osveziDaljinu();
      } else {
        $("sheet-step").textContent = "moj grad";
        inp.value = ""; lista.innerHTML = "";
        inp.focus();
      }
    });
  }

  function osveziDaljinu() {
    nacin = 0;
    prikaziDaljinu();
    prikaziGradove();
    crtajMapu();
  }

  // ---------- Dobro jutro ----------
  function varijante() {
    const out = [];
    PODACI.poruke.forEach((p, i) => {
      // Ako se poruka završava samo srcima, pravimo verzije sa 1, 2 i 3 srca
      const m = p.match(/^(.*?)(\s?)((?:❤️?)+)$/u);
      if (m) for (let n = 1; n <= 3; n++) out.push({ b: i, t: m[1] + m[2] + "❤️".repeat(n) });
      else out.push({ b: i, t: p });
    });
    return out;
  }

  function slucajno(seme) {
    return () => {
      seme |= 0; seme = (seme + 0x6d2b79f5) | 0;
      let t = Math.imul(seme ^ (seme >>> 15), 1 | seme);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Svaki dan jedna poruka. Prolazi kroz sve varijante pre nego što se išta ponovi,
  // i nikad ista osnovna poruka dva dana zaredom.
  function porukaZaDan(dan) {
    const V = varijante();
    const ciklus = Math.floor(dan / V.length);
    const r = slucajno(1611 + ciklus * 7919);
    const red = V.slice();
    for (let i = red.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [red[i], red[j]] = [red[j], red[i]];
    }
    for (let i = 1; i < red.length; i++) {
      if (red[i].b !== red[i - 1].b) continue;
      const j = red.findIndex((x, k) => k > i && x.b !== red[i - 1].b);
      if (j > 0) [red[i], red[j]] = [red[j], red[i]];
    }
    return red[dan % V.length].t;
  }

  function podesiDobroJutro() {
    const wa = $("wa"), chat = $("wa-chat"), status = $("wa-status");
    let tajmeri = [];
    $("wa-name").textContent = PODACI.ime;
    $("gm-date").textContent = new Intl.DateTimeFormat("sr-Latn", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" }).format(new Date());

    $("gm-btn").onclick = () => {
      const dan = danas();
      let v = store.get("gmVreme", null);
      if (!v || v.dan !== dan) {
        const d = new Date();
        v = { dan, t: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
        store.set("gmVreme", v);
      }
      chat.querySelectorAll(".wa-msg").forEach((m) => m.remove());
      status.textContent = "online";
      wa.hidden = false;

      const posle = (ms, fn) => tajmeri.push(setTimeout(fn, ms));
      posle(700, () => { status.textContent = "typing…"; });
      posle(2600, () => {
        status.textContent = "online";
        const msg = document.createElement("div");
        msg.className = "wa-msg";
        msg.innerHTML = `${esc(porukaZaDan(dan))}<span class="wa-meta">${v.t}</span>`;
        chat.appendChild(msg);
      });
    };

    $("wa-back").onclick = () => {
      tajmeri.forEach(clearTimeout);
      tajmeri = [];
      wa.hidden = true;
    };
  }

  // ---------- Navigacija ----------
  function podesiStranice() {
    const pages = $("pages"), dots = [...$("dots").children];
    const idi = (i, glatko = true) => pages.scrollTo({ left: i * pages.clientWidth, behavior: glatko ? "smooth" : "auto" });
    dots.forEach((d, i) => (d.onclick = () => idi(i)));
    const oznaci = () => {
      const i = Math.round(pages.scrollLeft / pages.clientWidth);
      dots.forEach((d, k) => d.classList.toggle("on", k === i));
    };
    pages.addEventListener("scroll", oznaci, { passive: true });
    oznaci();
    return idi;
  }

  // ---------- Start ----------
  odbrojavanje();
  zajedno();
  podesiIzmenuDatuma();
  podesiSedamDodira();
  podesiGradove();
  podesiPoredjenja();
  podesiDobroJutro();
  const idi = podesiStranice();
  osveziDaljinu();

  setInterval(odbrojavanje, 1000);
  setInterval(() => { zajedno(); satiGradova(); }, 10000);
  addEventListener("resize", crtajMapu);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    odbrojavanje(); zajedno(); satiGradova(); vreme();
  });

  uvod(() => {
    // Ujutru se aplikacija otvara pravo na dobro jutro
    const h = beograd().h;
    if (h >= 5 && h < 11) idi(2, false);
  });

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
