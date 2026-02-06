import React from 'react';
import MenuCard from './MenuCard';

function MenuList({ items = [] }) {
    const categories = [
        { key: 'mains', title: 'Main Courses', icon: 'restaurant' },
        { key: 'sides', title: 'Sides & Starters', icon: 'soup_kitchen' },
        { key: 'desserts', title: 'Desserts', icon: 'icecream' },
        { key: 'drinks', title: 'Drinks', icon: 'local_cafe' }
    ];

    const groupedItems = categories.reduce((acc, cat) => {
        acc[cat.key] = items.filter(item => item.category === cat.key);
        return acc;
    }, {});

    return (
        <div className="flex flex-col gap-16">
            {categories.map(category => {
                const categoryItems = groupedItems[category.key] || [];
                if (categoryItems.length === 0) return null;

                return (
                    <section key={category.key} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-3 mb-8 border-b border-dashed border-primary/20 pb-4">
                            <span className="material-symbols-outlined text-3xl text-primary">{category.icon}</span>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{category.title}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {categoryItems.map(item => (
                                <MenuCard key={item.id} item={item} />
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

export default MenuList;
