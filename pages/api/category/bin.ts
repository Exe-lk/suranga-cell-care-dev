import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createCategory,
  getDeleteCategory,
  updateCategory,
  deleteCategory,
} from '../../../service/categoryService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': {
        const { name } = req.body;
        if (!name) {
          res.status(400).json({ error: 'Category name is required' });
          return;
        }
        const id = await createCategory(name);
        res.status(201).json({ message: 'Category created', id });
        break;
      }
      case 'GET': {
        const categories = await getDeleteCategory();
        res.status(200).json(categories);
        break;
      }
      case 'PUT': {
        const { id, name, status } = req.body;
        if (!id || !name) {
          res.status(400).json({ error: 'Categories ID and name are required' });
          return;
        }
        await updateCategory(id, name, status);
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
