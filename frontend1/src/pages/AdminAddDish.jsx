import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdminAddDish() {
    const navigate = useNavigate();
    const [mode, setMode] = React.useState('simple'); // 'simple' or 'advanced'
    const [formData, setFormData] = React.useState({
        name: '',
        price: '',
        category: 'mains',
        description: '',
        calories: '',
        isVeg: false, // Default
        image: 'https://placehold.co/400x300/orange/white?text=New+Dish' // Mock image
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        // Basic Validation
        if (!formData.name || !formData.price) {
            alert("Please enter at least a Name and Price.");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    price: parseFloat(formData.price),
                    category: formData.category.toLowerCase().replace(' ', ''),
                    description: formData.description,
                    is_veg: false, // Simple mode doesn't allow toggle yet, could add it
                    image: formData.image,
                    available_day: 'today'
                })
            });

            if (response.ok) {
                navigate('/admin/published');
            } else {
                alert("Failed to publish dish.");
            }
        } catch (err) {
            console.error(err);
            alert("Error connecting to server.");
        }
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-[#1b130d] dark:text-white">
            <div className="layout-container flex h-full grow flex-col">
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 px-6 md:px-20 lg:px-40 py-4 bg-white dark:bg-[#2d1f15] z-50">
                    <div className="flex items-center gap-4 text-primary">
                        <div className="size-8 flex items-center justify-center bg-primary rounded-lg text-white">
                            <span className="material-symbols-outlined">restaurant</span>
                        </div>
                        <h2 className="text-[#1b130d] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">RestoAdmin</h2>
                    </div>
                    {/* ... copied header content ... */}
                    <div className="hidden md:flex flex-1 justify-end gap-8">
                        <nav className="flex items-center gap-9">
                            <button onClick={() => navigate('/admin')} className="text-[#1b130d] dark:text-[#e7d9cf] text-sm font-medium hover:text-primary transition-colors">Dashboard</button>
                            <span className="text-primary text-sm font-bold border-b-2 border-primary pb-1">Menu</span>
                            <a className="text-[#1b130d] dark:text-[#e7d9cf] text-sm font-medium hover:text-primary transition-colors" href="#">Orders</a>
                        </nav>
                        <div className="flex gap-2">
                            <button className="flex items-center justify-center rounded-full size-10 bg-primary/10 text-primary">
                                <span className="material-symbols-outlined">person</span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 max-w-[800px] mx-auto w-full px-6 py-8">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="inline-flex p-1 bg-[#e7d9cf] dark:bg-[#3d2a1d] rounded-full mb-6 shadow-inner">
                            <button
                                onClick={() => setMode('simple')}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${mode === 'simple' ? 'bg-primary text-white shadow-md' : 'text-[#9a6c4c] dark:text-[#d2a384] hover:text-primary'}`}
                            >
                                SIMPLE MODE
                            </button>
                            <button
                                onClick={() => setMode('advanced')}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${mode === 'advanced' ? 'bg-primary text-white shadow-md' : 'text-[#9a6c4c] dark:text-[#d2a384] hover:text-primary'}`}
                            >
                                ADVANCED MODE
                            </button>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full font-bold flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span className="text-sm">You're almost done! Just {mode === 'simple' ? '3' : '6'} details to go.</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#1b130d] dark:text-white tracking-tight mb-2">Add New Dish</h1>
                        <p className="text-[#9a6c4c] dark:text-[#d2a384] text-lg">Quickly list your new creation for customers.</p>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <span className="text-black dark:text-white font-bold uppercase tracking-wider text-xs mb-2 block">1. Dish Photo</span>
                            <div className="group relative flex flex-col items-center justify-center border-2 border-dashed border-primary/30 hover:border-primary bg-white dark:bg-[#2d1f15] rounded-2xl p-8 transition-all cursor-pointer min-h-[300px] shadow-sm hover:shadow-md hover:shadow-primary/10">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                                    </div>
                                    <p className="text-xl font-black text-[#1b130d] dark:text-white mb-1">Upload Photo</p>
                                    <p className="text-[#9a6c4c] text-base">Click here or drag a mouth-watering image</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <span className="text-black dark:text-white font-bold uppercase tracking-wider text-xs mb-2 block">2. Food Name</span>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-xl">restaurant_menu</span>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border-2 border-[#d2c3b8] dark:border-[#4d3a2b] bg-white dark:bg-[#2d1f15] h-14 pl-12 pr-4 text-lg font-bold focus:border-primary focus:ring-0 transition-all placeholder:text-gray-300"
                                        placeholder="e.g. Signature Burger"
                                        type="text"
                                    />
                                </div>
                            </div>
                            <div>
                                <span className="text-black dark:text-white font-bold uppercase tracking-wider text-xs mb-2 block">3. Selling Price</span>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-xl">payments</span>
                                    <input
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border-2 border-[#d2c3b8] dark:border-[#4d3a2b] bg-white dark:bg-[#2d1f15] h-14 pl-12 pr-12 text-lg font-bold focus:border-primary focus:ring-0 transition-all placeholder:text-gray-300"
                                        placeholder="0.00"
                                        step="0.01"
                                        type="number"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-black text-[#9a6c4c]">USD</span>
                                </div>
                            </div>
                        </div>

                        {/* ADVANCED MODE FIELDS */}
                        {mode === 'advanced' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div>
                                    <span className="text-black dark:text-white font-bold uppercase tracking-wider text-xs mb-2 block">4. Description</span>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-4 text-primary text-xl">description</span>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border-2 border-[#d2c3b8] dark:border-[#4d3a2b] bg-white dark:bg-[#2d1f15] h-32 pl-12 pr-4 pt-4 text-base font-medium focus:border-primary focus:ring-0 transition-all placeholder:text-gray-300 resize-none"
                                            placeholder="Describe the ingredients and flavors..."
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <span className="text-black dark:text-white font-bold uppercase tracking-wider text-xs mb-2 block">5. Category</span>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-xl">category</span>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border-2 border-[#d2c3b8] dark:border-[#4d3a2b] bg-white dark:bg-[#2d1f15] h-14 pl-12 pr-4 text-lg font-bold focus:border-primary focus:ring-0 transition-all text-[#1b130d] dark:text-white appearance-none cursor-pointer"
                                            >
                                                <option value="mains">Main Course</option>
                                                <option value="sides">Appetizer / Side</option>
                                                <option value="desserts">Dessert</option>
                                                <option value="drinks">Beverage</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#9a6c4c]">expand_more</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-black dark:text-white font-bold uppercase tracking-wider text-xs mb-2 block">6. Calories</span>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-xl">local_fire_department</span>
                                            <input
                                                name="calories"
                                                value={formData.calories}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border-2 border-[#d2c3b8] dark:border-[#4d3a2b] bg-white dark:bg-[#2d1f15] h-14 pl-12 pr-12 text-lg font-bold focus:border-primary focus:ring-0 transition-all placeholder:text-gray-300"
                                                placeholder="e.g. 450"
                                                type="number"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-bold text-[#9a6c4c]">kCal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row items-center gap-4 pt-6">
                            <button
                                onClick={handleSubmit}
                                className="w-full md:flex-[2] h-16 bg-primary text-white rounded-xl text-xl font-black hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/30 transform hover:-translate-y-1"
                            >
                                <span className="material-symbols-outlined text-2xl">done_all</span>
                                COMPLETE & PUBLISH DISH
                            </button>
                            <button
                                onClick={() => navigate('/admin/menu')}
                                className="w-full md:flex-1 h-16 bg-[#e7d9cf] dark:bg-[#3d2a1d] text-[#1b130d] dark:text-white rounded-xl text-lg font-bold hover:bg-[#d2c3b8] dark:hover:bg-[#4d3a2b] transition-all"
                            >
                                CANCEL
                            </button>
                        </div>

                        {mode === 'simple' && (
                            <p className="text-center text-[#9a6c4c] dark:text-[#d2a384] font-medium cursor-pointer" onClick={() => setMode('advanced')}>
                                Need more options? Switch to <strong>Advanced Mode</strong> to add ingredients, calories, and categories.
                            </p>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AdminAddDish;
