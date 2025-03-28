import type { NextApiRequest, NextApiResponse } from 'next';
import { createstockOut, getstockInByDate } from '../../../service/stockInOutAcceService';

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
					customerName,
					mobile,
					nic,
					email,
					barcode,
					cost,
					sellingPrice,
					stock,
					description,
				} = req.body;
				if (!model) {
					res.status(400).json({ error: 'stock In name is required' });
					return;
				}
				const id = await createstockOut(
					model,
					brand,
					category,
					quantity,
					date,
					customerName,
					mobile,
					nic,
					email,
					barcode,
					cost,
					sellingPrice,
					stock,
					description,
				);
				res.status(201).json({ message: 'stock In created', id });
				break;
			}
			case 'GET': {
				const { date } = req.query;
				console.log(date);
				if (!date || typeof date !== 'string') {
					res.status(400).json({ error: 'Valid date is required' });
					return;
				}

				const stockData = await getstockInByDate(date);
				res.status(200).json(stockData);
				break;
			}
			default: {
				res.setHeader('Allow', ['POST']);
				res.status(405).end(`Method ${req.method} Not Allowed`);
				break;
			}
		}
	} catch (error) {
		res.status(500).json({ error: 'An error occurred' });
	}
}
