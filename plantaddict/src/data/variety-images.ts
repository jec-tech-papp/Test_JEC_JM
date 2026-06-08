/** Reference images (Wikimedia Commons, CC licenses) for plant & variety identification */

const W = 'https://upload.wikimedia.org/wikipedia/commons/thumb';

export const plantReferenceImages: Record<string, string> = {
  'monstera-deliciosa': `${W}/7/7e/Monstera_deliciosa2.jpg/500px-Monstera_deliciosa2.jpg`,
  'monstera-adansonii': `${W}/0/0e/Monstera_adansonii.jpg/500px-Monstera_adansonii.jpg`,
  'monstera-dubia': `${W}/8/8a/Monstera_dubia.jpg/500px-Monstera_dubia.jpg`,
  'monstera-obliqua': `${W}/4/4e/Monstera_obliqua_kew.jpg/500px-Monstera_obliqua_kew.jpg`,
  'philodendron-pink-princess': `${W}/9/9c/Philodendron_erubescens_%27Pink_Princess%27.jpg/500px-Philodendron_erubescens_%27Pink_Princess%27.jpg`,
  'philodendron-birkin': `${W}/e/e0/Philodendron_birkin.jpg/500px-Philodendron_birkin.jpg`,
  'philodendron-gloriosum': `${W}/1/1e/Philodendron_gloriosum.jpg/500px-Philodendron_gloriosum.jpg`,
  'anthurium-warocqueanum': `${W}/a/a0/Anthurium_warocqueanum.jpg/500px-Anthurium_warocqueanum.jpg`,
  'anthurium-crystallinum': `${W}/5/5e/Anthurium_crystallinum.jpg/500px-Anthurium_crystallinum.jpg`,
  'anthurium-clarinervium': `${W}/2/2e/Anthurium_clarinervium.jpg/500px-Anthurium_clarinervium.jpg`,
  'alocasia-zebrina': `${W}/6/6e/Alocasia_zebrina.jpg/500px-Alocasia_zebrina.jpg`,
  'alocasia-cuprea': `${W}/8/8d/Alocasia_cuprea.jpg/500px-Alocasia_cuprea.jpg`,
  'calathea-ornata': `${W}/4/4b/Calathea_ornata.jpg/500px-Calathea_ornata.jpg`,
  'epipremnum-aureum': `${W}/5/5c/Epipremnum_aureum_31082015.jpg/500px-Epipremnum_aureum_31082015.jpg`,
  'epipremnum-cebu-blue': `${W}/a/a7/Epipremnum_pinnatum_Cebu_Blue.jpg/500px-Epipremnum_pinnatum_Cebu_Blue.jpg`,
  'hoya-carnosa': `${W}/9/9e/Hoya_carnosa_-_Hong_Kong_Park_Greenhouse_-_IMG_9864.JPG/500px-Hoya_carnosa_-_Hong_Kong_Park_Greenhouse_-_IMG_9864.JPG`,
  'ficus-lyrata': `${W}/8/8f/Ficus_lyrata.jpg/500px-Ficus_lyrata.jpg`,
  'spathiphyllum': `${W}/4/48/Spathiphyllum_cochlearispathum_RTBG.jpg/500px-Spathiphyllum_cochlearispathum_RTBG.jpg`,
  'zamioculcas-zamiifolia': `${W}/0/03/Zamioculcas_zamiifolia.jpg/500px-Zamioculcas_zamiifolia.jpg`,
  'sansevieria-trifasciata': `${W}/f/fb/Sansevieria_trifasciata_plant.jpg/500px-Sansevieria_trifasciata_plant.jpg`,
  'pilea-peperomioides': `${W}/6/6a/Pilea_peperomioides_001.jpg/500px-Pilea_peperomioides_001.jpg`,
  'begonia-maculata': `${W}/0/0d/Begonia_maculata.jpg/500px-Begonia_maculata.jpg`,
  'orchid-phalaenopsis': `${W}/1/1d/Phalaenopsis_hybrid.jpg/500px-Phalaenopsis_hybrid.jpg`,
  'rhaphidophora-tetrasperma': `${W}/9/9a/Rhaphidophora_tetrasperma.jpg/500px-Rhaphidophora_tetrasperma.jpg`,
  'scindapsus-pictus': `${W}/5/5a/Scindapsus_pictus_%27Argyraeus%27.jpg/500px-Scindapsus_pictus_%27Argyraeus%27.jpg`,
  'syngonium-podophyllum': `${W}/8/8a/Syngonium_podophyllum.jpg/500px-Syngonium_podophyllum.jpg`,
  'stromanthe-triostar': `${W}/3/3e/Stromanthe_sanguinea_Triostar.jpg/500px-Stromanthe_sanguinea_Triostar.jpg`,
};

/** Variety-specific reference photos keyed by plantId → variety name */
export const varietyReferenceImages: Record<string, Record<string, string>> = {
  'monstera-deliciosa': {
    Standard: plantReferenceImages['monstera-deliciosa'],
    'Thai Constellation': `${W}/6/6a/Monstera_deliciosa_Thai_Constellation.jpg/500px-Monstera_deliciosa_Thai_Constellation.jpg`,
    'Albo Variegata': `${W}/3/3d/Monstera_deliciosa_variegata.jpg/500px-Monstera_deliciosa_variegata.jpg`,
    Aurea: `${W}/1/1b/Monstera_deliciosa_Aurea.jpg/500px-Monstera_deliciosa_Aurea.jpg`,
  },
  'monstera-dubia': {
    Green: plantReferenceImages['monstera-dubia'],
    Variegated: `${W}/8/8a/Monstera_dubia.jpg/500px-Monstera_dubia.jpg`,
  },
  'monstera-standleyana': {
    Green: `${W}/5/5e/Monstera_standleyana.jpg/500px-Monstera_standleyana.jpg`,
    'Albo Variegata': `${W}/a/a5/Monstera_standleyana_albo.jpg/500px-Monstera_standleyana_albo.jpg`,
    Aurea: `${W}/5/5e/Monstera_standleyana.jpg/500px-Monstera_standleyana.jpg`,
  },
  'philodendron-pink-princess': {
    'Pink Princess': plantReferenceImages['philodendron-pink-princess'],
    'Black Cardinal': `${W}/4/4e/Philodendron_Black_Cardinal.jpg/500px-Philodendron_Black_Cardinal.jpg`,
  },
  'philodendron-white-wizard': {
    'White Wizard': `${W}/8/8f/Philodendron_White_Wizard.jpg/500px-Philodendron_White_Wizard.jpg`,
    'White Knight': `${W}/7/7a/Philodendron_White_Knight.jpg/500px-Philodendron_White_Knight.jpg`,
    'White Princess': `${W}/6/6c/Philodendron_White_Princess.jpg/500px-Philodendron_White_Princess.jpg`,
  },
  'philodendron-florida-beauty': {
    'Florida Beauty': `${W}/2/2a/Philodendron_Florida_Beauty.jpg/500px-Philodendron_Florida_Beauty.jpg`,
    'Florida Ghost': `${W}/1/1f/Philodendron_Florida_Ghost.jpg/500px-Philodendron_Florida_Ghost.jpg`,
    'Florida Green': `${W}/3/3a/Philodendron_Florida_Green.jpg/500px-Philodendron_Florida_Green.jpg`,
  },
  'epipremnum-aureum': {
    'Golden Pothos': plantReferenceImages['epipremnum-aureum'],
    'Marble Queen': `${W}/2/2e/Epipremnum_aureum_Marble_Queen.jpg/500px-Epipremnum_aureum_Marble_Queen.jpg`,
    Njoy: `${W}/4/4a/Epipremnum_aureum_Njoy.jpg/500px-Epipremnum_aureum_Njoy.jpg`,
    Manjula: `${W}/5/5b/Epipremnum_aureum_Manjula.jpg/500px-Epipremnum_aureum_Manjula.jpg`,
  },
  'scindapsus-pictus': {
    Argyraeus: plantReferenceImages['scindapsus-pictus'],
    Exotica: `${W}/6/6d/Scindapsus_pictus_Exotica.jpg/500px-Scindapsus_pictus_Exotica.jpg`,
    'Silvery Ann': `${W}/5/5a/Scindapsus_pictus_%27Argyraeus%27.jpg/500px-Scindapsus_pictus_%27Argyraeus%27.jpg`,
  },
  'syngonium-albo': {
    Albo: `${W}/4/4b/Syngonium_podophyllum_albo.jpg/500px-Syngonium_podophyllum_albo.jpg`,
    Mojito: `${W}/3/3c/Syngonium_Mojito.jpg/500px-Syngonium_Mojito.jpg`,
    'Pink Splash': `${W}/5/5f/Syngonium_Pink_Splash.jpg/500px-Syngonium_Pink_Splash.jpg`,
  },
  'hoya-krimson-queen': {
    'Krimson Queen': `${W}/7/7e/Hoya_carnosa_Krimson_Queen.jpg/500px-Hoya_carnosa_Krimson_Queen.jpg`,
    'Krimson Princess': `${W}/6/6a/Hoya_carnosa_Krimson_Princess.jpg/500px-Hoya_carnosa_Krimson_Princess.jpg`,
    Tricolor: `${W}/8/8c/Hoya_carnosa_Tricolor.jpg/500px-Hoya_carnosa_Tricolor.jpg`,
  },
  'anthurium-crystallinum': {
    Standard: plantReferenceImages['anthurium-crystallinum'],
    'Dark form': `${W}/5/5e/Anthurium_crystallinum.jpg/500px-Anthurium_crystallinum.jpg`,
    'Silver blush': plantReferenceImages['anthurium-crystallinum'],
  },
  'aglaonema': {
    'Silver Bay': `${W}/4/4e/Aglaonema_Silver_Bay.jpg/500px-Aglaonema_Silver_Bay.jpg`,
    'Red Siam': `${W}/3/3a/Aglaonema_Red_Siam.jpg/500px-Aglaonema_Red_Siam.jpg`,
    'Pink Dalmatian': `${W}/5/5b/Aglaonema_Pink_Dalmatian.jpg/500px-Aglaonema_Pink_Dalmatian.jpg`,
  },
  'calathea-white-fusion': {
    'White Fusion': `${W}/2/2e/Calathea_White_Fusion.jpg/500px-Calathea_White_Fusion.jpg`,
  },
};

export function getPlantReferenceImage(plantId: string): string | null {
  return plantReferenceImages[plantId] ?? null;
}

export function getVarietyReferenceImage(
  plantId: string,
  varietyName: string
): string | null {
  const plantVarieties = varietyReferenceImages[plantId];
  if (plantVarieties?.[varietyName]) return plantVarieties[varietyName];
  return getPlantReferenceImage(plantId);
}
