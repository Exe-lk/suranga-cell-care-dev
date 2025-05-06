// import { firestore } from '../firebaseConfig';
// import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, Timestamp } from 'firebase/firestore';

// export const Creatbill = async (values: any) => {
//   values.status = true;
//   values.timestamp = Timestamp.now();
//   const docRef = await addDoc(collection(firestore, 'accessorybill'), values);
//   return docRef.id;
// };

// export const Getbills= async () => {
//   const q = collection(firestore, 'accessorybill');
//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// };
import { supabase } from '../lib/supabase';

export const Creatbill = async (values: any) => {
  values.status = true;
  console.log(values)
 // Supabase uses JS Date format for timestamp
  const { data, error } = await supabase
    .from('accessorybill')
    .insert([values])
    .select()
    .single(); // returns the inserted row

  if (error) throw error;
  return data.id; // or whatever your primary key column is named
};

export const Getbills = async () => {
  const { data, error } = await supabase
    .from('accessorybill')
    .select('*');

  if (error) throw error;
  return data;
};
