import type { NextApiRequest, NextApiResponse } from 'next';
import { getModelById, updateModel, deleteModel } from '../../../service/Model1Service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Model ID is required' });
    return;
  }
  try {
    switch (req.method) {
      case 'GET': {
        const model = await getModelById(id as string);
        if (!model) {
          res.status(404).json({ error: 'Model not found' });
        } else {
          res.status(200).json(model);
        }
        break;
      }
      case 'PUT': {
        const { name, description, brand, category, status } = req.body;
        // if (!name) {
        //   res.status(400).json({ error: 'Model name is required' });
        //   return;
        // }
        await updateModel(id as string, name, description, brand, category, status);
        res.status(200).json({ message: 'Model updated' });
        break;
      }
      case 'DELETE': {
        await deleteModel(id as string);
        res.status(200).json({ message: 'Model deleted' });
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
