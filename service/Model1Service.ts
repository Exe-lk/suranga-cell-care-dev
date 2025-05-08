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

// export const createModel = async (
// 	name: string,
// 	description: string,
// 	brand: string,
// 	category: string,
// ) => {
// 	const status = true;
// 	const timestamp = Timestamp.now();
// 	const docRef = await addDoc(collection(firestore, 'ModelAccessory'), {
// 		name,
// 		description,
// 		brand,
// 		category,
// 		status,
// 		timestamp: timestamp,
// 	});
// 	return docRef.id;
// };

// export const getModel = async () => {
// 	const q = query(collection(firestore, 'ModelAccessory'), where('status', '==', true));
// 	const querySnapshot = await getDocs(q);
// 	return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
// };

// export const getDeleteModel = async () => {
// 	const q = query(collection(firestore, 'ModelAccessory'), where('status', '==', false));
// 	const querySnapshot = await getDocs(q);
// 	return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
// };

// export const getModelById = async (id: string) => {
// 	const ModelRef = doc(firestore, 'ModelAccessory', id);
// 	const ModelSnap = await getDoc(ModelRef);
// 	if (ModelSnap.exists()) {
// 		return { id: ModelSnap.id, ...ModelSnap.data() };
// 	} else {
// 		return null;
// 	}
// };

// export const updateModel1 = async (
// 	id: string,
// 	name: string,
// 	description: string,
// 	brand: string,
// 	category: string,
// 	status: boolean,
// ) => {
// 	const ModelRef = doc(firestore, 'ModelAccessory', id);
// 	await updateDoc(ModelRef, { name, description, brand, category, status });
// };

// export const updateModel = async (
// 	id: string,
// 	name: string,
// 	description: string,
// 	brand: string,
// 	category: string,
// 	status: boolean,
// ) => {
// 	const ModelRef = doc(firestore, 'ModelAccessory', id);
// 	const ModelDoc: any = await getDoc(ModelRef);

// 	await updateDoc(ModelRef, { name, description, brand, category, status });
// 	if (!ModelDoc.exists()) {
// 		console.error(`Category with ID "${id}" does not exist.`);
// 		// return;
// 	}
// 	const oldName = ModelDoc.data().brand; // Get the old category name
// 	const oldcategory = ModelDoc.data().category;
// 	const oldmodel = ModelDoc.data().name;

//   console.log(oldName)
// 	const itemManagementRef = collection(firestore, 'ItemManagementAcce');
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
// 		const itemDocRef = doc(firestore, 'ItemManagementAcce', docSnapshot.id);
// 		return updateDoc(itemDocRef, { brand: brand, category: category, model: name });
// 	});

// 	// Wait for all updates to complete
// 	await Promise.all(batchUpdates);

// 	const stockManagementRef = collection(firestore, 'StockAcce');
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
// 		const stockDocRef = doc(firestore, 'StockAcce', docSnapshot.id);
// 		return updateDoc(stockDocRef, { brand: brand, category: category, model: name });
// 	});

// 	// Wait for all updates to complete
// 	await Promise.all(batchUpdates1);
// };

// export const deleteModel = async (id: string) => {
// 	const ModelRef = doc(firestore, 'ModelAccessory', id);
// 	await deleteDoc(ModelRef);
// };
import { supabase } from '../lib/supabase';

export const createModel = async (
	name: string,
	description: string,
	brand: string,
	category: string
) => {
	console.log("Creating model with:", { name, description, brand, category });
	const status = true;
	const created_at = new Date();

	try {
		const { data, error } = await supabase
			.from('ModelAccessory')
			.insert([{ name, description, brand, category, status, created_at }])
			.select('id, name, description, brand, category, status, created_at');

		if (error) {
			console.error('Error creating model:', error);
			throw error;
		}

		if (!data || data.length === 0) {
			console.error('No data returned after creating model');
			throw new Error('Failed to create model - no data returned');
		}

		console.log('Model created successfully:', data[0]);
		return data[0].id;
	} catch (error) {
		console.error('Error in createModel function:', error);
		throw error;
	}
};

export const getModel = async () => {
	const { data, error } = await supabase
		.from('ModelAccessory')
		.select('*')
		.eq('status', true);

	if (error) {
		console.error('Error fetching models:', error);
		return [];
	}
	console.log("Error:", error);
	return data;
};

export const getDeleteModel = async () => {
	const { data, error } = await supabase
		.from('ModelAccessory')
		.select('*')
		.eq('status', false);

	if (error) {
		console.error('Error fetching deleted models:', error);
		return [];
	}

	return data;
};

export const getModelById = async (id: string) => {
	const { data, error } = await supabase
		.from('ModelAccessory')
		.select('*')
		.eq('id', id)
		.single();

	if (error) {
		console.error('Error getting model by ID:', error);
		return null;
	}

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
		.from('ModelAccessory')
		.update({ name, description, brand, category, status })
		.eq('id', id);

	if (error) {
		console.error('Error updating model:', error);
	}
};

export const updateModel = async (
	id: string,
	name: string,
	description: string,
	brand: string,
	category: string,
	status: boolean
) => {
	const { data: modelData, error: modelError } = await supabase
		.from('ModelAccessory')
		.select('*')
		.eq('id', id)
		.single();

	if (modelError || !modelData) {
		console.error(`Model with ID "${id}" not found.`, modelError);
		return;
	}

	const oldBrand = modelData.brand;
	const oldCategory = modelData.category;
	const oldModel = modelData.name;

	// Update model
	await supabase
		.from('ModelAccessory')
		.update({ name, description, brand, category, status })
		.eq('id', id);

	// Update related items in ItemManagementAcce
	const { data: itemData, error: itemError } = await supabase
		.from('ItemManagementAcce')
		.select('id')
		.eq('brand', oldBrand)
		.eq('category', oldCategory)
		.eq('model', oldModel);

	if (itemError) {
		console.error('Error fetching related items:', itemError);
	}

	const itemUpdates = itemData?.map((item) =>
		supabase
			.from('ItemManagementAcce')
			.update({ brand, category, model: name })
			.eq('id', item.id)
	);

	if (itemUpdates) await Promise.all(itemUpdates);

	// Update related items in StockAcce
	const { data: stockData, error: stockError } = await supabase
		.from('StockAcce')
		.select('id')
		.eq('brand', oldBrand)
		.eq('category', oldCategory)
		.eq('model', oldModel);

	if (stockError) {
		console.error('Error fetching related stock items:', stockError);
	}

	const stockUpdates = stockData?.map((stock) =>
		supabase
			.from('StockAcce')
			.update({ brand, category, model: name })
			.eq('id', stock.id)
	);

	if (stockUpdates) await Promise.all(stockUpdates);
};

export const deleteModel = async (id: string) => {
	const { error } = await supabase
		.from('ModelAccessory')
		.delete()
		.eq('id', id);

	if (error) {
		console.error('Error deleting model:', error);
	}
};
  