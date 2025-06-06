import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  searchCategories,
} from '../../../service/category1Service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': {
        const { name } = req.body;
        if (!name) {
          res.status(400).json({ error: 'Name is required' });
          return;
        }
        const id = await createCategory(name);
        res.status(201).json({ message: 'Category created', id });
        break;
      }
      case 'GET': {
        const { search } = req.query;
        let categories;
        
        if (search && typeof search === 'string') {
          categories = await searchCategories(search);
        } else {
          categories = await getCategory();
        }
        
        res.status(200).json(categories);
        break;
      }
      case 'PUT': {
        const { id, status, name } = req.body;
        if (!id || !name) {
          res.status(400).json({ error: 'Category ID and name are required' });
          return;
        }
        await updateCategory(id, status, name);
        res.status(200).json({ message: 'Category updated' });
        break;
      }
      case 'DELETE': {
        const { id } = req.body;
        if (!id) {
          res.status(400).json({ error: 'Category ID is required' });
          return;
        }
        await deleteCategory(id);
        res.status(200).json({ message: 'Category deleted' });
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
