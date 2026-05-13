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
    image: "/flag-3pk.png",
    fit: "cover",
    featured: true,

    gallery: [
      "/flag-3pk.png",
      "/flags/bundle-back.png",
      "/flags/bundle-close.png",
      "/flags/flag-size-chart.png",
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
    image: "/F1.png",
    fit: "cover",
    featured: true,

    gallery: [
      "/F1.png",
      "/flags/america-back.png",
      "/flags/america-close.png",
      "/flags/flag-size-chart.png",
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
    image: "/F2.png",
    fit: "cover",

    gallery: [
      "/F2.png",
      "/flags/canada-back.png",
      "/flags/canada-close.png",
      "/flags/flag-size-chart.png",
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
    image: "/F3.png",
    fit: "cover",

    gallery: [
      "/F3.png",
      "/flags/mexico-back.png",
      "/flags/mexico-close.png",
      "/flags/flag-size-chart.png",
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
    image: "/J1.png",
    fit: "cover",
    featured: true,

    gallery: [
      "/J1.png",
      "/jerseys/brazil-back.png",
      "/jerseys/brazil-close.png",
      "/jerseys/jersey-size-chart.png",
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
    image: "/J2.png",
    fit: "cover",

    gallery: [
      "/J2.png",
      "/jerseys/portugal-back.png",
      "/jerseys/portugal-close.png",
      "/jerseys/jersey-size-chart.png",
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
    image: "/J3.png",
    fit: "cover",
    featured: true,

    gallery: [
      "/J3.png",
      "/jerseys/argentina-back.png",
      "/jerseys/argentina-close.png",
      "/jerseys/jersey-size-chart.png",
    ],
  },
];