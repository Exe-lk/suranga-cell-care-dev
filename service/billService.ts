import { firestore } from '../firebaseConfig';
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, setDoc } from 'firebase/firestore';

export const createBill = async (data:any) => {
  const status = true;
  console.log(data)
  const docRef = doc(firestore, 'bill', data.billNumber);

  // Set the data to the document
  await setDoc(docRef, data);

  // Return the custom ID after creating the document
  return data.billNumber;
};

export const getBills = async () => {
  const q = query(collection(firestore, 'bill'), where('status', '==', true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDeleteBills = async () => {
  const q = query(collection(firestore, 'bill'), where('status', '==', false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getBillById = async (id: string) => {
  const billRef = doc(firestore, 'bill', id);
  const billSnap = await getDoc(billRef);
  if (billSnap.exists()) {
    return { id: billSnap.id, ...billSnap.data() };
  } else {
    return null;
  }
};

export const updateBill = async (data:any) => {
  console.log(data)
  const billRef = doc(firestore, 'bill', data.id);
  await updateDoc(billRef,data);
};

export const deleteBill = async (id: string) => {
  const billRef = doc(firestore, 'bill', id);
  await deleteDoc(billRef);
};
