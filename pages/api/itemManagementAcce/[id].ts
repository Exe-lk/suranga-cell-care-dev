import type { NextApiRequest, NextApiResponse } from 'next';
import { getItemAcceById, updateItemAcce, deleteItemAcce } from '../../../service/itemManagementAcceService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Item Acce ID is required' });
    return;
  }
  try {
    switch (req.method) {
      case 'GET': {
        const ItemAcce = await getItemAcceById(id as string);
        if (!ItemAcce) {
          res.status(404).json({ error: 'Item Acce not found' });
        } else {
          res.status(200).json(ItemAcce);
        }
        break;
      }
      case 'PUT': {
        const { type, mobileType, category, model, quantity, brand, reorderLevel, description,code, status ,warranty } = req.body;
        if (!model) {
          res.status(400).json({ error: 'Model  is required' });
          return;
        }
        await updateItemAcce(id as string, type, mobileType, category, model, quantity, brand, reorderLevel, description, code,status,warranty);
        res.status(200).json({ message: 'Item Acce updated' });
        break;
      }
      case 'DELETE': {
        await deleteItemAcce(id as string);
        res.status(200).json({ message: 'Item Acce deleted' });
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
