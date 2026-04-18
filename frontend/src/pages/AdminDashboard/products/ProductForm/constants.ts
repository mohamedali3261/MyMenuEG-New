export const DIMENSION_PRESET_MAP: Record<string, { ar: string; en: string }> = {
  cup_4oz: { ar: 'قطر 6 سم × ارتفاع 6 سم (4 أونصة)', en: '6 cm diameter × 6 cm height (4 oz)' },
  cup_8oz: { ar: 'قطر 8 سم × ارتفاع 9 سم (8 أونصة)', en: '8 cm diameter × 9 cm height (8 oz)' },
  cup_12oz: { ar: 'قطر 9 سم × ارتفاع 11 سم (12 أونصة)', en: '9 cm diameter × 11 cm height (12 oz)' },
  cup_16oz: { ar: 'قطر 9.5 سم × ارتفاع 13 سم (16 أونصة)', en: '9.5 cm diameter × 13 cm height (16 oz)' },
  cup_22oz: { ar: 'قطر 9.8 سم × ارتفاع 16 سم (22 أونصة)', en: '9.8 cm diameter × 16 cm height (22 oz)' },
  cup_32oz: { ar: 'قطر 10.5 سم × ارتفاع 17.5 سم (32 أونصة)', en: '10.5 cm diameter × 17.5 cm height (32 oz)' },
  box_small: { ar: '20 × 15 × 8 سم', en: '20 × 15 × 8 cm' },
  box_medium: { ar: '25 × 20 × 10 سم', en: '25 × 20 × 10 cm' },
  box_large: { ar: '30 × 25 × 12 سم', en: '30 × 25 × 12 cm' },
  box_xl: { ar: '35 × 30 × 14 سم', en: '35 × 30 × 14 cm' },
  bag_small: { ar: '18 × 10 × 25 سم', en: '18 × 10 × 25 cm' },
  bag_medium: { ar: '24 × 12 × 32 سم', en: '24 × 12 × 32 cm' },
  bag_large: { ar: '32 × 14 × 40 سم', en: '32 × 14 × 40 cm' },
  lid_80mm: { ar: 'قطر 80 مم', en: '80 mm diameter' },
  lid_90mm: { ar: 'قطر 90 مم', en: '90 mm diameter' },
  sleeve_standard: { ar: '12 × 6 سم', en: '12 × 6 cm' }
};

export const DIMENSIONS_PRESET_OPTIONS = [
  { value: '', labelAr: '-- اكتب أبعاد مخصصة --', labelEn: '-- Custom dimensions --' },
  ...Object.keys(DIMENSION_PRESET_MAP).map(key => ({
    value: key,
    labelAr: DIMENSION_PRESET_MAP[key].ar,
    labelEn: DIMENSION_PRESET_MAP[key].en
  }))
];
