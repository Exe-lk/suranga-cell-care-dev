// import { firestore } from '../firebaseConfig';
// import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, Timestamp } from 'firebase/firestore';

// export const createModel = async (name: string,brand: string, category: string) => {
//   const status = true;
//   const timestamp = Timestamp.now();
//   const docRef = await addDoc(collection(firestore, 'ModelDisplay'), { name, brand, category, status, timestamp: timestamp });
//   return docRef.id;
// };

// export const getModel = async () => {
//   const q = query(collection(firestore, 'ModelDisplay'), where('status', '==', true));
//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// };

// export const getDeleteModel = async () => {
//   const q = query(collection(firestore, 'ModelDisplay'), where('status', '==', false));
//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// };

// export const getModelById = async (id: string) => {
//   const ModelRef = doc(firestore, 'ModelDisplay', id);
//   const ModelSnap = await getDoc(ModelRef);
//   if (ModelSnap.exists()) {
//     return { id: ModelSnap.id, ...ModelSnap.data() };
//   } else {
//     return null;
//   }
// };

// export const updateModel1 = async (id: string, name: string,description:string, brand: string, category: string, status: boolean) => {
//   const ModelRef = doc(firestore, 'ModelDisplay', id);
//   console.log(status);
//   await updateDoc(ModelRef, { name, brand, category, status });
// };
// export const updateModel = async (
// 	id: string,
// 	name: string,
	
// 	brand: string,
// 	category: string,
// 	status: boolean,
// ) => {
// 	const ModelRef = doc(firestore, 'ModelDisplay', id);
// 	const ModelDoc: any = await getDoc(ModelRef);

// 	await updateDoc(ModelRef, { name, brand, category, status });
// 	if (!ModelDoc.exists()) {
// 		console.error(`Category with ID "${id}" does not exist.`);
// 		// return;
// 	}
// 	const oldName = ModelDoc.data().brand; // Get the old category name
// 	const oldcategory = ModelDoc.data().category;
// 	const oldmodel = ModelDoc.data().name;

//   console.log(oldName)
// 	const itemManagementRef = collection(firestore, 'ItemManagementDis');
// 	const itemQuery = query(
// 		itemManagementRef,
// 		where('brand', '==', oldName),
// 		where('category', '==', oldcategory),
// 		where('model', '==', oldmodel),
// 	);
// 	const querySnapshot = await getDocs(itemQuery);
  
// 	if (!querySnapshot.empty) {
// 		console.log(`No documents found in ItemManagementAcce with category name "${oldName}".`);
// 	}

// 	// Update the category name in the matching ItemManagementAcce documents
// 	const batchUpdates = querySnapshot.docs.map((docSnapshot) => {
// 		const itemDocRef = doc(firestore, 'ItemManagementDis', docSnapshot.id);
// 		return updateDoc(itemDocRef, { brand: brand, category: category, model: name });
// 	});

// 	// Wait for all updates to complete
// 	await Promise.all(batchUpdates);

// 	const stockManagementRef = collection(firestore, 'Stock');
// 	const stockQuery = query(
// 		stockManagementRef,
// 		where('brand', '==', oldName),
// 		where('category', '==', oldcategory),
// 		where('model', '==', oldmodel),
// 	);
// 	const querySnapshot1 = await getDocs(stockQuery);

// 	if (querySnapshot1.empty) {
// 		console.log(`No documents found in ItemManagementAcce with category name "${oldName}".`);
// 	}

// 	// Update the category name in the matching ItemManagementAcce documents
// 	const batchUpdates1 = querySnapshot1.docs.map((docSnapshot) => {
// 		const stockDocRef = doc(firestore, 'Stock', docSnapshot.id);
// 		return updateDoc(stockDocRef, { brand: brand, category: category, model: name });
// 	});

// 	// Wait for all updates to complete
// 	await Promise.all(batchUpdates1);
// };
// export const deleteModel = async (id: string) => {
//   const ModelRef = doc(firestore, 'ModelDisplay', id);
//   await deleteDoc(ModelRef);
// };
import { supabase } from '../lib/supabase';

export const createModel = async (name: string, brand: string, category: string, description: string) => {
  const status = true;
  const timestamp = new Date();

  const { data, error } = await supabase
    .from('ModelDisplay')
    .insert([{ name, brand, category, description, status }])
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const getModel = async () => {
  const { data, error } = await supabase
    .from('ModelDisplay')
    .select('*')
    .eq('status', true);

  if (error) throw error;
  return data;
};

export const getDeleteModel = async () => {
  const { data, error } = await supabase
    .from('ModelDisplay')
    .select('*')
    .eq('status', false);

  if (error) throw error;
  return data;
};

export const getModelById = async (id: string) => {
  const { data, error } = await supabase
    .from('ModelDisplay')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
};

export const updateModel1 = async (
  id: string,
  name: string,
  description: string,
  brand: string,
  category: string,
  status: boolean
) => {
  const { error } = await supabase
    .from('ModelDisplay')
    .update({ name, brand, category, status })
    .eq('id', id);

  if (error) throw error;
};

export const updateModel = async (
  id: string,
  name: string,
  brand: string,
  category: string,
  status: boolean,
  description: string
) => {
  const { data: modelData, error: modelError } = await supabase
    .from('ModelDisplay')
    .select('*')
    .eq('id', id)
    .single();

  if (modelError || !modelData) {
    console.error(`Model with ID "${id}" does not exist.`);
    return;
  }

  const { name: oldName, brand: oldBrand, category: oldCategory } = modelData;

  await supabase
    .from('ModelDisplay')
    .update({ name, brand, category, status, description })
    .eq('id', id);

  const { data: itemDocs, error: itemError } = await supabase
    .from('ItemManagementDis')
    .select('id')
    .eq('brand', oldBrand)
    .eq('category', oldCategory)
    .eq('model', oldName);

  if (itemError) throw itemError;

  const itemUpdates = itemDocs.map(doc =>
    supabase
      .from('ItemManagementDis')
      .update({ brand, category, model: name })
      .eq('id', doc.id)
  );
  await Promise.all(itemUpdates);

  const { data: stockDocs, error: stockError } = await supabase
    .from('Stock')
    .select('id')
    .eq('brand', oldBrand)
    .eq('category', oldCategory)
    .eq('model', oldName);

  if (stockError) throw stockError;

  const stockUpdates = stockDocs.map(doc =>
    supabase
      .from('Stock')
      .update({ brand, category, model: name })
      .eq('id', doc.id)
  );
  await Promise.all(stockUpdates);
};

export const deleteModel = async (id: string) => {
  const { error } = await supabase
    .from('ModelDisplay')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const searchModels = async (searchTerm: string) => {
  const { data, error } = await supabase
    .from('ModelDisplay')
    .select('*')
    .eq('status', true)
    .or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`);

  if (error) throw error;
  return data;
};
