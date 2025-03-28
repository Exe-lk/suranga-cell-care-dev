import { firestore } from '../firebaseConfig';
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, where, Timestamp } from 'firebase/firestore';

export const createBrand = async (name: string, category: string) => {
  const status = true;
  const timestamp = Timestamp.now();
  const docRef = await addDoc(collection(firestore, 'BrandDisplay'), { name, category, status, timestamp: timestamp });
  return docRef.id;
};

export const getBrand = async () => {
  const q = query(collection(firestore, 'BrandDisplay'), where('status', '==', true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getDeleteBrand = async () => {
  const q = query(collection(firestore, 'BrandDisplay'), where('status', '==', false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getBrandById = async (id: string) => {
  const brandRef = doc(firestore, 'BrandDisplay', id);
  const brandSnap = await getDoc(brandRef);
  if (brandSnap.exists()) {
    return { id: brandSnap.id, ...brandSnap.data() };
  } else {
    return null;
  }
};

export const updateBrand1 = async (id: string, name: string, category: string, status: boolean) => {
  const brandRef = doc(firestore, 'BrandDisplay', id);
  await updateDoc(brandRef, { name, category, status });
};
export const updateBrand = async (id: string, name: string, category: string, status: boolean) => {
	const brandRef = doc(firestore, 'BrandDisplay', id);
	const brandDoc: any = await getDoc(brandRef);

	await updateDoc(brandRef, { category, name, status });
	if (!brandDoc.exists()) {
		console.error(`Category with ID "${id}" does not exist.`);
		// return;
	}
	const oldName = brandDoc.data().name; // Get the old category name
	const oldcategory = brandDoc.data().category;
	console.log(`Old category name: "${oldName}"`);

	const itemManagementRef = collection(firestore, 'ItemManagementDis');
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
		const itemDocRef = doc(firestore, 'ItemManagementDis', docSnapshot.id);
		return updateDoc(itemDocRef, { brand: name, category: category });
	});

	// Wait for all updates to complete
	await Promise.all(batchUpdates);

	const stockManagementRef = collection(firestore, 'Stock');
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
		const stockDocRef = doc(firestore, 'Stock', docSnapshot.id);
		return updateDoc(stockDocRef, { brand: name, category: category });
	});

	// Wait for all updates to complete
	await Promise.all(batchUpdates1);
};
export const deleteBrand = async (id: string) => {
  const brandRef = doc(firestore, 'BrandDisplay', id);
  await deleteDoc(brandRef);
};
