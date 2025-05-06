import type { NextApiRequest, NextApiResponse } from 'next';
import { getBrandById, updateBrand, deleteBrand } from '../../../service/brand1Service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid brand ID' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        try {
          const brand = await getBrandById(id);
          if (!brand) {
            return res.status(404).json({ error: 'Brand not found' });
          }
          return res.status(200).json(brand);
        } catch (error:any) {
          console.error(`Error fetching brand with ID ${id}:`, error);
          return res.status(500).json({ 
            error: 'Failed to fetch brand', 
            details: error.message || 'Unknown error'
          });
        }
      }
      case 'PUT': {
        const { status, category, name } = req.body;
        
        if (!category || !name) {
          return res.status(400).json({ error: 'Brand name and category are required' });
        }
        
        try {
          await updateBrand(id, category, name, status);
          return res.status(200).json({ message: 'Brand updated successfully' });
        } catch (error:any) {
          console.error(`Error updating brand with ID ${id}:`, error);
          return res.status(500).json({ 
            error: 'Failed to update brand', 
            details: error.message || 'Unknown error'
          });
        }
      }
      case 'DELETE': {
        try {
          await deleteBrand(id);
          return res.status(200).json({ message: 'Brand deleted successfully' });
        } catch (error:any) {
          console.error(`Error deleting brand with ID ${id}:`, error);
          return res.status(500).json({ 
            error: 'Failed to delete brand', 
            details: error.message || 'Unknown error'
          });
        }
      }
      default: {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error:any) {
    console.error(`Unexpected error handling brand ID ${id}:`, error);
    return res.status(500).json({ 
      error: 'An unexpected error occurred', 
      details: error.message || 'Unknown error' 
    });
  }
}
