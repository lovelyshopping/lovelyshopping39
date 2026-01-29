// data/shipping.js
// Simple weight-based shipping bands (IDR)
export const shippingRules = [
  { maxWeight: 0.1, price: 15000 },
  { maxWeight: 0.5, price: 25000 },
  { maxWeight: 1.0, price: 35000 },
  { maxWeight: 3.0, price: 65000 },
  { maxWeight: 9999, price: 120000 }
];

export function estimateShipping(weightKg) {
  const w = Number(weightKg) || 0;
  const r = shippingRules.find(rule => w <= rule.maxWeight);
  return r ? r.price : shippingRules[shippingRules.length - 1].price;
}
