import type { NextApiRequest, NextApiResponse } from 'next';
import { getBrandById, updateBrand, deleteBrand } from '../../../service/brand1Service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Brand ID is required' });
    return;
  }
  try {
    switch (req.method) {
      case 'GET': {
        const brand = await getBrandById(id as string);
        if (!brand) {
          res.status(404).json({ error: 'Brand not found' });
        } else {
          res.status(200).json(brand);
        }
        break;
      }
      case 'PUT': {
        const { category, name, status } = req.body;
        // if (!name) {
        //   res.status(400).json({ error: 'Brand name is required' });
        //   return;
        // }
        await updateBrand(id as string, category, name, status);
        res.status(200).json({ message: 'Brand updated' });
        break;
      }
      case 'DELETE': {
        await deleteBrand(id as string);
        res.status(200).json({ message: 'Brand deleted' });
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
