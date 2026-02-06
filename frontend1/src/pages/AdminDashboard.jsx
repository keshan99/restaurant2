import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
    const navigate = useNavigate();

    return (
        <div className="layout-container flex h-full grow flex-col bg-background-light dark:bg-background-dark min-h-screen">
            <header className="flex items-center justify-between border-b border-[#e7d9cf] dark:border-[#3a2a1d] bg-white dark:bg-[#221810] px-8 py-4 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 text-primary">
                        <div className="size-10 flex items-center justify-center bg-primary text-white rounded-xl">
                            <span className="material-symbols-outlined">restaurant</span>
                        </div>
                        <h2 className="text-[#1b130d] dark:text-white text-xl font-bold leading-tight">RestoAdmin</h2>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-[#f3ece7] dark:bg-[#3a2a1d] p-1 rounded-full">
                    <button className="px-6 py-2 rounded-full text-sm font-bold bg-white dark:bg-[#221810] shadow-sm text-primary">Simple</button>
                    <button className="px-6 py-2 rounded-full text-sm font-medium text-[#9a6c4c] dark:text-[#c29b80] hover:text-primary transition-colors">Advanced</button>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center justify-center rounded-full size-10 bg-[#f3ece7] dark:bg-[#3a2a1d] text-[#1b130d] dark:text-white">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/20" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAmWTNiA6dXJ1l9DgVE-L5f4D-TT3H8x32TJTrowEDf1x3FEZuPmjjmvqgbjKrfSernsR5SwK8ByRrT7UP2UOtGl40drjLOBpQMlIdMv0FL1H2zHby-hrHdlymG6ZK6mp0UZ9U4JJHr4mMwheerpjQWC0UTyuW97m12r5mJzECWJQE5jEB4wLLwkLf1nSfqp3iDjibLhfzewrVVAfWokBucNcd6o1iEYyrWnZMRUkvn02PxoJ9knp_8BV2hAGvUsOZfO6HIT_DRVKc")' }}></div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
                <div className="max-w-6xl mx-auto px-8 py-12">
                    <div className="text-center mb-16">
                        <h1 className="text-[#1b130d] dark:text-white text-5xl font-bold tracking-tight mb-4">Hello, Chef!</h1>
                        <p className="text-[#9a6c4c] dark:text-[#c29b80] text-xl font-medium">
                            You're doing great! Today looks busy. 😊
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="flex items-center gap-6 p-6 bg-white dark:bg-[#221810] rounded-2xl border border-[#e7d9cf] dark:border-[#3a2a1d]">
                            <div className="size-14 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">check_circle</span>
                            </div>
                            <div>
                                <p className="text-[#9a6c4c] dark:text-[#c29b80] text-sm font-bold uppercase tracking-widest">Menu Status</p>
                                <p className="text-2xl font-bold">Today's Menu is Live</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 p-6 bg-white dark:bg-[#221810] rounded-2xl border border-[#e7d9cf] dark:border-[#3a2a1d]">
                            <div className="size-14 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">book_online</span>
                            </div>
                            <div>
                                <p className="text-[#9a6c4c] dark:text-[#c29b80] text-sm font-bold uppercase tracking-widest">Reservations</p>
                                <p className="text-2xl font-bold">8 Bookings Today</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <button
                            onClick={() => navigate('/admin/food-library')}
                            className="flex flex-col items-center justify-center gap-4 p-10 rounded-3xl transition-all duration-300 border-2 bg-primary border-primary text-white shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined text-5xl">inventory_2</span>
                            <div className="text-center">
                                <span className="block text-xl font-bold">Food Library</span>
                                <span className="text-white/80 text-sm mt-1">Add dishes with tags (veg, spicy, special)</span>
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('/admin/default-menu')}
                            className="flex flex-col items-center justify-center gap-4 p-10 rounded-3xl transition-all duration-300 border-2 bg-white dark:bg-[#221810] border-primary/20 text-[#1b130d] dark:text-white shadow-xl hover:border-primary hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined text-5xl text-primary">restaurant_menu</span>
                            <div className="text-center">
                                <span className="block text-xl font-bold">Default Menu</span>
                                <span className="text-[#9a6c4c] dark:text-[#c29b80] text-sm mt-1">Add items from library, few clicks</span>
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('/admin/special-date')}
                            className="flex flex-col items-center justify-center gap-4 p-10 rounded-3xl transition-all duration-300 border-2 bg-white dark:bg-[#221810] border-primary/20 text-[#1b130d] dark:text-white shadow-xl hover:border-primary hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined text-5xl text-primary">calendar_today</span>
                            <div className="text-center">
                                <span className="block text-xl font-bold">Special Date Menu</span>
                                <span className="text-[#9a6c4c] dark:text-[#c29b80] text-sm mt-1">Choose date, pick from default list</span>
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('/admin/deals')}
                            className="flex flex-col items-center justify-center gap-4 p-10 rounded-3xl transition-all duration-300 border-2 bg-white dark:bg-[#221810] border-primary/20 text-[#1b130d] dark:text-white shadow-xl hover:border-primary hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined text-5xl text-primary">local_offer</span>
                            <div className="text-center">
                                <span className="block text-xl font-bold">Deals & Promos</span>
                                <span className="text-[#9a6c4c] dark:text-[#c29b80] text-sm mt-1">Create bundles with discounts</span>
                            </div>
                        </button>
                    </div>

                    <div className="mt-20 flex justify-center">
                        <div className="inline-flex items-center gap-3 px-8 py-4 bg-[#f3ece7] dark:bg-[#3a2a1d] rounded-full text-[#9a6c4c] dark:text-[#c29b80]">
                            <span className="material-symbols-outlined">info</span>
                            <p className="font-medium text-sm">Next Reservation: John Smith at 19:30 (4 guests)</p>
                            <a className="ml-4 font-bold text-primary hover:underline" href="#">View All</a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;
