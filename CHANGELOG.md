# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-02-05

### Added
- Initial release of The Family Table restaurant management system
- Food Library management system
- Default menu with drag-and-drop reordering
- Special date menu functionality
- Deals & Promos feature
- Discount system (percentage and fixed amount)
- Customer-facing menu display
- Table booking system
- Admin dashboard
- Responsive design with dark mode support
- Optimistic UI updates with batched database sync
- Real-time sync status indicator

### Features
- **Food Library**: Central repository for all dishes with tags, attributes, and images
- **Menu Management**: Default menu and date-specific menus with custom ordering
- **Deals System**: Create promotional bundles with multiple items
- **Discounts**: Apply discounts to individual menu items
- **Drag-and-Drop**: Intuitive reordering with auto-sync every 5 seconds
- **Customer Interface**: Beautiful, responsive menu display
- **Booking System**: Table reservation functionality

### Technical
- React 18.2.0 frontend with Vite
- Node.js/Express backend
- PostgreSQL database (Supabase)
- RESTful API architecture
- @dnd-kit for drag-and-drop
- Tailwind CSS for styling

## [Unreleased]

### Planned
- Admin authentication system
- Order tracking (Kitchen Display System)
- Analytics dashboard
- Customer reviews and ratings
- Email notifications
- Payment integration
