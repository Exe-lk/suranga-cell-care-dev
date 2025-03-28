import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createItemDis,
  getItemDiss,
  updateItemDis,
  deleteItemDis,
} from '../../../service/itemManagementDisService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': {
        const { model, brand, reorderLevel, quantity, boxNumber, category, touchpadNumber, batteryCellNumber, displaySNumber } = req.body;
        if (!model) {
          res.status(400).json({ error: 'Item Dis model  is required' });
          return;
        }
        const id = await createItemDis(req.body);
        res.status(201).json({ message: 'Item Dis created', id });
        break;
      }
      case 'GET': {
        const ItemDiss = await getItemDiss();
        res.status(200).json(ItemDiss);
        break;
      }
      case 'PUT': {
        const { id, model, brand, reorderLevel, quantity, boxNumber, category, touchpadNumber, batteryCellNumber, displaySNumber, status } = req.body;
        if (!id || !model) {
          res.status(400).json({ error: 'Item Dis ID and model number are required' });
          return;
        }
        await updateItemDis(req.body);
        res.status(200).json({ message: 'Item Dis updated' });
        break;
      }
      case 'DELETE': {
        const { id } = req.body;
        if (!id) {
          res.status(400).json({ error: 'Item Dis ID is required' });
          return;
        }
        await deleteItemDis(id);
        res.status(200).json({ message: 'Item Dis deleted' });
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
