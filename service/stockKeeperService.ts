import { firestore } from '../firebaseConfig';
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';

export const createstockKeeper = async (type: string, description: string) => {
  const status = true;
  const docRef = await addDoc(collection(firestore, 'stockKeeper'), { type, description, status });
  return docRef.id;
};

export const getstockKeeper = async () => {
  const q = query(collection(firestore, 'stockKeeper'), where('status', '==', true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDeletestockKeeper = async () => {
  const q = query(collection(firestore, 'stockKeeper'), where('status', '==', false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getstockKeeperById = async (id: string) => {
  const stockKeeperRef = doc(firestore, 'stockKeeper', id);
  const stockKeeperSnap = await getDoc(stockKeeperRef);
  if (stockKeeperSnap.exists()) {
    return { id: stockKeeperSnap.id, ...stockKeeperSnap.data() };
  } else {
    return null;
  }
};

export const updatestockKeeper = async (id: string, type: string, description: string, status: boolean) => {
  const stockKeeperRef = doc(firestore, 'stockKeeper', id);
  await updateDoc(stockKeeperRef, { type, description, status });
};

export const deletestockKeeper = async (id: string) => {
  const stockKeeperRef = doc(firestore, 'stockKeeper', id);
  await deleteDoc(stockKeeperRef);
};
