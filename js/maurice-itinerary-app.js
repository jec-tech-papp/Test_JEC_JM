(function () {
  "use strict";

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

  var els = {
    daysGrid: document.getElementById("daysGrid"),
    filterBar: document.getElementById("filterBar"),
    driveToggle: document.getElementById("driveToggle"),
    driveToggleLabel: document.getElementById("driveToggleLabel"),
    dayCount: document.getElementById("dayCount"),
    tipsGrid: document.getElementById("tipsGrid"),
    mapLegend: document.getElementById("mapLegend")
  };

  function formatDriveTime(minutes) {
    if (minutes < 60) {
      return "~" + minutes + " min";
    }
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;
    return mins ? "~" + hours + " h " + mins + " min" : "~" + hours + " h";
  }

  function matchesFilter(day) {
    if (state.filter === "all") {
      return true;
    }
    return day.categories.indexOf(state.filter) !== -1;
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
        '<span aria-hidden="true">' +
        filter.icon +
        "</span> " +
        filter.label +
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
          '<span class="cat-badge" style="--cat-color:' +
          meta.color +
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
    var hidden = matchesFilter(day) ? "" : " hidden";
    var selected = state.selectedDay === day.day ? " is-selected" : "";

    var driveBlock = state.showDriveTimes
      ? '<p class="drive-time"><span>🚗</span> Depuis New Grove : <strong>' +
        formatDriveTime(day.driveMinutes) +
        "</strong> (aller simple)</p>"
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
      '<div class="day-card-header">' +
      '<div class="day-heading">' +
      '<p class="day-number">Jour ' +
      day.day +
      "</p>" +
      "<h2>Jour " +
      day.day +
      " – " +
      day.title +
      "</h2>" +
      '<p class="day-date">' +
      day.date +
      "</p>" +
      "</div>" +
      '<div class="day-badges">' +
      '<span class="rhythm-badge">' +
      rhythm.icon +
      " " +
      rhythm.label +
      "</span>" +
      '<span class="effort-badge" style="--effort-color:' +
      effort.color +
      '">' +
      effort.label +
      "</span>" +
      "</div>" +
      "</div>" +
      '<div class="cat-badges">' +
      renderCategoryBadges(day.categories) +
      "</div>" +
      '<section class="day-section">' +
      "<h3>🎯 Activités principales</h3>" +
      "<ul>" +
      day.activities
        .map(function (activity) {
          return "<li>" + activity + "</li>";
        })
        .join("") +
      "</ul>" +
      "</section>" +
      '<section class="day-section beach-section">' +
      "<h3>🏖️ Plage du jour</h3>" +
      "<p>" +
      day.beach +
      "</p>" +
      "</section>" +
      driveBlock +
      '<section class="day-section tips-section">' +
      "<h3>💡 Conseil du jour</h3>" +
      "<p>" +
      day.tips +
      "</p>" +
      "</section>" +
      '<button type="button" class="map-focus-btn" data-focus-day="' +
      day.day +
      '">📍 Voir sur la carte</button>' +
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

    Array.prototype.forEach.call(els.daysGrid.querySelectorAll(".day-card:not(.hidden)"), function (card) {
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

  function initMap() {
    map = L.map("tripMap", { scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
    routeLayer = L.layerGroup().addTo(map);

    var baseIcon = L.divIcon({
      className: "base-marker",
      html: '<div class="marker-pin base">🏠</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker([BASE.lat, BASE.lng], { icon: baseIcon })
      .addTo(map)
      .bindPopup("<strong>" + BASE.name + "</strong><br>Base du séjour");

    updateMap();
  }

  function updateMap() {
    if (!map) {
      return;
    }

    markersLayer.clearLayers();
    routeLayer.clearLayers();

    var days = getVisibleDays();
    var bounds = [[BASE.lat, BASE.lng]];
    var legendTypes = { base: true };
    var legendKeys = ["base"];

    days.forEach(function (day) {
      var isSelected = state.selectedDay === null || state.selectedDay === day.day;
      if (!isSelected) {
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
          className: "custom-marker",
          html:
            '<div class="marker-pin" style="background:' +
            color +
            '">J' +
            day.day +
            "</div>",
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        var marker = L.marker([location.lat, location.lng], { icon: icon }).bindPopup(
          "<strong>Jour " + day.day + " – " + location.name + "</strong><br>" + day.title
        );

        markersLayer.addLayer(marker);
        dayPoints.push([location.lat, location.lng]);
        bounds.push([location.lat, location.lng]);
      });

      if (dayPoints.length > 1) {
        L.polyline(dayPoints, {
          color: "#ffd166",
          weight: 3,
          opacity: 0.75,
          dashArray: "8 8"
        }).addTo(routeLayer);
      }
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 11 });
    } else {
      map.setView([BASE.lat, BASE.lng], 10);
    }

    renderMapLegend(legendKeys);
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

    var day = ITINERARY.find(function (entry) {
      return entry.day === dayNum;
    });

    if (!day) {
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

    document.getElementById("tripMap").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function initDriveToggle() {
    els.driveToggle.checked = state.showDriveTimes;
    els.driveToggleLabel.textContent = state.showDriveTimes ? "Masquer" : "Afficher";

    els.driveToggle.addEventListener("change", function () {
      state.showDriveTimes = els.driveToggle.checked;
      els.driveToggleLabel.textContent = state.showDriveTimes ? "Masquer" : "Afficher";
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

  renderFilters();
  renderDays();
  renderTips();
  initDriveToggle();
  initResetMapButton();

  window.addEventListener("load", function () {
    initMap();
    window.setTimeout(function () {
      map.invalidateSize();
    }, 150);
  });
})();
