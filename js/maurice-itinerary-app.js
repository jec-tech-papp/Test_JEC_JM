(function () {
  "use strict";

  if (typeof window.ITINERARY_DATA === "undefined") {
    return;
  }

  var D = window.ITINERARY_DATA;
  var BASE = D.BASE;
  var ITINERARY = D.ITINERARY;

  var state = { filter: "all", showDriveTimes: true, selectedDay: null };
  var map = null;
  var markersLayer = null;
  var routeLayer = null;
  var mapReady = false;

  var els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function cacheElements() {
    els.filterBar = $("filterBar");
    els.driveToggle = $("driveToggle");
    els.driveToggleLabel = $("driveToggleLabel");
    els.dayCount = $("dayCount");
    els.mapLegend = $("mapLegend");
    els.mapStatus = $("mapStatus");
    els.dayCards = document.querySelectorAll(".day-card");
    els.driveRows = document.querySelectorAll(".drive-row");
  }

  function matchesFilter(card) {
    if (state.filter === "all") {
      return true;
    }
    var cats = (card.getAttribute("data-categories") || "").split(" ");
    return cats.indexOf(state.filter) !== -1;
  }

  function applyFilter() {
    var visible = 0;
    Array.prototype.forEach.call(els.dayCards, function (card) {
      var show = matchesFilter(card);
      card.classList.toggle("is-hidden", !show);
      if (show) {
        visible += 1;
      }
    });
    els.dayCount.textContent = visible + " jour" + (visible > 1 ? "s" : "");
    updateMap();
  }

  function applyDriveToggle() {
    Array.prototype.forEach.call(els.driveRows, function (row) {
      row.style.display = state.showDriveTimes ? "" : "none";
    });
    els.driveToggleLabel.textContent = state.showDriveTimes ? "affichés" : "masqués";
  }

  function initFilters() {
    Array.prototype.forEach.call(els.filterBar.querySelectorAll(".filter-btn"), function (button) {
      button.addEventListener("click", function () {
        state.filter = button.getAttribute("data-filter");
        Array.prototype.forEach.call(els.filterBar.querySelectorAll(".filter-btn"), function (btn) {
          var active = btn.getAttribute("data-filter") === state.filter;
          btn.classList.toggle("is-active", active);
          btn.setAttribute("aria-pressed", String(active));
        });
        applyFilter();
      });
    });
  }

  function initRhythm() {
    Array.prototype.forEach.call(document.querySelectorAll(".rhythm-chip"), function (chip) {
      chip.addEventListener("click", function () {
        var dayNum = chip.getAttribute("data-goto-day");
        var target = $("day-" + dayNum);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          state.selectedDay = Number(dayNum);
          Array.prototype.forEach.call(els.dayCards, function (card) {
            card.classList.toggle("is-selected", Number(card.getAttribute("data-day")) === state.selectedDay);
          });
          updateMap();
        }
      });
    });
  }

  function initDayCards() {
    Array.prototype.forEach.call(els.dayCards, function (card) {
      card.addEventListener("click", function (event) {
        if (event.target.closest(".map-focus-btn")) {
          return;
        }
        var dayNum = Number(card.getAttribute("data-day"));
        state.selectedDay = state.selectedDay === dayNum ? null : dayNum;
        Array.prototype.forEach.call(els.dayCards, function (c) {
          c.classList.toggle("is-selected", state.selectedDay === Number(c.getAttribute("data-day")));
        });
        updateMap();
      });

      var mapBtn = card.querySelector(".map-focus-btn");
      if (mapBtn) {
        mapBtn.addEventListener("click", function (event) {
          event.stopPropagation();
          focusDayOnMap(Number(card.getAttribute("data-day")));
        });
      }
    });
  }

  function setMapStatus(message, isError) {
    if (!els.mapStatus) {
      return;
    }
    els.mapStatus.textContent = message;
    els.mapStatus.className = "map-status" + (isError ? " is-error" : "");
    els.mapStatus.hidden = !message;
  }

  function waitForLeaflet(callback, attempts) {
    attempts = attempts || 0;
    if (typeof L !== "undefined") {
      callback();
      return;
    }
    if (attempts > 50) {
      setMapStatus("Carte indisponible. Le programme reste utilisable.", true);
      return;
    }
    window.setTimeout(function () {
      waitForLeaflet(callback, attempts + 1);
    }, 200);
  }

  function getMarkerColor(type) {
    return { base: "#ffdd8a", plage: "#38bdf8", culture: "#fbbf24", nature: "#4ade80" }[type] || "#fff";
  }

  function getVisibleDays() {
    return ITINERARY.filter(function (day) {
      if (state.filter !== "all" && day.categories.indexOf(state.filter) === -1) {
        return false;
      }
      if (state.selectedDay !== null && state.selectedDay !== day.day) {
        return false;
      }
      return true;
    });
  }

  function initMap() {
    if (mapReady || typeof L === "undefined") {
      return;
    }
    try {
      map = L.map("tripMap", { scrollWheelZoom: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
      }).addTo(map);
      markersLayer = L.layerGroup().addTo(map);
      routeLayer = L.layerGroup().addTo(map);
      L.marker([BASE.lat, BASE.lng], {
        icon: L.divIcon({
          className: "leaflet-marker-base",
          html: '<div class="marker-pin base">🏠</div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })
      }).addTo(map).bindPopup("<strong>" + BASE.name + "</strong><br>Base du séjour");
      mapReady = true;
      updateMap();
      window.setTimeout(function () { map.invalidateSize(); }, 300);
    } catch (e) {
      setMapStatus("Impossible d'afficher la carte.", true);
    }
  }

  function updateMap() {
    if (!mapReady || !map) {
      return;
    }
    markersLayer.clearLayers();
    routeLayer.clearLayers();
    var bounds = [[BASE.lat, BASE.lng]];
    var legendKeys = ["base"];

    getVisibleDays().forEach(function (day) {
      var dayPoints = [];
      day.locations.forEach(function (loc) {
        if (loc.type === "base") {
          return;
        }
        if (legendKeys.indexOf(loc.type) === -1) {
          legendKeys.push(loc.type);
        }
        markersLayer.addLayer(
          L.marker([loc.lat, loc.lng], {
            icon: L.divIcon({
              className: "leaflet-marker-day",
              html: '<div class="marker-pin" style="background:' + getMarkerColor(loc.type) + '">J' + day.day + "</div>",
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            })
          }).bindPopup("<strong>Jour " + day.day + " – " + loc.name + "</strong>")
        );
        dayPoints.push([loc.lat, loc.lng]);
        bounds.push([loc.lat, loc.lng]);
      });
      if (dayPoints.length > 1) {
        routeLayer.addLayer(L.polyline(dayPoints, { color: "#ffd166", weight: 3, opacity: 0.85, dashArray: "8 8" }));
      }
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
    } else {
      map.setView([BASE.lat, BASE.lng], 10);
    }

    var labels = { base: "🏠 Base", plage: "🏖️ Plage", culture: "🏛️ Culture", nature: "🌿 Nature" };
    els.mapLegend.innerHTML = legendKeys.map(function (k) {
      return '<span class="legend-item">' + (labels[k] || k) + "</span>";
    }).join("");
  }

  function focusDayOnMap(dayNum) {
    state.selectedDay = dayNum;
    Array.prototype.forEach.call(els.dayCards, function (card) {
      card.classList.toggle("is-selected", Number(card.getAttribute("data-day")) === dayNum);
    });
    updateMap();
    var section = $("mapSection");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    var day = ITINERARY.find(function (d) { return d.day === dayNum; });
    if (!day || !map) {
      return;
    }
    var points = day.locations.filter(function (l) { return l.type !== "base"; });
    if (points.length) {
      var b = points.map(function (p) { return [p.lat, p.lng]; });
      b.push([BASE.lat, BASE.lng]);
      map.fitBounds(b, { padding: [48, 48], maxZoom: 12 });
    }
  }

  function boot() {
    cacheElements();
    initFilters();
    initRhythm();
    initDayCards();
    els.driveToggle.addEventListener("change", function () {
      state.showDriveTimes = els.driveToggle.checked;
      applyDriveToggle();
    });
    $("resetMapBtn").addEventListener("click", function () {
      state.selectedDay = null;
      Array.prototype.forEach.call(els.dayCards, function (c) { c.classList.remove("is-selected"); });
      updateMap();
    });
    applyFilter();
    applyDriveToggle();
    waitForLeaflet(initMap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
