(function (global) {
  "use strict";

  function esc(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDriveTime(minutes) {
    var m = Number(minutes) || 0;
    if (m < 60) {
      return "~" + m + " min";
    }
    var h = Math.floor(m / 60);
    var r = m % 60;
    return r ? "~" + h + " h " + r + " min" : "~" + h + " h";
  }

  function activityText(activity) {
    if (!activity) {
      return "";
    }
    if (typeof activity === "string") {
      return activity;
    }
    return activity.text || "";
  }

  function activityLink(activity) {
    if (!activity || typeof activity === "string") {
      return "";
    }
    return activity.link || "";
  }

  function isMealActivity(activity) {
    if (!activity) {
      return false;
    }
    if (typeof activity === "object" && activity.meal) {
      return true;
    }
    var text = activityText(activity).toLowerCase();
    return /(déjeuner|dejeuner|restaurant|snack|café|cafe|food truck|repas|barbecue|pique-nique|piquenique|messe|dégustation)/.test(text);
  }

  function mealEmoji(text) {
    var t = String(text || "").toLowerCase();
    if (t.indexOf("messe") !== -1) {
      return "⛪";
    }
    if (t.indexOf("snack") !== -1 || t.indexOf("food truck") !== -1) {
      return "🥙";
    }
    if (t.indexOf("café") !== -1 || t.indexOf("cafe") !== -1) {
      return "☕";
    }
    if (t.indexOf("pique-nique") !== -1 || t.indexOf("piquenique") !== -1) {
      return "🧺";
    }
    if (t.indexOf("dégustation") !== -1) {
      return "🍵";
    }
    return "🍽️";
  }

  function renderActivityItem(activity) {
    var text = activityText(activity);
    var link = activityLink(activity);
    var meal = isMealActivity(activity);
    var icon = meal
      ? '<span class="activity-meal-icon" aria-hidden="true">' + mealEmoji(text) + "</span>"
      : "";
    var body;
    if (link) {
      body =
        '<a class="activity-link" href="' +
        esc(link) +
        '" target="_blank" rel="noopener noreferrer">' +
        icon +
        esc(text) +
        " ↗</a>";
    } else {
      body = icon + esc(text);
    }
    return '<li' + (meal ? ' class="activity-meal"' : "") + ">" + body + "</li>";
  }

  var PHOTO_PLACEHOLDER =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">' +
        '<rect fill="#f5f0e8" width="800" height="500"/>' +
        '<text x="400" y="250" text-anchor="middle" fill="#78716c" font-family="system-ui,sans-serif" font-size="22">Photo indisponible</text>' +
        "</svg>"
    );

  function renderPhotos(photos) {
    if (!photos || !photos.length) {
      return "";
    }
    var items = photos
      .filter(function (p) {
        return p && p.url;
      })
      .map(function (photo) {
        return (
          '<figure class="day-photo">' +
          '<a class="day-photo-link" href="' +
          esc(photo.mapsUrl || photo.url) +
          '" target="_blank" rel="noopener noreferrer">' +
          '<img src="' +
          esc(photo.url) +
          '" alt="' +
          esc(photo.caption || "Photo du lieu") +
          '" loading="lazy" referrerpolicy="no-referrer" decoding="async" onerror="this.onerror=null;this.src=\'' +
          PHOTO_PLACEHOLDER +
          "'\">" +
          "</a>" +
          '<figcaption>' +
          esc(photo.caption || "Photo du lieu") +
          (photo.mapsUrl ? ' · <a href="' + esc(photo.mapsUrl) + '" target="_blank" rel="noopener noreferrer">Google Maps</a>' : "") +
          "</figcaption></figure>"
        );
      })
      .join("");
    if (!items) {
      return "";
    }
    return '<section class="day-block day-photos"><h3>📷 Aperçu Google Maps</h3><div class="photo-grid">' + items + "</div></section>";
  }

  function renderLinks(links) {
    if (!links || !links.length) {
      return "";
    }
    var items = links
      .filter(function (l) {
        return l && l.url;
      })
      .map(function (link) {
        return (
          '<a class="useful-link" href="' +
          esc(link.url) +
          '" target="_blank" rel="noopener noreferrer">' +
          '<span class="useful-link-label">' +
          esc(link.label || link.url) +
          "</span>" +
          (link.description ? '<span class="useful-link-desc">' + esc(link.description) + "</span>" : "") +
          '<span class="useful-link-arrow" aria-hidden="true">↗</span></a>'
        );
      })
      .join("");
    if (!items) {
      return "";
    }
    return '<section class="day-block day-links"><h3>🔗 Liens utiles</h3><div class="links-list">' + items + "</div></section>";
  }

  function buildSearchText(day) {
    var parts = [
      day.title,
      day.date,
      day.summary || "",
      day.beach || "",
      day.tips || ""
    ];
    (day.activities || []).forEach(function (a) {
      parts.push(activityText(a));
    });
    (day.locations || []).forEach(function (loc) {
      parts.push(loc.name);
    });
    return parts.join(" ").toLowerCase();
  }

  function renderDayCard(day, meta) {
    var CATEGORY_META = meta.CATEGORY_META;
    var RHYTHM_META = meta.RHYTHM_META;
    var EFFORT_META = meta.EFFORT_META;
    var rhythm = RHYTHM_META[day.rhythm] || { icon: "📅", label: day.rhythm };
    var effort = EFFORT_META[day.effort] || { label: day.effort };
    var effortClass = day.effort === "modéré" ? "modere" : day.effort;
    var cats = (day.categories || [])
      .map(function (c) {
        var cat = CATEGORY_META[c] || { icon: "•", label: c };
        return '<span class="cat-badge cat-' + c + '">' + cat.icon + " " + esc(cat.label) + "</span>";
      })
      .join("");
    var activities = (day.activities || []).map(renderActivityItem).join("");
    var summary = day.summary
      ? '<section class="day-block day-summary"><h3>En bref</h3><p>' + esc(day.summary) + "</p></section>"
      : "";

    return (
      '<article class="day-card reveal" id="day-' +
      day.day +
      '" data-day="' +
      day.day +
      '" data-categories="' +
      (day.categories || []).join(" ") +
      '" data-search="' +
      esc(buildSearchText(day)) +
      '">' +
      '<header class="day-card-top">' +
      '<div class="day-title-block">' +
      '<p class="day-kicker">Jour ' +
      day.day +
      "</p>" +
      "<h2>" +
      esc(day.title) +
      "</h2>" +
      '<p class="day-date">' +
      esc(day.date) +
      "</p>" +
      "</div>" +
      '<div class="day-meta-badges">' +
      '<span class="meta-badge rhythm-' +
      day.rhythm +
      '">' +
      rhythm.icon +
      " " +
      esc(rhythm.label) +
      "</span>" +
      '<span class="meta-badge effort-' +
      effortClass +
      '">' +
      esc(effort.label) +
      "</span>" +
      "</div></header>" +
      '<div class="cat-badges">' +
      cats +
      "</div>" +
      '<div class="day-card-body">' +
      summary +
      renderPhotos(day.photos) +
      '<section class="day-block"><h3>Activités</h3><ul class="activity-list">' +
      activities +
      "</ul></section>" +
      '<div class="day-info-grid">' +
      '<section class="day-block highlight-beach"><h3>Plage du jour</h3><p>' +
      esc(day.beach) +
      "</p></section>" +
      renderLinks(day.links) +
      '<div class="info-row drive-row"><span class="info-icon" aria-hidden="true">🚗</span><div><strong>Depuis New Grove</strong><span>' +
      formatDriveTime(day.driveMinutes) +
      " aller simple</span></div></div>" +
      '<section class="day-block highlight-tip"><h3>Conseil</h3><p>' +
      esc(day.tips) +
      "</p></section>" +
      "</div>" +
      "</div>" +
      '<footer class="day-card-footer"><button type="button" class="map-focus-btn">Voir sur la carte</button></footer></article>'
    );
  }

  function renderAllDays(itinerary, meta) {
    return itinerary.map(function (day) {
      return renderDayCard(day, meta);
    }).join("");
  }

  global.ItineraryRender = {
    esc: esc,
    formatDriveTime: formatDriveTime,
    activityText: activityText,
    renderDayCard: renderDayCard,
    renderAllDays: renderAllDays
  };
})(window);
