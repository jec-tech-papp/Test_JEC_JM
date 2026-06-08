import type { Substrate } from '../types';

export const substrates: Substrate[] = [
  {
    id: 'universal',
    nameEn: 'Universal potting soil',
    nameFr: 'Terreau universel',
    waterRetention: 'medium',
    fertilizerFactor: 1.0,
    descriptionEn: 'Standard indoor potting mix, balanced retention.',
    descriptionFr: 'Terreau standard, rétention équilibrée.',
  },
  {
    id: 'aroid',
    nameEn: 'Aroid mix (soil + perlite + bark)',
    nameFr: 'Mix aroïdes (terreau + perlite + écorce)',
    waterRetention: 'low',
    fertilizerFactor: 0.85,
    descriptionEn: 'Well-draining mix for Monstera, Philodendron, etc.',
    descriptionFr: 'Substrat drainant pour Monstera, Philodendron, etc.',
  },
  {
    id: 'cactus',
    nameEn: 'Cactus & succulent mix',
    nameFr: 'Terreau cactées & succulentes',
    waterRetention: 'low',
    fertilizerFactor: 0.7,
    descriptionEn: 'Very draining, low nutrient retention.',
    descriptionFr: 'Très drainant, faible rétention nutritive.',
  },
  {
    id: 'orchid_bark',
    nameEn: 'Orchid bark',
    nameFr: 'Écorce pour orchidées',
    waterRetention: 'low',
    fertilizerFactor: 0.75,
    descriptionEn: 'Chunky bark for epiphytic plants.',
    descriptionFr: 'Écorce grossière pour plantes épiphytes.',
  },
  {
    id: 'coco',
    nameEn: 'Coco coir',
    nameFr: 'Fibre de coco',
    waterRetention: 'high',
    fertilizerFactor: 1.1,
    descriptionEn: 'Retains moisture, may need extra calcium/magnesium.',
    descriptionFr: 'Retient l\'humidité, peut nécessiter du Ca/Mg.',
  },
  {
    id: 'sphagnum',
    nameEn: 'Sphagnum moss',
    nameFr: 'Mousse de sphaigne',
    waterRetention: 'high',
    fertilizerFactor: 0.9,
    descriptionEn: 'High moisture, use diluted fertilizer.',
    descriptionFr: 'Forte humidité, engrais dilué recommandé.',
  },
  {
    id: 'leca',
    nameEn: 'LECA (clay balls)',
    nameFr: 'Billes d\'argile (LECA)',
    waterRetention: 'low',
    fertilizerFactor: 1.0,
    descriptionEn: 'Semi-hydroponic, nutrients in water only.',
    descriptionFr: 'Semi-hydroponie, nutriments dans l\'eau uniquement.',
  },
  {
    id: 'peat',
    nameEn: 'Peat-based mix',
    nameFr: 'Terreau tourbeux',
    waterRetention: 'high',
    fertilizerFactor: 1.15,
    descriptionEn: 'Acidic, retains nutrients well.',
    descriptionFr: 'Acide, retient bien les nutriments.',
  },
];

export function getSubstrate(id: string): Substrate | undefined {
  return substrates.find((s) => s.id === id);
}
