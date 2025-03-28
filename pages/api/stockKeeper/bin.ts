import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createstockKeeper,
  getDeletestockKeeper,
  updatestockKeeper,
  deletestockKeeper,
} from '../../../service/stockKeeperService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': {
        const { type, description } = req.body;
        if (!type) {
          res.status(400).json({ error: 'Stock Keeper type is required' });
          return;
        }
        const id = await createstockKeeper(type, description);
        res.status(201).json({ message: 'Stock Keeper created', id });
        break;
      }
      case 'GET': {
        const stockKeepers = await getDeletestockKeeper();
        res.status(200).json(stockKeepers);
        break;
      }
      case 'PUT': {
        const { id, type, description, status } = req.body;
        if (!id || !type) {
          res.status(400).json({ error: 'Stock Keeper ID and type are required' });
          return;
        }
        await updatestockKeeper(id, type, description, status);
        res.status(200).json({ message: 'Stock Keeper updated' });
        break;
      }
      case 'DELETE': {
        const { id } = req.body;
        if (!id) {
          res.status(400).json({ error: 'Stock Keeper ID is required' });
          return;
        }
        await deletestockKeeper(id);
        res.status(200).json({ message: 'Stock Keeper deleted' });
        break;
      }
      default: {
        res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        break;
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred', });
  }
}
