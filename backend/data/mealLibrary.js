// Indian-focused meal library. Each meal is tagged with a slot, a dietType,
// and per-serving macros. The plan engine filters by the user's preference,
// rotates for variety across 7 days, and applies a per-day portion factor so
// the day total lands on the calorie target.
//
// dietType: 'vegan' | 'veg' (lacto-veg, contains dairy) | 'egg' | 'nonveg'
// macros: kcal, p (protein g), c (carbs g), f (fat g) per serving

const MEALS = [
  // ================= BREAKFAST =================
  { id: 'b_poha', name: 'Vegetable Poha', slot: 'breakfast', dietType: 'vegan', kcal: 350, p: 8, c: 60, f: 8 },
  { id: 'b_upma', name: 'Vegetable Upma', slot: 'breakfast', dietType: 'vegan', kcal: 320, p: 9, c: 52, f: 9 },
  { id: 'b_masala_oats', name: 'Masala Oats', slot: 'breakfast', dietType: 'vegan', kcal: 300, p: 10, c: 50, f: 6 },
  { id: 'b_besan_chilla', name: 'Besan Chilla (2)', slot: 'breakfast', dietType: 'vegan', kcal: 320, p: 15, c: 35, f: 12 },
  { id: 'b_moong_chilla', name: 'Moong Dal Chilla (2)', slot: 'breakfast', dietType: 'vegan', kcal: 340, p: 16, c: 40, f: 12 },
  { id: 'b_pb_toast', name: 'Banana + Peanut Butter Toast', slot: 'breakfast', dietType: 'vegan', kcal: 420, p: 12, c: 58, f: 16 },
  { id: 'b_idli', name: 'Idli (4) + Sambar', slot: 'breakfast', dietType: 'veg', kcal: 400, p: 12, c: 72, f: 6 },
  { id: 'b_paneer_paratha', name: 'Paneer Paratha + Curd', slot: 'breakfast', dietType: 'veg', kcal: 480, p: 20, c: 50, f: 22 },
  { id: 'b_egg_bhurji', name: 'Egg Bhurji + 2 Roti', slot: 'breakfast', dietType: 'egg', kcal: 450, p: 24, c: 45, f: 18 },
  { id: 'b_omelette', name: '3-Egg Omelette + Toast', slot: 'breakfast', dietType: 'egg', kcal: 380, p: 24, c: 28, f: 18 },

  // ================= LUNCH =================
  { id: 'l_rajma', name: 'Rajma Chawal', slot: 'lunch', dietType: 'vegan', kcal: 600, p: 22, c: 95, f: 12 },
  { id: 'l_chole', name: 'Chole + 2 Roti', slot: 'lunch', dietType: 'vegan', kcal: 560, p: 22, c: 78, f: 16 },
  { id: 'l_dal_sabzi', name: '2 Roti + Dal + Sabzi + Salad', slot: 'lunch', dietType: 'vegan', kcal: 550, p: 20, c: 80, f: 14 },
  { id: 'l_tofu', name: 'Tofu Bhurji + 2 Roti', slot: 'lunch', dietType: 'vegan', kcal: 500, p: 26, c: 55, f: 18 },
  { id: 'l_khichdi', name: 'Dal Khichdi + Curd', slot: 'lunch', dietType: 'veg', kcal: 520, p: 18, c: 82, f: 12 },
  { id: 'l_paneer', name: 'Paneer Curry + Rice', slot: 'lunch', dietType: 'veg', kcal: 620, p: 26, c: 70, f: 24 },
  { id: 'l_chicken_rice', name: 'Chicken Curry + Rice', slot: 'lunch', dietType: 'nonveg', kcal: 650, p: 42, c: 68, f: 20 },
  { id: 'l_grilled_chicken', name: 'Grilled Chicken + 2 Roti + Salad', slot: 'lunch', dietType: 'nonveg', kcal: 560, p: 48, c: 40, f: 20 },
  { id: 'l_fish', name: 'Fish Curry + Rice', slot: 'lunch', dietType: 'nonveg', kcal: 580, p: 40, c: 62, f: 16 },

  // ================= SNACK =================
  { id: 's_chana', name: 'Roasted Chana', slot: 'snack', dietType: 'vegan', kcal: 180, p: 10, c: 28, f: 4 },
  { id: 's_sprouts', name: 'Sprouts Salad', slot: 'snack', dietType: 'vegan', kcal: 160, p: 12, c: 22, f: 3 },
  { id: 's_pb_apple', name: 'Apple + Peanut Butter', slot: 'snack', dietType: 'vegan', kcal: 240, p: 8, c: 30, f: 12 },
  { id: 's_fruit', name: 'Fruit Bowl', slot: 'snack', dietType: 'vegan', kcal: 150, p: 3, c: 36, f: 1 },
  { id: 's_yogurt', name: 'Greek Yogurt + Fruit', slot: 'snack', dietType: 'veg', kcal: 200, p: 16, c: 22, f: 4 },
  { id: 's_buttermilk_nuts', name: 'Buttermilk + Handful of Nuts', slot: 'snack', dietType: 'veg', kcal: 220, p: 8, c: 14, f: 16 },
  { id: 's_shake', name: 'Whey Protein Shake', slot: 'snack', dietType: 'veg', kcal: 150, p: 25, c: 6, f: 2 },
  { id: 's_eggs', name: 'Boiled Eggs (2)', slot: 'snack', dietType: 'egg', kcal: 160, p: 12, c: 2, f: 11 },

  // ================= DINNER =================
  { id: 'd_dal_rice', name: 'Dal + Rice + Salad', slot: 'dinner', dietType: 'vegan', kcal: 500, p: 20, c: 78, f: 10 },
  { id: 'd_mixed_veg', name: 'Mixed Veg Curry + 2 Roti', slot: 'dinner', dietType: 'vegan', kcal: 460, p: 16, c: 62, f: 14 },
  { id: 'd_tofu_stir', name: 'Veg Soup + Tofu Stir-fry', slot: 'dinner', dietType: 'vegan', kcal: 420, p: 24, c: 38, f: 16 },
  { id: 'd_moong_roti', name: 'Moong Dal + 2 Roti + Curd', slot: 'dinner', dietType: 'veg', kcal: 480, p: 22, c: 60, f: 12 },
  { id: 'd_paneer', name: '2 Roti + Paneer Sabzi + Salad', slot: 'dinner', dietType: 'veg', kcal: 520, p: 24, c: 50, f: 22 },
  { id: 'd_egg_curry', name: 'Egg Curry + 2 Roti', slot: 'dinner', dietType: 'egg', kcal: 500, p: 24, c: 48, f: 22 },
  { id: 'd_grilled_chicken', name: 'Grilled Chicken + Veg', slot: 'dinner', dietType: 'nonveg', kcal: 480, p: 46, c: 20, f: 22 },
  { id: 'd_fish_quinoa', name: 'Fish + Quinoa + Veg', slot: 'dinner', dietType: 'nonveg', kcal: 520, p: 42, c: 46, f: 18 }
];

// Preference -> allowed dietTypes (widening inclusion).
const DIET_ALLOWS = {
  vegan: ['vegan'],
  veg: ['vegan', 'veg'],
  egg: ['vegan', 'veg', 'egg'],
  nonveg: ['vegan', 'veg', 'egg', 'nonveg']
};

module.exports = { MEALS, DIET_ALLOWS };
