import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CustomerBooking() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [guests, setGuests] = useState(2);

    return (
        <div className="layout-container flex h-full grow flex-col bg-background-light dark:bg-background-dark min-h-screen">
            <header className="flex items-center justify-between border-b border-solid border-[#f3ece7] dark:border-[#3d2b1d] px-6 md:px-10 py-6 bg-white dark:bg-background-dark">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-4xl">arrow_back</span>
                    </button>
                    <div className="size-10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl">restaurant</span>
                    </div>
                    <h2 className="text-2xl font-black leading-tight tracking-tight">Friendly Table</h2>
                </div>
                <div className="flex items-center bg-[#f3ece7] dark:bg-[#3d2b1d] p-1.5 rounded-full">
                    <button className="px-6 py-2 rounded-full text-sm font-bold bg-white dark:bg-primary text-[#1b130d] dark:text-white shadow-sm transition-all">Simple</button>
                    <button className="px-6 py-2 rounded-full text-sm font-bold text-[#9a6c4c] dark:text-[#c4a68f] hover:text-[#1b130d] transition-all">Advanced</button>
                </div>
            </header>

            <main className="px-6 flex flex-1 justify-center py-12">
                <div className="layout-content-container flex flex-col w-full max-w-[800px]">

                    <div className="flex flex-col items-center mb-12">
                        <span className="text-primary font-black text-lg mb-2">STEP {step} OF 3</span>
                        <div className="flex gap-2 w-full max-w-xs h-3 bg-[#f3ece7] dark:bg-[#3d2b1d] rounded-full overflow-hidden">
                            <div className={`h-full bg-primary rounded-full transition-all duration-300 ${step >= 1 ? 'w-1/3' : 'w-0'}`}></div>
                            <div className={`h-full bg-primary rounded-full transition-all duration-300 ${step >= 2 ? 'w-1/3' : 'w-0'}`}></div>
                            <div className={`h-full bg-primary rounded-full transition-all duration-300 ${step >= 3 ? 'w-1/3' : 'w-0'}`}></div>
                        </div>
                    </div>

                    {step === 1 && (
                        <>
                            <div className="text-center mb-12">
                                <div className="flex items-center justify-center gap-4 mb-4">
                                    <span className="material-symbols-outlined text-primary text-5xl">groups</span>
                                    <h1 className="text-5xl md:text-6xl font-black tracking-tight">How many?</h1>
                                </div>
                                <p className="text-[#9a6c4c] dark:text-[#c4a68f] text-2xl font-medium">Choose how many people are coming.</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-16">
                                {[1, 2, 3, 4, 5, 6].map((num) => (
                                    <label key={num} className="group relative cursor-pointer" onClick={() => setGuests(num)}>
                                        <div className={`flex flex-col items-center justify-center h-48 rounded-[3rem] border-4 transition-all shadow-xl hover:scale-[1.02] active:scale-95
                      ${guests === num
                                                ? 'bg-primary/5 border-primary'
                                                : 'bg-white dark:bg-[#3d2b1d] border-transparent'
                                            }`}>
                                            <span className="text-7xl font-black mb-2">{num}{num === 6 ? '+' : ''}</span>
                                            <span className={`text-xl font-bold uppercase tracking-wider ${guests === num ? 'text-primary' : 'text-[#9a6c4c] dark:text-[#c4a68f]'}`}>
                                                {num === 1 ? 'Person' : 'People'}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div className="flex flex-col items-center gap-6">
                                <button
                                    onClick={() => setStep(2)}
                                    className="group w-full md:w-[400px] h-24 rounded-full bg-primary text-white text-3xl font-black shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.05] active:scale-95 transition-all flex items-center justify-center gap-4"
                                >
                                    <span>Next Step</span>
                                    <span className="material-symbols-outlined text-4xl group-hover:translate-x-2 transition-transform">arrow_forward_ios</span>
                                </button>
                                <div className="flex items-center gap-2 text-[#9a6c4c] dark:text-[#c4a68f]">
                                    <span className="material-symbols-outlined text-xl">info</span>
                                    <span className="text-lg">Step 2 will be selecting your date and time</span>
                                </div>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <div className="text-center">
                            <div className="text-center mb-12">
                                <div className="flex items-center justify-center gap-4 mb-4">
                                    <span className="material-symbols-outlined text-primary text-5xl">calendar_month</span>
                                    <h1 className="text-5xl md:text-6xl font-black tracking-tight">When?</h1>
                                </div>
                                <p className="text-[#9a6c4c] dark:text-[#c4a68f] text-2xl font-medium">Pick a date and time.</p>
                            </div>

                            <div className="bg-white dark:bg-[#3d2b1d] p-8 rounded-[3rem] mb-12 shadow-sm border border-[#f3ece7] dark:border-[#3d2b1d]">
                                <div className="grid gap-8">
                                    <div>
                                        <label className="block text-2xl font-bold text-[#1b130d] dark:text-white mb-4 text-left">Date</label>
                                        <input
                                            type="date"
                                            className="w-full h-20 text-2xl p-6 rounded-2xl border-4 border-[#f3ece7] dark:border-[#5e422f] bg-transparent focus:border-primary focus:ring-0"
                                            defaultValue={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-2xl font-bold text-[#1b130d] dark:text-white mb-4 text-left">Time</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {['17:00', '18:00', '19:00', '19:30', '20:00', '20:30'].map(t => (
                                                <button key={t} className="py-4 text-xl font-bold rounded-xl border-2 border-[#f3ece7] hover:border-primary hover:text-primary transition-all">
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(3)}
                                className="group w-full md:w-[400px] h-24 rounded-full bg-primary text-white text-3xl font-black shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.05] active:scale-95 transition-all flex items-center justify-center gap-4"
                            >
                                <span>Next Step</span>
                                <span className="material-symbols-outlined text-4xl group-hover:translate-x-2 transition-transform">arrow_forward_ios</span>
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center">
                            <div className="text-center mb-12">
                                <div className="flex items-center justify-center gap-4 mb-4">
                                    <span className="material-symbols-outlined text-primary text-5xl">person</span>
                                    <h1 className="text-5xl md:text-6xl font-black tracking-tight">Your Details</h1>
                                </div>
                                <p className="text-[#9a6c4c] dark:text-[#c4a68f] text-2xl font-medium">Just a name to hold the table.</p>
                            </div>

                            <div className="bg-white dark:bg-[#3d2b1d] p-8 rounded-[3rem] mb-12 shadow-sm border border-[#f3ece7] dark:border-[#3d2b1d]">
                                <div className="grid gap-8">
                                    <div>
                                        <label className="block text-2xl font-bold text-[#1b130d] dark:text-white mb-4 text-left">Your Name</label>
                                        <input type="text" placeholder="e.g. John" className="w-full h-20 text-2xl p-6 rounded-2xl border-4 border-[#f3ece7] dark:border-[#5e422f] bg-transparent focus:border-primary focus:ring-0" />
                                    </div>
                                    <div>
                                        <label className="block text-2xl font-bold text-[#1b130d] dark:text-white mb-4 text-left">Phone</label>
                                        <input type="tel" placeholder="(555) 000-0000" className="w-full h-20 text-2xl p-6 rounded-2xl border-4 border-[#f3ece7] dark:border-[#5e422f] bg-transparent focus:border-primary focus:ring-0" />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/booking-confirmation')}
                                className="group w-full md:w-[400px] h-24 rounded-full bg-primary text-white text-3xl font-black shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.05] active:scale-95 transition-all flex items-center justify-center gap-4"
                            >
                                <span>Confirm Booking</span>
                                <span className="material-symbols-outlined text-4xl group-hover:translate-x-2 transition-transform">check</span>
                            </button>
                        </div>
                    )}

                </div>
            </main>

            <div className="mt-24 p-10 mx-6 mb-12 rounded-[3rem] bg-white dark:bg-[#2d2117] flex flex-col md:flex-row items-center gap-10 border border-[#f3ece7] dark:border-[#3d2b1d] shadow-sm max-w-[800px] md:mx-auto">
                <div className="size-32 md:size-40 rounded-[2rem] overflow-hidden shrink-0 border-4 border-[#f3ece7] dark:border-[#3d2b1d]">
                    <img alt="Restaurant Interior" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfa_xRSzhbK6PMGunepSAQaUc95hHSlK_S26Az-x-3VWTDCqD_Tg29BVfJAMWwp7m_sbOP4Rpixn9I6IwssPZ7R87WZWBa6kvhK43co4DltTSpSOL3ojLwNnbEqFwEM2QQvI_SVOVvTN1Itq9x1yoiBudZVgnw4nRXyOFUiwXm3E1FFXSCFdTd9PYI29IsTnpUvv2jYlUuBG6frz_autognAVnPmQ02SkjtwU3nvTFDayivhgIlnXFlHgg4H_JlRA84jq38xIZxwM" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="font-black text-3xl mb-4">Friendly Table Downtown</h4>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-center md:justify-start gap-3 text-[#9a6c4c] dark:text-[#c4a68f]">
                            <span className="material-symbols-outlined text-2xl">location_on</span>
                            <span className="text-xl font-medium">123 Hospitality Lane, Foodie City</span>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-3 text-[#9a6c4c] dark:text-[#c4a68f]">
                            <span className="material-symbols-outlined text-2xl">call</span>
                            <span className="text-xl font-medium">(555) 123-4567</span>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="p-10 text-center text-[#9a6c4c] dark:text-[#c4a68f] text-lg">
                <p>Need help? Call us and we'll book it for you!</p>
            </footer>
        </div>
    );
}

export default CustomerBooking;
