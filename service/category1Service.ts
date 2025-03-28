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

export const createCategory = async (name: string) => {
	const status = true;
	const timestamp = Timestamp.now();
	const docRef = await addDoc(collection(firestore, 'CategoryAccessory'), {
		name,
		status,
		timestamp: timestamp,
	});
	return docRef.id;
};

export const getCategory = async () => {
	const q = query(collection(firestore, 'CategoryAccessory'), where('status', '==', true));
	const querySnapshot = await getDocs(q);
	return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getDeleteCategory = async () => {
	const q = query(collection(firestore, 'CategoryAccessory'), where('status', '==', false));
	const querySnapshot = await getDocs(q);
	return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getCategoryById = async (id: string) => {
	const categoryRef = doc(firestore, 'CategoryAccessory', id);
	const categorySnap = await getDoc(categoryRef);
	if (categorySnap.exists()) {
		return { id: categorySnap.id, ...categorySnap.data() };
	} else {
		return null;
	}
};

// export const updateCategory = async (id: string, name: string, status: boolean) => {
//   const categoryRef = doc(firestore, 'CategoryAccessory', id);
//   console.log(name)
//   await updateDoc(categoryRef, { name, status });
// };
export const updateCategory = async (id: string, newName: string, status: boolean) => {
	try {
		// Get the old category name from the CategoryAccessory document
		const categoryRef = doc(firestore, 'CategoryAccessory', id);
		const categoryDoc: any = await getDoc(categoryRef);

		if (!categoryDoc.exists()) {
			console.error(`Category with ID "${id}" does not exist.`);
		}

		const oldName = categoryDoc.data().name; // Get the old category name
		console.log(`Old category name: "${oldName}"`);

		// Update the category name in the CategoryAccessory document
		await updateDoc(categoryRef, { name: newName, status });

		// Fetch all ItemManagementAcce documents with the matching old category name
		const itemManagementRef = collection(firestore, 'ItemManagementAcce');
		const itemQuery = query(itemManagementRef, where('category', '==', oldName));
		const querySnapshot = await getDocs(itemQuery);

		if (querySnapshot.empty) {
			console.log(
				`No documents found in ItemManagementAcce with category name "${oldName}".`,
			);
		}

		// Update the category name in the matching ItemManagementAcce documents
		const batchUpdates = querySnapshot.docs.map((docSnapshot) => {
			const itemDocRef = doc(firestore, 'ItemManagementAcce', docSnapshot.id);
			return updateDoc(itemDocRef, { category: newName });
		});

		// Wait for all updates to complete
		await Promise.all(batchUpdates);

		const stockManagementRef = collection(firestore, 'StockAcce');
		const stockQuery = query(stockManagementRef, where('category', '==', oldName));
		const querySnapshot1 = await getDocs(stockQuery);

		if (querySnapshot1.empty) {
			console.log(
				`No documents found in ItemManagementAcce with category name "${oldName}".`,
			);
		}

		// Update the category name in the matching ItemManagementAcce documents
		const batchUpdates1 = querySnapshot1.docs.map((docSnapshot) => {
			const stockDocRef = doc(firestore, 'StockAcce', docSnapshot.id);
			return updateDoc(stockDocRef, { category: newName });
		});

		// Wait for all updates to complete
		await Promise.all(batchUpdates1);

		console.log(
			`Category name updated from "${oldName}" to "${newName}" and reflected in related documents.`,
		);
	} catch (error) {
		console.error('Error updating category:', error);
	}
};

export const deleteCategory = async (id: string) => {
	const categoryRef = doc(firestore, 'CategoryAccessory', id);
	await deleteDoc(categoryRef);
};
