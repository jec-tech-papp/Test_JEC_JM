(function () {
  "use strict";

  if (typeof window.ITINERARY_DATA === "undefined") {
    return;
  }

  var D = window.ITINERARY_DATA;
  var BASE = D.BASE;

  function getItinerary() {
    return D.ITINERARY;
  }

  var state = { filter: "all", showDriveTimes: true, selectedDay: null, searchQuery: "" };
  var map = null;
  var markersLayer = null;
  var routeLayer = null;
  var mapReady = false;
  var usingFallback = false;

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
    els.tripMap = $("tripMap");
    els.mapFallback = $("mapFallback");
    els.dayCards = document.querySelectorAll(".day-card");
    els.driveRows = document.querySelectorAll(".drive-row");
    els.daysGrid = $("daysGrid");
    els.daySearch = $("daySearch");
    els.searchStatus = $("searchStatus");
    els.stickyNav = $("stickyNav");
  }

  function normalizeSearch(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function cardMatchesSearch(card) {
    if (!state.searchQuery) {
      return true;
    }
    var haystack = normalizeSearch(card.getAttribute("data-search") || card.textContent);
    return haystack.indexOf(state.searchQuery) !== -1;
  }

  function matchesFilter(card) {
    if (state.filter === "all") {
      return true;
    }
    var cats = (card.getAttribute("data-categories") || "").split(" ");
    return cats.indexOf(state.filter) !== -1;
  }

  function getVisibleDays() {
    return getItinerary().filter(function (day) {
      if (state.filter !== "all" && day.categories.indexOf(state.filter) === -1) {
        return false;
      }
      if (state.searchQuery) {
        var card = $("day-" + day.day);
        if (card && card.classList.contains("is-hidden")) {
          return false;
        }
      }
      return true;
    });
  }

  function applyFilter() {
    var visible = 0;
    Array.prototype.forEach.call(els.dayCards, function (card) {
      var show = matchesFilter(card) && cardMatchesSearch(card);
      card.classList.toggle("is-hidden", !show);
      card.classList.toggle("is-search-match", Boolean(state.searchQuery) && show);
      if (show) {
        visible += 1;
      }
    });
    els.dayCount.textContent = visible + " jour" + (visible > 1 ? "s" : "");
    if (els.searchStatus) {
      if (state.searchQuery) {
        els.searchStatus.hidden = false;
        els.searchStatus.textContent = visible + " résultat" + (visible > 1 ? "s" : "");
      } else {
        els.searchStatus.hidden = true;
        els.searchStatus.textContent = "";
      }
    }
    updateMap();
    if (state.selectedDay !== null) {
      updateSelectionUI();
    }
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
          selectDay(Number(dayNum), { scrollToCard: true });
        }
      });
    });
  }

  function setActiveRhythmChip(dayNum) {
    Array.prototype.forEach.call(document.querySelectorAll(".rhythm-chip"), function (chip) {
      chip.classList.toggle("is-active", dayNum !== null && chip.getAttribute("data-goto-day") === String(dayNum));
    });
  }

  function getVisibleDayCards() {
    return Array.prototype.filter.call(els.dayCards, function (card) {
      return !card.classList.contains("is-hidden");
    });
  }

  function resetCardGridPlacement() {
    Array.prototype.forEach.call(els.dayCards, function (card) {
      card.classList.remove("is-selected", "is-row-collapsed");
      card.style.removeProperty("grid-column");
      card.style.removeProperty("grid-row");
    });
  }

  function updateSelectionUI() {
    resetCardGridPlacement();

    if (els.daysGrid) {
      els.daysGrid.classList.toggle("has-selection", state.selectedDay !== null);
    }

    if (state.selectedDay === null) {
      setActiveRhythmChip(null);
      return;
    }

    var selected = $("day-" + state.selectedDay);
    if (!selected || selected.classList.contains("is-hidden")) {
      setActiveRhythmChip(state.selectedDay);
      return;
    }

    selected.classList.add("is-selected");

    if (window.matchMedia("(min-width: 1200px)").matches) {
      var visible = getVisibleDayCards();
      var index = visible.indexOf(selected);
      if (index !== -1) {
        var row = Math.floor(index / 2) + 1;
        var partnerIndex = index % 2 === 0 ? index + 1 : index - 1;
        selected.style.gridRow = String(row);
        selected.style.gridColumn = "1 / -1";
        if (partnerIndex >= 0 && partnerIndex < visible.length && Math.floor(partnerIndex / 2) === Math.floor(index / 2)) {
          visible[partnerIndex].classList.add("is-row-collapsed");
        }
      }
    }

    setActiveRhythmChip(state.selectedDay);
  }

  function selectDay(dayNum, options) {
    options = options || {};
    state.selectedDay = dayNum;
    updateSelectionUI();
    updateMap();
    if (options.scrollToCard) {
      var card = $("day-" + dayNum);
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    if (options.scrollToMap) {
      var section = $("mapSection");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }

  function clearSelection() {
    state.selectedDay = null;
    updateSelectionUI();
    updateMap();
  }

  function initSearch() {
    if (!els.daySearch) {
      return;
    }
    var debounceTimer = null;
    els.daySearch.addEventListener("input", function () {
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(function () {
        state.searchQuery = normalizeSearch(els.daySearch.value.trim());
        applyFilter();
      }, 180);
    });
    els.daySearch.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        els.daySearch.value = "";
        state.searchQuery = "";
        applyFilter();
      }
    });
  }

  function initScrollReveal() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      Array.prototype.forEach.call(document.querySelectorAll(".reveal"), function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    Array.prototype.forEach.call(document.querySelectorAll(".reveal"), function (el) {
      observer.observe(el);
    });
  }

  function initDayScrollSpy() {
    if (!("IntersectionObserver" in window)) {
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        if (state.selectedDay !== null) {
          return;
        }
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var dayNum = entry.target.getAttribute("data-day");
            setActiveRhythmChip(dayNum);
          }
        });
      },
      { threshold: 0.35, rootMargin: "-20% 0px -55% 0px" }
    );
    Array.prototype.forEach.call(els.dayCards, function (card) {
      observer.observe(card);
    });
  }

  function initParallax() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    var orbs = document.querySelectorAll("[data-parallax]");
    if (!orbs.length) {
      return;
    }
    var ticking = false;
    function updateParallax() {
      var scrollY = window.scrollY || window.pageYOffset;
      Array.prototype.forEach.call(orbs, function (orb) {
        var speed = parseFloat(orb.getAttribute("data-parallax")) || 0.1;
        orb.style.transform = "translate3d(0, " + scrollY * speed + "px, 0)";
      });
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateParallax);
        }
      },
      { passive: true }
    );
    updateParallax();
  }

  function updateNavHeight() {
    if (!els.stickyNav) {
      return;
    }
    document.documentElement.style.setProperty("--nav-height", els.stickyNav.offsetHeight + "px");
  }

  function initDayCards() {
    els.dayCards = document.querySelectorAll(".day-card");
    els.driveRows = document.querySelectorAll(".drive-row");
    Array.prototype.forEach.call(els.dayCards, function (card) {
      if (card.getAttribute("data-bound") === "1") {
        return;
      }
      card.setAttribute("data-bound", "1");

      function toggleCardSelection(dayNum) {
        if (state.selectedDay === dayNum) {
          clearSelection();
        } else {
          selectDay(dayNum);
        }
      }

      card.addEventListener("click", function (event) {
        var dayNum = Number(card.getAttribute("data-day"));
        if (state.selectedDay === dayNum) {
          event.preventDefault();
          event.stopPropagation();
          clearSelection();
          return;
        }
        if (event.target.closest("a, button, input, label")) {
          return;
        }
        selectDay(dayNum);
      });

      var header = card.querySelector(".day-card-top");
      if (header) {
        header.addEventListener("click", function (event) {
          event.stopPropagation();
          toggleCardSelection(Number(card.getAttribute("data-day")));
        });
      }

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

  function collectMapPoints(days) {
    var lats = [BASE.lat];
    var lngs = [BASE.lng];
    days.forEach(function (day) {
      day.locations.forEach(function (loc) {
        if (loc.type !== "base") {
          lats.push(loc.lat);
          lngs.push(loc.lng);
        }
      });
    });
    return { lats: lats, lngs: lngs };
  }

  function updateFallbackMap() {
    if (!els.mapFallback) {
      return;
    }
    var days = getVisibleDays();
    var pts = collectMapPoints(days);
    var minLat = Math.min.apply(null, pts.lats);
    var maxLat = Math.max.apply(null, pts.lats);
    var minLng = Math.min.apply(null, pts.lngs);
    var maxLng = Math.max.apply(null, pts.lngs);
    var pad = 0.04;
    var bbox = [minLng - pad, minLat - pad, maxLng + pad, maxLat + pad].join("%2C");
    els.mapFallback.src =
      "https://www.openstreetmap.org/export/embed.html?bbox=" +
      bbox +
      "&layer=mapnik&marker=" +
      BASE.lat +
      "%2C" +
      BASE.lng;
    usingFallback = true;
    els.mapFallback.classList.remove("is-hidden");
    if (els.tripMap) {
      els.tripMap.classList.remove("is-active");
    }
    setMapStatus("");
  }

  function loadLeafletScript(callback, onFail, index) {
    index = index || 0;
    if (typeof L !== "undefined") {
      callback();
      return;
    }
    var urls = [
      "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js",
      "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"
    ];
    if (index >= urls.length) {
      onFail();
      return;
    }
    var existing = document.querySelector('script[data-leaflet-src="' + urls[index] + '"]');
    if (existing) {
      existing.addEventListener("load", function () {
        callback();
      });
      existing.addEventListener("error", function () {
        loadLeafletScript(callback, onFail, index + 1);
      });
      return;
    }
    var script = document.createElement("script");
    script.src = urls[index];
    script.setAttribute("data-leaflet-src", urls[index]);
    script.onload = function () {
      window.setTimeout(callback, 50);
    };
    script.onerror = function () {
      loadLeafletScript(callback, onFail, index + 1);
    };
    document.head.appendChild(script);
  }

  function getMarkerColor(type) {
    return { base: "#9a3412", plage: "#0f766e", culture: "#b45309", nature: "#166534" }[type] || "#44403c";
  }

  var DAY_ROUTE_COLORS = [
    "#0f766e", "#9a3412", "#166534", "#b45309", "#7c3aed", "#0369a1",
    "#0d9488", "#c2410c", "#4d7c0f", "#1d4ed8", "#be123c", "#0e7490",
    "#15803d", "#a16207"
  ];

  function isHomeBase(loc) {
    return loc.type === "base" && loc.name === BASE.name;
  }

  function buildDayRoute(day) {
    var route = [[BASE.lat, BASE.lng]];
    day.locations.forEach(function (loc) {
      if (isHomeBase(loc)) {
        return;
      }
      route.push([loc.lat, loc.lng]);
    });
    if (route.length > 1) {
      route.push([BASE.lat, BASE.lng]);
    }
    return route;
  }

  function getDayRouteStyle(day) {
    var isSelected = state.selectedDay === day.day;
    var color = DAY_ROUTE_COLORS[(day.day - 1) % DAY_ROUTE_COLORS.length];
    if (state.selectedDay !== null) {
      return {
        color: color,
        weight: isSelected ? 5 : 2,
        opacity: isSelected ? 0.95 : 0.2,
        dashArray: isSelected ? null : "4 8"
      };
    }
    return {
      color: color,
      weight: 3,
      opacity: 0.8,
      dashArray: "10 6"
    };
  }

  function formatRoutePopup(day, route) {
    var stops = [BASE.name];
    day.locations.forEach(function (loc) {
      if (!isHomeBase(loc)) {
        stops.push(loc.name);
      }
    });
    stops.push(BASE.name);
    return (
      "<strong>Jour " +
      day.day +
      " — " +
      day.title +
      "</strong><br>" +
      stops.join(" → ") +
      (day.driveMinutes ? "<br><em>~ " + day.driveMinutes + " min depuis " + BASE.name + "</em>" : "")
    );
  }

  function initLeafletMap() {
    if (mapReady || typeof L === "undefined" || !els.tripMap) {
      return;
    }
    try {
      map = L.map(els.tripMap, { scrollWheelZoom: false });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        subdomains: "abcd",
        maxZoom: 19
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
      usingFallback = false;
      if (els.mapFallback) {
        els.mapFallback.classList.add("is-hidden");
      }
      els.tripMap.classList.add("is-active");
      updateLeafletMap();
      window.setTimeout(function () {
        map.invalidateSize();
      }, 300);
    } catch (e) {
      updateFallbackMap();
    }
  }

  function updateLeafletMap() {
    if (!mapReady || !map) {
      return;
    }
    markersLayer.clearLayers();
    routeLayer.clearLayers();
    var bounds = [[BASE.lat, BASE.lng]];
    var legendKeys = ["base"];
    var days = getVisibleDays();
    var mapDays = state.selectedDay !== null
      ? days.filter(function (day) {
          return day.day === state.selectedDay;
        })
      : days;

    mapDays.forEach(function (day) {
      day.locations.forEach(function (loc) {
        if (isHomeBase(loc)) {
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
        bounds.push([loc.lat, loc.lng]);
      });

      var route = buildDayRoute(day);
      if (route.length > 2) {
        var style = getDayRouteStyle(day);
        routeLayer.addLayer(
          L.polyline(route, style).bindPopup(formatRoutePopup(day, route))
        );
      }
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: state.selectedDay !== null ? 12 : 11 });
    } else {
      map.setView([BASE.lat, BASE.lng], 10);
    }

    renderMapLegend(legendKeys);
  }

  function renderMapLegend(keys) {
    var labels = { base: "🏠 Base", plage: "🏖️ Plage", culture: "🏛️ Culture", nature: "🌿 Nature" };
    var items = keys.map(function (k) {
      return '<span class="legend-item">' + (labels[k] || k) + "</span>";
    });
    if (mapReady) {
      items.push('<span class="legend-item legend-route">〰️ Itinéraires (base → étapes → base)</span>');
    }
    els.mapLegend.innerHTML = items.join("");
  }

  function updateMap() {
    var days = getVisibleDays();
    var legendKeys = ["base"];
    days.forEach(function (day) {
      day.locations.forEach(function (loc) {
        if (loc.type !== "base" && legendKeys.indexOf(loc.type) === -1) {
          legendKeys.push(loc.type);
        }
      });
    });
    renderMapLegend(legendKeys);

    if (mapReady) {
      updateLeafletMap();
    } else {
      updateFallbackMap();
    }
  }

  function focusDayOnMap(dayNum) {
    selectDay(dayNum, { scrollToMap: true });
    if (mapReady && map) {
      var day = getItinerary().find(function (d) {
        return d.day === dayNum;
      });
      if (!day) {
        return;
      }
      var route = buildDayRoute(day);
      if (route.length > 1) {
        map.fitBounds(route, { padding: [48, 48], maxZoom: 12 });
      }
    }
  }

  function initMap() {
    updateFallbackMap();
    loadLeafletScript(
      initLeafletMap,
      function () {
        setMapStatus("Carte simplifiée (OpenStreetMap). Le programme complet est disponible.", false);
      }
    );
  }

  function refresh() {
    cacheElements();
    initDayCards();
    applyFilter();
    applyDriveToggle();
    updateMap();
    if (mapReady && map) {
      window.setTimeout(function () {
        map.invalidateSize();
      }, 200);
    }
  }

  window.MauriceItineraryApp = { refresh: refresh };

  function boot() {
    cacheElements();
    initFilters();
    initRhythm();
    initSearch();
    initDayCards();
    initScrollReveal();
    initDayScrollSpy();
    initParallax();
    updateNavHeight();
    window.addEventListener("resize", function () {
      updateNavHeight();
      if (state.selectedDay !== null) {
        updateSelectionUI();
      }
    });
    els.driveToggle.addEventListener("change", function () {
      state.showDriveTimes = els.driveToggle.checked;
      applyDriveToggle();
    });
    $("resetMapBtn").addEventListener("click", function () {
      clearSelection();
    });
    applyFilter();
    applyDriveToggle();
    initMap();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
