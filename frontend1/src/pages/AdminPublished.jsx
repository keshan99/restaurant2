import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdminPublished() {
    const navigate = useNavigate();

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden font-display bg-[#f8f7f6] dark:bg-[#221810] text-[#1b130d] dark:text-white">
            <div className="layout-container flex h-full grow flex-col">
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#f3ece7] dark:border-white/10 px-10 py-4 bg-background-light dark:bg-background-dark">
                    <div className="flex items-center gap-4 text-primary">
                        <div className="size-8 flex items-center justify-center bg-primary/10 rounded-full">
                            <span className="material-symbols-outlined text-primary">restaurant_menu</span>
                        </div>
                        <h2 className="text-[#1b130d] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Admin Portal</h2>
                    </div>
                    <div className="flex flex-1 justify-end gap-8">
                        <nav className="flex items-center gap-9">
                            <button onClick={() => navigate('/admin')} className="text-[#1b130d] dark:text-white/80 text-sm font-medium leading-normal hover:text-primary transition-colors">Dashboard</button>
                            <a className="text-[#1b130d] dark:text-white/80 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Menus</a>
                        </nav>
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/20" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAg4SecXiIKNsCd9Q6RBFrGiK2tnPBaRIWXB8K8X6z-2SIlWQlcq_nVaq0Dfoku2afk-1grBXe5k8kEwH0Jb7UPBKmisa0qvu3pQTj0ueL7BOT5CiS0N7MSMhJcec-2POAAFQGYmTqt52Wqb150IkoTBD4pYqX27rngkqZl5yqwwO9kP8FhWQY-ksaTP8JaX0vT0cpfo7hq97UswwwSpJvlyxvvQC0h9DUth3HKdFcB9Shne0Jj9H3dFnTu28BwCL1XdpgruWgRRpA")' }}></div>
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center px-4 py-20">
                    <div className="layout-content-container flex flex-col max-w-[640px] w-full bg-white dark:bg-white/5 rounded-xl shadow-sm border border-[#f3ece7] dark:border-white/10 p-12 text-center">
                        <div className="flex flex-col items-center gap-8">
                            <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary">
                                <span className="material-symbols-outlined !text-5xl">task_alt</span>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <h1 className="text-[#1b130d] dark:text-white text-3xl font-bold leading-tight tracking-[-0.025em]">Menu Published!</h1>
                                <p className="text-[#9a6c4c] dark:text-white/60 text-lg font-normal leading-relaxed max-w-[420px]">
                                    Your menu is now live for everyone to see! Customers can now browse and place orders.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/admin')}
                                className="flex min-w-[240px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                            >
                                <span className="truncate">Back to Dashboard</span>
                            </button>
                        </div>
                    </div>
                </main>

                <footer className="flex flex-col gap-6 px-5 py-12 text-center">
                    <p className="text-[#9a6c4c] dark:text-white/30 text-sm font-normal leading-normal">© 2024 Restaurant Management System</p>
                </footer>
            </div>
        </div>
    );
}

export default AdminPublished;
