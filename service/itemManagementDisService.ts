// import { firestore } from '../firebaseConfig';
// import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';

// export const createItemDis = async (values: any) => {
//   values.status = true;
//   const docRef = await addDoc(collection(firestore, 'ItemManagementDis'), values);
//   return docRef.id;
// };

// export const getItemDiss = async () => {
//   const q = query(collection(firestore, 'ItemManagementDis'), where('status', '==', true));
//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// };

// export const getDeleteItemDiss = async () => {
//   const q = query(collection(firestore, 'ItemManagementDis'), where('status', '==', false));
//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// };

// export const getItemDisById = async (id: string) => {
//   const ItemDisRef = doc(firestore, 'ItemManagementDis', id);
//   const ItemDisSnap = await getDoc(ItemDisRef);
//   if (ItemDisSnap.exists()) {
//     return { id: ItemDisSnap.id, ...ItemDisSnap.data() };
//   } else {
//     return null;
//   }
// };

// export const updateItemDis = async (data:any) => {
//   const ItemDisRef = doc(firestore, 'ItemManagementDis', data.id);
//   await updateDoc(ItemDisRef, data);
// };

// export const deleteItemDis = async (id: string) => {
//   const ItemDisRef = doc(firestore, 'ItemManagementDis', id);
//   await deleteDoc(ItemDisRef);
// };


import { supabase } from '../lib/supabase';
export const createItemDis = async (values: any) => {
  values.status = true;

  const { data, error } = await supabase
    .from('ItemManagementDis')
    .insert([values]);

  if (error) {
    console.error('Error creating item:', error);
    return null;
  }

  return data?.[0];
};
export const getItemDiss = async () => {
  const { data, error } = await supabase
    .from('ItemManagementDis')
    .select('*')
    .eq('status', true);

  if (error) {
    console.error('Error fetching items:', error);
    return [];
  }

  return data;
};
export const getDeleteItemDiss = async () => {
  const { data, error } = await supabase
    .from('ItemManagementDis')
    .select('*')
    .eq('status', false);

  if (error) {
    console.error('Error fetching deleted items:', error);
    return [];
  }

  return data;
};
export const getItemDisById = async (id: string) => {
  const { data, error } = await supabase
    .from('ItemManagementDis')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error getting item by ID:', error);
    return null;
  }

  return data;
};
export const updateItemDis = async (data: any) => {
  const { error } = await supabase
    .from('ItemManagementDis')
    .update(data)
    .eq('id', data.id);

  if (error) {
    console.error('Error updating item:', error);
  }
};
export const deleteItemDis = async (id: string) => {
  const { error } = await supabase
    .from('ItemManagementDis')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting item:', error);
  }
};

export const searchItemDiss = async (searchTerm: string) => {
  const { data, error } = await supabase
    .from('ItemManagementDis')
    .select('*')
    .eq('status', true)
    .or(`model.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,boxNumber.ilike.%${searchTerm}%`);

  if (error) {
    console.error('Error searching items:', error);
    return [];
  }

  return data;
};
