import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createModel,
  getModel,
  updateModel,
  deleteModel,
} from '../../../service/Model1Service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': {
        const { name, description, brand, category } = req.body;
        console.log('Received model creation request:', { name, description, brand, category });
        
        // Validate all required fields
        if (!name || typeof name !== 'string' || name.trim() === '') {
          return res.status(400).json({ error: 'Valid name is required' });
        }
        
        if (!brand || typeof brand !== 'string' || brand.trim() === '') {
          return res.status(400).json({ error: 'Valid brand is required' });
        }
        
        if (!category || typeof category !== 'string' || category.trim() === '') {
          return res.status(400).json({ error: 'Valid category is required' });
        }
        
        try {
          console.log('Calling createModel with validated data');
          const id = await createModel(
            name.trim(), 
            description || '', 
            brand.trim(), 
            category.trim()
          );
          console.log('Model created with ID:', id);
          return res.status(201).json({ message: 'Model created', id });
        } catch (error:any) {
          console.error('Detailed error creating model:', error);
          
          // Handle specific error types
          if (error.code === '23502') {
            // Not null constraint violation
            return res.status(400).json({ 
              error: 'Missing required field',
              details: error.message || 'A required field is missing'
            });
          }
          
          if (error.code === '23505') {
            // Unique constraint violation
            return res.status(409).json({
              error: 'Model already exists',
              details: 'A model with this name already exists in this category and brand.'
            });
          }
          
          return res.status(500).json({ 
            error: 'Failed to create model',
            details: error.message || 'Unknown error occurred'
          });
        }
        break;
      }
      case 'GET': {
        const models = await getModel();
        res.status(200).json(models);
        break;
      }
      case 'PUT': {
        const { id, status, name, description, brand, category } = req.body;
        // if (!id || !name) {
        //   res.status(400).json({ error: 'Model ID and name are required' });
        //   return;
        // }
        await updateModel(id, status, name, description, brand, category);
        res.status(200).json({ message: 'Model updated' });
        break;
      }
      case 'DELETE': {
        const { id } = req.body;
        if (!id) {
          res.status(400).json({ error: 'Model ID is required' });
          return;
        }
        await deleteModel(id);
        res.status(200).json({ message: 'Model deleted' });
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
