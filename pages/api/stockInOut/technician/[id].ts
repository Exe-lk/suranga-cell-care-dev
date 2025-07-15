import type { NextApiRequest, NextApiResponse } from 'next';
import { getStockOutByTechnician } from '../../../../service/stockInOutDissService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		if (req.method !== 'GET') {
			res.setHeader('Allow', ['GET']);
			res.status(405).end(`Method ${req.method} Not Allowed`);
			return;
		}

		const { id } = req.query;
		
		if (!id || typeof id !== 'string') {
			res.status(400).json({ error: 'Technician ID is required' });
			return;
		}

		const stockOutData = await getStockOutByTechnician(id);
		res.status(200).json(stockOutData);
	} catch (error) {
		console.error('Error in technician stock out API:', error);
		res.status(500).json({ error: 'An error occurred while fetching stock out data' });
	}
} 