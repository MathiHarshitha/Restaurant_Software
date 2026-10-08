// Initial menu for Connect Dhaba.
// `popularity` only drives the demo sales generator — it is not stored on the item.
// `qty` picks the typical quantity profile per line (see demoDataGenerator).

export const MENU_SEED = [
  // Biryani
  { name: 'Chicken Biryani', category: 'Biryani', price: 220, isVeg: false, popularity: 14, qty: 'main' },
  { name: 'Mutton Biryani', category: 'Biryani', price: 280, isVeg: false, popularity: 5, qty: 'main' },
  { name: 'Veg Biryani', category: 'Biryani', price: 180, isVeg: true, popularity: 7, qty: 'main' },
  { name: 'Egg Biryani', category: 'Biryani', price: 170, isVeg: false, popularity: 3, qty: 'main' },
  { name: 'Chicken Fry Piece Biryani', category: 'Biryani', price: 250, isVeg: false, popularity: 4, qty: 'main' },
  { name: 'Paneer Biryani', category: 'Biryani', price: 200, isVeg: true, popularity: 2.5, qty: 'main' },

  // Starters
  { name: 'Chicken 65', category: 'Starters', price: 180, isVeg: false, popularity: 9, qty: 'main' },
  { name: 'Paneer 65', category: 'Starters', price: 160, isVeg: true, popularity: 3.5, qty: 'main' },
  { name: 'Chilli Chicken', category: 'Starters', price: 200, isVeg: false, popularity: 4, qty: 'main' },
  { name: 'Gobi Manchurian', category: 'Starters', price: 140, isVeg: true, popularity: 3, qty: 'main' },
  { name: 'Apollo Fish', category: 'Starters', price: 240, isVeg: false, popularity: 2.5, qty: 'main' },
  { name: 'Chicken Lollipop', category: 'Starters', price: 210, isVeg: false, popularity: 3, qty: 'main' },
  { name: 'Mushroom Pepper Fry', category: 'Starters', price: 170, isVeg: true, popularity: 2, qty: 'main' },

  // Main Course
  { name: 'Butter Chicken', category: 'Main Course', price: 240, isVeg: false, popularity: 3.5, qty: 'main' },
  { name: 'Kadai Paneer', category: 'Main Course', price: 200, isVeg: true, popularity: 2.5, qty: 'main' },
  { name: 'Dal Tadka', category: 'Main Course', price: 140, isVeg: true, popularity: 2, qty: 'main' },
  { name: 'Chicken Curry', category: 'Main Course', price: 220, isVeg: false, popularity: 2.5, qty: 'main' },
  { name: 'Mutton Curry', category: 'Main Course', price: 290, isVeg: false, popularity: 2, qty: 'main' },
  { name: 'Butter Naan', category: 'Main Course', price: 40, isVeg: true, popularity: 1.8, qty: 'bread' },
  { name: 'Tandoori Roti', category: 'Main Course', price: 25, isVeg: true, popularity: 1.3, qty: 'bread' },
  { name: 'Jeera Rice', category: 'Main Course', price: 120, isVeg: true, popularity: 2, qty: 'main' },

  // Fried Rice & Noodles
  { name: 'Chicken Fried Rice', category: 'Fried Rice', price: 180, isVeg: false, popularity: 6.5, qty: 'main' },
  { name: 'Veg Fried Rice', category: 'Fried Rice', price: 150, isVeg: true, popularity: 3.5, qty: 'main' },
  { name: 'Egg Fried Rice', category: 'Fried Rice', price: 160, isVeg: false, popularity: 2.5, qty: 'main' },
  { name: 'Schezwan Chicken Fried Rice', category: 'Fried Rice', price: 200, isVeg: false, popularity: 2.5, qty: 'main' },
  { name: 'Veg Noodles', category: 'Fried Rice', price: 140, isVeg: true, popularity: 2, qty: 'main' },
  { name: 'Chicken Noodles', category: 'Fried Rice', price: 170, isVeg: false, popularity: 2.5, qty: 'main' },

  // Snacks
  { name: 'Chicken Roll', category: 'Snacks', price: 140, isVeg: false, popularity: 2, qty: 'main' },
  { name: 'Paneer Roll', category: 'Snacks', price: 120, isVeg: true, popularity: 0.75, qty: 'main' },
  { name: 'Veg Sandwich', category: 'Snacks', price: 90, isVeg: true, popularity: 1, qty: 'main' },

  // Beverages
  { name: 'Coke', category: 'Beverages', price: 40, isVeg: true, popularity: 4, qty: 'drink' },
  { name: 'Sprite', category: 'Beverages', price: 40, isVeg: true, popularity: 3, qty: 'drink' },
  { name: 'Fresh Lime Soda', category: 'Beverages', price: 60, isVeg: true, popularity: 2.6, qty: 'drink' },
  { name: 'Mineral Water', category: 'Beverages', price: 20, isVeg: true, popularity: 3, qty: 'drink' },
  { name: 'Sweet Lassi', category: 'Beverages', price: 70, isVeg: true, popularity: 1.8, qty: 'drink' },
  { name: 'Masala Chai', category: 'Beverages', price: 25, isVeg: true, popularity: 1.6, qty: 'drink' },
  { name: 'Lemon Tea', category: 'Beverages', price: 30, isVeg: true, popularity: 0.72, qty: 'drink' },

  // Desserts
  { name: 'Ice Cream', category: 'Desserts', price: 80, isVeg: true, popularity: 2.5, qty: 'main' },
  { name: 'Gulab Jamun', category: 'Desserts', price: 60, isVeg: true, popularity: 2, qty: 'main' },
  { name: 'Double Ka Meetha', category: 'Desserts', price: 90, isVeg: true, popularity: 2, qty: 'main' },
  { name: 'Qubani Ka Meetha', category: 'Desserts', price: 110, isVeg: true, popularity: 2, qty: 'main' },
];

export const RESTAURANT_SEED = {
  name: 'Connect Family Restaurant & Dhaba',
  tagline: 'Pure taste. Real flavour.',
  address: '12-2-417, Main Road, Ameerpet, Hyderabad 500016',
  phone: '040 2374 5566',
  gstin: '36AABFS4821K1Z5',
  receiptFooter: 'Thank You. Visit Again. — Connect Dhaba',
};
