export const PRODUCT_CATEGORIES = {
  FLAGS: "flags",
  JERSEYS: "jerseys",
};

export const SIZE_TYPES = {
  FLAGS: "flags",
  JERSEYS: "jerseys",
};

export const SIZE_CHARTS = {
  [SIZE_TYPES.JERSEYS]: [
    { code: "S", label: "S" },
    { code: "M", label: "M" },
    { code: "L", label: "L" },
    { code: "XL", label: "XL" },
    { code: "XXL", label: "XXL" },
  ],

  [SIZE_TYPES.FLAGS]: [
    { code: "2x3ft", label: "2 x 3 ft" },
    { code: "3x5ft", label: "3 x 5 ft" },
    { code: "4x6ft", label: "4 x 6 ft" },
  ],
};

export const WORLD_CUP_NATIONS = [
  "Argentina",
  "Australia",
  "Belgium",
  "Brazil",
  "Canada",
  "Colombia",
  "Croatia",
  "Denmark",
  "England",
  "France",
  "Germany",
  "Ghana",
  "Iran",
  "Italy",
  "Japan",
  "Mexico",
  "Morocco",
  "Netherlands",
  "Portugal",
  "Qatar",
  "Saudi Arabia",
  "Senegal",
  "South Korea",
  "Spain",
  "Switzerland",
  "Tunisia",
  "Uruguay",
  "USA",
  "Wales",
];

export const products = [
  {
    id: "flag-3pk",
    name: "3 Pack Flags",
    description: "Choose any 3 World Cup nation flags for your custom bundle.",
    price: 29.99,
    category: PRODUCT_CATEGORIES.FLAGS,
    type: "bundle",
    sizeType: SIZE_TYPES.FLAGS,
    bundleCount: 3,
    customBundle: true,
    image: "/flag-3pk.webp",
    fit: "cover",
    featured: true,

    gallery: [
      "/flag-3pk.webp",
      "/flags/bundle-back.webp",
      "/flags/bundle-close.webp",
      "/flags/flag-size-chart.webp",
    ],
  },

  {
    id: "flag-america",
    name: "America Flag",
    description: "Premium USA statement flag.",
    price: 14.99,
    category: PRODUCT_CATEGORIES.FLAGS,
    type: "single",
    sizeType: SIZE_TYPES.FLAGS,
    image: "/F1.webp",
    fit: "cover",
    featured: true,

    gallery: [
      "/F1.webp",
      "/flags/america-back.webp",
      "/flags/america-close.webp",
      "/flags/flag-size-chart.webp",
    ],
  },

  {
    id: "flag-canada",
    name: "Canada Flag",
    description: "Premium Canada statement flag.",
    price: 14.99,
    category: PRODUCT_CATEGORIES.FLAGS,
    type: "single",
    sizeType: SIZE_TYPES.FLAGS,
    image: "/F2.webp",
    fit: "cover",

    gallery: [
      "/F2.webp",
      "/flags/canada-back.webp",
      "/flags/canada-close.webp",
      "/flags/flag-size-chart.webp",
    ],
  },

  {
    id: "flag-mexico",
    name: "Mexico Flag",
    description: "Premium Mexico statement flag.",
    price: 14.99,
    category: PRODUCT_CATEGORIES.FLAGS,
    type: "single",
    sizeType: SIZE_TYPES.FLAGS,
    image: "/F3.webp",
    fit: "cover",

    gallery: [
      "/F3.webp",
      "/flags/mexico-back.webp",
      "/flags/mexico-close.webp",
      "/flags/flag-size-chart.webp",
    ],
  },

  {
    id: "jersey-brazil",
    name: "Brazil Jersey",
    description: "Premium Brazil football jersey.",
    price: 34.99,
    category: PRODUCT_CATEGORIES.JERSEYS,
    type: "jersey",
    sizeType: SIZE_TYPES.JERSEYS,
    image: "/J1.webp",
    fit: "cover",
    featured: true,

    gallery: [
      "/J1.webp",
      "/jerseys/brazil-back.webp",
      "/jerseys/brazil-close.webp",
      "/jerseys/jersey-size-chart.webp",
    ],
  },

  {
    id: "jersey-portugal",
    name: "Portugal Jersey",
    description: "Premium Portugal football jersey.",
    price: 34.99,
    category: PRODUCT_CATEGORIES.JERSEYS,
    type: "jersey",
    sizeType: SIZE_TYPES.JERSEYS,
    image: "/J2.webp",
    fit: "cover",

    gallery: [
      "/J2.webp",
      "/jerseys/portugal-back.webp",
      "/jerseys/portugal-close.webp",
      "/jerseys/jersey-size-chart.webp",
    ],
  },

  {
    id: "jersey-argentina",
    name: "Argentina Jersey",
    description: "Premium Argentina football jersey.",
    price: 34.99,
    category: PRODUCT_CATEGORIES.JERSEYS,
    type: "jersey",
    sizeType: SIZE_TYPES.JERSEYS,
    image: "/J3.webp",
    fit: "cover",
    featured: true,

    gallery: [
      "/J3.webp",
      "/jerseys/argentina-back.webp",
      "/jerseys/argentina-close.webp",
      "/jerseys/jersey-size-chart.webp",
    ],
  },
];
