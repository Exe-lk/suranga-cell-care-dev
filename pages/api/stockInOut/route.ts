import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createstockIn,
  createstockOut,
  getstockIns,
  updatestockIn,
} from '../../../service/stockInOutDissService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': {
        const { brand, model, category, quantity, date, suppName, cost, stock, code, barcode,boxNumber,description} = req.body;
        if (!brand) {
          res.status(400).json({ error: 'stock In name is required' });
          return;
        }
        const id = await createstockIn(req.body);
        res.status(201).json({ message: 'stock In created', id });
        break;
      }
      case 'GET': {
        const stockIns = await getstockIns();
        res.status(200).json(stockIns);
        break;
      }
      case 'PUT': {
        const { id, quantity } = req.body;
        if (!id || !quantity) {
          res.status(400).json({ error: 'stock In ID and name are required' });
          return;
        }
        await updatestockIn(id, quantity);
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
    res.status(500).json({ error: 'An error occurred', });
  }
}
