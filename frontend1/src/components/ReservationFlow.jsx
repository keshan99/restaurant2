import React, { useState } from 'react';

function ReservationFlow({ onBack }) {
    const [step, setStep] = useState(1);
    const [guests, setGuests] = useState(2);

    return (
        <div className="layout-container flex h-full grow flex-col bg-background-light dark:bg-background-dark min-h-screen">
            <header className="flex items-center justify-between border-b border-solid border-[#f3ece7] dark:border-[#3d2b1d] px-6 md:px-10 py-6 bg-white dark:bg-background-dark">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-4xl">arrow_back</span>
                    </button>
                    <div className="size-10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl">restaurant</span>
                    </div>
                    <h2 className="text-2xl font-black leading-tight tracking-tight">Friendly Table</h2>
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
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <div className="text-center animate-in fade-in slide-in-from-right duration-500">
                            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-8">When?</h1>
                            <div className="max-w-md mx-auto flex flex-col gap-6 mb-12">
                                <input
                                    type="date"
                                    className="w-full p-4 text-2xl border-4 border-[#f3ece7] rounded-xl font-bold"
                                    onChange={(e) => window.bookingDate = e.target.value} // Simple hack for demo state
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    {['17:00', '18:00', '19:00', '20:00'].map(t => (
                                        <button key={t} className="p-4 border-4 border-[#f3ece7] rounded-xl text-xl font-bold hover:border-primary hover:text-primary transition-all" onClick={() => window.bookingTime = t}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => setStep(3)}
                                className="bg-primary text-white text-3xl font-black px-12 py-6 rounded-full shadow-xl hover:scale-105 transition-transform"
                            >
                                Next Step
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center animate-in fade-in slide-in-from-right duration-500">
                            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-8">Details</h1>
                            <div className="max-w-md mx-auto flex flex-col gap-4 mb-12">
                                <input type="text" placeholder="Your Name" id="booking-name" className="w-full p-4 text-xl border-4 border-[#f3ece7] rounded-xl font-bold" />
                                <input type="email" placeholder="Email Address" id="booking-email" className="w-full p-4 text-xl border-4 border-[#f3ece7] rounded-xl font-bold" />
                                <input type="tel" placeholder="Phone Number" id="booking-phone" className="w-full p-4 text-xl border-4 border-[#f3ece7] rounded-xl font-bold" />
                            </div>
                            <button
                                onClick={() => {
                                    const booking = {
                                        guests,
                                        date: window.bookingDate || new Date().toISOString().split('T')[0],
                                        time: window.bookingTime || '19:00',
                                        name: document.getElementById('booking-name').value,
                                        email: document.getElementById('booking-email').value,
                                        phone: document.getElementById('booking-phone').value
                                    };

                                    fetch('http://localhost:3000/api/bookings', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(booking)
                                    })
                                        .then(res => {
                                            if (res.ok) setStep(4);
                                            else alert('Error creating booking');
                                        })
                                        .catch(err => console.error(err));
                                }}
                                className="bg-primary text-white text-3xl font-black px-12 py-6 rounded-full shadow-xl hover:bg-green-600 transition-colors"
                            >
                                Confirm Booking
                            </button>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="text-center animate-in zoom-in duration-500">
                            <div className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                                <span className="material-symbols-outlined text-6xl">check_circle</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-8">Confirmed!</h1>
                            <p className="text-2xl text-slate-500 mb-12">We've sent a confirmation to your email.</p>
                            <button
                                onClick={onBack}
                                className="bg-primary text-white text-3xl font-black px-12 py-6 rounded-full"
                            >
                                Back to Home
                            </button>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}

export default ReservationFlow;
