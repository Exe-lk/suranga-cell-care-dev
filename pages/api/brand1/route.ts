import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createBrand,
  getBrand,
  updateBrand,
  deleteBrand,
} from '../../../service/brand1Service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': {
        const { category, name } = req.body;
        if (!name) {
          res.status(400).json({ error: 'Name is required' });
          return;
        }
        if (!category) {
          res.status(400).json({ error: 'Category is required' });
          return;
        }
        
        try {
          const id = await createBrand(category, name);
          res.status(201).json({ message: 'Brand created', id });
        } catch (error) {
          console.error("Error creating brand:", error);
          res.status(500).json({ 
            error: 'Failed to create brand',
            details: error.message || 'Unknown error' 
          });
        }
        break;
      }
      case 'GET': {
        const brands = await getBrand();
        res.status(200).json(brands);
        break;
      }
      case 'PUT': {
        const { id, status, category, name } = req.body;
        if (!id || !name || !category) {
          res.status(400).json({ error: 'Brand ID, name, and category are required' });
          return;
        }
        await updateBrand(id, status, category, name);
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
    console.error("API route error:", error);
    res.status(500).json({ 
      error: 'An error occurred', 
      details: error.message || 'Unknown error'
    });
  }
}
