import type { NextApiRequest, NextApiResponse } from 'next';
import { createstockOut, getstockInByDate, getAllStockRecords } from '../../../service/stockInOutAcceService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		switch (req.method) {
			case 'POST': {
				const {
					model,
					brand,
					category,
					quantity,
					date,
					name,
					mobile,
					nic,
					barcode,
					cost,
					sellingPrice,
					stock,
					description,
				} = req.body;
				
				if (!model) {
					res.status(400).json({ error: 'Model is required' });
					return;
				}
				
				try {
					// Pass the entire req.body to createstockOut
					const id = await createstockOut(req.body);
					res.status(201).json({ message: 'Stock out created', id });
				} catch (error: any) {
					console.error('Error creating stock out:', error);
					res.status(500).json({ 
						error: 'Failed to create stock out',
						details: error.message || error 
					});
				}
				break;
			}
			case 'GET': {
				// Get all stock records regardless of date
				const stockData = await getAllStockRecords();
				res.status(200).json(stockData);
				break;
			}
			default: {
				res.setHeader('Allow', ['POST', 'GET']);
				res.status(405).end(`Method ${req.method} Not Allowed`);
				break;
			}
		}
	} catch (error) {
		res.status(500).json({ error: 'An error occurred' });
	}
}
