// import { firestore } from '../firebaseConfig';
// import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';

// export const createItemAcce = async (values:any) => {
//   const status = true;
//   const docRef = await addDoc(collection(firestore, 'ItemManagementAcce'), values);
//   return docRef.id;
// };

// export const getItemAcces = async () => {
//   const q = query(collection(firestore, 'ItemManagementAcce'), where('status', '==', true));
//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// };

// export const getDeleteItemAcces = async () => {
//   const q = query(collection(firestore, 'ItemManagementAcce'), where('status', '==', false));
//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// };

// export const getItemAcceById = async (id: string) => {
//   const ItemAcceRef = doc(firestore, 'ItemManagementAcce', id);
//   const ItemAcceSnap = await getDoc(ItemAcceRef);
//   if (ItemAcceSnap.exists()) {
//     return { id: ItemAcceSnap.id, ...ItemAcceSnap.data() };
//   } else {
//     return null;
//   }
// };

// export const updateItemAcce = async (id: string, type: string, mobileType: string, category: string, model: string, quantity: string, brand: string, reorderLevel: string, description: string, code: any,status:any,warranty:any) => {
//   const ItemAcceRef = doc(firestore, 'ItemManagementAcce', id);
//   await updateDoc(ItemAcceRef, { type, mobileType, category, model, quantity, brand, reorderLevel, description, code ,status,warranty});
// };

// export const deleteItemAcce = async (id: string) => {
//   const ItemAcceRef = doc(firestore, 'ItemManagementAcce', id);
//   await deleteDoc(ItemAcceRef);
// };
import { supabase } from '../lib/supabase';
export const createItemAcce = async (values: any) => {
  values.status = true; // ensure status is set
  values.created_at = new Date(); // add created_at timestamp
  
  const { data, error } = await supabase
    .from('ItemManagementAcce')
    .insert([values])
    .select();
  
  if (error) {
    console.error('Error creating item:', error);
    throw error;
  }
  
  return data?.[0]?.id;
};
export const getItemAcces = async () => {

  // const { data, error } = await supabase
  //   .from('ItemManagementAcce')
  //   .select('*')
  //   .eq('status', true);

    const { data: firstBatch, error: err1 } = await supabase
    .from('ItemManagementAcce')
    .select('*')
    .range(0, 999)  // First 1000 rows
    .eq('status', true);
  const { data: secondBatch, error: err2 } = await supabase
  .from('ItemManagementAcce')
    .select('*')
    .range(1000, 2000)
    .eq('status', true);  // Next 800 rows
  
  // Combine both batches
  const allData = [...(firstBatch || []), ...(secondBatch || [])];



  if (err1 || err2) {
    console.error('Error fetching items:', err1);
    return [];
  }

  return allData;
};

export const getDeleteItemAcces = async () => {
  const { data, error } = await supabase
    .from('ItemManagementAcce')
    .select('*')
    .eq('status', false);

  if (error) {
    console.error('Error fetching deleted items:', error);
    return [];
  }

  return data;
};
export const getItemAcceById = async (id: string) => {
  const { data, error } = await supabase
    .from('ItemManagementAcce')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching item with ID ${id}:`, error);
    return null;
  }

  return data;
};
export const updateItemAcce = async (
  id: string,
  type: string,
  mobileType: string,
  category: string,
  model: string,
  quantity: string,
  brand: string,
  reorderLevel: string,
  description: string,
  code: any,
  status: any,
  warranty: any
) => {
  const { error } = await supabase
    .from('ItemManagementAcce')
    .update({ type, mobileType, category, model, quantity, brand, reorderLevel, description, code, status, warranty })
    .eq('id', id);

  if (error) {
    console.error('Error updating item:', error);
  }
};
export const deleteItemAcce = async (id: string) => {
  const { error } = await supabase
    .from('ItemManagementAcce')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting item:', error);
  }
};
