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

function renderRhythm() {
  return D.ITINERARY.map((day) => {
    const r = RHYTHM_META[day.rhythm];
    return (
      '<button type="button" class="rhythm-chip rhythm-' + day.rhythm + '" data-goto-day="' + day.day + '" title="Jour ' + day.day + '">' +
      '<span class="rhythm-chip-day">J' + day.day + "</span>" +
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
  return D.PRACTICAL_TIPS.map((tip) => (
    '<div class="tip-card"><span class="tip-icon" aria-hidden="true">' + tip.icon + "</span>" +
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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css">
  <style>${styles}</style>
</head>
<body>
  <a class="back-link" href="index.html">&larr; Compte à rebours</a>
  <main class="page">
    <header class="panel hero">
      <p class="hero-kicker">🌴 Itinéraire détaillé</p>
      <h1>${esc(D.TRIP_META.title)}</h1>
      <p class="hero-sub">${esc(D.TRIP_META.dates)} · Base à ${esc(D.BASE.name)} · ${esc(D.TRIP_META.group)}</p>
      <div class="chip-row">
        <span class="chip">✈️ Arrivée 7 nov</span>
        <span class="chip">🏠 New Grove</span>
        <span class="chip">🚗 Voiture</span>
        <span class="chip">🦵 Genoux sensibles</span>
        <span class="chip">🌴 Départ 21 nov</span>
      </div>
    </header>
    <section class="panel" aria-label="Rythme du voyage">
      <p class="section-kicker">Vue d'ensemble</p>
      <h2 class="section-title">Alternance actif / chill</h2>
      <div class="rhythm-grid" id="rhythmGrid">${renderRhythm()}</div>
    </section>
    <section class="panel" aria-label="Filtres">
      <div class="toolbar-head">
        <h2 class="section-title" style="margin:0">Filtrer par activité</h2>
        <span class="day-count" id="dayCount">14 jours</span>
      </div>
      <div id="filterBar" role="toolbar">${renderFilters()}</div>
      <label class="toggle-row">
        <input type="checkbox" id="driveToggle" checked>
        <span>Temps de trajet depuis New Grove : <strong id="driveToggleLabel">affichés</strong></span>
      </label>
    </section>
    <div class="layout-with-map">
      <section aria-label="Programme jour par jour">
        <h2 class="section-title">📅 Programme jour par jour</h2>
        <div id="daysGrid" class="days-list">${Render.renderAllDays(D.ITINERARY, D)}</div>
      </section>
      <aside class="map-sticky" id="mapSection">
        <div class="panel map-panel">
          <div class="map-panel-head">
            <h2 class="section-title" style="margin:0">🗺️ Carte</h2>
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
    <section class="panel tips-panel" aria-label="Conseils pratiques">
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
