import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, GripVertical, X } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import LoadingSpinner from '../components/LoadingSpinner';
import API_URL from '../config/api';

const API = API_URL;

function SortableItem({ item, onRemove, isFoodItem }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                <GripVertical size={20} />
            </div>
            {item.image && (
                <img src={item.image || 'https://placehold.co/48?text=No+image'} alt="" className="w-12 h-12 rounded-lg object-cover" />
            )}
            <div className="flex-1">
                <p className="font-medium text-gray-900">{item.name}</p>
                {isFoodItem && <p className="text-sm text-gray-500">${item.price}</p>}
            </div>
            {onRemove && (
                <button onClick={() => onRemove(item.id)} className="p-2 text-gray-400 hover:text-red-600">
                    <X size={18} />
                </button>
            )}
        </div>
    );
}

export default function AdminDeals() {
    const navigate = useNavigate();
    const [deals, setDeals] = useState([]);
    const [library, setLibrary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', image: '', price: '', food_item_ids: [] });
    const [selectedItems, setSelectedItems] = useState([]);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [dealsRes, libRes] = await Promise.all([
                fetch(`${API}/api/deals`),
                fetch(`${API}/api/food-items?active=true`)
            ]);
            if (dealsRes.ok) setDeals(await dealsRes.json());
            if (libRes.ok) setLibrary(await libRes.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (event, dealId) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = selectedItems.findIndex((i) => i.id === active.id);
        const newIndex = selectedItems.findIndex((i) => i.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;
        const newItems = arrayMove(selectedItems, oldIndex, newIndex);
        setSelectedItems(newItems);
        if (dealId) {
            try {
                const food_item_orders = newItems.map((item, idx) => ({ food_item_id: item.id, display_order: idx }));
                const res = await fetch(`${API}/api/deals/${dealId}/reorder`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ food_item_orders })
                });
                if (!res.ok) {
                    console.error('Failed to update order');
                    fetchAll();
                }
            } catch (err) {
                console.error('Failed to update order:', err);
                fetchAll();
            }
        }
    };

    const handleDealsDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = deals.findIndex((d) => d.id === active.id);
        const newIndex = deals.findIndex((d) => d.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;
        const newDeals = arrayMove(deals, oldIndex, newIndex);
        setDeals(newDeals);
        try {
            const deal_orders = newDeals.map((deal, idx) => ({ deal_id: deal.id, display_order: idx }));
            const res = await fetch(`${API}/api/deals/reorder`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deal_orders })
            });
            if (!res.ok) {
                console.error('Failed to update order');
                fetchAll();
            }
        } catch (err) {
            console.error('Failed to update order:', err);
            fetchAll();
        }
    };

    const startEdit = async (deal) => {
        const res = await fetch(`${API}/api/deals/${deal.id}`);
        if (res.ok) {
            const data = await res.json();
            setEditing(deal.id);
            setFormData({ name: data.name, description: data.description || '', image: data.image || '', price: data.price, food_item_ids: data.items.map((i) => i.id) });
            setSelectedItems(data.items);
        }
    };

    const cancelEdit = () => {
        setEditing(null);
        setFormData({ name: '', description: '', image: '', price: '', food_item_ids: [] });
        setSelectedItems([]);
    };

    const addItem = (item) => {
        if (!selectedItems.find((i) => i.id === item.id)) {
            setSelectedItems([...selectedItems, item]);
        }
    };

    const removeItem = (id) => {
        setSelectedItems(selectedItems.filter((i) => i.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const body = {
                name: formData.name,
                description: formData.description,
                image: formData.image,
                price: Number(formData.price),
                food_item_ids: selectedItems.map((i) => i.id)
            };
            let res;
            if (editing && editing !== 'new') {
                res = await fetch(`${API}/api/deals/${editing}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            } else {
                res = await fetch(`${API}/api/deals`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            }
            if (!res.ok) {
                const error = await res.json();
                alert(`Error: ${error.error || 'Failed to save deal'}`);
                return;
            }
            cancelEdit();
            fetchAll();
        } catch (err) {
            console.error(err);
            alert('Failed to save deal. Please try again.');
        }
    };

    const toggleActive = async (deal) => {
        await fetch(`${API}/api/deals/${deal.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...deal, is_active: !deal.is_active })
        });
        fetchAll();
    };

    const deleteDeal = async (id) => {
        if (confirm('Delete this deal?')) {
            await fetch(`${API}/api/deals/${id}`, { method: 'DELETE' });
            fetchAll();
        }
    };

    if (loading) return <LoadingSpinner fullScreen label="Loading deals..." />;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <button onClick={() => navigate('/admin')} className="text-gray-500 hover:text-gray-800 text-sm font-medium mb-6">
                    ← Back to dashboard
                </button>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Deals & Promos</h1>
                    <p className="text-gray-600 mt-1 text-sm">Create bundles of food items at discounted prices (like Pizza Hut deals).</p>
                </div>
                {!editing ? (
                    <>
                        <button onClick={() => setEditing('new')} className="mb-6 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2">
                            <Plus size={20} />
                            Create New Deal
                        </button>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDealsDragEnd}>
                            <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-4">
                                    {deals.map((deal) => (
                                        <div key={deal.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-lg font-bold text-gray-900">{deal.name}</h3>
                                                        <span className={`px-2 py-1 text-xs rounded ${deal.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                            {deal.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    {deal.description && <p className="text-sm text-gray-600 mt-1">{deal.description}</p>}
                                                    <p className="text-xl font-bold text-orange-600 mt-2">${deal.price}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => startEdit(deal)} className="p-2 text-gray-400 hover:text-blue-600">
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button onClick={() => toggleActive(deal)} className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
                                                        {deal.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button onClick={() => deleteDeal(deal.id)} className="p-2 text-gray-400 hover:text-red-600">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                        {deals.length === 0 && <p className="text-gray-500 text-center py-12">No deals yet. Create your first deal!</p>}
                    </>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-xl font-bold mb-4">{editing === 'new' ? 'Create New Deal' : 'Edit Deal'}</h2>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    placeholder="e.g., Family Combo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    rows={3}
                                    placeholder="Describe this deal..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                    <input
                                        type="url"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deal Price *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="29.99"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Items in Deal (drag to reorder)</label>
                            {selectedItems.length > 0 ? (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, editing !== 'new' ? editing : null)}>
                                    <SortableContext items={selectedItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-2 mb-4">
                                            {selectedItems.map((item) => (
                                                <SortableItem key={item.id} item={item} onRemove={removeItem} isFoodItem />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                <p className="text-gray-500 text-sm py-4">No items selected. Add items from the library below.</p>
                            )}
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Add Items from Library</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                                {library.filter((item) => !selectedItems.find((i) => i.id === item.id)).map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => addItem(item)}
                                        className="p-3 border border-gray-200 rounded-lg hover:bg-orange-50 text-left"
                                    >
                                        <img src={item.image || 'https://placehold.co/64?text=No+image'} alt="" className="w-full h-20 object-cover rounded mb-2" />
                                        <p className="text-sm font-medium truncate">{item.name}</p>
                                        <p className="text-xs text-gray-500">${item.price}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                                {editing === 'new' ? 'Create Deal' : 'Save Changes'}
                            </button>
                            <button type="button" onClick={cancelEdit} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
