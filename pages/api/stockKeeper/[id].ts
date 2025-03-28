import type { NextApiRequest, NextApiResponse } from 'next';
import { getstockKeeperById, updatestockKeeper, deletestockKeeper } from '../../../service/stockKeeperService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Stock Keeper ID is required' });
    return;
  }
  try {
    switch (req.method) {
      case 'GET': {
        const stockKeeper = await getstockKeeperById(id as string);
        if (!stockKeeper) {
          res.status(404).json({ error: 'Stock Keeper not found' });
        } else {
          res.status(200).json(stockKeeper);
        }
        break;
      }
      case 'PUT': {
        const { type, description, status } = req.body;
        if (!type) {
          res.status(400).json({ error: 'Stock Keeper type is required' });
          return;
        }
        await updatestockKeeper(id as string, type, description, status);
        res.status(200).json({ message: 'Stock Keeper updated' });
        break;
      }
      case 'DELETE': {
        await deletestockKeeper(id as string);
        res.status(200).json({ message: 'Stock Keeper deleted' });
        break;
      }
      default: {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        break;
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
}
