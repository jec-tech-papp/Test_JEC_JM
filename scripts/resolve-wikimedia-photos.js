#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");

const root = path.join(__dirname, "..");
const photosPath = path.join(root, "js/maurice-google-photos.json");

/** Search terms tuned per POI key (Commons file namespace). */
const SEARCH_BY_KEY = {
  blueBay: "Blue Bay Beach Mauritius",
  grisGris: "Gris Gris Mauritius cliffs",
  riambel: "Riambel beach Mauritius",
  pointeEsny: "Pointe d'Esny Mauritius",
  ileAuxCerfs: "Ile aux Cerfs Mauritius",
  grandBassin: "Grand Bassin Ganga Talao Mauritius",
  boisCheri: "Bois Cheri tea Mauritius",
  savannah: "sugar cane Mauritius",
  chamarel: "Chamarel coloured earth Mauritius",
  cascadeChamarel: "Chamarel waterfall Mauritius",
  alexandraFalls: "Alexandra Falls Mauritius",
  leMorne: "Le Morne Brabant Mauritius",
  flicEnFlac: "Flic en Flac beach Mauritius",
  portLouis: "Port Louis market Mauritius",
  pamplemousses: "Pamplemousses botanical garden Mauritius",
  montChoisy: "Mont Choisy beach Mauritius",
  trouEauDouce: "Trou d'Eau Douce Mauritius",
  laVanille: "La Vanille Nature Park Mauritius",
  rochesterFalls: "Rochester Falls Mauritius",
  belleMare: "Belle Mare beach Mauritius",
  grandBaie: "Grand Baie Mauritius",
  pereybere: "Pereybere beach Mauritius",
  souillac: "Souillac Mauritius",
  palmar: "Palmar beach Mauritius",
  eauBleue: "Eau Bleue waterfall Mauritius"
};

function getJson(url) {
  return new Promise(function (resolve, reject) {
    https
      .get(url, { headers: { "User-Agent": "MauriceItineraryPhotoBot/1.0 (family trip page)" } }, function (res) {
        let body = "";
        res.on("data", function (chunk) {
          body += chunk;
        });
        res.on("end", function () {
          if (res.statusCode !== 200) {
            reject(new Error("HTTP " + res.statusCode + " for " + url));
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

function commonsSearch(query) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "url",
    iiurlwidth: "800",
    format: "json"
  });
  return getJson("https://commons.wikimedia.org/w/api.php?" + params.toString());
}

function pickThumb(data) {
  const pages = data.query && data.query.pages;
  if (!pages) {
    return null;
  }
  const ordered = Object.keys(pages)
    .map(function (id) {
      return pages[id];
    })
    .sort(function (a, b) {
      return (a.index || 0) - (b.index || 0);
    });
  for (let i = 0; i < ordered.length; i++) {
    const info = ordered[i].imageinfo && ordered[i].imageinfo[0];
    if (!info) {
      continue;
    }
    if (info.thumburl) {
      return info.thumburl.split("?")[0];
    }
    if (info.url) {
      return info.url.split("?")[0];
    }
  }
  return null;
}

function isGooglePhoto(url) {
  return typeof url === "string" && url.indexOf("googleusercontent.com") !== -1;
}

async function main() {
  const photos = JSON.parse(fs.readFileSync(photosPath, "utf8"));
  const updates = [];

  for (const key of Object.keys(photos)) {
    const entry = photos[key];
    if (!entry || !isGooglePhoto(entry.photo)) {
      continue;
    }
    const query = SEARCH_BY_KEY[key] || key.replace(/([A-Z])/g, " $1") + " Mauritius";
    process.stdout.write("… " + key + " ");
    try {
      const data = await commonsSearch(query);
      const thumb = pickThumb(data);
      if (thumb) {
        entry.photo = thumb;
        updates.push(key);
        process.stdout.write("OK\n");
      } else {
        process.stdout.write("skip (no result)\n");
      }
    } catch (err) {
      process.stdout.write("err " + err.message + "\n");
    }
    await new Promise(function (r) {
      setTimeout(r, 650);
    });
  }

  fs.writeFileSync(photosPath, JSON.stringify(photos, null, 2) + "\n");
  console.log("Updated", updates.length, "photos:", updates.join(", "));
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
