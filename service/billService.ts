// import { firestore } from '../firebaseConfig';
// import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, setDoc } from 'firebase/firestore';

// export const createBill = async (data:any) => {
//   const status = true;
//   console.log(data)
//   const docRef = doc(firestore, 'bill', data.billNumber);

//   // Set the data to the document
//   await setDoc(docRef, data);

//   // Return the custom ID after creating the document
//   return data.billNumber;
// };

// export const getBills = async () => {
//   const q = query(collection(firestore, 'bill'), where('status', '==', true));
//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// };

// export const getDeleteBills = async () => {
//   const q = query(collection(firestore, 'bill'), where('status', '==', false));
//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// };

// export const getBillById = async (id: string) => {
//   const billRef = doc(firestore, 'bill', id);
//   const billSnap = await getDoc(billRef);
//   if (billSnap.exists()) {
//     return { id: billSnap.id, ...billSnap.data() };
//   } else {
//     return null;
//   }
// };

// export const updateBill = async (data:any) => {
//   console.log(data)
//   const billRef = doc(firestore, 'bill', data.id);
//   await updateDoc(billRef,data);
// };

// export const deleteBill = async (id: string) => {
//   const billRef = doc(firestore, 'bill', id);
//   await deleteDoc(billRef);
// };

import { supabase } from '../lib/supabase';

// Create bill with custom billNumber as primary key
export const createBill = async (data: any) => {
  const { billNumber, ...rest } = data;
  const status = true;

  const { error } = await supabase
    .from('bill')
    .upsert([{ billNumber, status, ...rest }], { onConflict: 'billNumber' });

  if (error) throw error;

  return billNumber;
};

// Get active bills (status = true)
export const getBills = async () => {
  const { data, error } = await supabase
    .from('bill')
    .select('*')
    .eq('status', true);

  if (error) throw error;
  return data;
};

// Get soft-deleted bills (status = false)
export const getDeleteBills = async () => {
  const { data, error } = await supabase
    .from('bill')
    .select('*')
    .eq('status', false);

  if (error) throw error;
  return data;
};

// Get a bill by ID
export const getBillById = async (id: string) => {
  const { data, error } = await supabase
    .from('bill')
    .select('*')
    .eq('billNumber', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data;
};

// Update a bill
export const updateBill = async (data: any) => {
  const { id, ...rest } = data;

  const { error } = await supabase
    .from('bill')
    .update(rest)
    .eq('billNumber', id);

  if (error) throw error;
};

// Delete a bill
export const deleteBill = async (id: string) => {
  const { error } = await supabase
    .from('bill')
    .delete()
    .eq('billNumber', id);

  if (error) throw error;
};
