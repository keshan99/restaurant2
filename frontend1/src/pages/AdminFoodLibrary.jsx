import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import API_URL, { STORAGE_BUCKET, getImageSrc } from '../config/api';

const API = API_URL;

export default function AdminFoodLibrary() {
    const navigate = useNavigate();
    const [foodItems, setFoodItems] = useState([]);
    const [defaultMenuIds, setDefaultMenuIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'mains',
        price: '',
        description: '',
        image: '',
        is_veg: false,
        spice_level: 'none',
        tags: [],
        allergens: [],
        is_active: true
    });

    const categories = ['mains', 'sides', 'desserts', 'drinks'];
    const categoryLabels = {
        mains: 'Main courses',
        sides: 'Sides & starters',
        desserts: 'Desserts',
        drinks: 'Drinks'
    };
    const spiceLevels = ['none', 'mild', 'medium', 'hot', 'extra_hot'];
    const availableTags = ['special', 'seasonal', 'limited', 'chef_choice', 'new'];

    useEffect(() => {
        fetchFoodItems();
        fetchDefaultMenuIds();
    }, []);

    const fetchFoodItems = async () => {
        try {
            const response = await fetch(`${API}/api/food-items`);
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Failed to fetch' }));
                console.error('Error fetching food items:', error);
                setFoodItems([]);
                return;
            }
            const data = await response.json();
            setFoodItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching food items:', err);
            setFoodItems([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDefaultMenuIds = async () => {
        try {
            const res = await fetch(`${API}/api/menus/default`);
            if (res.ok) {
                const data = await res.json();
                setDefaultMenuIds(new Set((data.items || []).map((i) => i.id)));
            } else {
                setDefaultMenuIds(new Set());
            }
        } catch (err) {
            console.error(err);
            setDefaultMenuIds(new Set());
        }
    };

    const addToDefaultMenu = async (e, foodItemId) => {
        e.stopPropagation();
        try {
            await fetch(`${API}/api/menus/default/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ food_item_id: foodItemId })
            });
            setDefaultMenuIds((prev) => new Set([...prev, foodItemId]));
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingItem
                ? `${API}/api/food-items/${editingItem.id}`
                : `${API}/api/food-items`;

            const method = editingItem ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                is_active: formData.is_active !== undefined ? formData.is_active : true
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({ error: 'Failed to save' }));
                alert(`Error: ${error.error || 'Failed to save food item'}`);
                return;
            }

            await fetchFoodItems();
            await fetchDefaultMenuIds();
            resetForm();
        } catch (err) {
            console.error('Error saving food item:', err);
            alert('Error saving food item. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await fetch(`${API}/api/food-items/${id}`, {
                method: 'DELETE'
            });
            fetchFoodItems();
        } catch (err) {
            console.error('Error deleting food item:', err);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name || '',
            category: item.category || 'mains',
            price: item.price !== undefined && item.price !== null ? String(item.price) : '',
            description: item.description || '',
            image: item.image || '',
            is_veg: Boolean(item.is_veg),
            spice_level: item.spice_level || 'none',
            tags: Array.isArray(item.tags) ? item.tags : [],
            allergens: Array.isArray(item.allergens) ? item.allergens : [],
            is_active: item.is_active !== undefined && item.is_active !== null ? Boolean(item.is_active) : true
        });
        setImageDisplayUrl(item.imageUrl || item.image || '');
        setShowForm(true);
    };

    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageDisplayUrl, setImageDisplayUrl] = useState('');
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        setUploadingImage(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);
            const res = await fetch(`${API}/api/upload`, {
                method: 'POST',
                body: formDataUpload
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Upload failed');
            }
            const data = await res.json();
            if (data.path) {
                setFormData(prev => ({ ...prev, image: data.path }));
                setImageDisplayUrl(data.url || '');
            }
        } catch (err) {
            alert(err.message || 'Image upload failed');
        } finally {
            setUploadingImage(false);
            e.target.value = '';
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'mains',
            price: '',
            description: '',
            image: '',
            is_veg: false,
            spice_level: 'none',
            tags: [],
            allergens: [],
            is_active: true
        });
        setImageDisplayUrl('');
        setEditingItem(null);
        setShowForm(false);
    };

    const toggleTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    if (loading) {
        return <LoadingSpinner fullScreen label="Loading food library..." />;
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
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Food Library</h1>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                    >
                        + Add New Item
                    </button>
                </div>

                {/* Modal for Add/Edit */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={resetForm}>
                        <div
                            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                                <h2 className="text-2xl font-bold">
                                    {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
                                </h2>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Price ($) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Spice Level</label>
                                    <select
                                        value={formData.spice_level}
                                        onChange={(e) => setFormData({ ...formData, spice_level: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    >
                                        {spiceLevels.map(level => (
                                            <option key={level} value={level}>{level.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                        rows="3"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Image</label>
                                    {(imageDisplayUrl || formData.image) && (
                                        <div className="mb-3">
                                            <img
                                                src={getImageSrc(imageDisplayUrl || formData.image)}
                                                alt="Preview"
                                                className="w-full max-w-xs h-48 object-cover rounded-lg border border-gray-200"
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="block text-xs text-gray-600 mb-1">Upload image file (saved to your private bucket)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploadingImage}
                                            className="w-full px-4 py-2 border rounded-lg text-sm"
                                        />
                                        {uploadingImage && <span className="text-sm text-gray-500">Uploading…</span>}
                                        <div className="text-xs text-gray-500">OR</div>
                                        <label className="block text-xs text-gray-600 mb-1">Or enter image URL</label>
                                        <input
                                            type="text"
                                            value={formData.image}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                setFormData(prev => ({ ...prev, image: v }));
                                                setImageDisplayUrl(v);
                                            }}
                                            className="w-full px-4 py-2 border rounded-lg"
                                            placeholder={`https://storage.googleapis.com/${STORAGE_BUCKET}/dish.jpg`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_veg}
                                            onChange={(e) => setFormData({ ...formData, is_veg: e.target.checked })}
                                            className="w-5 h-5"
                                        />
                                        <span className="text-sm font-medium">Vegetarian</span>
                                    </label>
                                </div>

                                <div>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="w-5 h-5"
                                        />
                                        <span className="text-sm font-medium">
                                            Active (shown in menus)
                                        </span>
                                    </label>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Tags</label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableTags.map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => toggleTag(tag)}
                                                className={`px-3 py-1 rounded-full text-sm ${formData.tags.includes(tag)
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-gray-200 text-gray-700'
                                                    }`}
                                            >
                                                {tag.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 -mx-6 -mb-6 mt-6 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                                >
                                    {editingItem ? 'Update Item' : 'Add Item'}
                                </button>
                            </div>
                            </form>
                        </div>
                    </div>
                )}

                {Array.isArray(foodItems) && foodItems.length > 0 ? (
                    <div className="space-y-8">
                        {categories.map((catKey) => {
                            const itemsInCategory = foodItems.filter(item => item.category === catKey);
                            if (itemsInCategory.length === 0) return null;

                            return (
                                <div key={catKey}>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                            {categoryLabels[catKey] || catKey}
                                        </span>
                                        <span className="text-sm font-normal text-gray-500">
                                            ({itemsInCategory.length} item{itemsInCategory.length !== 1 ? 's' : ''})
                                        </span>
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {itemsInCategory.map((item) => (
                                            <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                                                <img
                                                    src={getImageSrc(item.imageUrl || item.image) || 'https://placehold.co/400x300?text=No+Image'}
                                                    alt={item.name}
                                                    className="w-full h-48 object-cover"
                                                />
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                                        <span className="text-lg font-bold text-orange-500">${item.price}</span>
                                                    </div>

                                                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>

                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {item.is_veg && (
                                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                                                🌱 Veg
                                                            </span>
                                                        )}
                                                        {item.spice_level && item.spice_level !== 'none' && (
                                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                                                🌶️ {item.spice_level}
                                                            </span>
                                                        )}
                                                        {item.tags?.map(tag => (
                                                            <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {!item.is_active && (
                                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {!defaultMenuIds.has(item.id) && (
                                                            <button
                                                                onClick={(e) => addToDefaultMenu(e, item.id)}
                                                                className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                                                            >
                                                                <Plus size={16} />
                                                                Add to default menu
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">
                            {!Array.isArray(foodItems) 
                                ? 'Unable to load food items. Check database connection.' 
                                : 'No food items yet. Add your first item!'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
