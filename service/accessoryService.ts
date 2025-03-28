import { firestore } from '../firebaseConfig';
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, Timestamp } from 'firebase/firestore';

export const Creatbill = async (values: any) => {
  values.status = true;
  values.timestamp = Timestamp.now();
  const docRef = await addDoc(collection(firestore, 'accessorybill'), values);
  return docRef.id;
};

export const Getbills= async () => {
  const q = collection(firestore, 'accessorybill');
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};