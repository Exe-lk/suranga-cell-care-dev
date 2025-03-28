import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createItemAcce,
  getItemAcces,
  updateItemAcce,
  deleteItemAcce,
} from '../../../service/itemManagementAcceService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': {
        const { type, mobileType, category, model, quantity, brand, reorderLevel, description, code } = req.body;
        if (!model) {
          res.status(400).json({ error: 'Item Acce model is required' });
          return;
        }
        const id = await createItemAcce(req.body);
        res.status(201).json({ message: 'Item Acce created', id });
        break;
      }
      case 'GET': {
        const ItemAcces = await getItemAcces();
        res.status(200).json(ItemAcces);
        break;
      }
      case 'PUT': {
        const { id, type, mobileType, category, model, quantity, brand, reorderLevel, description, code, status,warranty } = req.body;
        if (!id || !model) {
          res.status(400).json({ error: 'Item Acce ID and model number are required' });
          return;
        }
        await updateItemAcce(id, type, mobileType, category, model, quantity, brand, reorderLevel, description, code, status,warranty);
        res.status(200).json({ message: 'Item Acce updated' });
        break;
      }
      case 'DELETE': {
        const { id } = req.body;
        if (!id) {
          res.status(400).json({ error: 'Item Acce ID is required' });
          return;
        }
        await deleteItemAcce(id);
        res.status(200).json({ message: 'Item Acce deleted' });
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
