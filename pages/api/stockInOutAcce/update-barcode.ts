import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'PUT') {
      res.setHeader('Allow', ['PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    const { id, barcode } = req.body;

    if (!id || !barcode) {
      res.status(400).json({ error: 'ID and barcode are required' });
      return;
    }

    const { error } = await supabase
      .from('StockAcce')
      .update({ barcode })
      .eq('id', id);

    if (error) {
      console.error('Error updating barcode:', error);
      res.status(500).json({ error: 'Failed to update barcode' });
      return;
    }

    res.status(200).json({ message: 'Barcode updated successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
} 