// import { firestore } from '../firebaseConfig';
// import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, Timestamp } from 'firebase/firestore';

// export const updaterepairedPhone = async (id: string, Status: string) => {
//   const repairedPhoneRef = doc(firestore, 'bill', id);
//   await updateDoc(repairedPhoneRef, { Status });
// };
import { supabase } from '../lib/supabase';

export const updaterepairedPhone = async (id: string, Status: string) => {
  const { error } = await supabase
    .from('bill')
    .update({ Status })
    .eq('billNumber', id);

  if (error) {
    console.error('Error updating repaired phone status:', error.message);
    throw error;
  }
};

export const createBill = async (data: any) => {
  const { billNumber, ...rest } = data;
  const status = true;

  const { error } = await supabase
    .from('bill')
    .upsert([{ billNumber, status, ...rest }], { onConflict: 'billNumber' });

  if (error) throw error;

  return billNumber;
};
