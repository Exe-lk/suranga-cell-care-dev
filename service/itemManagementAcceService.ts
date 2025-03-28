import { firestore } from '../firebaseConfig';
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';

export const createItemAcce = async (values:any) => {
  const status = true;
  const docRef = await addDoc(collection(firestore, 'ItemManagementAcce'), values);
  return docRef.id;
};

export const getItemAcces = async () => {
  const q = query(collection(firestore, 'ItemManagementAcce'), where('status', '==', true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDeleteItemAcces = async () => {
  const q = query(collection(firestore, 'ItemManagementAcce'), where('status', '==', false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getItemAcceById = async (id: string) => {
  const ItemAcceRef = doc(firestore, 'ItemManagementAcce', id);
  const ItemAcceSnap = await getDoc(ItemAcceRef);
  if (ItemAcceSnap.exists()) {
    return { id: ItemAcceSnap.id, ...ItemAcceSnap.data() };
  } else {
    return null;
  }
};

export const updateItemAcce = async (id: string, type: string, mobileType: string, category: string, model: string, quantity: string, brand: string, reorderLevel: string, description: string, code: any,status:any,warranty:any) => {
  const ItemAcceRef = doc(firestore, 'ItemManagementAcce', id);
  await updateDoc(ItemAcceRef, { type, mobileType, category, model, quantity, brand, reorderLevel, description, code ,status,warranty});
};

export const deleteItemAcce = async (id: string) => {
  const ItemAcceRef = doc(firestore, 'ItemManagementAcce', id);
  await deleteDoc(ItemAcceRef);
};


