import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  PlusCircle, 
  Loader, 
  Lock, 
  Package, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Plus, 
  Star, 
  ArrowLeft,
  Shield,
  Zap,
  TrendingUp
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  planType: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  imageUrl: string;
  duration: string;
  devices: string;
  inStock: boolean;
}

const ProductManagement: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchProductTerm, setSearchProductTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [adminEmails] = useState([
    'scpu.v1@gmail.com',
    // Para añadir el correo de algún ayudante futuro
  ]);

  // Producto vacío para crear nuevo
  const emptyProduct: Omit<Product, 'id'> = {
    name: '',
    description: '',
    longDescription: '',
    category: 'video',
    planType: 'Mensual',
    price: 0,
    originalPrice: 0,
    discount: 0,
    rating: 0,
    reviews: 0,
    imageUrl: '',
    duration: '30 días',
    devices: 'Hasta 1 dispositivo',
    inStock: true
  };

  useEffect(() => {
    // Verificar si el usuario actual es administrador
    if (!user || !adminEmails.includes(user.email || '')) {
      navigate('/');
      return;
    }

    fetchProducts();
  }, [user, adminEmails, navigate]);

  // Cargar productos
  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      const productsData: Product[] = [];
      querySnapshot.forEach((doc) => {
        productsData.push({
          id: doc.id,
          ...doc.data()
        } as Product);
      });
      
      setProducts(productsData);
      setFilteredProducts(productsData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setIsLoading(false);
    }
  };

  // Filtrar productos
  useEffect(() => {
    if (searchProductTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        product => 
          product.name.toLowerCase().includes(searchProductTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchProductTerm.toLowerCase()) ||
          product.planType.toLowerCase().includes(searchProductTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchProductTerm, products]);

  const handleCreateProduct = async (productData: Omit<Product, 'id'>) => {
    setIsUpdating(true);
    try {
      const docRef = await addDoc(collection(db, 'products'), productData);
      const newProduct: Product = { id: docRef.id, ...productData };
      
      setProducts([...products, newProduct]);
      setFilteredProducts([...filteredProducts, newProduct]);
      setIsCreatingProduct(false);
    } catch (error) {
      console.error('Error al crear producto:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateProduct = async (productData: Product) => {
    setIsUpdating(true);
    try {
      const { id, ...productUpdate } = productData;
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, productUpdate);
      
      const updatedProducts = products.map(p => 
        p.id === productData.id ? productData : p
      );
      
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    
    setIsUpdating(true);
    try {
      await deleteDoc(doc(db, 'products', productId));
      
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Componente de formulario de producto
  const ProductForm: React.FC<{ 
    product: Omit<Product, 'id'> | Product, 
    onSave: (product: any) => void,
    onCancel: () => void 
  }> = ({ product, onSave, onCancel }) => {
    const [formData, setFormData] = useState(product);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    const categories = ['video', 'music', 'gaming', 'tools', 'education', 'productivity'];
    const planTypes = ['Mensual', 'Anual', 'Trimestral', 'Único', 'Premium'];

    return (
      <div className="backdrop-blur-sm bg-black/20 fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] rounded-xl p-6 w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-[#FFD600] to-[#FFC400] rounded-lg">
                <Package className="text-black" size={20} />
              </div>
              {'id' in product ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h3>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="text-gray-400" size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Nombre del Producto</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none focus:ring-2 focus:ring-[#FFD600]/20 transition-all"
                    placeholder="Ej: Netflix Premium"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Descripción Corta</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none focus:ring-2 focus:ring-[#FFD600]/20 transition-all"
                    placeholder="Ej: Acceso a Netflix para hasta 4 dispositivos simultáneos"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Descripción Detallada</label>
                  <textarea
                    value={formData.longDescription}
                    onChange={(e) => setFormData({...formData, longDescription: e.target.value})}
                    className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none focus:ring-2 focus:ring-[#FFD600]/20 transition-all h-24 resize-none"
                    placeholder="Ej: Incluye contenido en 4K, HDR y múltiples perfiles de usuario"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Categoría</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none focus:ring-2 focus:ring-[#FFD600]/20 transition-all"
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Tipo de Plan</label>
                    <select
                      value={formData.planType}
                      onChange={(e) => setFormData({...formData, planType: e.target.value})}
                      className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none focus:ring-2 focus:ring-[#FFD600]/20 transition-all"
                      required
                    >
                      {planTypes.map(plan => (
                        <option key={plan} value={plan}>{plan}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Precio Original</label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({...formData, originalPrice: Number(e.target.value)})}
                      className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none focus:ring-2 focus:ring-[#FFD600]/20 transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Precio Final</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                      className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none focus:ring-2 focus:ring-[#FFD600]/20 transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Descuento (%)</label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})}
                      className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none focus:ring-2 focus:ring-[#FFD600]/20 transition-all"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Rating (1-5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
                      className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none focus:ring-2 focus:ring-[#FFD600]/20 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Número de Reviews</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.reviews}
                      onChange={(e) => setFormData({...formData, reviews: Number(e.target.value)})}
                      className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none focus:ring-2 focus:ring-[#FFD600]/20 transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">URL de Imagen</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none focus:ring-2 focus:ring-[#FFD600]/20 transition-all"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Duración</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none focus:ring-2 focus:ring-[#FFD600]/20 transition-all"
                      placeholder="Ej: 30 días"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Dispositivos</label>
                    <input
                      type="text"
                      value={formData.devices}
                      onChange={(e) => setFormData({...formData, devices: e.target.value})}
                      className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none focus:ring-2 focus:ring-[#FFD600]/20 transition-all"
                      placeholder="Ej: Hasta 4 dispositivos"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-[#1a1a1a] rounded-lg border border-gray-600">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
                    className="w-5 h-5 text-[#FFD600] bg-[#2C2C2C] border-gray-600 rounded focus:ring-[#FFD600] focus:ring-2"
                  />
                  <label htmlFor="inStock" className="text-gray-300 font-medium">Producto en stock</label>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 pt-6 border-t border-gray-700">
              <button
                type="submit"
                disabled={isUpdating}
                className="flex-1 bg-gradient-to-r from-[#FFD600] to-[#FFC400] text-[#1F1F1F] py-3 px-6 rounded-lg font-bold hover:shadow-lg hover:shadow-[#FFD600]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Guardar Producto
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-6 rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <X size={20} />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Renderizar pantalla de carga
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C]">
        <div className="flex flex-col items-center p-8 bg-[#2C2C2C] rounded-xl shadow-2xl border border-gray-700/50">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#FFD600]/20 border-t-[#FFD600] rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-[#FFD600] font-bold text-lg">Cargando gestión de productos</p>
        </div>
      </div>
    );
  }

  // Verificar si es admin
  if (!user || !adminEmails.includes(user.email || '')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C]">
        <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 border border-gray-700/50">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-6">
              <Lock size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Acceso Restringido</h2>
            <p className="text-gray-300 mb-6">No tienes permisos para acceder a esta sección.</p>
          </div>
        </div>
      </div>
    );
  }

  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.inStock).length;
  const averageRating = products.length > 0 ? (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0010] via-[#18001B] to-[#2C2C2C] py-4 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2C2C2C] to-[#1a1a1a] rounded-xl shadow-2xl overflow-hidden border border-gray-700/50 mb-6">
          <div className="bg-gradient-to-r from-[#FFD600] via-[#FFC400] to-[#FFD600] py-4">
            <div className="flex items-center justify-between px-6">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 bg-black/20 hover:bg-black/30 px-4 py-2 rounded-lg transition-all font-medium text-black"
              >
                <ArrowLeft size={20} />
                Volver al Dashboard
              </button>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black/20 rounded-lg">
                  <Package className="text-black" size={24} />
                </div>
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-black">Gestión de Productos</h1>
                  <p className="text-black/70 font-medium">Administrar catálogo de productos</p>
                </div>
              </div>
              
              <div className="w-32"></div> {/* Spacer for centering */}
            </div>
          </div>
          
          {/* Estadísticas */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 p-4 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-3">
                <Package className="text-green-400" size={20} />
                <div>
                  <p className="text-green-400 text-sm font-medium">Productos Disponibles</p>
                  <p className="text-white text-2xl font-bold">{inStockProducts}/{totalProducts}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#FFD600]/10 to-[#FFC400]/10 p-4 rounded-lg border border-[#FFD600]/20">
              <div className="flex items-center gap-3">
                <Star className="text-[#FFD600]" size={20} />
                <div>
                  <p className="text-[#FFD600] text-sm font-medium">Rating Promedio</p>
                  <p className="text-white text-2xl font-bold">{averageRating}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-4 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-blue-400" size={20} />
                <div>
                  <p className="text-blue-400 text-sm font-medium">Total Productos</p>
                  <p className="text-white text-2xl font-bold">{totalProducts}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-gradient-to-r from-[#2C2C2C] to-[#1a1a1a] rounded-xl shadow-2xl overflow-hidden border border-gray-700/50">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar producto, categoría o plan..."
                  value={searchProductTerm}
                  onChange={(e) => setSearchProductTerm(e.target.value)}
                  className="w-full bg-[#1a1a1a] text-white pl-12 pr-4 py-3 rounded-lg border border-gray-600 focus:border-[#FFD600] focus:outline-none focus:ring-2 focus:ring-[#FFD600]/20 transition-all"
                />
              </div>
              <button
                onClick={() => setIsCreatingProduct(true)}
                className="bg-gradient-to-r from-[#FFD600] to-[#FFC400] text-black py-3 px-6 rounded-lg font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-[#FFD600]/25 transition-all"
              >
                <Plus size={20} />
                Crear Producto
              </button>
            </div>

            {(isCreatingProduct || editingProduct) && (
              <ProductForm
                product={isCreatingProduct ? emptyProduct : editingProduct!}
                onSave={isCreatingProduct ? handleCreateProduct : handleUpdateProduct}
                onCancel={() => {
                  setIsCreatingProduct(false);
                  setEditingProduct(null);
                }}
              />
            )}

            <div className="grid gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-lg p-6 border border-gray-700/50 hover:border-[#FFD600]/30 transition-all duration-300 group">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-16 h-16 rounded-lg object-cover border-2 border-gray-600 group-hover:border-[#FFD600] transition-colors"
                        />
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
                            <span className="text-red-400 text-xs font-bold">Sin Stock</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-bold text-lg group-hover:text-[#FFD600] transition-colors truncate pr-4">{product.name}</h3>
                          <div className="flex items-center gap-1 text-[#FFD600] flex-shrink-0">
                            <Star size={16} className="fill-current" />
                            <span className="font-medium">{product.rating}</span>
                            <span className="text-gray-400 text-sm">({product.reviews})</span>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{product.description}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-gradient-to-r from-[#FFD600]/10 to-[#FFC400]/10 text-[#FFD600] px-3 py-1 rounded-full text-xs font-medium border border-[#FFD600]/20">
                            {product.category}
                          </span>
                          <span className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-400 px-3 py-1 rounded-full text-xs font-medium border border-blue-500/20">
                            {product.planType}
                          </span>
                          <span className="bg-gradient-to-r from-green-500/10 to-green-600/10 text-green-400 px-3 py-1 rounded-full text-xs font-medium border border-green-500/20">
                            {product.duration}
                          </span>
                          <span className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 text-purple-400 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/20">
                            {product.devices}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-3 mb-2">
                          {product.discount > 0 && (
                            <span className="text-gray-400 line-through text-sm">${product.originalPrice}</span>
                          )}
                          <span className="text-[#FFD600] font-bold text-2xl">${product.price}</span>
                        </div>
                        {product.discount > 0 && (
                          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                            -{product.discount}%
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all hover:shadow-lg hover:shadow-blue-500/25"
                        >
                          <Edit size={16} />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all hover:shadow-lg hover:shadow-red-500/25"
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredProducts.length === 0 && (
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-lg p-12 text-center border border-gray-700/50">
                  <Package size={64} className="mx-auto text-gray-500 mb-4" />
                  <h3 className="text-white font-bold text-xl mb-2">No se encontraron productos</h3>
                  <p className="text-gray-300 mb-6">No hay productos que coincidan con tu búsqueda</p>
                  <button
                    onClick={() => setSearchProductTerm('')}
                    className="bg-gradient-to-r from-[#FFD600] to-[#FFC400] text-black py-2 px-6 rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Ver todos los productos
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;