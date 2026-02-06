import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();

    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 px-6 md:px-20 py-4 bg-white dark:bg-zinc-900 sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg text-white">
                    <span className="material-symbols-outlined text-3xl">restaurant</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-primary uppercase">The Family Table</h2>
            </div>
            <div className="hidden md:flex flex-1 justify-center gap-10">
                <button
                    onClick={() => {
                        window.location.pathname !== '/' ? window.location.href = '/#home' : document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-sm font-bold hover:text-primary transition-colors cursor-pointer"
                >
                    Home
                </button>
                <button
                    onClick={() => {
                        window.location.pathname !== '/' ? window.location.href = '/#menu' : document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-sm font-bold hover:text-primary transition-colors cursor-pointer"
                >
                    Menu
                </button>
                <button
                    onClick={() => navigate('/deals')}
                    className="text-sm font-bold hover:text-primary transition-colors cursor-pointer"
                >
                    Deals
                </button>
                <button
                    onClick={() => {
                        window.location.pathname !== '/' ? window.location.href = '/#story' : document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-sm font-bold hover:text-primary transition-colors cursor-pointer"
                >
                    Our Story
                </button>
                <button
                    onClick={() => {
                        window.location.pathname !== '/' ? window.location.href = '/#location' : document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-sm font-bold hover:text-primary transition-colors cursor-pointer"
                >
                    Location
                </button>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/booking')}
                    className="hidden sm:flex min-w-[140px] cursor-pointer items-center justify-center rounded-full h-12 px-6 bg-primary text-white text-base font-black shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                >
                    <span>Book a Table</span>
                </button>
                <div className="size-10 rounded-full border-2 border-primary/20 p-0.5">
                    <img
                        alt="User Profile"
                        className="rounded-full object-cover w-full h-full"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAV_Nbh7VeKm-kVYvged3I4xjbbrVzHlcyyCezvFPMq8I8ak2XMO8TNwQj-xPLNi8XBZbufWIl1mEUe82cHRZgrq66FRCpBdkcADmT04xD8XKbSIvMOOCftZqsURgFqHHoCHNd2uWoqBxaXt5YrJE8PYLtBqIgcR1MpKL4wEZhUWgnFIL6cECKjJx83XuicEUySerT9FwJUOQwvFGpruS_bnRJMw9FYhK-S7MHni_tMbnMSA_57RVhTd-605VV8YaS0hdY3nkFgdpY"
                    />
                </div>
            </div>
        </header>
    );
}

export default Header;
