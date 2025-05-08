// import { firestore } from '../firebaseConfig';
// import {
// 	addDoc,
// 	collection,
// 	getDocs,
// 	doc,
// 	updateDoc,
// 	deleteDoc,
// 	getDoc,
// 	query,
// 	where,
// 	Timestamp,
// } from 'firebase/firestore';

// export const createCategory = async (name: string) => {
// 	const status = true;
// 	const timestamp = Timestamp.now();
// 	const docRef = await addDoc(collection(firestore, 'CategoryAccessory'), {
// 		name,
// 		status,
// 		timestamp: timestamp,
// 	});
// 	return docRef.id;
// };

// export const getCategory = async () => {
// 	const q = query(collection(firestore, 'CategoryAccessory'), where('status', '==', true));
// 	const querySnapshot = await getDocs(q);
// 	return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
// };

// export const getDeleteCategory = async () => {
// 	const q = query(collection(firestore, 'CategoryAccessory'), where('status', '==', false));
// 	const querySnapshot = await getDocs(q);
// 	return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
// };

// export const getCategoryById = async (id: string) => {
// 	const categoryRef = doc(firestore, 'CategoryAccessory', id);
// 	const categorySnap = await getDoc(categoryRef);
// 	if (categorySnap.exists()) {
// 		return { id: categorySnap.id, ...categorySnap.data() };
// 	} else {
// 		return null;
// 	}
// };

// // export const updateCategory = async (id: string, name: string, status: boolean) => {
// //   const categoryRef = doc(firestore, 'CategoryAccessory', id);
// //   console.log(name)
// //   await updateDoc(categoryRef, { name, status });
// // };
// export const updateCategory = async (id: string, newName: string, status: boolean) => {
// 	try {
// 		// Get the old category name from the CategoryAccessory document
// 		const categoryRef = doc(firestore, 'CategoryAccessory', id);
// 		const categoryDoc: any = await getDoc(categoryRef);

// 		if (!categoryDoc.exists()) {
// 			console.error(`Category with ID "${id}" does not exist.`);
// 		}

// 		const oldName = categoryDoc.data().name; // Get the old category name
// 		console.log(`Old category name: "${oldName}"`);

// 		// Update the category name in the CategoryAccessory document
// 		await updateDoc(categoryRef, { name: newName, status });

// 		// Fetch all ItemManagementAcce documents with the matching old category name
// 		const itemManagementRef = collection(firestore, 'ItemManagementAcce');
// 		const itemQuery = query(itemManagementRef, where('category', '==', oldName));
// 		const querySnapshot = await getDocs(itemQuery);

// 		if (querySnapshot.empty) {
// 			console.log(
// 				`No documents found in ItemManagementAcce with category name "${oldName}".`,
// 			);
// 		}

// 		// Update the category name in the matching ItemManagementAcce documents
// 		const batchUpdates = querySnapshot.docs.map((docSnapshot) => {
// 			const itemDocRef = doc(firestore, 'ItemManagementAcce', docSnapshot.id);
// 			return updateDoc(itemDocRef, { category: newName });
// 		});

// 		// Wait for all updates to complete
// 		await Promise.all(batchUpdates);

// 		const stockManagementRef = collection(firestore, 'StockAcce');
// 		const stockQuery = query(stockManagementRef, where('category', '==', oldName));
// 		const querySnapshot1 = await getDocs(stockQuery);

// 		if (querySnapshot1.empty) {
// 			console.log(
// 				`No documents found in ItemManagementAcce with category name "${oldName}".`,
// 			);
// 		}

// 		// Update the category name in the matching ItemManagementAcce documents
// 		const batchUpdates1 = querySnapshot1.docs.map((docSnapshot) => {
// 			const stockDocRef = doc(firestore, 'StockAcce', docSnapshot.id);
// 			return updateDoc(stockDocRef, { category: newName });
// 		});

// 		// Wait for all updates to complete
// 		await Promise.all(batchUpdates1);

// 		console.log(
// 			`Category name updated from "${oldName}" to "${newName}" and reflected in related documents.`,
// 		);
// 	} catch (error) {
// 		console.error('Error updating category:', error);
// 	}
// };

// export const deleteCategory = async (id: string) => {
// 	const categoryRef = doc(firestore, 'CategoryAccessory', id);
// 	await deleteDoc(categoryRef);
// };
import { supabase } from '../lib/supabase';
export const createCategory = async (name: string) => {
	const { data, error } = await supabase
	  .from('CategoryAccessory')
	  .insert([{ name, status: true }]);
  
	if (error) {
	  console.error('Error creating category:', error);
	  return null;
	}
  
	return data;
  };
  export const getCategory = async () => {
	const { data, error } = await supabase
	  .from('CategoryAccessory')
	  .select('*')
	  .eq('status', true);
  
	if (error) {
	  console.error('Error fetching categories:', error);
	  return [];
	}
  
	return data;
  };
  export const getDeleteCategory = async () => {
	const { data, error } = await supabase
	  .from('CategoryAccessory')
	  .select('*')
	  .eq('status', false);
  
	if (error) {
	  console.error('Error fetching deleted categories:', error);
	  return [];
	}
  
	return data;
  };
  export const getCategoryById = async (id: string) => {
	const { data, error } = await supabase
	  .from('CategoryAccessory')
	  .select('*')
	  .eq('id', id)
	  .single();
  
	if (error) {
	  console.error(`Error fetching category with ID ${id}:`, error);
	  return null;
	}
  
	return data;
  };
  export const updateCategory = async (id: string, newName: string, status: boolean) => {
	// Fetch the existing category to get the old name
	const { data: existingCategory, error: fetchError } = await supabase
	  .from('CategoryAccessory')
	  .select('name')
	  .eq('id', id)
	  .single();
  
	if (fetchError || !existingCategory) {
	  console.error(`Category with ID "${id}" does not exist.`);
	  return;
	}
  
	const oldName = existingCategory.name;
  
	// Update the category name and status
	const { error: updateError } = await supabase
	  .from('CategoryAccessory')
	  .update({ name: newName, status })
	  .eq('id', id);
  
	if (updateError) {
	  console.error('Error updating category:', updateError);
	  return;
	}
  
	// Update related records in ItemManagementAcce
	const { error: itemUpdateError } = await supabase
	  .from('ItemManagementAcce')
	  .update({ category: newName })
	  .eq('category', oldName);
  
	if (itemUpdateError) {
	  console.error('Error updating ItemManagementAcce records:', itemUpdateError);
	}
  
	// Update related records in StockAcce
	const { error: stockUpdateError } = await supabase
	  .from('StockAcce')
	  .update({ category: newName })
	  .eq('category', oldName);
  
	if (stockUpdateError) {
	  console.error('Error updating StockAcce records:', stockUpdateError);
	}
  };
  export const deleteCategory = async (id: string) => {
	const { error } = await supabase
	  .from('CategoryAccessory')
	  .delete()
	  .eq('id', id);
  
	if (error) {
	  console.error(`Error deleting category with ID ${id}:`, error);
	}
  };
  
// Search Categories
export const searchCategories = async (searchTerm: string) => {
  const { data, error } = await supabase
    .from('CategoryAccessory')
    .select('*')
    .eq('status', true)
    .ilike('name', `%${searchTerm}%`);

  if (error) {
    console.error('Error searching categories:', error);
    return [];
  }

  return data;
};
  