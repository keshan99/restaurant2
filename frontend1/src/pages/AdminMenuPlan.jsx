import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Plus, Trash2, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminMenuPlan() {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [foodLibrary, setFoodLibrary] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [isDefault, setIsDefault] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch food library
            const libRes = await fetch(`${API_URL}/api/food-items?active=true`);
            const libData = await libRes.json();
            setFoodLibrary(libData);

            // Fetch menu for selected date
            const menuRes = await fetch(`${API_URL}/api/menus?date=${selectedDate}`);
            const menuData = await menuRes.json();
            setMenuItems(menuData.items || []);
            setIsDefault(menuData.isDefault || false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setMessage('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMenu = async () => {
        setSaving(true);
        setMessage('');
        try {
            const food_item_ids = menuItems.map(item => item.id);

            // If menu doesn't exist for this date (isDefault was true), create it
            // Otherwise update it. 
            // Simplified: Just always try to create/update
            const res = await fetch(`${API_URL}/api/menus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    menu_date: selectedDate,
                    name: `Menu for ${selectedDate}`,
                    food_item_ids
                })
            });

            if (res.ok) {
                setMessage('Menu saved successfully!');
                setIsDefault(false);
            } else {
                // If POST fails because it already exists, we might need a PUT
                // But our backend's POST is basic. Let's assume it works or we refine it.
                setMessage('Error saving menu');
            }
        } catch (err) {
            console.error('Error saving menu:', err);
            setMessage('Error saving menu');
        } finally {
            setSaving(false);
        }
    };

    const addItemToMenu = (item) => {
        if (!menuItems.some(mi => mi.id === item.id)) {
            setMenuItems([...menuItems, item]);
        }
    };

    const removeItemFromMenu = (itemId) => {
        setMenuItems(menuItems.filter(item => item.id !== itemId));
    };

    const categories = ['mains', 'sides', 'desserts', 'drinks'];

    if (loading) {
        return <LoadingSpinner fullScreen label="Loading menu planner..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium mb-4"
                >
                    <ArrowLeft size={18} />
                    Back to dashboard
                </button>
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Menu Planner</h1>
                        <p className="text-gray-600">Select a date and build your menu from the library.</p>
                    </div>
                    <div className="flex items-center space-x-4 bg-white p-2 rounded-xl shadow-sm border">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border-none focus:ring-0 text-lg font-medium"
                        />
                    </div>
                </header>

                {message && (
                    <div className={`p-4 rounded-lg mb-6 ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}

                {isDefault && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg mb-6 flex items-center">
                        <span className="mr-2">ℹ️</span>
                        No specific menu set for this date. Showing <strong>Default Menu</strong>. Click "Save as Special Menu" to customize.
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* FOOD LIBRARY */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[700px]">
                        <div className="p-6 border-b bg-gray-50">
                            <h2 className="text-2xl font-bold">Food Library</h2>
                            <p className="text-sm text-gray-500">Pick items to add to the menu</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {categories.map(cat => (
                                <div key={cat}>
                                    <h3 className="text-sm font-bold uppercase text-gray-400 mb-3 tracking-wider">{cat}</h3>
                                    <div className="space-y-2">
                                        {foodLibrary.filter(item => item.category === cat).map(item => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition border border-transparent hover:border-orange-200 group cursor-pointer"
                                                onClick={() => addItemToMenu(item)}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <img src={item.imageUrl || item.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                                    <div>
                                                        <div className="font-semibold">{item.name}</div>
                                                        <div className="text-xs text-gray-500">${item.price} • {item.is_veg ? '🌱' : '🥩'}</div>
                                                    </div>
                                                </div>
                                                <button className="p-2 text-orange-500 opacity-0 group-hover:opacity-100 transition">
                                                    <Plus size={20} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SELECTED MENU */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[700px]">
                        <div className="p-6 border-b bg-orange-50 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Menu for {new Date(selectedDate).toLocaleDateString()}</h2>
                                <p className="text-sm text-orange-600">{menuItems.length} items selected</p>
                            </div>
                            <button
                                onClick={handleSaveMenu}
                                disabled={saving}
                                className="px-6 py-2 bg-orange-500 text-white rounded-xl font-bold shadow-lg hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <LoadingSpinner size="sm" inline />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check size={20} />
                                        <span>Save Menu</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {categories.map(cat => (
                                <div key={cat}>
                                    <h3 className="text-sm font-bold uppercase text-gray-400 mb-3 tracking-wider">{cat}</h3>
                                    <div className="space-y-2">
                                        {menuItems.filter(item => item.category === cat).map(item => (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                <div className="flex items-center space-x-3">
                                                    <img src={item.imageUrl || item.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                                    <div>
                                                        <div className="font-semibold">{item.name}</div>
                                                        <div className="text-xs text-gray-500">${item.price} • {item.is_veg ? '🌱' : '🥩'}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeItemFromMenu(item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        ))}
                                        {menuItems.filter(item => item.category === cat).length === 0 && (
                                            <div className="text-center py-4 text-gray-400 text-sm italic border-2 border-dashed rounded-xl">
                                                No {cat} selected
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
