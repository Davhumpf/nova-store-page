export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  imageUrl: string;
  description: string;
  longDescription: string;
  duration: string;
  devices: string;
  category: string;
  planType?: string;
  inStock: boolean; // ✅ ← asegúrate de tener esto
}
// 👇 Agregado para corregir tu error
export interface CartItem extends Product {
  quantity: number;
}
