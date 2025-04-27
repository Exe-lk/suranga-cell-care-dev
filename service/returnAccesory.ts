// import { firestore } from '../firebaseConfig';
// import { addDoc, collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

// export const saveReturnData = async (data: any) => {
// 	const returnCollection = collection(firestore, 'return');

// 	try {
// 		// Get all documents to find the latest ID
// 		const querySnapshot = await getDocs(returnCollection);
// 		const docIds = querySnapshot.docs.map((doc) => Number(doc.id)).filter((id) => !isNaN(id));

// 		// Find the next numeric ID
// 		const nextId = docIds.length > 0 ? Math.max(...docIds) + 1 : 1;

// 		// Create a document with the custom numeric ID
// 		const newDocRef = doc(returnCollection, nextId.toString());
// 		await setDoc(newDocRef, data);

// 		console.log(`Document created with ID: ${nextId}`);
// 	} catch (error) {
// 		console.error('Error saving return data:', error);
// 	}
// };

// export const saveReturnData1 = async (data: any) => {
// 	const returnCollection = collection(firestore, 'returnDisplay');

// 	try {
// 		// Get all documents to find the latest ID
// 		const querySnapshot = await getDocs(returnCollection);
// 		const docIds = querySnapshot.docs.map((doc) => Number(doc.id)).filter((id) => !isNaN(id));

// 		// Find the next numeric ID
// 		const nextId = docIds.length > 0 ? Math.max(...docIds) + 1 : 1;

// 		// Create a document with the custom numeric ID
// 		const newDocRef = doc(returnCollection, nextId.toString());
// 		await setDoc(newDocRef, data);
// 		return true;
// 		// console.log(`Document created with ID: ${nextId}`);
// 	} catch (error) {
// 		console.error('Error saving return data:', error);
// 	}
// };
// export const updateQuantity = async (id: string, quantity: number) => {
// 	const ModelRef = doc(firestore, 'ItemManagementAcce', id);
// 	console.log(status);
// 	await updateDoc(ModelRef, { quantity: quantity });
// };

// export const updateQuantity1 = async (id: string, quantity: number) => {
// 	const ModelRef = doc(firestore, 'ItemManagementDis', id);
// 	console.log(status);
// 	await updateDoc(ModelRef, { quantity: quantity });
// };
import { supabase } from '../lib/supabase';

// Save to "return" table with custom numeric ID
export const saveReturnData = async (data: any) => {
  try {
    const { data: existingData, error: fetchError } = await supabase
      .from('return')
      .select('id');

    if (fetchError) throw fetchError;

    const docIds = existingData
      ?.map((row: any) => Number(row.id))
      .filter((id: number) => !isNaN(id)) || [];

    const nextId = docIds.length > 0 ? Math.max(...docIds) + 1 : 1;

    const { error: insertError } = await supabase
      .from('return')
      .insert([{ id: nextId, ...data }]);

    if (insertError) throw insertError;

    console.log(`Document created with ID: ${nextId}`);
  } catch (error) {
    console.error('Error saving return data:', error);
  }
};

// Save to "returnDisplay" table with custom numeric ID
export const saveReturnData1 = async (data: any) => {
  try {
    const { data: existingData, error: fetchError } = await supabase
      .from('returnDisplay')
      .select('id');

    if (fetchError) throw fetchError;

    const docIds = existingData
      ?.map((row: any) => Number(row.id))
      .filter((id: number) => !isNaN(id)) || [];

    const nextId = docIds.length > 0 ? Math.max(...docIds) + 1 : 1;

    const { error: insertError } = await supabase
      .from('returnDisplay')
      .insert([{ id: nextId, ...data }]);

    if (insertError) throw insertError;

    return true;
  } catch (error) {
    console.error('Error saving return data:', error);
    return false;
  }
};

// Update quantity in "ItemManagementAcce"
export const updateQuantity = async (id: string, quantity: number) => {
  try {
    const { error } = await supabase
      .from('ItemManagementAcce')
      .update({ quantity })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating quantity in ItemManagementAcce:', error);
  }
};

// Update quantity in "ItemManagementDis"
export const updateQuantity1 = async (id: string, quantity: number) => {
  try {
    const { error } = await supabase
      .from('ItemManagementDis')
      .update({ quantity })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating quantity in ItemManagementDis:', error);
  }
};
