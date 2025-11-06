// userService.ts

import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { User } from 'firebase/auth';

// Interfaces
export interface UserProfile {
  email: string;
  photoURL: string | null;
  points: number;
  displayName: string | null;

  // --- Extras opcionales ---
  phone?: string;                // Teléfono
  birthDate?: string;            // Fecha de nacimiento
  favoriteCategory?: string;     // Categoría favorita
  createdAt?: string;            // Fecha de creación de cuenta
  totalPurchases?: number;       // Compras realizadas
  rewardsRedeemed?: number;      // Recompensas canjeadas
}

// Función para obtener perfil de usuario
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Crear perfil de usuario nuevo
export const createUserProfile = async (user: User): Promise<void> => {
  try {
    const now = new Date();
    const userProfile: UserProfile = {
      email: user.email || '',
      photoURL: user.photoURL,
      points: 0,
      displayName: user.displayName,
      createdAt: now.toISOString(), // Fecha de creación
      // Los demás campos los puede llenar luego el usuario
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
};

// Sumar puntos
export const addPointsToUser = async (userId: string, points: number): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      points: increment(points)
    });
  } catch (error) {
    console.error('Error adding points:', error);
  }
};

// Actualizar foto de usuario
export const updateUserPhoto = async (userId: string, photoURL: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      photoURL
    });
  } catch (error) {
    console.error('Error updating user photo:', error);
  }
};

// Función para obtener total de puntos
export const getUserPoints = async (userId: string): Promise<number> => {
  const profile = await getUserProfile(userId);
  return profile?.points || 0;
};

// ----------------------
// ¿Quieres poder actualizar los campos nuevos desde el perfil?
// Aquí tienes una función genérica:
export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), data);
  } catch (error) {
    console.error('Error updating user profile:', error);
  }
};
