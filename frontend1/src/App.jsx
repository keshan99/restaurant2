import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomerHome from './pages/CustomerHome';
import CustomerBooking from './pages/CustomerBooking';
import CustomerConfirmation from './pages/CustomerConfirmation';
import AdminDashboard from './pages/AdminDashboard';
import AdminMenuPlan from './pages/AdminMenuPlan';
import AdminAddDish from './pages/AdminAddDish';
import AdminFoodLibrary from './pages/AdminFoodLibrary';
import AdminPublished from './pages/AdminPublished';
import AdminDefaultMenu from './pages/AdminDefaultMenu';
import AdminSpecialDate from './pages/AdminSpecialDate';
import AdminDeals from './pages/AdminDeals';
import CustomerDeals from './pages/CustomerDeals';
import './index.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<CustomerHome />} />
                <Route path="/deals" element={<CustomerDeals />} />
                <Route path="/booking" element={<CustomerBooking />} />
                <Route path="/booking-confirmation" element={<CustomerConfirmation />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/menu" element={<AdminMenuPlan />} />
                <Route path="/admin/default-menu" element={<AdminDefaultMenu />} />
                <Route path="/admin/special-date" element={<AdminSpecialDate />} />
                <Route path="/admin/deals" element={<AdminDeals />} />
                <Route path="/admin/food-library" element={<AdminFoodLibrary />} />
                <Route path="/admin/add-dish" element={<AdminAddDish />} />
                <Route path="/admin/published" element={<AdminPublished />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
