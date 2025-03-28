import { firestore } from '../firebaseConfig';
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';

export const createSupplier = async (name: string, email: string, address: string, mobileNumber: string, item: any,type:string) => {
  const status = true;
  const docRef = await addDoc(collection(firestore, 'supplier'), { name, email, address, mobileNumber, item, status,type });
  return docRef.id;
};

export const getSuppliers = async () => {
  const q = query(collection(firestore, 'supplier'), where('status', '==', true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDeleteSuppliers = async () => {
  const q = query(collection(firestore, 'supplier'), where('status', '==', false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getSupplierById = async (id: string) => {
  const supplierRef = doc(firestore, 'supplier', id);
  const supplierSnap = await getDoc(supplierRef);
  if (supplierSnap.exists()) {
    return { id: supplierSnap.id, ...supplierSnap.data() };
  } else {
    return null;
  }
};

export const updateSupplier = async (id: string, name: string, email: string, address: string, mobileNumber: string, item: any, status: any,type:any) => {
  const supplierRef = doc(firestore, 'supplier', id);
  await updateDoc(supplierRef, { name, email, address, mobileNumber, item, status, type });
};

export const deleteSupplier = async (id: string) => {
  const supplierRef = doc(firestore, 'supplier', id);
  await deleteDoc(supplierRef);
};
