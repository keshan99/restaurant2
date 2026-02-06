# 🍽️ The Family Table - Restaurant Management System

A modern, full-stack restaurant management application with an intuitive admin panel and beautiful customer-facing interface. Built with React, Node.js, and PostgreSQL.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## ✨ Features

### 🎯 Customer Features
- **Dynamic Menu Display** - View menus by date (today, tomorrow, next day)
- **Deals & Promos** - Browse special bundles and discounted packages
- **Rich Food Information** - Images, descriptions, dietary info, spice levels, tags
- **Table Booking** - Easy reservation system
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Dark Mode Support** - Comfortable viewing in any lighting

### 👨‍💼 Admin Features
- **Food Library** - Central repository for all dishes with tags and attributes
- **Default Menu Management** - Set your everyday menu with drag-and-drop reordering
- **Special Date Menus** - Create custom menus for specific dates (holidays, events)
- **Deals & Promos Management** - Create bundles with multiple items at discounted prices
- **Discount Management** - Apply percentage or fixed-amount discounts to individual items
- **Drag-and-Drop Ordering** - Intuitive reordering with auto-sync every 5 seconds
- **Real-time Sync Status** - Visual indicator showing sync status in top-right corner

### 🎨 Technical Highlights
- **Optimistic UI Updates** - Instant feedback when dragging items
- **Batched Database Sync** - Efficient updates every 5 seconds
- **Modern UI/UX** - Beautiful design with smooth animations
- **Type-safe API** - Consistent REST API structure
- **Scalable Architecture** - Clean separation of concerns

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL database (Supabase recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd restaurant/2
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env and add your DATABASE_URL
   
   # Run migrations
   node migrate_schema.js
   node migrate_discounts.js
   node migrate_deals.js
   
   # (Optional) Seed sample data
   node seed_new_schema.js
   
   # Start backend server
   npm start
   # Server runs on http://localhost:3000
   ```

3. **Frontend Setup**
   ```bash
   cd frontend1
   npm install
   
   # Start development server
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

4. **Access the Application**
   - Customer: http://localhost:5173
   - Admin: http://localhost:5173/admin

## 📁 Project Structure

```
restaurant/2/
├── backend/
│   ├── db.js                 # Database connection & pool
│   ├── server.js             # Express API server
│   ├── migrate_schema.js     # Initial schema migration
│   ├── migrate_discounts.js # Discount feature migration
│   ├── migrate_deals.js      # Deals feature migration
│   ├── seed_new_schema.js    # Sample data seeder
│   ├── .env                  # Environment variables (not in git)
│   └── package.json
│
├── frontend1/
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── CustomerHome.jsx
│   │   │   ├── CustomerDeals.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminDefaultMenu.jsx
│   │   │   ├── AdminSpecialDate.jsx
│   │   │   ├── AdminDeals.jsx
│   │   │   └── AdminFoodLibrary.jsx
│   │   ├── components/       # Reusable components
│   │   │   ├── Header.jsx
│   │   │   ├── MenuCard.jsx
│   │   │   └── MenuList.jsx
│   │   └── App.jsx           # Main app component
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🗄️ Database Schema

### Core Tables
- **food_items** - Master library of all dishes
- **menus** - Date-specific menu configurations
- **menu_food_items** - Junction table linking items to menus (with discounts & ordering)
- **deals** - Promotional bundles
- **deal_items** - Items included in deals
- **bookings** - Customer reservations

### Key Features
- **Display Ordering** - Custom order per menu via `display_order`
- **Discounts** - Per-item discounts (percentage or fixed amount)
- **Tags & Attributes** - Vegetarian, spice level, special tags
- **Date-based Menus** - Default menu + special date menus

## 🔌 API Endpoints

### Menus
- `GET /api/menus?date=YYYY-MM-DD` - Get menu for specific date
- `GET /api/menus/default` - Get default menu
- `POST /api/menus/default/items` - Add item to default menu
- `PATCH /api/menus/default/reorder` - Reorder default menu items
- `POST /api/menus` - Create/update special date menu

### Food Items
- `GET /api/food-items` - List all food items
- `POST /api/food-items` - Create new food item
- `PUT /api/food-items/:id` - Update food item
- `DELETE /api/food-items/:id` - Delete food item

### Deals
- `GET /api/deals?active=true` - List active deals
- `POST /api/deals` - Create new deal
- `PUT /api/deals/:id` - Update deal
- `PATCH /api/deals/:id/reorder` - Reorder deal items
- `DELETE /api/deals/:id` - Delete deal

### Bookings
- `POST /api/bookings` - Create new booking

## 🛠️ Development

### Backend Scripts
```bash
cd backend
node server.js          # Start server
node migrate_schema.js  # Run migrations
node seed_new_schema.js # Seed data
```

### Frontend Scripts
```bash
cd frontend1
npm run dev     # Development server
npm run build   # Production build
npm run lint    # Lint code
npm run preview # Preview production build
```

## 🔒 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3000
POOL_MAX=10
```

## 📝 Migration Guide

If you're setting up a fresh database:

1. Run `migrate_schema.js` - Creates core tables
2. Run `migrate_discounts.js` - Adds discount columns
3. Run `migrate_deals.js` - Creates deals tables
4. (Optional) Run `seed_new_schema.js` - Adds sample data

## 🎯 Key Features Explained

### Drag-and-Drop Ordering
- Items move instantly (optimistic updates)
- Changes sync to database every 5 seconds
- Visual sync indicator in top-right corner
- Manual sync button available

### Discount System
- Apply discounts when adding items to menus
- Edit discounts on existing menu items
- Supports percentage (%) or fixed amount ($)
- Automatically calculates and displays discounted prices

### Deals & Promos
- Create bundles with multiple food items
- Set bundle price (automatically calculates savings)
- Drag-and-drop to reorder items within deals
- Activate/deactivate deals easily

## 🐛 Troubleshooting

### Database Connection Issues
- Check `.env` file has correct `DATABASE_URL`
- Ensure Supabase project is active (not paused)
- Verify internet connection

### Menu Not Showing
- Run migrations: `node migrate_schema.js`
- Seed data: `node seed_new_schema.js`
- Check browser console for errors

### Drag-and-Drop Not Working
- Check browser console for errors
- Ensure you're dragging from the grip icon (⋮⋮)
- Verify sync status indicator shows "pending" or "syncing"

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work*

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for beautiful styling
- Supabase for PostgreSQL hosting
- @dnd-kit for drag-and-drop functionality

## 📧 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Made with ❤️ for restaurants everywhere**
