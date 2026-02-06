import React from 'react';

function discountedPrice(price, discount_type, discount_value) {
    if (!discount_type || discount_value == null) return null;
    const p = Number(price);
    if (discount_type === 'percent') return p * (1 - discount_value / 100);
    if (discount_type === 'fixed') return Math.max(0, p - discount_value);
    return null;
}

function MenuCard({ item }) {
    const price = Number(item.price);
    const finalPrice = discountedPrice(item.price, item.discount_type, item.discount_value);
    const hasDiscount = finalPrice != null && finalPrice < price;

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow flex flex-col group">
            <div className="relative h-64 overflow-hidden">
                <img
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={item.image}
                />
                {hasDiscount && (
                    <div className="absolute top-4 left-4 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow">
                        {item.discount_type === 'percent' ? `${item.discount_value}% off` : `$${item.discount_value} off`}
                    </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-zinc-800/90 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <span className={`material-symbols-outlined text-sm ${(item.is_veg ?? item.isVeg) ? 'text-green-600' : 'text-red-600'}`}>
                        circle
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider dark:text-white">
                        {(item.is_veg ?? item.isVeg) ? 'Vegetarian' : 'Non-Veg'}
                    </span>
                </div>
            </div>

            <div className="p-6 flex flex-col grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                        {item.name}
                    </h3>
                    <span className="text-xl font-black text-primary">
                        {hasDiscount ? (
                            <>
                                <span className="line-through text-slate-400 dark:text-zinc-500 text-base font-normal mr-1">${price.toFixed(2)}</span>
                                ${finalPrice.toFixed(2)}
                            </>
                        ) : (
                            `$${price.toFixed(2)}`
                        )}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {item.spice_level && item.spice_level !== 'none' && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">local_fire_department</span>
                            {item.spice_level.toUpperCase()}
                        </span>
                    )}
                    {item.tags?.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full uppercase tracking-wider">
                            {tag.replace('_', ' ')}
                        </span>
                    ))}
                </div>

                <p className="text-slate-600 dark:text-zinc-400 text-base mb-6 grow">
                    {item.description || ''}
                </p>
            </div>
        </div>
    );
}

export default MenuCard;
