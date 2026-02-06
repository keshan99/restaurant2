import React from 'react';
import { useNavigate } from 'react-router-dom';

function CustomerConfirmation() {
    const navigate = useNavigate();

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden font-display bg-[#f6f8f6] dark:bg-[#102210] text-[#0d1b0d] dark:text-[#f8fcf8]">
            {/* Use a slightly different theme for confirmation page based on Stitch design (Green primary) */}
            <style>{`
         :root {
           --primary-green: #13ec13;
         }
       `}</style>

            <div className="layout-container flex h-full grow flex-col">
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#cfe7cf] dark:border-[#2a4d2a] px-10 py-4 bg-[#f6f8f6] dark:bg-[#102210]">
                    <div className="flex items-center gap-4 text-[#0d1b0d] dark:text-[#13ec13]">
                        <div className="size-8 flex items-center justify-center bg-[#13ec13] rounded-full text-white">
                            <span className="material-symbols-outlined text-2xl">restaurant</span>
                        </div>
                        <h2 className="text-[#0d1b0d] dark:text-[#f8fcf8] text-xl font-bold leading-tight tracking-[-0.015em]">DineEase</h2>
                    </div>
                    <div className="flex flex-1 justify-end gap-8">
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-[#13ec13]" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCBFLcCbitfnDwvIf6IfwyaKgiJwAGnCpcTUYjFq5GVvfFQBLN0fxBfnnUYpoF79-2sAAbQMUUF9y8pooQ8y_CfrP-xx13l44tkNevnxu0kPU0lNejK7LJ3qUl-QD6CK5a3UkkFPSABjhIKK_3KN2KfDShxQO5z0vLk5zG88u-rxDJLaNBdaO8yD25YmepYsUwIfXI4yJ70L12pCZkloZCflFBaTt7h4aGbaXR61bZ8ph5Wf0rWmLli_wZMSLnpus1gDuDyFlpIr04")' }}></div>
                    </div>
                </header>

                <main className="flex flex-1 justify-center py-12 px-6">
                    <div className="layout-content-container flex flex-col max-w-[640px] flex-1 items-center">

                        <div className="mb-8 flex items-center justify-center size-32 bg-[#13ec13]/10 dark:bg-[#13ec13]/5 rounded-full">
                            <span className="material-symbols-outlined text-[#13ec13] text-[80px]">check_circle</span>
                        </div>

                        <h1 className="text-[#0d1b0d] dark:text-[#f8fcf8] tracking-tight text-[40px] font-bold leading-tight text-center mb-4">
                            You're all set! We can't wait to see you.
                        </h1>
                        <p className="text-[#4c9a4c] dark:text-[#13ec13]/80 text-lg font-medium mb-12 text-center">
                            Your table at The Green Bistro is confirmed.
                        </p>

                        <div className="w-full bg-white dark:bg-[#1a2e1a] rounded-xl shadow-sm border border-[#cfe7cf] dark:border-[#2a4d2a] p-8 mb-12">
                            <div className="grid grid-cols-2 gap-y-8">
                                <div className="flex flex-col gap-1 border-r border-[#cfe7cf] dark:border-[#2a4d2a] pr-4">
                                    <span className="text-[#4c9a4c] dark:text-[#13ec13]/70 text-sm font-medium uppercase tracking-wider">Date</span>
                                    <span className="text-[#0d1b0d] dark:text-[#f8fcf8] text-xl font-bold">Friday, Oct 24</span>
                                </div>
                                <div className="flex flex-col gap-1 pl-8">
                                    <span className="text-[#4c9a4c] dark:text-[#13ec13]/70 text-sm font-medium uppercase tracking-wider">Time</span>
                                    <span className="text-[#0d1b0d] dark:text-[#f8fcf8] text-xl font-bold">7:00 PM</span>
                                </div>
                                <div className="flex flex-col gap-1 border-r border-[#cfe7cf] dark:border-[#2a4d2a] pr-4">
                                    <span className="text-[#4c9a4c] dark:text-[#13ec13]/70 text-sm font-medium uppercase tracking-wider">Guests</span>
                                    <span className="text-[#0d1b0d] dark:text-[#f8fcf8] text-xl font-bold">2 people</span>
                                </div>
                                <div className="flex flex-col gap-1 pl-8">
                                    <span className="text-[#4c9a4c] dark:text-[#13ec13]/70 text-sm font-medium uppercase tracking-wider">Location</span>
                                    <span className="text-[#0d1b0d] dark:text-[#f8fcf8] text-xl font-bold">Main Dining Room</span>
                                </div>
                            </div>

                            <div className="mt-10 rounded-lg h-48 w-full bg-[#e7f3e7] dark:bg-[#0d1b0d] overflow-hidden relative border border-[#cfe7cf] dark:border-[#2a4d2a]">
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#13ec13]/5 to-[#13ec13]/20">
                                    <div className="flex flex-col items-center">
                                        <span className="material-symbols-outlined text-[#13ec13] text-4xl mb-2">location_on</span>
                                        <span className="text-sm font-medium text-[#0d1b0d] dark:text-[#f8fcf8]">123 Accessibility Ave, Food City</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex w-full justify-center">
                            <button
                                onClick={() => navigate('/')}
                                className="flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-10 bg-[#13ec13] text-[#0d1b0d] text-lg font-bold leading-normal tracking-[0.015em] hover:brightness-95 transition-all shadow-md active:scale-95"
                            >
                                <span className="truncate">Done</span>
                            </button>
                        </div>

                        <div className="mt-8 flex items-center gap-2 text-[#4c9a4c] dark:text-[#13ec13]/60">
                            <span className="material-symbols-outlined text-sm">info</span>
                            <p className="text-sm font-normal">Need to change your booking? You can do it from 'My Bookings'.</p>
                        </div>
                    </div>
                </main>

                <footer className="p-10 text-center border-t border-[#cfe7cf] dark:border-[#2a4d2a]">
                    <p className="text-[#4c9a4c] dark:text-[#13ec13]/40 text-xs">© 2024 DineEase Accessibility-First Dining.</p>
                </footer>
            </div>
        </div>
    );
}

export default CustomerConfirmation;
