#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const photos = JSON.parse(fs.readFileSync(path.join(root, "js/maurice-google-photos.json"), "utf8"));

function p(key, caption) {
  const item = photos[key];
  if (!item || !item.photo) {
    return null;
  }
  return { url: item.photo, caption: caption, mapsUrl: item.mapsUrl };
}

function photoList(entries) {
  return entries.map(function (e) {
    return p(e[0], e[1]);
  }).filter(Boolean);
}

const dayPhotos = {
  1: photoList([["blueBay", "Blue Bay — photo Google Maps"]]),
  2: photoList([["grisGris", "Gris Gris — falaises du sud"], ["riambel", "Plage de Riambel"]]),
  3: photoList([["mahebourg", "Mahébourg — port et marché"], ["blueBay", "Blue Bay"]]),
  4: photoList([["pointeEsny", "Pointe d'Esny — plage calme"]]),
  5: photoList([["trouEauDouce", "Trou d'Eau Douce — départ bateau"], ["ileAuxCerfs", "Île aux Cerfs"]]),
  6: photoList([["grandBassin", "Grand Bassin — lac sacré"], ["boisCheri", "Bois Chéri — plantation de thé"]]),
  7: photoList([["belleMare", "Belle Mare — plage de l'est"], ["palmar", "Palmar — côte est"]]),
  8: photoList([["chamarel", "Chamarel — terres des 7 couleurs"]]),
  9: photoList([["leMorne", "Le Morne Brabant — panorama UNESCO"]]),
  10: photoList([["flicEnFlac", "Flic en Flac — plage de l'ouest"]]),
  11: photoList([["portLouis", "Port-Louis — marché central"]]),
  12: photoList([["pamplemousses", "Jardin de Pamplemousses"], ["montChoisy", "Mont Choisy — plage familiale"]]),
  13: photoList([["grandBaie", "Grand Baie — lagon du nord"], ["pereybere", "Pereybère — baignade tranquille"]]),
  14: photoList([["blueBay", "Blue Bay — une dernière baignade ?"]])
};

const vm = require("vm");
const dataPath = path.join(root, "js/maurice-itinerary-data.js");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(dataPath, "utf8"), sandbox);
const D = sandbox.window.ITINERARY_DATA;

D.ITINERARY.forEach(function (day) {
  day.photos = dayPhotos[day.day] || [];
});

const formatted = "window.ITINERARY_DATA = " + JSON.stringify(D, null, 2) + ";\n";
fs.writeFileSync(dataPath, formatted);
console.log("Updated photos for", D.ITINERARY.length, "days");
