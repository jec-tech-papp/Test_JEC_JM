(function () {
  "use strict";

  if (typeof window.ITINERARY_DATA === "undefined") {
    console.error("Données itinéraire manquantes.");
    return;
  }

  var D = window.ITINERARY_DATA;
  var BASE = D.BASE;
  var FILTERS = D.FILTERS;
  var PRACTICAL_TIPS = D.PRACTICAL_TIPS;
  var ITINERARY = D.ITINERARY;
  var CATEGORY_META = D.CATEGORY_META;
  var RHYTHM_META = D.RHYTHM_META;
  var EFFORT_META = D.EFFORT_META;

  var state = {
    filter: "all",
    showDriveTimes: true,
    selectedDay: null
  };

  var map = null;
  var markersLayer = null;
  var routeLayer = null;
  var mapReady = false;

  var els = {};

  function cacheElements() {
    els.daysGrid = document.getElementById("daysGrid");
    els.filterBar = document.getElementById("filterBar");
    els.driveToggle = document.getElementById("driveToggle");
    els.driveToggleLabel = document.getElementById("driveToggleLabel");
    els.dayCount = document.getElementById("dayCount");
    els.tipsGrid = document.getElementById("tipsGrid");
    els.mapLegend = document.getElementById("mapLegend");
    els.mapStatus = document.getElementById("mapStatus");
    els.rhythmGrid = document.getElementById("rhythmGrid");
  }

  function formatDriveTime(minutes) {
    if (minutes < 60) {
      return "~" + minutes + " min";
    }
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;
    return mins ? "~" + hours + " h " + mins + " min" : "~" + hours + " h";
  }

  function matchesFilter(day) {
    return state.filter === "all" || day.categories.indexOf(state.filter) !== -1;
  }

  function renderRhythm() {
    if (!els.rhythmGrid) {
      return;
    }
    els.rhythmGrid.innerHTML = ITINERARY.map(function (day) {
      var rhythm = RHYTHM_META[day.rhythm];
      return (
        '<button type="button" class="rhythm-chip rhythm-' +
        day.rhythm +
        '" data-goto-day="' +
        day.day +
        '" title="Jour ' +
        day.day +
        " : " +
        day.title +
        '">' +
        '<span class="rhythm-chip-day">J' +
        day.day +
        "</span>" +
        '<span class="rhythm-chip-icon" aria-hidden="true">' +
        rhythm.icon +
        "</span>" +
        "</button>"
      );
    }).join("");

    Array.prototype.forEach.call(els.rhythmGrid.querySelectorAll(".rhythm-chip"), function (chip) {
      chip.addEventListener("click", function () {
        var dayNum = Number(chip.dataset.gotoDay);
        var target = document.getElementById("day-" + dayNum);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          state.selectedDay = dayNum;
          renderDays();
          updateMap();
        }
      });
    });
  }

  function renderFilters() {
    els.filterBar.innerHTML = FILTERS.map(function (filter) {
      var active = state.filter === filter.id;
      return (
        '<button type="button" class="filter-btn' +
        (active ? " is-active" : "") +
        '" data-filter="' +
        filter.id +
        '" aria-pressed="' +
        active +
        '">' +
        '<span class="filter-icon" aria-hidden="true">' +
        filter.icon +
        "</span>" +
        "<span>" +
        filter.label +
        "</span>" +
        "</button>"
      );
    }).join("");

    Array.prototype.forEach.call(els.filterBar.querySelectorAll(".filter-btn"), function (button) {
      button.addEventListener("click", function () {
        state.filter = button.dataset.filter;
        renderFilters();
        renderDays();
        updateMap();
      });
    });
  }

  function renderCategoryBadges(categories) {
    return categories
      .map(function (cat) {
        var meta = CATEGORY_META[cat];
        return (
          '<span class="cat-badge cat-' +
          cat +
          '">' +
          meta.icon +
          " " +
          meta.label +
          "</span>"
        );
      })
      .join("");
  }

  function renderDayCard(day) {
    var rhythm = RHYTHM_META[day.rhythm];
    var effort = EFFORT_META[day.effort];
    var hidden = matchesFilter(day) ? "" : " is-hidden";
    var selected = state.selectedDay === day.day ? " is-selected" : "";

    var driveBlock = state.showDriveTimes
      ? '<div class="info-row drive-row"><span class="info-icon" aria-hidden="true">🚗</span><div><strong>Depuis New Grove</strong><span>' +
        formatDriveTime(day.driveMinutes) +
        " aller simple</span></div></div>"
      : "";

    return (
      '<article class="day-card' +
      hidden +
      selected +
      '" data-day="' +
      day.day +
      '" id="day-' +
      day.day +
      '">' +
      '<header class="day-card-top">' +
      '<div class="day-title-block">' +
      '<p class="day-kicker">Jour ' +
      day.day +
      "</p>" +
      "<h2>" +
      day.title +
      "</h2>" +
      '<p class="day-date">' +
      day.date +
      "</p>" +
      "</div>" +
      '<div class="day-meta-badges">' +
      '<span class="meta-badge rhythm-' +
      day.rhythm +
      '">' +
      rhythm.icon +
      " " +
      rhythm.label +
      "</span>" +
      '<span class="meta-badge effort-' +
      (day.effort === "modéré" ? "modere" : day.effort) +
      '">' +
      effort.label +
      "</span>" +
      "</div>" +
      "</header>" +
      '<div class="cat-badges">' +
      renderCategoryBadges(day.categories) +
      "</div>" +
      '<div class="day-card-body">' +
      '<section class="day-block">' +
      "<h3>Activités</h3>" +
      '<ul class="activity-list">' +
      day.activities
        .map(function (activity) {
          return "<li>" + activity + "</li>";
        })
        .join("") +
      "</ul>" +
      "</section>" +
      '<section class="day-block highlight-beach">' +
      "<h3>Plage du jour</h3>" +
      "<p>" +
      day.beach +
      "</p>" +
      "</section>" +
      driveBlock +
      '<section class="day-block highlight-tip">' +
      "<h3>Conseil</h3>" +
      "<p>" +
      day.tips +
      "</p>" +
      "</section>" +
      "</div>" +
      '<footer class="day-card-footer">' +
      '<button type="button" class="map-focus-btn" data-focus-day="' +
      day.day +
      '">Voir sur la carte</button>' +
      "</footer>" +
      "</article>"
    );
  }

  function renderDays() {
    var visible = ITINERARY.filter(matchesFilter);
    els.dayCount.textContent = visible.length + " jour" + (visible.length > 1 ? "s" : "");
    els.daysGrid.innerHTML = ITINERARY.map(renderDayCard).join("");

    Array.prototype.forEach.call(els.daysGrid.querySelectorAll(".map-focus-btn"), function (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        focusDayOnMap(Number(button.dataset.focusDay));
      });
    });

    Array.prototype.forEach.call(els.daysGrid.querySelectorAll(".day-card:not(.is-hidden)"), function (card) {
      card.addEventListener("click", function (event) {
        if (event.target.closest(".map-focus-btn")) {
          return;
        }
        var dayNum = Number(card.dataset.day);
        state.selectedDay = state.selectedDay === dayNum ? null : dayNum;
        renderDays();
        updateMap();
      });
    });
  }

  function renderTips() {
    els.tipsGrid.innerHTML = PRACTICAL_TIPS.map(function (tip) {
      return (
        '<div class="tip-card">' +
        '<span class="tip-icon" aria-hidden="true">' +
        tip.icon +
        "</span>" +
        "<h3>" +
        tip.title +
        "</h3>" +
        "<p>" +
        tip.text +
        "</p>" +
        "</div>"
      );
    }).join("");
  }

  function getVisibleDays() {
    return ITINERARY.filter(matchesFilter);
  }

  function getMarkerColor(type) {
    var colors = {
      base: "#ffdd8a",
      plage: "#38bdf8",
      culture: "#fbbf24",
      nature: "#4ade80"
    };
    return colors[type] || "#ffffff";
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
      setMapStatus("Carte indisponible (Leaflet non chargé). Le programme reste utilisable ci-dessous.", true);
      return;
    }
    window.setTimeout(function () {
      waitForLeaflet(callback, attempts + 1);
    }, 200);
  }

  function initMap() {
    if (mapReady || typeof L === "undefined") {
      setMapStatus(
        typeof L === "undefined"
          ? "Carte indisponible (connexion requise pour charger Leaflet)."
          : "",
        typeof L === "undefined"
      );
      return;
    }

    try {
      map = L.map("tripMap", {
        scrollWheelZoom: false,
        attributionControl: true
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
      }).addTo(map);

      markersLayer = L.layerGroup().addTo(map);
      routeLayer = L.layerGroup().addTo(map);

      var baseIcon = L.divIcon({
        className: "leaflet-marker-base",
        html: '<div class="marker-pin base">🏠</div>',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker([BASE.lat, BASE.lng], { icon: baseIcon })
        .addTo(map)
        .bindPopup("<strong>" + BASE.name + "</strong><br>Base du séjour");

      mapReady = true;
      setMapStatus("");
      updateMap();
      window.setTimeout(function () {
        map.invalidateSize();
      }, 200);
      window.setTimeout(function () {
        map.invalidateSize();
      }, 800);
    } catch (error) {
      setMapStatus("Impossible d'afficher la carte.", true);
    }
  }

  function updateMap() {
    if (!mapReady || !map) {
      return;
    }

    markersLayer.clearLayers();
    routeLayer.clearLayers();

    var days = getVisibleDays();
    var bounds = [[BASE.lat, BASE.lng]];
    var legendTypes = { base: true };
    var legendKeys = ["base"];

    days.forEach(function (day) {
      if (state.selectedDay !== null && state.selectedDay !== day.day) {
        return;
      }

      var dayPoints = [];

      day.locations.forEach(function (location) {
        if (location.type === "base") {
          return;
        }

        if (!legendTypes[location.type]) {
          legendTypes[location.type] = true;
          legendKeys.push(location.type);
        }

        var color = getMarkerColor(location.type);
        var icon = L.divIcon({
          className: "leaflet-marker-day",
          html:
            '<div class="marker-pin" style="background:' +
            color +
            '">J' +
            day.day +
            "</div>",
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        markersLayer.addLayer(
          L.marker([location.lat, location.lng], { icon: icon }).bindPopup(
            "<strong>Jour " + day.day + " – " + location.name + "</strong><br>" + day.title
          )
        );

        dayPoints.push([location.lat, location.lng]);
        bounds.push([location.lat, location.lng]);
      });

      if (dayPoints.length > 1) {
        routeLayer.addLayer(
          L.polyline(dayPoints, {
            color: "#ffd166",
            weight: 3,
            opacity: 0.85,
            dashArray: "8 8"
          })
        );
      }
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
    } else {
      map.setView([BASE.lat, BASE.lng], 10);
    }

    renderMapLegend(legendKeys);
    window.setTimeout(function () {
      map.invalidateSize();
    }, 100);
  }

  function renderMapLegend(keys) {
    var labels = {
      base: "🏠 Base",
      plage: "🏖️ Plage",
      culture: "🏛️ Culture",
      nature: "🌿 Nature"
    };

    els.mapLegend.innerHTML = keys
      .map(function (type) {
        return '<span class="legend-item">' + (labels[type] || type) + "</span>";
      })
      .join("");
  }

  function focusDayOnMap(dayNum) {
    state.selectedDay = dayNum;
    renderDays();
    updateMap();

    var mapSection = document.getElementById("mapSection");
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    var day = ITINERARY.find(function (entry) {
      return entry.day === dayNum;
    });

    if (!day || !map) {
      return;
    }

    var points = day.locations.filter(function (loc) {
      return loc.type !== "base";
    });

    if (points.length) {
      var bounds = points.map(function (p) {
        return [p.lat, p.lng];
      });
      bounds.push([BASE.lat, BASE.lng]);
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
    }
  }

  function initDriveToggle() {
    els.driveToggle.checked = state.showDriveTimes;
    els.driveToggleLabel.textContent = state.showDriveTimes ? "affichés" : "masqués";

    els.driveToggle.addEventListener("change", function () {
      state.showDriveTimes = els.driveToggle.checked;
      els.driveToggleLabel.textContent = state.showDriveTimes ? "affichés" : "masqués";
      renderDays();
    });
  }

  function initResetMapButton() {
    document.getElementById("resetMapBtn").addEventListener("click", function () {
      state.selectedDay = null;
      renderDays();
      updateMap();
    });
  }

  function initMeta() {
    var meta = D.TRIP_META;
    document.getElementById("tripTitle").textContent = meta.title;
    document.getElementById("tripDates").textContent =
      meta.dates + " · Base à " + BASE.name + " · " + meta.group;
  }

  function boot() {
    try {
      cacheElements();
      initMeta();
      renderRhythm();
      renderFilters();
      renderDays();
      renderTips();
      initDriveToggle();
      initResetMapButton();
      waitForLeaflet(initMap);
    } catch (error) {
      console.error("Erreur initialisation programme:", error);
      if (els.daysGrid) {
        els.daysGrid.innerHTML =
          '<p class="map-status is-error">Erreur de chargement. Rechargez la page (Ctrl+F5).</p>';
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
