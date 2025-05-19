import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID provided' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('accessorybill')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Accessory bill not found' });
        
        return res.status(200).json(data);
      }
      
      case 'PUT': {
        const updateData = req.body;
        
        // Remove id from the update data if it's included
        const { id: _, ...dataToUpdate } = updateData;
        
        const { data, error } = await supabase
          .from('accessorybill')
          .update(dataToUpdate)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json({ message: 'Accessory bill updated', data });
      }
      
      case 'DELETE': {
        const { error } = await supabase
          .from('accessorybill')
          .delete()
          .eq('id', id);

        if (error) throw error;
        return res.status(200).json({ message: 'Accessory bill deleted' });
      }
      
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API route error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      details: error.details || error.toString() 
    });
  }
} 