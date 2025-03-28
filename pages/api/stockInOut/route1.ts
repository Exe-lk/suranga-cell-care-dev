import type { NextApiRequest, NextApiResponse } from 'next';
import {
	createstockOut,
	getAllSubStockData,
	getstockInByDate,
	updateSubStock,
} from '../../../service/stockInOutDissService';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		switch (req.method) {
			case 'POST': {
				const { model } = req.body;
				if (!model) {
					res.status(400).json({ error: 'stock In name is required' });
					return;
				}
				// console.log(req.body)
				const id = await createstockOut(req.body);
				res.status(201).json({ message: 'stock In created', id });
				break;
			}
			case 'GET': {
				const { date, searchTerm } = req.query;

				if (!date || typeof date !== 'string') {
					res.status(400).json({ error: 'Valid date is required' });
					return;
				}

				if (searchTerm == '') {
					const stockData = await getstockInByDate(date, searchTerm);
					console.log(stockData);
					res.status(200).json(stockData);
				} else {
					console.log(searchTerm);
					const qCode = query(
						collection(firestore, 'Stock'),
						where('code', '==', searchTerm),
					);
					const barCode = query(
						collection(firestore, 'Stock'),
						where('barcode', '==', searchTerm),
					);
					const qCategory = query(
						collection(firestore, 'Stock'),
						where('category', '==', searchTerm),
					);
					const qBrand = query(
						collection(firestore, 'Stock'),
						where('brand', '==', searchTerm),
					);
					const qModel = query(
						collection(firestore, 'Stock'),
						where('model', '==', searchTerm),
					);

					Promise.all([
						getDocs(qCode),
						getDocs(qCategory),
						getDocs(qBrand),
						getDocs(qModel),
						getDocs(barCode),
					]).then(
						([
							snapshotCode,
							snapshotCategory,
							snapshotBrand,
							snapshotModel,
							snapshotBarcode,
						]) => {
							const results = [
								...snapshotCode.docs,
								...snapshotCategory.docs,
								...snapshotBrand.docs,
								...snapshotModel.docs,
								...snapshotBarcode.docs,
							];

							// Deduplicate documents based on their ID
							const uniqueResults = Array.from(
								new Set(results.map((doc) => doc.id)),
							).map((id) => results.find((doc) => doc.id === id));

							// Convert documents to JSON format
							const data = uniqueResults.map((doc: any) => ({
								id: doc.id, // Include document ID
								...doc.data(), // Spread document fields
							}));
							console.log(data);
							res.status(200).json(data);
						},
					);
				}

				break;

				// const stockIns = await getAllSubStockData();
				// res.status(200).json(stockIns);
				// break;
			}
			case 'PUT': {
				const { id, subid, values } = req.body;
				// console.log(req.body)
				await updateSubStock(id, subid, values);
				res.status(200).json({ message: 'stock In updated' });
				break;
			}
			default: {
				res.setHeader('Allow', ['POST', 'GET', 'PUT']);
				res.status(405).end(`Method ${req.method} Not Allowed`);
				break;
			}
		}
	} catch (error) {
		res.status(500).json({ error: 'An error occurred' });
	}
}
