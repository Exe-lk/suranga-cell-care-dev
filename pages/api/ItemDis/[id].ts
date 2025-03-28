import type { NextApiRequest, NextApiResponse } from 'next';
import { getItemDisById, updateItemDis, deleteItemDis } from '../../../service/itemManagementDisService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Item Dis ID is required' });
    return;
  }
  try {
    switch (req.method) {
      case 'GET': {
        const ItemDis = await getItemDisById(id as string);
        if (!ItemDis) {
          res.status(404).json({ error: 'Item Dis not found' });
        } else {
          res.status(200).json(ItemDis);
        }
        break;
      }
      case 'PUT': {
        const { model, brand, reorderLevel, quantity, boxNumber, category, touchpadNumber, batteryCellNumber, displaySNumber, status,otherCategory } = req.body;
        if (!model) {
          res.status(400).json({ error: 'Model  is required' });
          return;
        }
        console.log(req.body)
        await updateItemDis(req.body);
        res.status(200).json({ message: 'Item Dis updated' });
        break;
      }
      case 'DELETE': {
        await deleteItemDis(id as string);
        res.status(200).json({ message: 'Item Dis deleted' });
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
