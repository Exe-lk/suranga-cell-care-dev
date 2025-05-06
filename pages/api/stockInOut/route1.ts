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
				
				// Use the updated service function that supports search terms
				const stockData = await getstockInByDate(
					date as string || '', 
					searchTerm as string || ''
				);
				console.log(stockData);
				res.status(200).json(stockData);
				break;
			}
			case 'PUT': {
				const { id, subid, values } = req.body;
				// console.log(req.body)
				await updateSubStock(subid, values);
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
