// import { firestore } from '../firebaseConfig';
// import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';

// export const createTechnician = async (technicianNum: string, name: string, type: string, mobileNumber: string) => {
//   const status = true;
//   const docRef = await addDoc(collection(firestore, 'technician'), { technicianNum, name, type, mobileNumber, status });
//   return docRef.id;
// };

// export const getTechnicians = async () => {
//   const q = query(collection(firestore, 'technician'), where('status', '==', true));
//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// };

// export const getDeleteTechnicians = async () => {
//   const q = query(collection(firestore, 'technician'), where('status', '==', false));
//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// };

// export const getTechnicianById = async (id: string) => {
//   const technicianRef = doc(firestore, 'technician', id);
//   const technicianSnap = await getDoc(technicianRef);
//   if (technicianSnap.exists()) {
//     return { id: technicianSnap.id, ...technicianSnap.data() };
//   } else {
//     return null;
//   }
// };

// export const updateTechnician = async (id: string, technicianNum: string, name: string, type: string, mobileNumber: string, status: any) => {
//   const technicianRef = doc(firestore, 'technician', id);
//   await updateDoc(technicianRef, { technicianNum, name, type, mobileNumber, status });
// };

// export const deleteTechnician = async (id: string) => {
//   const technicianRef = doc(firestore, 'technician', id);
//   await deleteDoc(technicianRef);
// };

// technicianService.ts
import { supabase } from '../lib/supabase';

// Create a Technician
export const createTechnician = async (
  technicianNum: string,
  name: string,
  type: string,
  mobileNumber: string
) => {
  console.log(name)
  const { data, error } = await supabase
    .from('technicians') // Replace 'technicians' with your actual table name
    .insert([
      {
        technicianNum,
        name,
        type,
        mobileNumber,
        status: true,
      },
    ]);

  if (error) throw error;
  return data;
};

// Get Active Technicians
export const getTechnicians = async () => {
  const { data, error } = await supabase
    .from('technicians') // Replace 'technicians' with your actual table name
    .select('*')
    .eq('status', true);

  if (error) throw error;
  return data;
};

// Get Deleted Technicians (Soft Delete: status = false)
export const getDeleteTechnicians = async () => {
  const { data, error } = await supabase
    .from('technicians') // Replace 'technicians' with your actual table name
    .select('*')
    .eq('status', false);

  if (error) throw error;
  return data;
};

// Get Technician by ID
export const getTechnicianById = async (id: string) => {
  const { data, error } = await supabase
    .from('technicians') // Replace 'technicians' with your actual table name
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Update Technician
export const updateTechnician = async (
  id: string,
  technicianNum: string,
  name: string,
  type: string,
  mobileNumber: string,
  status: boolean
) => {
  const { data, error } = await supabase
    .from('technicians') // Replace 'technicians' with your actual table name
    .update({
      technicianNum,
      name,
      type,
      mobileNumber,
      status,
    })
    .eq('id', id);

  if (error) throw error;
  return data;
};

// Delete Technician (Soft Delete: Change status to false)
export const deleteTechnician = async (id: string) => {
  console.log(id)
  const { data, error } = await supabase
    .from('technicians') // Replace 'technicians' with your actual table name
    .delete()
    .eq('id', id);

  if (error) throw error;
  return data;
};

// Search Technicians
export const searchTechnicians = async (searchTerm: string) => {
  const { data, error } = await supabase
    .from('technicians')
    .select('*')
    .eq('status', true)
    .or(`name.ilike.%${searchTerm}%,technicianNum.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%,mobileNumber.ilike.%${searchTerm}%`);

  if (error) throw error;
  return data;
};
