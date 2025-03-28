import { firestore } from '../firebaseConfig';
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';

export const createTechnician = async (technicianNum: string, name: string, type: string, mobileNumber: string) => {
  const status = true;
  const docRef = await addDoc(collection(firestore, 'technician'), { technicianNum, name, type, mobileNumber, status });
  return docRef.id;
};

export const getTechnicians = async () => {
  const q = query(collection(firestore, 'technician'), where('status', '==', true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDeleteTechnicians = async () => {
  const q = query(collection(firestore, 'technician'), where('status', '==', false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getTechnicianById = async (id: string) => {
  const technicianRef = doc(firestore, 'technician', id);
  const technicianSnap = await getDoc(technicianRef);
  if (technicianSnap.exists()) {
    return { id: technicianSnap.id, ...technicianSnap.data() };
  } else {
    return null;
  }
};

export const updateTechnician = async (id: string, technicianNum: string, name: string, type: string, mobileNumber: string, status: any) => {
  const technicianRef = doc(firestore, 'technician', id);
  await updateDoc(technicianRef, { technicianNum, name, type, mobileNumber, status });
};

export const deleteTechnician = async (id: string) => {
  const technicianRef = doc(firestore, 'technician', id);
  await deleteDoc(technicianRef);
};
