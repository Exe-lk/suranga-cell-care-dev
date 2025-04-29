// import { firestore } from '../firebaseConfig';
// import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, Timestamp } from 'firebase/firestore';

// export const Creatbill = async (values: any) => {
//   values.status = true;
//   values.timestamp = Timestamp.now();
//   const docRef = await addDoc(collection(firestore, 'displaybill'), values);
//   return docRef.id;
// };

// export const Getbills= async () => {
//   const q = collection(firestore, 'displaybill');
//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// };
import { supabase } from '../lib/supabase';
export const  Creatbill = async (values: any) => {
  values.status = true;
  values.timestamp = new Date(); // Supabase accepts JS Date objects
  const { data, error } = await supabase
    .from('displaybill')
    .insert([values]);

  if (error) {
    console.error('Error creating bill:', error);
    return null;
  }

  return data;
};
export const Getbills = async () => {
  const { data, error } = await supabase
    .from('displaybill')
    .select('*');

  if (error) {
    console.error('Error fetching bills:', error);
    return [];
  }

  return data;
};
