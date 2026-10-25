#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const photos = JSON.parse(fs.readFileSync(path.join(root, "js/maurice-google-photos.json"), "utf8"));

function photo(key, caption) {
  const item = photos[key];
  if (!item || !item.photo) return null;
  return { url: item.photo, caption: caption, mapsUrl: item.mapsUrl };
}

function photoList(entries) {
  return entries.map(function (e) {
    return photo(e[0], e[1]);
  }).filter(Boolean);
}

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "js/maurice-itinerary-data.js"), "utf8"), sandbox);
const D = sandbox.window.ITINERARY_DATA;

const updates = {
  7: {
    title: "Moulin & détente sud",
    rhythm: "chill",
    effort: "facile",
    categories: ["culture", "plage", "repos"],
    summary:
      "Matinée au domaine sucrier de Savannah, déjeuner dans le coin, puis détente et snorkeling à Blue Bay l'après-midi.",
    activities: [
      {
        text: "Domaine sucrier de Savannah (Omnicane Sugar Estate) — visite moulin / canne à sucre",
        link: "https://www.google.com/maps/search/?api=1&query=Omnicane+Sugar+Estate+Savannah+Mauritius"
      },
      "Déjeuner sur place, à Mahébourg ou Plaine Magnien",
      {
        text: "Après-midi à Blue Bay Marine Park — eau calme et snorkeling facile",
        link: "https://www.google.com/maps/search/?api=1&query=Blue+Bay+Marine+Park+Mauritius"
      }
    ],
    beach: "Plage de Blue Bay — eau calme, parfaite pour récupérer + snorkeling facile",
    locations: [
      { name: "Savannah Sugar Estate", lat: -20.4617, lng: 57.5989, type: "culture" },
      { name: "Blue Bay", lat: -20.4442, lng: 57.7189, type: "plage" }
    ],
    driveMinutes: 20,
    tips:
      "Vérifiez les horaires de visite du moulin la veille (visite guidée ou découverte du domaine selon disponibilité). Blue Bay en fin d'après-midi : idéal pour une journée chill.",
    links: [
      {
        label: "Omnicane Sugar Estate",
        url: "https://www.google.com/maps/search/?api=1&query=Omnicane+Sugar+Estate+Savannah+Mauritius",
        description: "≈ 10–15 min depuis New Grove"
      },
      {
        label: "Blue Bay Marine Park",
        url: "https://www.google.com/maps/search/?api=1&query=Blue+Bay+Marine+Park+Mauritius",
        description: "≈ 15 min — snorkeling et eau turquoise"
      }
    ],
    photos: photoList([
      ["savannah", "Savannah — domaine sucrier Omnicane"],
      ["blueBay", "Blue Bay — détente et snorkeling"]
    ])
  },
  8: {
    title: "Chamarel & cascade accessible",
    rhythm: "actif",
    effort: "modéré",
    categories: ["nature", "culture"],
    summary:
      "Terres des 7 couleurs et cascade de Chamarel le matin, puis Alexandra Falls (vue panoramique, 1–2 min de marche). Journée « wahou » sans fatigue.",
    activities: [
      {
        text: "Terres des 7 couleurs de Chamarel",
        link: "https://www.google.com/maps/search/?api=1&query=Chamarel+Seven+Coloured+Earth"
      },
      {
        text: "Cascade de Chamarel — point de vue depuis le belvédère (sans descente)",
        link: "https://www.google.com/maps/search/?api=1&query=Chamarel+Waterfall+Mauritius"
      },
      {
        text: "Alexandra Falls — Black River Gorges (parking direct, 1–2 min de marche)",
        link: "https://www.google.com/maps/search/?api=1&query=Alexandra+Falls+Mauritius"
      },
      "Déjeuner à Chamarel ou pique-nique",
      "Option : arrêts photo dans les gorges si l'énergie le permet",
      "Retour tranquille vers New Grove"
    ],
    beach: "Pas de plage — journée nature et panoramas dans le sud-ouest",
    locations: [
      { name: "Terres 7 couleurs", lat: -20.4397, lng: 57.3736, type: "nature" },
      { name: "Cascade Chamarel", lat: -20.4453, lng: 57.3858, type: "nature" },
      { name: "Alexandra Falls", lat: -20.3783, lng: 57.4431, type: "nature" }
    ],
    driveMinutes: 75,
    tips:
      "Tout est dans la même zone : enchaînement logique, zéro galère pour les genoux. Alexandra Falls est accessible en voiture avec une vue panoramique incroyable. Partez tôt.",
    links: [
      {
        label: "Alexandra Falls",
        url: "https://www.google.com/maps/search/?api=1&query=Alexandra+Falls+Mauritius",
        description: "Parking direct — 1 à 2 minutes de marche"
      },
      {
        label: "Chamarel sur Google Maps",
        url: "https://www.google.com/maps/search/?api=1&query=Chamarel+Mauritius",
        description: "Terres des 7 couleurs et cascade"
      }
    ],
    photos: photoList([
      ["chamarel", "Chamarel — terres des 7 couleurs"],
      ["cascadeChamarel", "Cascade de Chamarel"],
      ["alexandraFalls", "Alexandra Falls — panorama"]
    ])
  },
  13: {
    title: "La Vanille & cascade baignade",
    rhythm: "actif",
    effort: "facile",
    categories: ["nature", "plage"],
    summary:
      "La Vanille Nature Park le matin, baignade à Rochester Falls en début d'après-midi, fin de journée sauvage à Gris Gris ou Riambel.",
    activities: [
      {
        text: "La Vanille Nature Park (Crocodile Park) — visite ombragée et accessible",
        link: "https://www.google.com/maps/search/?api=1&query=La+Vanille+Nature+Park+Mauritius"
      },
      "Déjeuner sur place ou snack dans le parc",
      {
        text: "Rochester Falls — baignade possible (piste + 5 min de marche, roches volcaniques)",
        link: "https://www.google.com/maps/search/?api=1&query=Rochester+Falls+Mauritius"
      },
      {
        text: "Fin d'après-midi : plage de Gris Gris ou Riambel — côte sud sauvage",
        link: "https://www.google.com/maps/search/?api=1&query=Gris+Gris+Mauritius"
      }
    ],
    beach: "Gris Gris ou Riambel — côte sud plus sauvage, parfait pour finir tranquille",
    locations: [
      { name: "La Vanille", lat: -20.4019, lng: 57.5575, type: "nature" },
      { name: "Rochester Falls", lat: -20.4944, lng: 57.4567, type: "nature" },
      { name: "Gris Gris", lat: -20.4789, lng: 57.5214, type: "plage" }
    ],
    driveMinutes: 45,
    tips:
      "Allez à Rochester Falls en début d'après-midi (moins de monde). Baskets conseillées : accès court mais un peu irrégulier. Baignade possible aux chutes.",
    links: [
      {
        label: "La Vanille Nature Park",
        url: "https://www.google.com/maps/search/?api=1&query=La+Vanille+Nature+Park+Mauritius",
        description: "Rivière des Anguilles — parc ombragé"
      },
      {
        label: "Rochester Falls",
        url: "https://www.google.com/maps/search/?api=1&query=Rochester+Falls+Mauritius",
        description: "Baignade possible — Savanne, près de Souillac"
      }
    ],
    photos: photoList([
      ["laVanille", "La Vanille Nature Park"],
      ["rochesterFalls", "Rochester Falls — baignade"],
      ["grisGris", "Gris Gris — côte sud sauvage"]
    ])
  }
};

D.ITINERARY.forEach(function (day) {
  if (updates[day.day]) {
    Object.assign(day, updates[day.day]);
  }
});

// Bonus Eau Bleue — jour 4 repos + conseil pratique
const day4 = D.ITINERARY.find(function (d) {
  return d.day === 4;
});
if (day4) {
  day4.summary =
    "Journée repos à New Grove. Option matin : cascade Eau Bleue (≈15 min) — meilleure cascade baignable du séjour.";
  day4.tips =
    "Journée volontairement légère. Option bonus : Eau Bleue à Cluny (≈15 min) le matin — eau turquoise et plusieurs bassins. Pointe d'Esny l'après-midi si envie de plage.";
  day4.links = [
    {
      label: "Cascade Eau Bleue (Cluny)",
      url: "https://www.google.com/maps/search/?api=1&query=Eau+Bleue+Waterfall+Mauritius",
      description: "≈15 min de New Grove — cascade baignable"
    },
    {
      label: "Pointe d'Esny",
      url: "https://www.google.com/maps/search/?api=1&query=Pointe+d%27Esny+Mauritius",
      description: "Plage calme et peu fréquentée"
    }
  ];
  const eauBleuePhoto = photo("eauBleue", "Eau Bleue — cascade baignable");
  if (eauBleuePhoto) {
    day4.photos = [eauBleuePhoto, ...(day4.photos || []).filter(function (p) {
      return !p.caption.includes("Eau Bleue");
    })];
  }
}

D.PRACTICAL_TIPS.push({
  icon: "💦",
  title: "Bonus : Eau Bleue (Cluny)",
  text: "À ≈15 min de New Grove. Idéal sur un matin libre ou après une journée légère : la meilleure cascade baignable du séjour (eau turquoise, plusieurs bassins)."
});

fs.writeFileSync(
  path.join(root, "js/maurice-itinerary-data.js"),
  "window.ITINERARY_DATA = " + JSON.stringify(D, null, 2) + ";\n"
);

console.log("Updated days 7, 8, 13 + bonus Eau Bleue on day 4");
