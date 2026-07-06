window.ITINERARY_DATA = {
  BASE: {
    name: "New Grove",
    lat: -20.4085,
    lng: 57.7182,
    description: "Hébergement au sud-est de l'île, idéal pour rayonner facilement en voiture."
  },
  TRIP_META: {
    title: "Île Maurice — 14 jours",
    dates: "7 → 21 novembre 2026",
    arrival: "Arrivée le matin du 7 novembre",
    departure: "Départ le soir du 21 novembre",
    group: "6 adultes",
    transport: "Voiture de location",
    constraint: "2 personnes avec genoux sensibles — pas de longues randonnées"
  },
  FILTERS: [
    { id: "all", label: "Tout voir", icon: "🗺️" },
    { id: "plage", label: "Plage", icon: "🏖️" },
    { id: "culture", label: "Culture", icon: "🏛️" },
    { id: "nature", label: "Nature", icon: "🌿" },
    { id: "repos", label: "Repos", icon: "😌" }
  ],
  PRACTICAL_TIPS: [
    {
      icon: "🚗",
      title: "Conduite à Maurice",
      text: "Circulation à gauche. Routes côtières parfois sinueuses : prévoir 15 à 20 min de marge. Stationnez à l'ombre quand c'est possible."
    },
    {
      icon: "🏖️",
      title: "Plages incontournables",
      text: "Blue Bay (snorkeling), Belle Mare (sable fin), Pereybère (eau calme), Le Morne (vue spectaculaire), Mont Choisy (familiale)."
    },
    {
      icon: "🍛",
      title: "Spécialités locales",
      text: "Dholl puri, boulettes, cari de poisson, alouda, gâteau patate. Essayez un déjeuner créole à Mahébourg ou Port-Louis."
    },
    {
      icon: "🧴",
      title: "Soleil & récifs",
      text: "Crème solaire indice 50+, chapeau et eau en permanence. Chaussures d'eau utiles sur les récifs coralliens."
    },
    {
      icon: "🦵",
      title: "Genoux sensibles",
      text: "Privilégier les accès plage faciles (Blue Bay, Pereybère, Mont Choisy). Éviter la montée du Morne : profiter de la plage en contrebas."
    },
    {
      icon: "⏰",
      title: "Horaires utiles",
      text: "Marché de Mahébourg : lundi. Marché central Port-Louis : tôt le matin. Grand Bassin : calme en matinée."
    }
  ],
  ITINERARY: [
    {
      day: 1,
      date: "Vendredi 7 novembre 2026",
      title: "Arrivée & détente",
      rhythm: "chill",
      effort: "facile",
      categories: ["repos", "plage"],
      activities: [
        "Arrivée à l'aéroport SSR et installation à New Grove",
        "Courses alimentaires et premiers repas locaux",
        "Première baignade en fin d'après-midi"
      ],
      beach: "Plage de Blue Bay — eau turquoise, snorkeling léger depuis la plage",
      locations: [
        { name: "New Grove", lat: -20.4085, lng: 57.7182, type: "base" },
        { name: "Blue Bay", lat: -20.4442, lng: 57.7189, type: "plage" }
      ],
      driveMinutes: 15,
      tips: "Récupérez la voiture à l'aéroport puis rejoignez New Grove. Blue Bay est à 15 min : parfait pour une première mise en jambes."
    },
    {
      day: 2,
      date: "Samedi 8 novembre 2026",
      title: "Sud sauvage & falaises",
      rhythm: "actif",
      effort: "modéré",
      categories: ["nature", "plage"],
      activities: [
        "Gris Gris — falaises battues par les vagues (vue sans descente difficile)",
        "Roche Qui Pleure — spectacle naturel du sud",
        "Village de Souillac et promenade côtière",
        "Déjeuner local dans le sud"
      ],
      beach: "Plage de Riambel — sable, baignade tranquille loin de la foule",
      locations: [
        { name: "Gris Gris", lat: -20.4789, lng: 57.5214, type: "nature" },
        { name: "Roche Qui Pleure", lat: -20.4812, lng: 57.5189, type: "nature" },
        { name: "Souillac", lat: -20.5167, lng: 57.5167, type: "culture" },
        { name: "Riambel", lat: -20.5056, lng: 57.5639, type: "plage" }
      ],
      driveMinutes: 30,
      tips: "Restez sur les points de vue aménagés à Gris Gris. Pas de baignade aux falaises — la plage de Riambel est plus sûre."
    },
    {
      day: 3,
      date: "Dimanche 9 novembre 2026",
      title: "Mahébourg & marché",
      rhythm: "actif",
      effort: "facile",
      categories: ["culture", "plage"],
      activities: [
        "Marché de Mahébourg (ambiance locale, fruits, épices)",
        "Musée naval de Mahébourg — histoire maritime mauricienne",
        "Balade dans le vieux quartier et café face au port"
      ],
      beach: "Retour à Blue Bay pour snorkeling ou farniente",
      locations: [
        { name: "Marché Mahébourg", lat: -20.4081, lng: 57.7003, type: "culture" },
        { name: "Musée naval", lat: -20.4167, lng: 57.7042, type: "culture" },
        { name: "Blue Bay", lat: -20.4442, lng: 57.7189, type: "plage" }
      ],
      driveMinutes: 10,
      tips: "Le marché est animé le lundi matin. Le musée est accessible et peu exigeant physiquement."
    },
    {
      day: 4,
      date: "Lundi 10 novembre 2026",
      title: "Journée repos",
      rhythm: "chill",
      effort: "facile",
      categories: ["repos", "plage"],
      activities: [
        "Matinée libre à la maison — lecture, sieste, piscine",
        "Petite balade douce dans le quartier",
        "Barbecue ou repas simple à New Grove"
      ],
      beach: "Pointe d'Esny — plage calme et peu fréquentée, accès facile",
      locations: [
        { name: "New Grove", lat: -20.4085, lng: 57.7182, type: "base" },
        { name: "Pointe d'Esny", lat: -20.4214, lng: 57.7286, type: "plage" }
      ],
      driveMinutes: 10,
      tips: "Journée volontairement légère après deux jours actifs. Pointe d'Esny est proche et très agréable."
    },
    {
      day: 5,
      date: "Mardi 11 novembre 2026",
      title: "Île aux Cerfs",
      rhythm: "actif",
      effort: "modéré",
      categories: ["nature", "plage"],
      activities: [
        "Départ en bateau depuis Trou d'Eau Douce",
        "Journée sur l'île aux Cerfs — baignade, transat, déjeuner les pieds dans l'eau",
        "Option snorkeling dans le lagon (sans effort intense)"
      ],
      beach: "Île aux Cerfs — plages de sable blanc et eau cristalline",
      locations: [
        { name: "Trou d'Eau Douce", lat: -20.2569, lng: 57.7878, type: "base" },
        { name: "Île aux Cerfs", lat: -20.2747, lng: 57.8008, type: "plage" }
      ],
      driveMinutes: 45,
      tips: "Réservez le bateau la veille. Prévoyez de partir tôt pour profiter d'une plage moins bondée."
    },
    {
      day: 6,
      date: "Mercredi 12 novembre 2026",
      title: "Grand Bassin & thé",
      rhythm: "actif",
      effort: "facile",
      categories: ["culture", "nature"],
      activities: [
        "Grand Bassin (Ganga Talao) — lac sacré hindou, visite respectueuse",
        "Route des plages du sud puis ascension douce vers le plateau",
        "Bois Chéri — visite de plantation de thé et dégustation"
      ],
      beach: "Pas de plage principale — journée culture & nature en altitude",
      locations: [
        { name: "Grand Bassin", lat: -20.4181, lng: 57.4917, type: "culture" },
        { name: "Bois Chéri", lat: -20.4264, lng: 57.4436, type: "culture" }
      ],
      driveMinutes: 50,
      tips: "Couvrez-vous légèrement au Grand Bassin (site religieux). La visite de la rhumerie Bois Chéri est accessible."
    },
    {
      day: 7,
      date: "Jeudi 13 novembre 2026",
      title: "Plages de l'est",
      rhythm: "chill",
      effort: "facile",
      categories: ["plage", "repos"],
      activities: [
        "Route vers la côte est — paysages de canne à sucre",
        "Belle Mare — longue plage de sable fin",
        "Palmar — baignade et déjeuner en bord de mer"
      ],
      beach: "Belle Mare & Palmar — parmi les plus belles plages de l'île",
      locations: [
        { name: "Belle Mare", lat: -20.1989, lng: 57.7814, type: "plage" },
        { name: "Palmar", lat: -20.2103, lng: 57.7681, type: "plage" }
      ],
      driveMinutes: 50,
      tips: "Journée plage pure. Louez des transats sur place et alternez ombre / soleil."
    },
    {
      day: 8,
      date: "Vendredi 14 novembre 2026",
      title: "Chamarel & rhumerie",
      rhythm: "actif",
      effort: "modéré",
      categories: ["nature", "culture"],
      activities: [
        "Terres des 7 couleurs de Chamarel — site géologique unique",
        "Cascade de Chamarel (vue depuis le belvédère, sans randonnée)",
        "Rhumerie de Chamarel — visite et dégustation"
      ],
      beach: "Option plage de Tamarin en fin de journée si envie",
      locations: [
        { name: "Terres 7 couleurs", lat: -20.4397, lng: 57.3736, type: "nature" },
        { name: "Cascade Chamarel", lat: -20.4453, lng: 57.3858, type: "nature" },
        { name: "Rhumerie Chamarel", lat: -20.4322, lng: 57.3914, type: "culture" },
        { name: "Tamarin", lat: -20.3256, lng: 57.3706, type: "plage" }
      ],
      driveMinutes: 75,
      tips: "Journée la plus longue en voiture. Partez tôt. La cascade se voit sans descendre les marches."
    },
    {
      day: 9,
      date: "Samedi 15 novembre 2026",
      title: "Le Morne sans randonnée",
      rhythm: "actif",
      effort: "facile",
      categories: ["nature", "plage"],
      activities: [
        "Route vers Le Morne — panorama sur le Morne Brabant (UNESCO)",
        "Photo depuis la plage publique, sans ascension",
        "Déjeuner face au lagon du sud-ouest"
      ],
      beach: "Plage du Morne — vue spectaculaire sur la montagne",
      locations: [
        { name: "Le Morne Brabant", lat: -20.4519, lng: 57.3106, type: "nature" },
        { name: "Plage du Morne", lat: -20.4542, lng: 57.3194, type: "plage" }
      ],
      driveMinutes: 70,
      tips: "Ne pas tenter la randonnée pour les genoux sensibles. La plage offre déjà une vue magnifique."
    },
    {
      day: 10,
      date: "Dimanche 16 novembre 2026",
      title: "Repos & Flic en Flac",
      rhythm: "chill",
      effort: "facile",
      categories: ["repos", "plage", "culture"],
      activities: [
        "Matinée détente à New Grove",
        "Shopping souvenirs ou supermarché",
        "Après-midi à Flic en Flac — longue plage animée"
      ],
      beach: "Flic en Flac — plage populaire, restaurants et boutiques à proximité",
      locations: [
        { name: "New Grove", lat: -20.4085, lng: 57.7182, type: "base" },
        { name: "Flic en Flac", lat: -20.2833, lng: 57.3667, type: "plage" }
      ],
      driveMinutes: 60,
      tips: "Journée chill idéale pour ralentir le rythme. Flic en Flac est parfait pour un coucher de soleil."
    },
    {
      day: 11,
      date: "Lundi 17 novembre 2026",
      title: "Port-Louis & capitale",
      rhythm: "actif",
      effort: "modéré",
      categories: ["culture"],
      activities: [
        "Marché central de Port-Louis — épices, légumes, street food",
        "Aapravasi Ghat (UNESCO) — histoire de l'immigration",
        "Waterfront Caudan — boutiques, cafés, vue sur le port"
      ],
      beach: "Pas de plage — journée urbaine et culturelle",
      locations: [
        { name: "Marché central", lat: -20.1609, lng: 57.5012, type: "culture" },
        { name: "Aapravasi Ghat", lat: -20.1586, lng: 57.5025, type: "culture" },
        { name: "Le Caudan", lat: -20.1617, lng: 57.4972, type: "culture" }
      ],
      driveMinutes: 75,
      tips: "Garez-vous au Caudan. Marchez entre les sites : tout est proche. Goûtez les gâteaux piments au marché."
    },
    {
      day: 12,
      date: "Mardi 18 novembre 2026",
      title: "Pamplemousses & nord-ouest",
      rhythm: "actif",
      effort: "facile",
      categories: ["nature", "plage"],
      activities: [
        "Jardin botanique de Pamplemousses — lotus géants, palmiers royaux",
        "Route vers le nord-ouest",
        "Après-midi à Mont Choisy — plage familiale"
      ],
      beach: "Mont Choisy — longue plage ombragée, eau calme",
      locations: [
        { name: "Jardin Pamplemousses", lat: -20.1078, lng: 57.5772, type: "nature" },
        { name: "Mont Choisy", lat: -20.0342, lng: 57.5528, type: "plage" }
      ],
      driveMinutes: 80,
      tips: "Visitez le jardin tôt (chaleur + foule). Mont Choisy est l'une des plages les plus accessibles."
    },
    {
      day: 13,
      date: "Mercredi 19 novembre 2026",
      title: "Grand Baie & Pereybère",
      rhythm: "actif",
      effort: "facile",
      categories: ["plage", "culture"],
      activities: [
        "Grand Baie — boutiques, galeries, ambiance animée",
        "Déjeuner en bord de lagon",
        "Pereybère — baignade dans une eau calme et protégée"
      ],
      beach: "Pereybère — petite plage idéale pour une baignade tranquille",
      locations: [
        { name: "Grand Baie", lat: -20.0136, lng: 57.5806, type: "culture" },
        { name: "Pereybère", lat: -19.9953, lng: 57.5894, type: "plage" }
      ],
      driveMinutes: 75,
      tips: "Pereybère est moins agitée que Grand Baie : parfait pour le groupe et les genoux sensibles."
    },
    {
      day: 14,
      date: "Jeudi 20 – Vendredi 21 novembre 2026",
      title: "Journée libre & départ",
      rhythm: "chill",
      effort: "facile",
      categories: ["repos", "plage"],
      activities: [
        "Jeudi 20 : matinée libre sur votre plage favorite",
        "Derniers achats et préparation des valises",
        "Vendredi 21 : dernière baignade, check-out et départ vers l'aéroport le soir"
      ],
      beach: "Votre plage favorite (Blue Bay, Pereybère ou Pointe d'Esny)",
      locations: [
        { name: "New Grove", lat: -20.4085, lng: 57.7182, type: "base" },
        { name: "Aéroport SSR", lat: -20.4302, lng: 57.6836, type: "culture" }
      ],
      driveMinutes: 15,
      tips: "Prévoyez 2 h avant le vol du 21/11 au soir pour le retour de la voiture. Un dernier dip dans le lagon !"
    }
  ],
  CATEGORY_META: {
    plage: { label: "Plage", icon: "🏖️", color: "#38bdf8" },
    culture: { label: "Culture", icon: "🏛️", color: "#fbbf24" },
    nature: { label: "Nature", icon: "🌿", color: "#4ade80" },
    repos: { label: "Repos", icon: "😌", color: "#c4b5fd" }
  },
  RHYTHM_META: {
    actif: { label: "Jour actif", icon: "🚗" },
    chill: { label: "Jour chill", icon: "🌴" }
  },
  EFFORT_META: {
    facile: { label: "Facile", color: "#4ade80" },
    "modéré": { label: "Modéré", color: "#fbbf24" }
  }
};
