import { firestore } from '../firebaseConfig';
import { addDoc, collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

export const saveReturnData = async (data: any) => {
	const returnCollection = collection(firestore, 'return');

	try {
		// Get all documents to find the latest ID
		const querySnapshot = await getDocs(returnCollection);
		const docIds = querySnapshot.docs.map((doc) => Number(doc.id)).filter((id) => !isNaN(id));

		// Find the next numeric ID
		const nextId = docIds.length > 0 ? Math.max(...docIds) + 1 : 1;

		// Create a document with the custom numeric ID
		const newDocRef = doc(returnCollection, nextId.toString());
		await setDoc(newDocRef, data);

		console.log(`Document created with ID: ${nextId}`);
	} catch (error) {
		console.error('Error saving return data:', error);
	}
};

export const saveReturnData1 = async (data: any) => {
	const returnCollection = collection(firestore, 'returnDisplay');

	try {
		// Get all documents to find the latest ID
		const querySnapshot = await getDocs(returnCollection);
		const docIds = querySnapshot.docs.map((doc) => Number(doc.id)).filter((id) => !isNaN(id));

		// Find the next numeric ID
		const nextId = docIds.length > 0 ? Math.max(...docIds) + 1 : 1;

		// Create a document with the custom numeric ID
		const newDocRef = doc(returnCollection, nextId.toString());
		await setDoc(newDocRef, data);
		return true;
		// console.log(`Document created with ID: ${nextId}`);
	} catch (error) {
		console.error('Error saving return data:', error);
	}
};
export const updateQuantity = async (id: string, quantity: number) => {
	const ModelRef = doc(firestore, 'ItemManagementAcce', id);
	console.log(status);
	await updateDoc(ModelRef, { quantity: quantity });
};

export const updateQuantity1 = async (id: string, quantity: number) => {
	const ModelRef = doc(firestore, 'ItemManagementDis', id);
	console.log(status);
	await updateDoc(ModelRef, { quantity: quantity });
};
