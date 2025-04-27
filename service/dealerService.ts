// import { firestore } from '../firebaseConfig';
// import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';

// export const createDealer = async (name: string, email: string, address: string, mobileNumber: string, item: any) => {
//   const status = true;
//   const docRef = await addDoc(collection(firestore, 'dealer'), { name, email, address, mobileNumber, item, status });
//   return docRef.id;
// };

// export const getDealers = async () => {
//   const q = query(collection(firestore, 'dealer'), where('status', '==', true));
//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// };

// export const getDeleteDealers = async () => {
//   const q = query(collection(firestore, 'dealer'), where('status', '==', false));
//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// };

// export const getDealerById = async (id: string) => {
//   const dealerRef = doc(firestore, 'dealer', id);
//   const dealerSnap = await getDoc(dealerRef);
//   if (dealerSnap.exists()) {
//     return { id: dealerSnap.id, ...dealerSnap.data() };
//   } else {
//     return null;
//   }
// };

// export const updateDealer = async (id: string, name: string, email: string, address: string, mobileNumber: string, item: any, status: any) => {
//   const dealerRef = doc(firestore, 'dealer', id);
//   await updateDoc(dealerRef, { name, email, address, mobileNumber, item, status });
// };

// export const deleteDealer = async (id: string) => {
//   const dealerRef = doc(firestore, 'dealer', id);
//   await deleteDoc(dealerRef);
// };
import { supabase } from '../lib/supabase';


export const createDealer = async (
  name: string,
  email: string,
  address: string,
  mobileNumber: string,
  item: any
) => {
  const { data, error } = await supabase
    .from('dealer')
    .insert([{ name, email, address, mobileNumber, item, status: true }]);

  if (error) {
    console.error('Error creating dealer:', error);
    return null;
  }

  return data;
};
export const getDealers = async () => {
  const { data, error } = await supabase
    .from('dealer')
    .select('*')
    .eq('status', true);

  if (error) {
    console.error('Error fetching dealers:', error);
    return [];
  }

  return data;
};
export const getDeleteDealers = async () => {
  const { data, error } = await supabase
    .from('dealer')
    .select('*')
    .eq('status', false);

  if (error) {
    console.error('Error fetching deleted dealers:', error);
    return [];
  }

  return data;
};
export const getDealerById = async (id: string) => {
  const { data, error } = await supabase
    .from('dealer')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching dealer:', error);
    return null;
  }

  return data;
};
export const updateDealer = async (
  id: string,
  name: string,
  email: string,
  address: string,
  mobileNumber: string,
  item: any,
  status: boolean
) => {
  const { error } = await supabase
    .from('dealer')
    .update({ name, email, address, mobileNumber, item, status })
    .eq('id', id);

  if (error) {
    console.error('Error updating dealer:', error);
  }
};
export const deleteDealer = async (id: string) => {
  const { error } = await supabase
    .from('dealer')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting dealer:', error);
  }
};
