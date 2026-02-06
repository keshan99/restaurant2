import React from 'react';

function DaySelector({ currentDay, onSelectDay }) {
    const isToday = currentDay === 'today';
    const isTomorrow = currentDay === 'tomorrow';
    const isNextDay = currentDay === 'nextDay';

    return (
        <div className="flex flex-col md:flex-row justify-center gap-8 mb-24 max-w-5xl mx-auto">
            <button
                onClick={() => onSelectDay('today')}
                className={`flex-[2.5] py-12 px-12 rounded-[2.5rem] text-5xl font-black flex items-center justify-center gap-6 shadow-2xl transition-all
          ${isToday
                        ? 'bg-primary text-white shadow-primary/30 ring-8 ring-primary/5'
                        : 'text-slate-400 bg-white dark:bg-zinc-900 border-2 border-slate-100 dark:border-zinc-800 hover:bg-slate-50'
                    }`}
            >
                <span className="material-symbols-outlined text-6xl">today</span>
                TODAY
            </button>

            <button
                onClick={() => onSelectDay('tomorrow')}
                className={`flex-1 py-10 px-10 rounded-[2.5rem] text-2xl font-bold flex items-center justify-center border-2 transition-all
          ${isTomorrow
                        ? 'bg-primary text-white shadow-primary/30'
                        : 'text-slate-400 bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 hover:bg-slate-50'
                    }`}
            >
                Tomorrow
            </button>

            <button
                onClick={() => onSelectDay('nextDay')}
                className={`flex-1 py-10 px-10 rounded-[2.5rem] text-2xl font-bold flex items-center justify-center border-2 transition-all
          ${isNextDay
                        ? 'bg-primary text-white shadow-primary/30'
                        : 'text-slate-400 bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 hover:bg-slate-50'
                    }`}
            >
                Upcoming
            </button>
        </div>
    );
}

export default DaySelector;
