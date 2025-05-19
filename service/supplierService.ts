// import { firestore } from '../firebaseConfig';
// import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';

// export const createSupplier = async (name: string, email: string, address: string, mobileNumber: string, item: any,type:string) => {
//   const status = true;
//   const docRef = await addDoc(collection(firestore, 'supplier'), { name, email, address, mobileNumber, item, status,type });
//   return docRef.id;
// };

// export const getSuppliers = async () => {
//   const q = query(collection(firestore, 'supplier'), where('status', '==', true));
//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// };

// export const getDeleteSuppliers = async () => {
//   const q = query(collection(firestore, 'supplier'), where('status', '==', false));
//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// };

// export const getSupplierById = async (id: string) => {
//   const supplierRef = doc(firestore, 'supplier', id);
//   const supplierSnap = await getDoc(supplierRef);
//   if (supplierSnap.exists()) {
//     return { id: supplierSnap.id, ...supplierSnap.data() };
//   } else {
//     return null;
//   }
// };

// export const updateSupplier = async (id: string, name: string, email: string, address: string, mobileNumber: string, item: any, status: any,type:any) => {
//   const supplierRef = doc(firestore, 'supplier', id);
//   await updateDoc(supplierRef, { name, email, address, mobileNumber, item, status, type });
// };

// export const deleteSupplier = async (id: string) => {
//   const supplierRef = doc(firestore, 'supplier', id);
//   await deleteDoc(supplierRef);
// };
// supplierService.ts
import { supabase } from '../lib/supabase';

// Create a Supplier
export const createSupplier = async (
  name: string,
  email: string,
  address: string,
  mobileNumber: string,
  item: any,
  type: string
) => {
  const { data, error } = await supabase
    .from('suppliers') // Replace 'suppliers' with your actual table name
    .insert([
      {
        name,
        email,
        address,
        mobile_number: mobileNumber,
        item,
        status: true,
        type,
      },
    ]);

  if (error) throw error;
  return data;
};

// Get Active Suppliers
export const getSuppliers = async () => {
  const { data, error } = await supabase
    .from('suppliers') // Replace 'suppliers' with your actual table name
    .select('*')
    .eq('status', true);

  if (error) throw error;
  
  // Transform data to match frontend camelCase naming
  return data.map(supplier => ({
    ...supplier,
    mobileNumber: supplier.mobile_number
  }));
};

// Get Deleted Suppliers
export const getDeleteSuppliers = async () => {
  const { data, error } = await supabase
    .from('suppliers') // Replace 'suppliers' with your actual table name
    .select('*')
    .eq('status', false);

  if (error) throw error;
  
  // Transform data to match frontend camelCase naming
  return data.map(supplier => ({
    ...supplier,
    mobileNumber: supplier.mobile_number
  }));
};

// Get Supplier by ID
export const getSupplierById = async (id: string) => {
  const { data, error } = await supabase
    .from('suppliers') // Replace 'suppliers' with your actual table name
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  
  // Transform data to match frontend camelCase naming
  return {
    ...data,
    mobileNumber: data.mobile_number
  };
};

// Update Supplier
export const updateSupplier = async (
  id: string,
  name: string,
  email: string,
  address: string,
  mobileNumber: string,
  item: any,
  status: boolean,
  type: any
) => {
  const { data, error } = await supabase
    .from('suppliers') // Replace 'suppliers' with your actual table name
    .update({ name, email, address, mobile_number: mobileNumber, item, status, type })
    .eq('id', id);

  if (error) throw error;
  return data;
};

// Delete Supplier (Soft Delete: Change status to false)
export const deleteSupplier = async (id: string) => {
  const { data, error } = await supabase
    .from('suppliers') // Replace 'suppliers' with your actual table name
    .update({ status: false })
    .eq('id', id);

  if (error) throw error;
  return data;
};
