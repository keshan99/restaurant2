import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdminMenuPlanner() {
    const navigate = useNavigate();
    const [menuStatus, setMenuStatus] = React.useState({ today: false, tomorrow: false });

    React.useEffect(() => {
        fetch('http://localhost:3000/api/menu')
            .then(res => res.json())
            .then(data => {
                const todayReady = (data.today?.mains?.length > 0 || data.today?.sides?.length > 0);
                const tomorrowReady = (data.tomorrow?.mains?.length > 0);
                setMenuStatus({ today: todayReady, tomorrow: tomorrowReady });
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark text-[#1b130d] dark:text-white">
            <div className="layout-container flex h-full grow flex-col">
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#f3ece7] dark:border-[#3d2b1d] px-10 py-3 bg-white dark:bg-[#2d1f15]">
                    {/* ... header content ... */}
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4 text-[#1b130d] dark:text-white">
                            <div className="size-6 text-primary">
                                <span className="material-symbols-outlined text-3xl">restaurant_menu</span>
                            </div>
                            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Gusto Admin</h2>
                        </div>
                        {/* ... search ... */}
                    </div>
                    {/* ... nav ... */}
                    <div className="flex flex-1 justify-end gap-8 items-center">
                        <nav className="flex items-center gap-9">
                            <button onClick={() => navigate('/admin')} className="text-sm font-medium leading-normal hover:text-primary transition-colors">Dashboard</button>
                            <span className="text-primary text-sm font-bold leading-normal">Daily Menus</span>
                            <a className="text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Inventory</a>
                            <a className="text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Orders</a>
                        </nav>
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined cursor-pointer text-gray-500">notifications</span>
                            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/20" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBLA9Ncoc7JW9UnUuynSxTqKwOYmjRBRLbladIs6RN9S65833lBHg8qYdSYUJLj7E7pW4TxK4IeFi_i19umtZgOwRQNbK6qP-aBydwJXUOZkbU-0969ogPcDTKbV-C_IbEWi-RK-2heLFH925-BtQOykZIVcBjfobNtSyoptR53lbbDU1SXlb394l6L1qQ7TaWI_yIFLjlqPNfN2rt6C-SWCcC_sPhbBo-kvEzaPbHWa9h3YytaAN8GLIwD1vCgbEcFzxD1-KA4xlw")' }}></div>
                        </div>
                    </div>
                </header>

                <main className="flex flex-1 flex-col lg:flex-row max-w-[1440px] mx-auto w-full">
                    <aside className="w-full lg:w-64 p-4 lg:p-6 border-r border-[#f3ece7] dark:border-[#3d2b1d]">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col">
                                <h1 className="text-base font-bold leading-normal">Management</h1>
                                <p className="text-[#9a6c4c] text-xs font-normal leading-normal">Operational Controls</p>
                            </div>
                            <nav className="flex flex-col gap-1">
                                <a className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-primary/10" href="#">
                                    <span className="material-symbols-outlined">grid_view</span>
                                    <span className="text-sm font-medium">Overview</span>
                                </a>
                                <a className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/20" href="#">
                                    <span className="material-symbols-outlined">calendar_month</span>
                                    <span className="text-sm font-medium">Daily Menus</span>
                                </a>
                            </nav>
                        </div>
                    </aside>

                    <section className="flex-1 p-6 lg:p-10 flex flex-col gap-8 bg-background-light dark:bg-background-dark">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-2xl font-black leading-tight">Daily Menu Planner</h2>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#9a6c4c] text-lg">calendar_today</span>
                                    <p className="text-[#9a6c4c] text-sm font-medium">Week of October 24, 2024</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-6">
                                <button
                                    onClick={() => navigate('/admin/add-dish')}
                                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-sm font-bold shadow-md hover:bg-orange-600 transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">add</span>
                                    <span>Add New Dish</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                        </span>
                                        Live Status
                                    </span>
                                    <span className="text-sm font-bold text-[#9a6c4c]">Thu, Oct 24</span>
                                </div>
                                <div className="relative border-2 border-primary shadow-lg z-10 flex flex-col gap-4 p-6 bg-white dark:bg-[#2d1f15] rounded-xl overflow-hidden transition-all">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-2xl font-black text-primary tracking-tight">TODAY</h3>
                                                <div className={`flex items-center gap-1.5 mt-1 font-bold text-xs ${menuStatus.today ? 'text-green-600 dark:text-green-400' : 'text-orange-600'}`}>
                                                    <span className="material-symbols-outlined text-sm">{menuStatus.today ? 'check_circle' : 'warning'}</span>
                                                    {menuStatus.today ? 'Menu ready' : 'Menu incomplete'}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-[#9a6c4c] text-sm leading-relaxed">The kitchen is currently serving the prepared lunch and dinner selection for today.</p>
                                        <button className="w-full py-3 rounded-lg bg-primary text-white font-bold text-sm hover:bg-orange-600 transition-all mt-2">
                                            Edit Live Menu
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Not Scheduled</span>
                                    <span className="text-sm font-bold text-[#9a6c4c]">Fri, Oct 25</span>
                                </div>
                                <div className="opacity-70 bg-gray-50 dark:bg-zinc-900/40 cursor-not-allowed flex flex-col gap-4 p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 transition-all">
                                    <div className="flex flex-col gap-2 items-center text-center py-4">
                                        <div className="size-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                            <span className="material-symbols-outlined text-xl">lock</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <h3 className="text-lg font-bold text-gray-500">Tomorrow</h3>
                                            <p className="text-xs font-medium text-gray-400">No menu set yet</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Not Scheduled</span>
                                    <span className="text-sm font-bold text-[#9a6c4c]">Sat, Oct 26</span>
                                </div>
                                <div className="opacity-70 bg-gray-50 dark:bg-zinc-900/40 cursor-not-allowed flex flex-col gap-4 p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 transition-all">
                                    <div className="flex flex-col gap-2 items-center text-center py-4">
                                        <div className="size-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                            <span className="material-symbols-outlined text-xl">lock</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <h3 className="text-lg font-bold text-gray-500">Day After</h3>
                                            <p className="text-xs font-medium text-gray-400">No menu set yet</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default AdminMenuPlanner;
