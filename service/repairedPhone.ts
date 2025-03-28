import { firestore } from '../firebaseConfig';
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, Timestamp } from 'firebase/firestore';

export const updaterepairedPhone = async (id: string, Status: string) => {
  const repairedPhoneRef = doc(firestore, 'bill', id);
  await updateDoc(repairedPhoneRef, { Status });
};