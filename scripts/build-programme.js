#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const dataJs = fs.readFileSync(path.join(root, "js/maurice-itinerary-data.js"), "utf8");
const appJs = fs.readFileSync(path.join(root, "js/maurice-itinerary-app.js"), "utf8");
const renderJs = fs.readFileSync(path.join(root, "js/maurice-itinerary-render.js"), "utf8");
const editorJs = fs.readFileSync(path.join(root, "js/maurice-itinerary-editor.js"), "utf8");

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
  <button type="button" class="editor-fab" id="editorUnlockBtn" title="Modifier le programme">✏️ Modifier le programme</button>
  <p class="editor-toast" id="editorToast" hidden role="status"></p>
  <main class="page">
    <div class="editor-toolbar" id="editorToolbar" hidden>
    <p class="editor-toolbar-title">Mode édition</p>
    <div class="editor-toolbar-actions">
      <button type="button" class="btn-editor" id="editorSaveBtn">💾 Sauvegarder</button>
      <button type="button" class="btn-editor" id="editorExportBtn">⬇️ Exporter</button>
      <button type="button" class="btn-editor" id="editorImportBtn">⬆️ Importer</button>
      <input type="file" id="editorImportFile" accept="application/json" hidden>
      <button type="button" class="btn-editor btn-editor-danger" id="editorResetBtn">↩️ Réinitialiser</button>
    </div>
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
  <div class="editor-modal" id="passwordModal" hidden>
    <div class="editor-modal-backdrop" data-close-modal></div>
    <div class="editor-modal-card" role="dialog" aria-labelledby="passwordModalTitle">
      <h2 id="passwordModalTitle">Accès édition</h2>
      <p class="editor-modal-help">Entrez le mot de passe pour modifier le programme, ajouter des photos et des liens.</p>
      <label class="editor-field">
        <span>Mot de passe</span>
        <input type="password" id="editorPassword" autocomplete="current-password">
      </label>
      <div class="editor-modal-actions">
        <button type="button" class="btn-editor" id="passwordCancelBtn">Annuler</button>
        <button type="button" class="btn-editor btn-editor-primary" id="passwordSubmitBtn">Déverrouiller</button>
      </div>
    </div>
  </div>
  <div class="editor-modal" id="dayEditorModal" hidden>
    <div class="editor-modal-backdrop" data-close-modal></div>
    <div class="editor-modal-card editor-modal-card-wide" role="dialog" aria-labelledby="editDayTitle">
      <h2 id="editDayTitle">Modifier le jour</h2>
      <form id="dayEditorForm">
        <input type="hidden" id="editDayNum">
        <div class="editor-form-grid">
          <label class="editor-field"><span>Titre</span><input type="text" id="editTitle" required></label>
          <label class="editor-field"><span>Date</span><input type="text" id="editDate" required></label>
          <label class="editor-field editor-field-full"><span>En bref (résumé pour néophyte)</span><textarea id="editSummary" rows="2"></textarea></label>
          <label class="editor-field editor-field-full"><span>Activités (une par ligne, option lien : texte | https://...)</span><textarea id="editActivities" rows="5"></textarea></label>
          <label class="editor-field editor-field-full"><span>Plage du jour</span><textarea id="editBeach" rows="2"></textarea></label>
          <label class="editor-field editor-field-full"><span>Photos (une par ligne : url | légende)</span><textarea id="editPhotos" rows="3" placeholder="https://... | Légende de la photo"></textarea></label>
          <label class="editor-field editor-field-full"><span>Liens utiles (label | url | description)</span><textarea id="editLinks" rows="3" placeholder="Google Maps | https://... | Itinéraire"></textarea></label>
          <label class="editor-field"><span>Conseil</span><textarea id="editTips" rows="2"></textarea></label>
          <label class="editor-field"><span>Trajet (min)</span><input type="number" id="editDrive" min="0" step="5"></label>
        </div>
        <div class="editor-modal-actions">
          <button type="button" class="btn-editor" id="dayEditorCancelBtn">Annuler</button>
          <button type="submit" class="btn-editor btn-editor-primary">Enregistrer le jour</button>
        </div>
      </form>
    </div>
  </div>
  <script>${dataJs}<\/script>
  <script>${renderJs}<\/script>
  <script>${editorJs}<\/script>
  <script>${appJs}<\/script>
</body>
</html>`;

fs.writeFileSync(path.join(root, "programme.html"), html);
console.log("Built programme.html:", html.length, "bytes, 14 days static");
