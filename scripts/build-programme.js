#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const dataJs = fs.readFileSync(path.join(root, "js/maurice-itinerary-data.js"), "utf8");
const appJs = fs.readFileSync(path.join(root, "js/maurice-itinerary-app.js"), "utf8");
const renderJs = fs.readFileSync(path.join(root, "js/maurice-itinerary-render.js"), "utf8");

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataJs, sandbox);
vm.runInContext(renderJs, sandbox);
const D = sandbox.window.ITINERARY_DATA;
const Render = sandbox.window.ItineraryRender;

const RHYTHM_META = D.RHYTHM_META;

function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shortDate(dateStr) {
  const m = String(dateStr).match(/(\d{1,2})\s+(janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre)/i);
  if (!m) {
    return "";
  }
  const months = {
    janvier: "jan",
    février: "fév",
    fevrier: "fév",
    mars: "mar",
    avril: "avr",
    mai: "mai",
    juin: "juin",
    juillet: "juil",
    août: "août",
    aout: "août",
    septembre: "sep",
    octobre: "oct",
    novembre: "nov",
    décembre: "déc",
    decembre: "déc"
  };
  const mon = months[m[2].toLowerCase()] || m[2].slice(0, 3);
  return m[1] + " " + mon;
}

function renderRhythm() {
  return D.ITINERARY.map((day) => {
    const r = RHYTHM_META[day.rhythm];
    const label = shortDate(day.date);
    return (
      '<button type="button" class="rhythm-chip rhythm-' + day.rhythm + '" data-goto-day="' + day.day + '" title="Jour ' + day.day + " — " + esc(day.date) + '">' +
      '<span class="rhythm-chip-day">J' + day.day + "</span>" +
      (label ? '<span class="rhythm-chip-date">' + esc(label) + "</span>" : "") +
      '<span class="rhythm-chip-icon" aria-hidden="true">' + r.icon + "</span></button>"
    );
  }).join("");
}

function renderFilters() {
  return D.FILTERS.map((f, i) => (
    '<button type="button" class="filter-btn' + (i === 0 ? " is-active" : "") + '" data-filter="' + f.id + '" aria-pressed="' + (i === 0) + '">' +
    '<span class="filter-icon" aria-hidden="true">' + f.icon + "</span><span>" + esc(f.label) + "</span></button>"
  )).join("");
}

function renderTips() {
  return D.PRACTICAL_TIPS.map((tip, i) => (
    '<div class="tip-card reveal' + (i % 3 === 1 ? " reveal-delay-1" : i % 3 === 2 ? " reveal-delay-2" : "") + '">' +
    '<span class="tip-icon" aria-hidden="true">' + tip.icon + "</span>" +
    "<h3>" + esc(tip.title) + "</h3><p>" + esc(tip.text) + "</p></div>"
  )).join("");
}

const styles = fs.readFileSync(path.join(root, "programme-styles.css"), "utf8");

const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Programme 14 jours — Île Maurice</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌴</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css">
  <style>${styles}</style>
</head>
<body>
  <div class="parallax-bg" aria-hidden="true">
    <div class="parallax-layer-sky" data-parallax-y="0.18" data-mouse-x="30" data-mouse-y="18"></div>
    <div class="parallax-orb-wrap parallax-orb-wrap-1" data-parallax-y="0.42" data-mouse-x="95" data-mouse-y="60">
      <div class="parallax-orb parallax-orb-1"></div>
    </div>
    <div class="parallax-orb-wrap parallax-orb-wrap-2" data-parallax-y="0.28" data-mouse-x="-110" data-mouse-y="50">
      <div class="parallax-orb parallax-orb-2"></div>
    </div>
    <div class="parallax-orb-wrap parallax-orb-wrap-3" data-parallax-y="0.55" data-mouse-x="75" data-mouse-y="-45">
      <div class="parallax-orb parallax-orb-3"></div>
    </div>
    <div class="parallax-orb-wrap parallax-orb-wrap-4" data-parallax-y="0.35" data-mouse-x="-65" data-mouse-y="70">
      <div class="parallax-orb parallax-orb-4"></div>
    </div>
    <div class="parallax-wave parallax-wave-1" data-parallax-y="0.32" data-mouse-x="40" data-mouse-y="22"></div>
    <div class="parallax-wave parallax-wave-2" data-parallax-y="0.48" data-mouse-x="-35" data-mouse-y="28"></div>
    <div class="parallax-grain" data-parallax-y="0.05" data-mouse-x="12" data-mouse-y="8"></div>
  </div>

  <a class="back-link" href="index.html">&larr; Compte à rebours</a>

  <header class="hero-full reveal">
    <div class="hero-parallax-inner" data-parallax-y="-0.06" data-parallax-mouse="0.04">
    <p class="hero-kicker">🌴 Itinéraire détaillé</p>
    <h1>${esc(D.TRIP_META.title)}</h1>
    <p class="hero-sub">${esc(D.TRIP_META.dates)} · Base à ${esc(D.BASE.name)} · ${esc(D.TRIP_META.group)}</p>
    <div class="chip-row">
      <span class="chip">✈️ ${esc(D.TRIP_META.arrival)}</span>
      <span class="chip">🏠 New Grove</span>
      <span class="chip">🚗 Voiture</span>
      <span class="chip">🦵 Genoux sensibles</span>
      <span class="chip">🌴 ${esc(D.TRIP_META.departure)}</span>
    </div>
    </div>
  </header>

  <nav class="sticky-nav" id="stickyNav" aria-label="Navigation du programme">
    <div class="sticky-nav-inner">
      <div class="search-wrap">
        <input class="search-input" type="search" id="daySearch" placeholder="Rechercher un jour, lieu, activité…" autocomplete="off" aria-label="Rechercher dans le programme">
      </div>
      <div class="search-meta">
        <span class="day-count" id="dayCount">14 jours</span>
        <span id="searchStatus" hidden></span>
      </div>
      <div class="rhythm-scroll">
        <div class="rhythm-grid" id="rhythmGrid">${renderRhythm()}</div>
      </div>
      <div class="toolbar-row">
        <div id="filterBar" role="toolbar" aria-label="Filtrer par activité">${renderFilters()}</div>
        <label class="toggle-row">
          <input type="checkbox" id="driveToggle" checked>
          <span>Trajets <strong id="driveToggleLabel">affichés</strong></span>
        </label>
      </div>
    </div>
  </nav>

  <main class="page">
    <div class="layout-with-map">
      <section aria-label="Programme jour par jour">
        <h2 class="section-title reveal">📅 Programme jour par jour</h2>
        <div id="daysGrid" class="days-list">${Render.renderAllDays(D.ITINERARY, D)}</div>
      </section>
      <aside class="map-sticky reveal reveal-delay-1" id="mapSection">
        <div class="panel map-panel">
          <div class="map-panel-head">
            <h2 class="section-title" style="margin:0">🗺️ Carte interactive</h2>
            <button type="button" class="btn-ghost" id="resetMapBtn">Tout afficher</button>
          </div>
          <div class="map-wrap">
            <div id="tripMap" class="map-leaflet"></div>
            <iframe id="mapFallback" class="map-fallback" title="Carte île Maurice" loading="lazy"></iframe>
          </div>
          <p class="map-status" id="mapStatus" hidden></p>
          <div id="mapLegend"></div>
        </div>
      </aside>
    </div>
    <section class="panel tips-panel reveal" aria-label="Conseils pratiques">
      <h2 class="section-title">💡 Conseils pratiques</h2>
      <div id="tipsGrid" class="tips-grid">${renderTips()}</div>
    </section>
  </main>
  <script>${dataJs}<\/script>
  <script>${renderJs}<\/script>
  <script>${appJs}<\/script>
</body>
</html>`;

fs.writeFileSync(path.join(root, "programme.html"), html);
console.log("Built programme.html:", html.length, "bytes, 14 days static");
