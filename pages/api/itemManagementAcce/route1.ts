import { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from '../../../firebaseConfig'; // Import Firestore instance
import { collection, query, orderBy, startAfter, limit, getDocs, where } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'GET') {
		try {
			const { page, perPage, lastDoc, searchTerm }: any = req.query;
			const perPageNumber = parseInt(perPage, 10) || 10;
			if (searchTerm == '') {
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
				// const filteredData = searchTerm
				// 	? data.filter((item: any) => {
				// 			// Check if any field contains the searchTerm (case-insensitive)
				// 			return Object.values(item).some(
				// 				(value: any) =>
				// 					typeof value === 'string' &&
				// 					value.toLowerCase().includes(searchTerm.toLowerCase()),
				// 			);
				// 	  })
				// 	: data;

				// Get the last document for pagination
				const lastDocRef = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

				res.status(200).json({
					data: data,
					lastDoc: lastDocRef,
				});
			} else {
				const qCode = query(
					collection(firestore, 'ItemManagementAcce'),
					where('code', '==', searchTerm),
				);
				const qCategory = query(
					collection(firestore, 'ItemManagementAcce'),
					where('category', '==', searchTerm),
				);
                const qBrand = query(
					collection(firestore, 'ItemManagementAcce'),
					where('brand', '==', searchTerm),
				);
                const qModel = query(
					collection(firestore, 'ItemManagementAcce'),
					where('model', '==', searchTerm),
				);

				Promise.all([getDocs(qCode), getDocs(qCategory),getDocs(qBrand),getDocs(qModel)])
					.then(([snapshotCode, snapshotCategory,snapshotBrand,snapshotModel]) => {
						const results = [...snapshotCode.docs, ...snapshotCategory.docs,...snapshotBrand.docs,...snapshotModel.docs];

						// Deduplicate documents based on their ID
						const uniqueResults = Array.from(new Set(results.map((doc) => doc.id))).map(
							(id) => results.find((doc) => doc.id === id),
						);

						// Convert documents to JSON format
						const data = uniqueResults.map((doc: any) => ({
							id: doc.id, // Include document ID
							...doc.data(), // Spread document fields
						}));

						res.status(200).json({
							data: data,
							lastDoc:
								uniqueResults.length > 0
									? uniqueResults[uniqueResults.length - 1]
									: null,
						});
					})
					.catch((error) => {
						console.error('Error fetching documents: ', error);
						res.status(500).json({ error: 'Internal Server Error' });
					});
			}
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	} else {
		res.status(405).json({ error: 'Method Not Allowed' });
	}
}
