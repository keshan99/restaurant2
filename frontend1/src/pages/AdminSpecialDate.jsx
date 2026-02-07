import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Calendar, Pencil, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import LoadingSpinner from '../components/LoadingSpinner';
import API_URL from '../config/api';

const API = API_URL;
const categories = ['mains', 'sides', 'desserts', 'drinks'];

function formatMenuDate(isoDate) {
    if (!isoDate) return '';
    const dateStr = isoDate.split('T')[0];
    const [y, m, d] = dateStr.split('-');
    return `${d} ${m} ${y}`;
}

function extractDateOnly(dateStr) {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
}

function SortableSelectedItem({ item, discount, setDiscount, toggleItem }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
        <li ref={setNodeRef} style={style} className="flex flex-wrap items-center gap-3 py-2 px-3 rounded-lg bg-orange-50 border border-orange-200">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0">
                <GripVertical size={18} />
            </div>
            <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center bg-orange-500 border-orange-500 text-white"
            >
                <Check size={14} />
            </button>
            <img src={item.image || 'https://placehold.co/80?text=No+Image'} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
            <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">${item.price} {item.is_veg ? '· 🌱' : ''}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Discount:</span>
                <select
                    value={discount?.discount_type || ''}
                    onChange={(e) => setDiscount(item.id, e.target.value || null, e.target.value ? discount?.discount_value : null)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs"
                >
                    <option value="">None</option>
                    <option value="percent">% off</option>
                    <option value="fixed">$ off</option>
                </select>
                {(discount?.discount_type === 'percent' || discount?.discount_type === 'fixed') && (
                    <input
                        type="number"
                        min="0"
                        step={discount?.discount_type === 'percent' ? 1 : 0.01}
                        className="w-14 border border-gray-300 rounded px-2 py-1 text-xs"
                        value={discount?.discount_value ?? ''}
                        onChange={(e) => setDiscount(item.id, discount?.discount_type, e.target.value === '' ? null : e.target.value)}
                    />
                )}
            </div>
        </li>
    );
}

export default function AdminSpecialDate() {
    const navigate = useNavigate();
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [specialDates, setSpecialDates] = useState([]);
    const [defaultItems, setDefaultItems] = useState([]);
    const [menuForDate, setMenuForDate] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [itemDiscounts, setItemDiscounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [orderedSelectedItems, setOrderedSelectedItems] = useState([]);
    const [currentMenuId, setCurrentMenuId] = useState(null);
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    useEffect(() => {
        loadDefaultMenu();
        loadSpecialDates();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            loadMenuForDate(selectedDate);
        }
    }, [selectedDate]);

    const loadSpecialDates = async () => {
        try {
            const res = await fetch(`${API}/api/menus/special-dates`);
            if (res.ok) {
                const data = await res.json();
                setSpecialDates(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadDefaultMenu = async () => {
        try {
            const res = await fetch(`${API}/api/menus/default`);
            if (res.ok) {
                const data = await res.json();
                setDefaultItems(data.items || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadMenuForDate = async (date) => {
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch(`${API}/api/menus?date=${date}`);
            const data = await res.json();
            const items = data.items || [];
            setMenuForDate({ items, isDefault: data.isDefault });
            setSelectedIds(new Set(items.map((i) => i.id)));
            const sortedItems = [...items].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
            setOrderedSelectedItems(sortedItems);
            const discounts = {};
            items.forEach((i) => {
                if (i.discount_type || i.discount_value != null) {
                    discounts[i.id] = { discount_type: i.discount_type || null, discount_value: i.discount_value };
                }
            });
            setItemDiscounts(discounts);
            if (!data.isDefault && items.length > 0) {
                const menuRes = await fetch(`${API}/api/menus/special-dates`);
                if (menuRes.ok) {
                    const specialDates = await menuRes.json();
                    const menu = specialDates.find((m) => extractDateOnly(m.menu_date) === date);
                    if (menu) setCurrentMenuId(menu.id);
                }
            } else {
                setCurrentMenuId(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
                setOrderedSelectedItems((items) => items.filter((i) => i.id !== id));
            } else {
                next.add(id);
                const item = defaultItems.find((i) => i.id === id);
                if (item) setOrderedSelectedItems((items) => [...items, item]);
            }
            return next;
        });
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = orderedSelectedItems.findIndex((i) => i.id === active.id);
        const newIndex = orderedSelectedItems.findIndex((i) => i.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;
        const newOrdered = arrayMove(orderedSelectedItems, oldIndex, newIndex);
        setOrderedSelectedItems(newOrdered);
        if (isCustom && currentMenuId) {
            try {
                const food_item_orders = newOrdered.map((item, idx) => ({ food_item_id: item.id, display_order: idx }));
                const res = await fetch(`${API}/api/menus/${currentMenuId}/reorder`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ food_item_orders })
                });
                if (!res.ok) {
                    console.error('Failed to update order');
                    loadMenuForDate(selectedDate);
                }
            } catch (err) {
                console.error('Failed to update order:', err);
                loadMenuForDate(selectedDate);
            }
        }
    };

    const selectAll = () => {
        setSelectedIds(new Set(defaultItems.map((i) => i.id)));
    };

    const clearAll = () => {
        setSelectedIds(new Set());
    };

    const setDiscount = (foodItemId, discount_type, discount_value) => {
        setItemDiscounts((prev) => {
            const next = { ...prev };
            if (!discount_type && (discount_value == null || discount_value === '')) {
                delete next[foodItemId];
            } else {
                next[foodItemId] = { discount_type: discount_type || null, discount_value: discount_value != null && discount_value !== '' ? Number(discount_value) : null };
            }
            return next;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            const items = orderedSelectedItems.map((item, idx) => {
                const d = itemDiscounts[item.id];
                return {
                    food_item_id: item.id,
                    discount_type: d?.discount_type ?? null,
                    discount_value: d?.discount_value ?? null
                };
            });
            const res = await fetch(`${API}/api/menus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    menu_date: selectedDate,
                    name: `Menu for ${selectedDate}`,
                    items
                })
            });
            if (res.ok) {
                const savedMenu = await res.json();
                setCurrentMenuId(savedMenu.id);
                setMessage('Special menu saved for this date.');
                loadMenuForDate(selectedDate);
                loadSpecialDates();
            } else {
                setMessage('Failed to save.');
            }
        } catch (err) {
            console.error(err);
            setMessage('Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    const isCustom = menuForDate && !menuForDate.isDefault;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <header className="mb-6">
                    <button
                        onClick={() => navigate('/admin')}
                        className="text-gray-500 hover:text-gray-700 text-sm font-medium mb-4"
                    >
                        ← Back
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Special date menu</h1>
                    <p className="text-gray-600 text-sm mt-1">Dates that have a custom menu. Click one to edit, or pick a date below to add a new one.</p>
                </header>

                {/* 1. List of special date menus – always first */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <span className="text-sm font-semibold text-gray-700">Special date menus</span>
                        {specialDates.length > 0 && (
                            <span className="text-gray-500 text-sm ml-2">({specialDates.length} date{specialDates.length !== 1 ? 's' : ''})</span>
                        )}
                    </div>
                    {specialDates.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm">
                            No special date menus yet. Pick a date below to create one.
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {specialDates.map((row) => (
                                <li key={row.id}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedDate(extractDateOnly(row.menu_date))}
                                        className={`w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-orange-50 transition ${selectedDate === extractDateOnly(row.menu_date) ? 'bg-orange-50 border-l-4 border-orange-500' : ''}`}
                                    >
                                        <span className="font-medium text-gray-900">{formatMenuDate(row.menu_date)}</span>
                                        <span className="text-sm text-gray-500">{row.item_count || 0} items</span>
                                        <span className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                                            <Pencil size={16} />
                                            Edit
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* 2. Create or edit for a date */}
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Create or edit menu for a date</h2>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <label className="flex items-center gap-2 text-gray-700 font-medium">
                        <Calendar size={20} />
                        Date
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-xl"
                    />
                    <span className="text-sm text-gray-500">
                        {menuForDate && !menuForDate.isDefault ? 'Editing special menu' : 'Create or edit menu for this date'}
                    </span>
                </div>

                {message && (
                    <div
                        className={`mb-4 p-4 rounded-xl ${message.includes('saved') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}
                    >
                        {message}
                    </div>
                )}

                {loading ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12">
                        <LoadingSpinner label="Loading menu..." />
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b bg-gray-50/80 flex flex-wrap items-center justify-between gap-4">
                            <p className="text-sm font-medium text-gray-600">
                                {isCustom
                                    ? `Custom menu for ${formatMenuDate(selectedDate)} (${menuForDate?.items?.length || 0} items)`
                                    : `This date uses default menu. Choose items below to create a special menu for ${formatMenuDate(selectedDate)}.`}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={selectAll}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    Select all
                                </button>
                                <button
                                    type="button"
                                    onClick={clearAll}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        <div className="p-4 max-h-[55vh] overflow-y-auto">
                            {defaultItems.length === 0 ? (
                                <div className="py-12 text-center text-gray-500">
                                    <p>Add items to the default menu first.</p>
                                    <button
                                        onClick={() => navigate('/admin/default-menu')}
                                        className="mt-2 text-orange-600 font-semibold hover:underline"
                                    >
                                        Go to Default Menu →
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {orderedSelectedItems.length > 0 && (
                                        <div className="mb-6 pb-4 border-b border-gray-200">
                                            <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Selected Items (drag to reorder)</p>
                                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                                <SortableContext items={orderedSelectedItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                                                    <ul className="space-y-2">
                                                        {orderedSelectedItems.map((item) => {
                                                            const d = itemDiscounts[item.id];
                                                            return (
                                                                <SortableSelectedItem
                                                                    key={item.id}
                                                                    item={item}
                                                                    discount={d}
                                                                    setDiscount={setDiscount}
                                                                    toggleItem={toggleItem}
                                                                />
                                                            );
                                                        })}
                                                    </ul>
                                                </SortableContext>
                                            </DndContext>
                                        </div>
                                    )}
                                    <ul className="space-y-2">
                                        {categories.map((cat) => {
                                            const items = defaultItems.filter((i) => i.category === cat && !selectedIds.has(i.id));
                                            if (items.length === 0) return null;
                                            return (
                                                <li key={cat}>
                                                    <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2 mt-4 first:mt-0">{cat}</p>
                                                    <ul className="space-y-1">
                                                        {items.map((item) => {
                                                            return (
                                                                <li key={item.id} className="flex flex-wrap items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleItem(item.id)}
                                                                        className="flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center border-gray-300"
                                                                    >
                                                                    </button>
                                                                    <img src={item.image || 'https://placehold.co/80?text=No+Image'} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                                                        <p className="text-xs text-gray-500">${item.price} {item.is_veg ? '· 🌱' : ''}</p>
                                                                    </div>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </>
                            )}
                        </div>

                        {defaultItems.length > 0 && (
                            <div className="p-4 border-t bg-gray-50/80">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-bold shadow hover:bg-orange-600 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <LoadingSpinner size="sm" inline />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check size={20} />
                                            Save menu for {formatMenuDate(selectedDate)}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
