import type { NextApiRequest, NextApiResponse } from 'next';
import { getCategoryById, updateCategory, deleteCategory } from '../../../service/category1Service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Category ID is required' });
    return;
  }
  try {
    switch (req.method) {
      case 'GET': {
        const category = await getCategoryById(id as string);
        if (!category) {
          res.status(404).json({ error: 'Category not found' });
        } else {
          res.status(200).json(category);
        }
        break;
      }
      case 'PUT': {
        const { name, status } = req.body;
        if (!name) {
          res.status(400).json({ error: 'Category name is required' });
          return;
        }
        await updateCategory(id as string, name, status);
        res.status(200).json({ message: 'Category updated' });
        break;
      }
      case 'DELETE': {
        await deleteCategory(id as string);
        res.status(200).json({ message: 'Category deleted' });
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
