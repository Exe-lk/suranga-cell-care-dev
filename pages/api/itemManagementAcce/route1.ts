import { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from '../../../firebaseConfig'; // Import Firestore instance
import { collection, query, orderBy, startAfter, limit, getDocs, where } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'GET') {
		try {
			const { page, perPage, lastDoc, searchTerm }: any = req.query;
			const perPageNumber = parseInt(perPage, 10) || 10;
			if (!searchTerm || searchTerm === '') {
				let q = query(
					collection(firestore, 'ItemManagementAcce'),
					orderBy('code'),
					limit(perPageNumber),
				);

				if (lastDoc) {
					q = query(
						collection(firestore, 'ItemManagementAcce'),
						orderBy('code'),
						startAfter(lastDoc),
						limit(perPageNumber),
					);
				}

				const querySnapshot = await getDocs(q);
				const data = querySnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));

				// Get the last document for pagination
				const lastDocRef = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

				res.status(200).json({
					data: data,
					lastDoc: lastDocRef,
				});
			} else {
				// Get all documents to perform filtering with JavaScript
				// This is necessary because Firestore doesn't support advanced text search/contains operation
				const q = query(
					collection(firestore, 'ItemManagementAcce'),
					where('status', '==', true)
				);
				
				const querySnapshot = await getDocs(q);
				
				// Filter items client-side to match search term
				const allData = querySnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				
				// Perform the search on multiple fields
				const searchTermLower = searchTerm.toLowerCase();
				const filteredData = allData.filter((item: any) => {
					return (
						// Search by code
						(item.code?.toString().toLowerCase().includes(searchTermLower)) ||
						// Search by category
						(item.category?.toLowerCase().includes(searchTermLower)) ||
						// Search by brand
						(item.brand?.toLowerCase().includes(searchTermLower)) ||
						// Search by model
						(item.model?.toLowerCase().includes(searchTermLower)) ||
						// Combined searches
						((item.brand + ' ' + item.model)?.toLowerCase().includes(searchTermLower)) ||
						((item.category + ' ' + item.brand + ' ' + item.model)?.toLowerCase().includes(searchTermLower)) ||
						((item.category + ' ' + item.model + ' ' + item.brand)?.toLowerCase().includes(searchTermLower))
					);
				});

				res.status(200).json({
					data: filteredData,
					lastDoc: null, // Pagination not supported with client-side filtering
				});
			}
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	} else {
		res.status(405).json({ error: 'Method Not Allowed' });
	}
}
