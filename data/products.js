// data/products.js
// Single source of truth for products. Edit only this file to add/update products.
// price in IDR, weight in kg, image path relative to repo root, video is YouTube embed URL or null.
export const products = [
  {
    id: "poke-001",
    name: "Pikachu Plush (Small)",
    category: "plush",
    price: 175000,
    weight: 0.35,
    image: "assets/images/pikachu.jpg",
    video: "https://www.youtube.com/embed/VIDEO_ID_A",
    description: "Cute small Pikachu plush — official-looking, perfect as a gift.",
    active: true
  },
  {
    id: "onepiece-luffy",
    name: "Luffy Figure (15cm)",
    category: "figures",
    price: 450000,
    weight: 0.9,
    image: "assets/images/luffy.jpg",
    video: null,
    description: "High-quality PVC Luffy figure with detailed paint.",
    active: true
  },
  {
    id: "poke-002",
    name: "Eevee Keychain",
    category: "accessories",
    price: 45000,
    weight: 0.05,
    image: "assets/images/eevee-keychain.jpg",
    video: null,
    description: "Soft enamel keychain, kawaii Eevee charm.",
    active: true
  },
  {
    id: "onepiece-fig-mini",
    name: "Chibi Figure Set",
    category: "onepiece",
    price: 220000,
    weight: 0.4,
    image: "assets/images/chibi-set.jpg",
    video: null,
    description: "Cute chibi figure trio from One Piece.",
    active: true
  }
];
