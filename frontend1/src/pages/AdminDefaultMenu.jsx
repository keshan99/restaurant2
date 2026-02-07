import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Percent, DollarSign, GripVertical, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import LoadingSpinner from '../components/LoadingSpinner';
import API_URL from '../config/api';

const API = API_URL;
const CATEGORIES = [
    { key: 'mains', label: 'Main courses' },
    { key: 'sides', label: 'Sides & starters' },
    { key: 'desserts', label: 'Desserts' },
    { key: 'drinks', label: 'Drinks' }
];

function discountedPrice(price, discount_type, discount_value) {
    if (!discount_type || discount_value == null) return null;
    const p = Number(price);
    if (discount_type === 'percent') return p * (1 - discount_value / 100);
    if (discount_type === 'fixed') return Math.max(0, p - discount_value);
    return null;
}

function DiscountForm({ discount_type, discount_value, onSave, onCancel, compact }) {
    const [type, setType] = useState(discount_type || 'percent');
    const [value, setValue] = useState(discount_value != null ? String(discount_value) : '');
    return (
        <div className={`flex flex-wrap items-center gap-2 ${compact ? 'text-sm' : 'p-2 bg-gray-50 rounded-lg'}`}>
            <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
                <option value="percent">% off</option>
                <option value="fixed">$ off</option>
            </select>
            <input
                type="number"
                min="0"
                step={type === 'percent' ? 1 : 0.01}
                placeholder={type === 'percent' ? '10' : '2'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
            />
            <button type="button" onClick={() => onSave(type, value === '' ? null : Number(value))} className="text-sm bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600">
                Save
            </button>
            <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:underline">
                Cancel
            </button>
        </div>
    );
}

function SortableMenuItem({ item, editingDiscount, setEditingDiscount, updateItemDiscount, removeFromDefault, discountedPrice }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const style = { 
        transform: CSS.Transform.toString(transform), 
        transition, 
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'default'
    };
    const finalPrice = discountedPrice(item.price, item.discount_type, item.discount_value);
    const isEditing = editingDiscount === item.id;
    return (
        <li ref={setNodeRef} style={style} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50">
            <div 
                {...attributes} 
                {...listeners} 
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0 touch-none"
                style={{ touchAction: 'none' }}
            >
                <GripVertical size={18} />
            </div>
            <img src={item.image || 'https://placehold.co/64?text=No+image'} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
            <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-sm text-gray-500">
                    {finalPrice != null ? (
                        <>
                            <span className="line-through text-gray-400">${Number(item.price).toFixed(2)}</span>
                            <span className="text-green-600 font-medium ml-1">${finalPrice.toFixed(2)}</span>
                            {item.discount_type === 'percent' && ` (${item.discount_value}% off)`}
                            {item.discount_type === 'fixed' && ` ($${item.discount_value} off)`}
                        </>
                    ) : (
                        `$${item.price}`
                    )}
                    {item.is_veg && ' · Vegetarian'}
                </p>
            </div>
            {isEditing ? (
                <DiscountForm
                    discount_type={item.discount_type}
                    discount_value={item.discount_value}
                    onSave={(type, val) => updateItemDiscount(item.id, type, val)}
                    onCancel={() => setEditingDiscount(null)}
                    compact
                />
            ) : (
                <>
                    <button type="button" onClick={() => setEditingDiscount(item.id)} className="text-xs text-orange-600 hover:underline">
                        {item.discount_type ? 'Edit discount' : 'Add discount'}
                    </button>
                    <button type="button" onClick={() => removeFromDefault(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0" title="Remove from default menu">
                        <Trash2 size={18} />
                    </button>
                </>
            )}
        </li>
    );
}

export default function AdminDefaultMenu() {
    const navigate = useNavigate();
    const [defaultItems, setDefaultItems] = useState([]);
    const [library, setLibrary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingWithDiscount, setAddingWithDiscount] = useState(null);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [syncStatus, setSyncStatus] = useState({ status: 'saved', lastSync: null }); // 'saved' | 'syncing' | 'pending'
    const pendingSyncRef = useRef(null);
    const syncIntervalRef = useRef(null);
    
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const defaultIds = defaultItems.map((i) => i.id);
    const notInDefault = library.filter((item) => !defaultIds.includes(item.id));

    const syncToDatabase = async (food_item_orders) => {
        if (!food_item_orders || food_item_orders.length === 0) return;
        
        setSyncStatus({ status: 'syncing', lastSync: null });
        try {
            const res = await fetch(`${API}/api/menus/default/reorder`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ food_item_orders })
            });
            if (res.ok) {
                setSyncStatus({ status: 'saved', lastSync: new Date() });
                pendingSyncRef.current = null;
            } else {
                const error = await res.json();
                console.error('Failed to sync order:', error);
                setSyncStatus({ status: 'pending', lastSync: null });
            }
        } catch (err) {
            console.error('Failed to sync order:', err);
            setSyncStatus({ status: 'pending', lastSync: null });
        }
    };

    useEffect(() => {
        fetchAll();
        
        // Set up sync interval - sync every 5 seconds
        syncIntervalRef.current = setInterval(() => {
            if (pendingSyncRef.current) {
                syncToDatabase(pendingSyncRef.current);
            }
        }, 5000);
        
        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
            // Sync on unmount if there are pending changes
            if (pendingSyncRef.current) {
                syncToDatabase(pendingSyncRef.current);
            }
        };
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [defaultRes, libRes] = await Promise.all([
                fetch(`${API}/api/menus/default`),
                fetch(`${API}/api/food-items?active=true`)
            ]);
            if (defaultRes.ok) {
                const data = await defaultRes.json();
                // Only update if we don't have pending changes
                if (!pendingSyncRef.current) {
                    setDefaultItems(data.items || []);
                }
            } else {
                if (!pendingSyncRef.current) {
                    setDefaultItems([]);
                }
            }
            if (libRes.ok) {
                const data = await libRes.json();
                setLibrary(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addToDefault = async (foodItemId, discount) => {
        try {
            const body = { food_item_id: foodItemId };
            if (discount && (discount.discount_type === 'percent' || discount.discount_type === 'fixed') && discount.discount_value != null && Number(discount.discount_value) >= 0) {
                body.discount_type = discount.discount_type;
                body.discount_value = Number(discount.discount_value);
            }
            await fetch(`${API}/api/menus/default/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            setAddingWithDiscount(null);
            fetchAll();
        } catch (err) {
            console.error(err);
        }
    };

    const updateItemDiscount = async (foodItemId, discount_type, discount_value) => {
        try {
            await fetch(`${API}/api/menus/default/items/${foodItemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discount_type: discount_type === 'percent' || discount_type === 'fixed' ? discount_type : null,
                    discount_value: discount_value != null && Number(discount_value) >= 0 ? Number(discount_value) : null
                })
            });
            setEditingDiscount(null);
            fetchAll();
        } catch (err) {
            console.error(err);
        }
    };

    const removeFromDefault = async (foodItemId) => {
        try {
            await fetch(`${API}/api/menus/default/items/${foodItemId}`, { method: 'DELETE' });
            setDefaultItems((prev) => prev.filter((i) => i.id !== foodItemId));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDragEnd = async (event, categoryKey) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        
        // Get all items sorted by current display_order
        const sortedAllItems = [...defaultItems].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        
        // Find the category items and their positions
        const categoryItems = sortedAllItems.filter((i) => i.category === categoryKey);
        const otherItems = sortedAllItems.filter((i) => i.category !== categoryKey);
        
        const oldIndex = categoryItems.findIndex((i) => i.id === active.id);
        const newIndex = categoryItems.findIndex((i) => i.id === over.id);
        
        if (oldIndex === -1 || newIndex === -1) return;
        
        // Reorder only within the category
        const reorderedCategory = arrayMove(categoryItems, oldIndex, newIndex);
        
        // Rebuild the full list maintaining category order (other items first, then reordered category)
        const updated = [...otherItems, ...reorderedCategory];
        
        // Update display_order for all items (maintaining relative positions)
        const food_item_orders = updated.map((item, idx) => ({ food_item_id: item.id, display_order: idx }));
        
        // Update local state immediately (optimistic update)
        const updatedWithOrder = updated.map((item, idx) => ({ ...item, display_order: idx }));
        setDefaultItems(updatedWithOrder);
        
        // Mark as pending sync
        pendingSyncRef.current = food_item_orders;
        setSyncStatus({ status: 'pending', lastSync: null });
    };

    if (loading) {
        return <LoadingSpinner fullScreen label="Loading menu..." />;
    }

    const handleManualSync = () => {
        if (pendingSyncRef.current) {
            syncToDatabase(pendingSyncRef.current);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sync Status Indicator - Fixed Top Right */}
            <div className="fixed top-4 right-4 z-50">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-lg">
                    {syncStatus.status === 'syncing' && (
                        <>
                            <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                            <span className="text-sm font-medium text-gray-700">Syncing...</span>
                        </>
                    )}
                    {syncStatus.status === 'pending' && (
                        <>
                            <Clock className="w-4 h-4 text-orange-500 animate-pulse" />
                            <span className="text-sm font-medium text-gray-700">Changes pending</span>
                            <button
                                onClick={handleManualSync}
                                className="ml-2 text-xs text-orange-600 hover:text-orange-700 underline"
                            >
                                Sync now
                            </button>
                        </>
                    )}
                    {syncStatus.status === 'saved' && syncStatus.lastSync && (
                        <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-gray-700">
                                Saved {Math.floor((new Date() - syncStatus.lastSync) / 1000)}s ago
                            </span>
                        </>
                    )}
                    {syncStatus.status === 'saved' && !syncStatus.lastSync && (
                        <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-gray-700">All saved</span>
                        </>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <button
                    onClick={() => navigate('/admin')}
                    className="text-gray-500 hover:text-gray-800 text-sm font-medium mb-6"
                >
                    ← Back to dashboard
                </button>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Default menu</h1>
                    <p className="text-gray-600 mt-1 text-sm">
                        These dishes are shown to customers every day, unless you set a <strong>special menu</strong> for a date.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        💡 Drag items to reorder. Changes auto-sync every 5 seconds.
                    </p>
                </div>

                {/* Desktop: two columns. Mobile: stack */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* LEFT: Current default menu */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                            <span className="text-sm font-medium text-gray-700">
                                On default menu · {defaultItems.length} item{defaultItems.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto min-h-0">
                            {defaultItems.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <p className="font-medium">No items yet.</p>
                                    <p className="text-sm mt-1">Add from the library on the right, or add dishes in Food Library first.</p>
                                    <button
                                        onClick={() => navigate('/admin/food-library')}
                                        className="mt-4 text-orange-600 font-semibold hover:underline"
                                    >
                                        Go to Food Library →
                                    </button>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {CATEGORIES.map(({ key, label }) => {
                                        const items = defaultItems.filter((i) => i.category === key).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
                                        if (items.length === 0) return null;
                                        return (
                                            <li key={key}>
                                                <div className="px-4 pt-3 pb-1">
                                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                        {label}
                                                    </span>
                                                </div>
                                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, key)}>
                                                    <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                                                        <ul className="pb-2">
                                                            {items.map((item) => (
                                                                <SortableMenuItem
                                                                    key={item.id}
                                                                    item={item}
                                                                    editingDiscount={editingDiscount}
                                                                    setEditingDiscount={setEditingDiscount}
                                                                    updateItemDiscount={updateItemDiscount}
                                                                    removeFromDefault={removeFromDefault}
                                                                    discountedPrice={discountedPrice}
                                                                />
                                                            ))}
                                                        </ul>
                                                    </SortableContext>
                                                </DndContext>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* RIGHT (desktop): Add from library + available items */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                        <div className="px-4 py-3 border-b border-gray-100 bg-orange-50 flex-shrink-0">
                            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <Plus size={18} />
                                Add from library
                            </h2>
                            <p className="text-xs text-gray-600 mt-0.5">
                                {notInDefault.length > 0
                                    ? `${notInDefault.length} item${notInDefault.length !== 1 ? 's' : ''} available to add`
                                    : 'All library items are already on the default menu'}
                            </p>
                        </div>
                        <div className="flex-1 overflow-y-auto min-h-0 p-2">
                            {notInDefault.length === 0 ? (
                                <div className="p-6 text-center text-gray-500 text-sm">
                                    Add more dishes in the Food Library to see them here.
                                    <button
                                        onClick={() => navigate('/admin/food-library')}
                                        className="block mt-2 text-orange-600 font-medium hover:underline"
                                    >
                                        Go to Food Library →
                                    </button>
                                </div>
                            ) : (
                                CATEGORIES.map(({ key, label }) => {
                                    const items = notInDefault.filter((i) => i.category === key);
                                    if (items.length === 0) return null;
                                    return (
                                        <div key={key} className="mb-4">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-2 mb-2">
                                                {label}
                                            </p>
                                            <ul className="space-y-1">
                                                {items.map((item) => {
                                                    const showAddForm = addingWithDiscount?.id === item.id;
                                                    return (
                                                        <li key={item.id} className="rounded-lg border border-transparent hover:border-orange-200">
                                                            {showAddForm ? (
                                                                <div className="p-3 bg-orange-50/80 rounded-lg space-y-2">
                                                                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                                                                    <DiscountForm
                                                                        onSave={(t, v) => addToDefault(item.id, (t && v != null && v !== '') ? { discount_type: t, discount_value: v } : null)}
                                                                        onCancel={() => setAddingWithDiscount(null)}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => addToDefault(item.id)}
                                                                        className="text-xs text-gray-500 hover:underline"
                                                                    >
                                                                        Add without discount
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setAddingWithDiscount(item)}
                                                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-orange-50 transition"
                                                                >
                                                                    <img
                                                                        src={item.image || 'https://placehold.co/48?text=No+image'}
                                                                        alt=""
                                                                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                                                    />
                                                                    <span className="flex-1 font-medium text-gray-900 truncate">{item.name}</span>
                                                                    <span className="text-orange-600 text-sm font-medium flex-shrink-0">+ Add</span>
                                                                </button>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
