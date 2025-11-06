import { Product, CartItem } from '../types';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface Order {
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: any;
  userEmail: string;
}

// Función para crear un registro de orden en Firestore
export const createOrder = async (userId: string, userEmail: string, items: CartItem[], totalAmount: number): Promise<string | null> => {
  try {
    const orderData: Order = {
      userId,
      userEmail,
      items,
      totalAmount,
      status: 'pending',
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'orders'), orderData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
};

// Función para obtener las órdenes de un usuario
export const getUserOrders = async (userId: string) => {
  try {
    const ordersCollection = collection(db, 'orders');
    // Esta función necesitaría implementarse con una query que filtre por userId
    // Por simplicidad, no lo hemos implementado completamente aquí
    return [];
  } catch (error) {
    console.error('Error getting user orders:', error);
    return [];
  }
};

// Función para actualizar el estado de una orden
export const updateOrderStatus = async (orderId: string, status: 'pending' | 'completed' | 'cancelled') => {
  try {
    // Aquí implementarías la actualización del estado de la orden
    // Usando doc() y updateDoc() de Firestore
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};