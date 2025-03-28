import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createBrand,
  getDeleteBrand,
  updateBrand,
  deleteBrand,
} from '../../../service/brandService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': {
        const { name, category } = req.body;
        if (!name) {
          res.status(400).json({ error: 'Brand name is required' });
          return;
        }
        const id = await createBrand(name, category);
        res.status(201).json({ message: 'Brand created', id });
        break;
      }
      case 'GET': {
        const brands = await getDeleteBrand();
        res.status(200).json(brands);
        break;
      }
      case 'PUT': {
        const { id, name, category, status } = req.body;
        if (!id || !name) {
          res.status(400).json({ error: 'Brand ID and name are required' });
          return;
        }
        await updateBrand(id, name, category, status);
        res.status(200).json({ message: 'Brand updated' });
        break;
      }
      case 'DELETE': {
        const { id } = req.body;
        if (!id) {
          res.status(400).json({ error: 'Brand ID is required' });
          return;
        }
        await deleteBrand(id);
        res.status(200).json({ message: 'Brand deleted' });
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
