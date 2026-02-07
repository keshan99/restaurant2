import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import API_URL from '../config/api';

const API = API_URL;

function DealCard({ deal }) {
    const navigate = useNavigate();
    const totalOriginalPrice = deal.items?.reduce((sum, item) => sum + Number(item.price), 0) || 0;
    const savings = totalOriginalPrice - Number(deal.price);
    const savingsPercent = totalOriginalPrice > 0 ? Math.round((savings / totalOriginalPrice) * 100) : 0;

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            {deal.image && (
                <div className="relative h-64 overflow-hidden">
                    <img src={deal.image} alt={deal.name} className="w-full h-full object-cover" />
                    {savings > 0 && (
                        <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            Save ${savings.toFixed(2)}
                        </div>
                    )}
                </div>
            )}
            <div className="p-6">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{deal.name}</h3>
                {deal.description && <p className="text-slate-600 dark:text-zinc-400 mb-4">{deal.description}</p>}
                {deal.items && deal.items.length > 0 && (
                    <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Includes:</p>
                        <ul className="space-y-1">
                            {deal.items.map((item) => (
                                <li key={item.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                                    {item.name} <span className="text-gray-400">(${item.price})</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700">
                            <div className="flex items-baseline justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 line-through">${totalOriginalPrice.toFixed(2)}</p>
                                    <p className="text-2xl font-black text-green-600">${Number(deal.price).toFixed(2)}</p>
                                </div>
                                {savingsPercent > 0 && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                                        {savingsPercent}% OFF
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => navigate('/booking')}
                    className="w-full mt-4 px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition"
                >
                    Order This Deal
                </button>
            </div>
        </div>
    );
}

export default function CustomerDeals() {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/deals?active=true`);
            if (res.ok) {
                const dealsList = await res.json();
                const dealsWithItems = await Promise.all(
                    dealsList.map(async (deal) => {
                        const itemRes = await fetch(`${API}/api/deals/${deal.id}`);
                        if (itemRes.ok) {
                            return await itemRes.json();
                        }
                        return deal;
                    })
                );
                setDeals(dealsWithItems);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="layout-container flex h-full grow flex-col bg-background-light dark:bg-background-dark min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Deals & Promos</h1>
                    <p className="text-lg text-slate-600 dark:text-zinc-400">Special bundles at unbeatable prices!</p>
                </div>
                {loading ? (
                    <LoadingSpinner fullScreen label="Loading deals..." />
                ) : deals.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-500">No deals available at the moment.</p>
                        <button onClick={() => window.history.back()} className="mt-4 text-orange-600 hover:underline">
                            ← Back to menu
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {deals.map((deal) => (
                            <DealCard key={deal.id} deal={deal} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
