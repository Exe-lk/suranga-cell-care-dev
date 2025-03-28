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

export const createBrand = async (category: string, name: string) => {
	const status = true;
	const timestamp = Timestamp.now();
	const docRef = await addDoc(collection(firestore, 'BrandAccessory'), {
		category,
		name,
		status,
		timestamp: timestamp,
	});
	return docRef.id;
};

export const getBrand = async () => {
	const q = query(collection(firestore, 'BrandAccessory'), where('status', '==', true));
	const querySnapshot = await getDocs(q);
	return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getDeleteBrand = async () => {
	const q = query(collection(firestore, 'BrandAccessory'), where('status', '==', false));
	const querySnapshot = await getDocs(q);
	return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getBrandById = async (id: string) => {
	const brandRef = doc(firestore, 'BrandAccessory', id);
	const brandSnap = await getDoc(brandRef);
	if (brandSnap.exists()) {
		return { id: brandSnap.id, ...brandSnap.data() };
	} else {
		return null;
	}
};

export const updateBrand = async (id: string, category: string, name: string, status: boolean) => {
	const brandRef = doc(firestore, 'BrandAccessory', id);
	const brandDoc: any = await getDoc(brandRef);

	await updateDoc(brandRef, { category, name, status });
	if (!brandDoc.exists()) {
		console.error(`Category with ID "${id}" does not exist.`);
		// return;
	}
	const oldName = brandDoc.data().name; // Get the old category name
	const oldcategory = brandDoc.data().category;
	console.log(`Old category name: "${oldName}"`);

	const itemManagementRef = collection(firestore, 'ItemManagementAcce');
	const itemQuery = query(
		itemManagementRef,
		where('brand', '==', oldName),
		where('category', '==', oldcategory),
	);
	const querySnapshot = await getDocs(itemQuery);

	if (querySnapshot.empty) {
		console.log(`No documents found in ItemManagementAcce with category name "${oldName}".`);
	}

	// Update the category name in the matching ItemManagementAcce documents
	const batchUpdates = querySnapshot.docs.map((docSnapshot) => {
		const itemDocRef = doc(firestore, 'ItemManagementAcce', docSnapshot.id);
		return updateDoc(itemDocRef, { brand: name, category: category });
	});

	// Wait for all updates to complete
	await Promise.all(batchUpdates);

	const stockManagementRef = collection(firestore, 'StockAcce');
	const stockQuery = query(
		stockManagementRef,
		where('brand', '==', oldName),
		where('category', '==', oldcategory),
	);
	const querySnapshot1 = await getDocs(stockQuery);

	if (querySnapshot1.empty) {
		console.log(`No documents found in ItemManagementAcce with category name "${oldName}".`);
	}

	// Update the category name in the matching ItemManagementAcce documents
	const batchUpdates1 = querySnapshot1.docs.map((docSnapshot) => {
		const stockDocRef = doc(firestore, 'StockAcce', docSnapshot.id);
		return updateDoc(stockDocRef, { brand: name, category: category });
	});

	// Wait for all updates to complete
	await Promise.all(batchUpdates1);
};

export const deleteBrand = async (id: string) => {
	const brandRef = doc(firestore, 'BrandAccessory', id);
	await deleteDoc(brandRef);
};
