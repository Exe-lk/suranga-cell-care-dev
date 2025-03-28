import { firestore } from '../firebaseConfig';
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, Timestamp ,serverTimestamp} from 'firebase/firestore';

export const createstockIn = async (values: any) => {
  values.status = true;
  values.timestamp = Timestamp.now();
  const docRef = await addDoc(collection(firestore, 'StockAcce'), values);
  return docRef.id;
};

export const getstockIns = async () => {
  const q = query(collection(firestore, 'StockAcce'), where('status', '==', true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};


export const getstockInById = async (id: string) => {
  const stockInRef = doc(firestore, 'StockAcce', id);
  const stockInSnap = await getDoc(stockInRef);
  if (stockInSnap.exists()) {
    return { id: stockInSnap.id, ...stockInSnap.data() };
  } else {
    return null;
  }
};
export const updatestockIn = async (id: string, quantity: string) => {
  console.log(id)
  console.log(quantity)
  const stockInRef = doc(firestore, 'ItemManagementAcce', id);
  await updateDoc(stockInRef, { quantity });
};

export const createstockOut = async (model: string, brand: string, category: string, quantity: string, date: string, customerName: string, mobile: string, nic: string, email: string, barcode: string, cost: string, sellingPrice: string, stock: string,description:string) => {
  const status = true;
  const timestamp = Timestamp.now();
  const docRef = await addDoc(collection(firestore, 'StockAcce'), { model, brand, category, quantity, date, customerName, mobile, nic, email, barcode, cost, sellingPrice, stock, status,description, timestamp: timestamp});
  console.log(docRef.id);
  return docRef.id;
};

export const createstockDelete = async (values: any) => {
  values.status = false;
  values.timestamp = Timestamp.now();
  const docRef = await addDoc(collection(firestore, 'StockAcce'), values);
  return docRef.id;
};

export const getstockInByDate = async (date: string) => {
  const q = query(
    collection(firestore, 'StockAcce'),
    where('status', '==', true),
    where('date', '==', date)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
