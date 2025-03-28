import { firestore } from '../firebaseConfig';
import {
	addDoc,
	collection,
	getDocs,
	doc,
	updateDoc,
	deleteDoc,
	getDoc,
	query,
	where,
	Timestamp,
} from 'firebase/firestore';

export const createModel = async (
	name: string,
	description: string,
	brand: string,
	category: string,
) => {
	const status = true;
	const timestamp = Timestamp.now();
	const docRef = await addDoc(collection(firestore, 'ModelAccessory'), {
		name,
		description,
		brand,
		category,
		status,
		timestamp: timestamp,
	});
	return docRef.id;
};

export const getModel = async () => {
	const q = query(collection(firestore, 'ModelAccessory'), where('status', '==', true));
	const querySnapshot = await getDocs(q);
	return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getDeleteModel = async () => {
	const q = query(collection(firestore, 'ModelAccessory'), where('status', '==', false));
	const querySnapshot = await getDocs(q);
	return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getModelById = async (id: string) => {
	const ModelRef = doc(firestore, 'ModelAccessory', id);
	const ModelSnap = await getDoc(ModelRef);
	if (ModelSnap.exists()) {
		return { id: ModelSnap.id, ...ModelSnap.data() };
	} else {
		return null;
	}
};

export const updateModel1 = async (
	id: string,
	name: string,
	description: string,
	brand: string,
	category: string,
	status: boolean,
) => {
	const ModelRef = doc(firestore, 'ModelAccessory', id);
	await updateDoc(ModelRef, { name, description, brand, category, status });
};

export const updateModel = async (
	id: string,
	name: string,
	description: string,
	brand: string,
	category: string,
	status: boolean,
) => {
	const ModelRef = doc(firestore, 'ModelAccessory', id);
	const ModelDoc: any = await getDoc(ModelRef);

	await updateDoc(ModelRef, { name, description, brand, category, status });
	if (!ModelDoc.exists()) {
		console.error(`Category with ID "${id}" does not exist.`);
		// return;
	}
	const oldName = ModelDoc.data().brand; // Get the old category name
	const oldcategory = ModelDoc.data().category;
	const oldmodel = ModelDoc.data().name;

  console.log(oldName)
	const itemManagementRef = collection(firestore, 'ItemManagementAcce');
	const itemQuery = query(
		itemManagementRef,
		where('brand', '==', oldName),
		where('category', '==', oldcategory),
		where('model', '==', oldmodel),
	);
	const querySnapshot = await getDocs(itemQuery);
  
	if (!querySnapshot.empty) {
		console.log(`No documents found in ItemManagementAcce with category name "${oldName}".`);
	}

	// Update the category name in the matching ItemManagementAcce documents
	const batchUpdates = querySnapshot.docs.map((docSnapshot) => {
		const itemDocRef = doc(firestore, 'ItemManagementAcce', docSnapshot.id);
		return updateDoc(itemDocRef, { brand: brand, category: category, model: name });
	});

	// Wait for all updates to complete
	await Promise.all(batchUpdates);

	const stockManagementRef = collection(firestore, 'StockAcce');
	const stockQuery = query(
		stockManagementRef,
		where('brand', '==', oldName),
		where('category', '==', oldcategory),
		where('model', '==', oldmodel),
	);
	const querySnapshot1 = await getDocs(stockQuery);

	if (querySnapshot1.empty) {
		console.log(`No documents found in ItemManagementAcce with category name "${oldName}".`);
	}

	// Update the category name in the matching ItemManagementAcce documents
	const batchUpdates1 = querySnapshot1.docs.map((docSnapshot) => {
		const stockDocRef = doc(firestore, 'StockAcce', docSnapshot.id);
		return updateDoc(stockDocRef, { brand: brand, category: category, model: name });
	});

	// Wait for all updates to complete
	await Promise.all(batchUpdates1);
};

export const deleteModel = async (id: string) => {
	const ModelRef = doc(firestore, 'ModelAccessory', id);
	await deleteDoc(ModelRef);
};
