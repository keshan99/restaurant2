import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MenuList from '../components/MenuList';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowRight, Clock, MapPin, Phone, Mail, Star, TrendingUp } from 'lucide-react';
import API_URL from '../config/api';

const API = API_URL;

function CustomerHome() {
    const [currentDay, setCurrentDay] = useState('today');
    const [items, setItems] = useState([]);
    const [deals, setDeals] = useState([]);
    const [menuLoading, setMenuLoading] = useState(true);
    const [dealsLoading, setDealsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const dates = {
            today: new Date().toISOString().split('T')[0],
            tomorrow: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            nextDay: new Date(Date.now() + 172800000).toISOString().split('T')[0]
        };
        const selectedDate = dates[currentDay];
        setMenuLoading(true);
        fetch(`${API}/api/menus?date=${selectedDate}`)
            .then(res => res.json())
            .then(data => {
                setItems(data.items || []);
                setMenuLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch menu:", err);
                setMenuLoading(false);
            });
    }, [currentDay]);

    useEffect(() => {
        setDealsLoading(true);
        fetch(`${API}/api/deals?active=true`)
            .then(res => res.json())
            .then(async (data) => {
                const dealsWithItems = await Promise.all(
                    data.slice(0, 3).map(async (deal) => {
                        try {
                            const itemRes = await fetch(`${API}/api/deals/${deal.id}`);
                            if (itemRes.ok) {
                                return await itemRes.json();
                            }
                        } catch (e) {
                            console.error(`Failed to fetch deal ${deal.id}:`, e);
                        }
                        return deal;
                    })
                );
                setDeals(dealsWithItems);
                setDealsLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch deals:", err);
                setDealsLoading(false);
            });
    }, []);

    const featuredItems = items.slice(0, 6);
    const hasItems = items.length > 0;

    return (
        <div className="layout-container flex h-full grow flex-col bg-background-light dark:bg-background-dark min-h-screen">
            <Header />

            {/* Hero Section */}
            <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden scroll-mt-20">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-orange-400/10 to-transparent"></div>
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80")' }}
                ></div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-10 py-20 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-zinc-900/90 rounded-full mb-6 shadow-lg">
                        <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                        <span className="text-sm font-bold text-gray-800 dark:text-white">Rated 4.9/5 by 500+ Customers</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                        Welcome to <span className="text-orange-500">The Family Table</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                        Fresh, delicious meals crafted with love. From family favorites to chef's specials, 
                        we bring people together around great food.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
                            className="group bg-orange-500 text-white text-lg font-bold px-8 py-4 rounded-full shadow-xl hover:bg-orange-600 transition-all hover:scale-105 flex items-center gap-2"
                        >
                            View Menu
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => navigate('/booking')}
                            className="bg-white dark:bg-zinc-800 text-orange-500 text-lg font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-2 border-orange-500"
                        >
                            Book a Table
                        </button>
                    </div>
                </div>
            </section>

            {/* Featured Deals Section */}
            {deals.length > 0 && (
                <section className="py-20 bg-gradient-to-b from-white to-orange-50/30 dark:from-zinc-900 dark:to-zinc-800">
                    <div className="max-w-7xl mx-auto px-4 md:px-10">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-6 h-6 text-orange-500" />
                                    <span className="text-sm font-bold text-orange-500 uppercase tracking-wider">Special Offers</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">Today's Deals</h2>
                            </div>
                            <button
                                onClick={() => navigate('/deals')}
                                className="hidden md:flex items-center gap-2 text-orange-500 font-bold hover:text-orange-600 transition-colors"
                            >
                                View All Deals
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                        {dealsLoading ? (
                            <div className="flex justify-center py-12">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {deals.map((deal) => {
                                    const totalPrice = deal.items?.reduce((sum, item) => sum + Number(item.price), 0) || 0;
                                    const savings = totalPrice - Number(deal.price);
                                    return (
                                        <div
                                            key={deal.id}
                                            className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] cursor-pointer"
                                            onClick={() => navigate('/deals')}
                                        >
                                            {deal.image && (
                                                <div className="relative h-48 overflow-hidden">
                                                    <img src={deal.imageUrl || deal.image} alt={deal.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    {savings > 0 && (
                                                        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                                            Save ${savings.toFixed(2)}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div className="p-6">
                                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{deal.name}</h3>
                                                {deal.description && (
                                                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{deal.description}</p>
                                                )}
                                                <div className="flex items-baseline justify-between">
                                                    <div>
                                                        {totalPrice > 0 && (
                                                            <p className="text-sm text-gray-400 line-through">${totalPrice.toFixed(2)}</p>
                                                        )}
                                                        <p className="text-3xl font-black text-orange-500">${Number(deal.price).toFixed(2)}</p>
                                                    </div>
                                                    <button className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors">
                                                        Order Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <div className="text-center md:hidden">
                            <button
                                onClick={() => navigate('/deals')}
                                className="inline-flex items-center gap-2 text-orange-500 font-bold hover:text-orange-600 transition-colors"
                            >
                                View All Deals
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Menu Section */}
            <section id="menu" className="py-20 bg-white dark:bg-zinc-900 scroll-mt-20">
                <div className="max-w-7xl mx-auto px-4 md:px-10">
                    {/* Date Selector Tabs */}
                    <div className="mb-12">
                        <div className="flex flex-wrap justify-center gap-4 p-2 bg-gray-100 dark:bg-zinc-800 rounded-2xl max-w-2xl mx-auto">
                            {['today', 'tomorrow', 'nextDay'].map((day) => {
                                const label = day === 'today' ? 'Today' : day === 'tomorrow' ? 'Tomorrow' : 'Next Day';
                                const isActive = currentDay === day;
                                return (
                                    <button
                                        key={day}
                                        onClick={() => setCurrentDay(day)}
                                        className={`flex-1 min-w-[120px] py-3 px-6 rounded-xl text-lg font-bold transition-all ${
                                            isActive
                                                ? 'bg-orange-500 text-white shadow-lg scale-105'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">Our Menu</h2>
                            <p className="text-gray-600 dark:text-gray-400">Fresh ingredients, authentic flavors</p>
                        </div>
                    </div>

                    {menuLoading ? (
                        <div className="py-20 bg-gray-50 dark:bg-zinc-800 rounded-2xl">
                            <LoadingSpinner size="lg" label="Loading menu..." />
                        </div>
                    ) : hasItems ? (
                        <MenuList items={items} />
                    ) : (
                        <div className="text-center py-20 bg-gray-50 dark:bg-zinc-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-zinc-700">
                            <p className="text-2xl text-gray-400 font-bold">Menu not available for this day.</p>
                            <p className="text-gray-500 mt-2">Check back later for updates!</p>
                        </div>
                    )}
                </div>
            </section>

            {/* About/Story Section */}
            <section id="story" className="py-20 bg-gradient-to-b from-orange-50/50 to-white dark:from-zinc-800 dark:to-zinc-900 scroll-mt-20">
                <div className="max-w-7xl mx-auto px-4 md:px-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-4 inline-block">Our Story</span>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
                                More Than Just Food
                            </h2>
                            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                At The Family Table, we believe that great food brings people together. 
                                Our kitchen is a place where tradition meets innovation, where every dish 
                                is prepared with care and served with a smile.
                            </p>
                            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                                We use only the freshest ingredients, sourced locally whenever possible. 
                                Our menu features a variety of options to suit every taste and dietary need, 
                                ensuring that everyone can find something they love.
                            </p>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-black text-orange-500 mb-1">500+</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Happy Customers</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-black text-orange-500 mb-1">50+</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Menu Items</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-black text-orange-500 mb-1">10+</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Years Experience</div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                                <img 
                                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80" 
                                    alt="Restaurant interior" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                                        <Star className="w-6 h-6 text-white fill-white" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-gray-900 dark:text-white">4.9/5</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Customer Rating</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Location & Contact Section */}
            <section id="location" className="py-20 bg-white dark:bg-zinc-900 scroll-mt-20">
                <div className="max-w-7xl mx-auto px-4 md:px-10">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">Visit Us</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400">We'd love to see you!</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-gray-50 dark:bg-zinc-800 rounded-2xl p-8">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Location & Hours</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <MapPin className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white mb-1">Address</div>
                                        <div className="text-gray-600 dark:text-gray-400">123 Community Drive<br />Friendly City, FC 12345</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Clock className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white mb-1">Opening Hours</div>
                                        <div className="text-gray-600 dark:text-gray-400">
                                            Monday - Sunday: 8:00 AM - 9:00 PM<br />
                                            <span className="text-sm">Kitchen closes at 8:30 PM</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Phone className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white mb-1">Phone</div>
                                        <div className="text-gray-600 dark:text-gray-400">+1 (555) 123-4567</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Mail className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white mb-1">Email</div>
                                        <div className="text-gray-600 dark:text-gray-400">hello@familytable.com</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-xl h-full min-h-[400px]">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.184133894686!2d-73.98811768459384!3d40.75889597932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1234567890"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="w-full h-full"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
                <div className="max-w-4xl mx-auto px-4 md:px-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Ready to Dine With Us?</h2>
                    <p className="text-xl text-white/90 mb-8">Book your table today and experience the best dining in town</p>
                    <button
                        onClick={() => navigate('/booking')}
                        className="bg-white text-orange-500 text-lg font-bold px-10 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-105 inline-flex items-center gap-2"
                    >
                        Reserve Your Table
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="max-w-7xl mx-auto px-4 md:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-orange-500 p-2 rounded-lg">
                                    <span className="material-symbols-outlined text-white text-2xl">restaurant</span>
                                </div>
                                <h3 className="text-xl font-black text-white">The Family Table</h3>
                            </div>
                            <p className="text-sm">Bringing families together through great food and warm hospitality.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm">
                                <li><button onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-orange-500 transition-colors">Menu</button></li>
                                <li><button onClick={() => navigate('/deals')} className="hover:text-orange-500 transition-colors">Deals</button></li>
                                <li><button onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-orange-500 transition-colors">Our Story</button></li>
                                <li><button onClick={() => navigate('/booking')} className="hover:text-orange-500 transition-colors">Book a Table</button></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4">Contact</h4>
                            <ul className="space-y-2 text-sm">
                                <li>123 Community Drive</li>
                                <li>Friendly City, FC 12345</li>
                                <li>+1 (555) 123-4567</li>
                                <li>hello@familytable.com</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4">Follow Us</h4>
                            <div className="flex gap-4">
                                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                                    <span className="material-symbols-outlined">facebook</span>
                                </button>
                                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                                    <span className="material-symbols-outlined">instagram</span>
                                </button>
                                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                                    <span className="material-symbols-outlined">twitter</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-sm">
                        <p>© 2024 The Family Table. All rights reserved. Designed with ❤️ for families.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default CustomerHome;
