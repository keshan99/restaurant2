const db = require('./db');

// Mock Data structure in frontend is nested (today.mains, today.sides), we need to flatten it for DB insertion
// Note: We need to manually replicate/import the data since we can't easily require ES modules from frontend in CommonJS backend without setup.
// So I will redefine the seed data here based on the mockData content.

const SEED_MENU = [
  // TODAY MAINS
  { name: "Grandma's Chicken Curry", category: 'mains', price: 12.99, is_veg: false, image: "http://localhost:3000/photos/chicken_curry.jpg", description: "Tender chicken cooked in slow-roasted spices.", available_day: 'today' },
  { name: "Baked Ocean Fillet", category: 'mains', price: 16.50, is_veg: false, image: "http://localhost:3000/photos/fish_fillet.jpg", description: "Flaky white fish baked with a lemon-zest crust.", available_day: 'today' },
  { name: "Paneer Butter Masala", category: 'mains', price: 11.00, is_veg: true, image: "http://localhost:3000/photos/paneer_masala.jpg", description: "Cottage cheese cubes in a rich tomato butter gravy.", available_day: 'today' },
  // TODAY SIDES
  { name: "Garden Fresh Salad", category: 'sides', price: 8.50, is_veg: true, image: "http://localhost:3000/photos/garden_salad.jpg", description: "Crispy lettuce, tomatoes, cucumbers with lemon dressing.", available_day: 'today' },
  { name: "Lentil Soup (Dal)", category: 'sides', price: 6.00, is_veg: true, image: "http://localhost:3000/photos/lentil_soup.jpg", description: "Hearty yellow lentils tempered with cumin and garlic.", available_day: 'today' },
  { name: "Cheesy Garlic Bread", category: 'sides', price: 5.50, is_veg: true, image: "http://localhost:3000/photos/garlic_bread.jpg", description: "Toasted baguette slices topped with mozzarella and herbs.", available_day: 'today' },
  { name: "Steamed Seasonal Veggies", category: 'sides', price: 7.00, is_veg: true, image: "http://localhost:3000/photos/steamed_veggies.jpg", description: "Lightly salted broccoli, carrots, and beans.", available_day: 'today' },
  { name: "Crispy Seasoned Fries", category: 'sides', price: 4.50, is_veg: true, image: "http://localhost:3000/photos/french_fries.jpg", description: "Golden fries tossed in our signature spice blend.", available_day: 'today' },
  // TODAY MAINS - PREMIUM ADDITIONS
  { name: "Grilled Salmon", category: 'mains', price: 18.99, is_veg: false, image: "http://localhost:3000/photos/grilled_salmon.png", description: "Fresh Atlantic salmon grilled to perfection with lemon butter sauce.", available_day: 'today' },
  { name: "Pasta Carbonara", category: 'mains', price: 14.99, is_veg: false, image: "http://localhost:3000/photos/pasta_carbonara.png", description: "Creamy Italian pasta with pancetta, eggs, and parmesan cheese.", available_day: 'today' },
  // TODAY SIDES - PREMIUM ADDITIONS
  { name: "Caesar Salad", category: 'sides', price: 9.50, is_veg: true, image: "http://localhost:3000/photos/caesar_salad.png", description: "Crisp romaine lettuce with classic Caesar dressing, croutons, and parmesan.", available_day: 'today' },
  // TODAY DESSERTS
  { name: "Chocolate Lava Cake", category: 'desserts', price: 8.50, is_veg: true, image: "http://localhost:3000/photos/chocolate_lava_cake.png", description: "Rich chocolate cake with a molten center, served warm with vanilla ice cream.", available_day: 'today' },
  { name: "Classic Apple Pie", category: 'desserts', price: 7.50, is_veg: true, image: "http://localhost:3000/photos/apple_pie.jpg", description: "Warm apple slices with cinnamon in a flaky crust.", available_day: 'today' },
  { name: "Chocolate Fudge Brownie", category: 'desserts', price: 6.00, is_veg: true, image: "http://localhost:3000/photos/brownie.jpg", description: "Decadent chocolate brownie served with vanilla ice cream.", available_day: 'today' },

  // TOMORROW MAINS
  { name: "Beef Stew", category: 'mains', price: 14.50, is_veg: false, image: "http://localhost:3000/photos/beef_stew.jpg", description: "Slow-cooked beef with carrots and potatoes.", available_day: 'tomorrow' },
  { name: "Vegetable Stir Fry", category: 'mains', price: 10.50, is_veg: true, image: "http://localhost:3000/photos/stir_fry.jpg", description: "Seasonal vegetables tossed in a sesame soy glaze.", available_day: 'tomorrow' },
  // TOMORROW SIDES
  { name: "Garlic Bread", category: 'sides', price: 4.50, is_veg: true, image: "http://localhost:3000/photos/garlic_bread.jpg", description: "Toasted baguette slices with garlic butter and herbs.", available_day: 'tomorrow' },
  // TOMORROW DESSERTS
  { name: "Fruit Salad", category: 'desserts', price: 5.50, is_veg: true, image: "http://localhost:3000/photos/fruit_salad.jpg", description: "Mix of seasonal fresh fruits.", available_day: 'tomorrow' }
];

const createTables = async () => {
  try {
    // 1. Create Menu Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        is_veg BOOLEAN DEFAULT false,
        image TEXT,
        available_day VARCHAR(20) DEFAULT 'today'
      );
    `);
    console.log("Created menu_items table.");

    // 2. Create Bookings Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        date DATE NOT NULL,
        time VARCHAR(20) NOT NULL,
        guests INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created bookings table.");

    // 3. Clear existing menu items (to avoid duplicates on re-run)
    await db.query('TRUNCATE TABLE menu_items RESTART IDENTITY');
    console.log("Cleared existing menu items.");

    // 4. Insert Seed Data
    const insertQuery = `
      INSERT INTO menu_items (name, category, price, is_veg, image, description, available_day)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    for (const item of SEED_MENU) {
      await db.query(insertQuery, [
        item.name,
        item.category,
        item.price,
        item.is_veg,
        item.image,
        item.description,
        item.available_day
      ]);
    }
    console.log(`Seeded ${SEED_MENU.length} menu items.`);

  } catch (err) {
    console.error("Error setting up database:", err);
  }
};

createTables();
