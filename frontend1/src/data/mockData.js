export const MENU_DATA = {
  today: {
    mains: [
      {
        id: 1,
        name: "Grandma's Chicken Curry",
        image: "https://placehold.co/400x300/orange/white?text=Chicken+Curry",
        price: 12.99,
        isVeg: false,
        categoryId: 'mains',
        description: "Tender chicken cooked in slow-roasted spices."
      },
      {
        id: 4,
        name: "Baked Ocean Fillet",
        image: "https://placehold.co/400x300/blue/white?text=Fish+Fillet",
        price: 16.50,
        isVeg: false,
        categoryId: 'mains',
        description: "Flaky white fish baked with a lemon-zest crust."
      },
      {
        id: 5,
        name: "Paneer Butter Masala",
        image: "https://placehold.co/400x300/orange/white?text=Paneer",
        price: 11.00,
        isVeg: true,
        categoryId: 'mains',
        description: "Cottage cheese cubes in a rich tomato butter gravy."
      }
    ],
    sides: [
      {
        id: 2,
        name: "Garden Fresh Salad",
        image: "https://placehold.co/400x300/green/white?text=Salad",
        price: 8.50,
        isVeg: true,
        categoryId: 'sides',
        description: "Crispy lettuce, tomatoes, cucumbers with lemon dressing."
      },
      {
        id: 3,
        name: "Lentil Soup (Dal)",
        image: "https://placehold.co/400x300/yellow/black?text=Dal",
        price: 6.00,
        isVeg: true,
        categoryId: 'sides',
        description: "Hearty yellow lentils tempered with cumin and garlic."
      },
      {
        id: 12,
        name: "Cheesy Garlic Bread",
        image: "https://placehold.co/400x300/yellow/orange?text=Garlic+Bread",
        price: 5.50,
        isVeg: true,
        categoryId: 'sides',
        description: "Toasted baguette slices topped with mozzarella and herbs."
      },
      {
        id: 13,
        name: "Steamed Seasonal Veggies",
        image: "https://placehold.co/400x300/green/green?text=Veggies",
        price: 7.00,
        isVeg: true,
        categoryId: 'sides',
        description: "Lightly salted broccoli, carrots, and beans."
      },
      {
        id: 14,
        name: "Crispy Seasoned Fries",
        image: "https://placehold.co/400x300/orange/red?text=Fries",
        price: 4.50,
        isVeg: true,
        categoryId: 'sides',
        description: "Golden fries tossed in our signature spice blend."
      }
    ],
    desserts: [
      {
        id: 6,
        name: "Classic Apple Pie",
        image: "https://placehold.co/400x300/red/white?text=Apple+Pie",
        price: 7.50,
        isVeg: true,
        categoryId: 'desserts',
        description: "Warm apple slices with cinnamon in a flaky crust."
      },
      {
        id: 7,
        name: "Chocolate Fudge Brownie",
        image: "https://placehold.co/400x300/brown/white?text=Brownie",
        price: 6.00,
        isVeg: true,
        categoryId: 'desserts',
        description: "Decadent chocolate brownie served with vanilla ice cream."
      }
    ]
  },
  tomorrow: {
    mains: [
      {
        id: 8,
        name: "Beef Stew",
        image: "https://placehold.co/400x300/brown/white?text=Stew",
        price: 14.50,
        isVeg: false,
        categoryId: 'mains',
        description: "Slow-cooked beef with carrots and potatoes."
      },
      {
        id: 9,
        name: "Vegetable Stir Fry",
        image: "https://placehold.co/400x300/green/white?text=Stir+Fry",
        price: 10.50,
        isVeg: true,
        categoryId: 'mains',
        description: "Seasonal vegetables tossed in a sesame soy glaze."
      }
    ],
    sides: [
      {
        id: 10,
        name: "Garlic Bread",
        image: "https://placehold.co/400x300/yellow/black?text=Bread",
        price: 4.50,
        isVeg: true,
        categoryId: 'sides',
        description: "Toasted baguette slices with garlic butter and herbs."
      }
    ],
    desserts: [
      {
        id: 11,
        name: "Fruit Salad",
        image: "https://placehold.co/400x300/pink/white?text=Fruit+Salad",
        price: 5.50,
        isVeg: true,
        categoryId: 'desserts',
        description: "Mix of seasonal fresh fruits."
      }
    ]
  },
  nextDay: { mains: [], sides: [], desserts: [] }
};
