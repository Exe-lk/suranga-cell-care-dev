import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createstockIn,
  createstockOut,
  getstockIns,
  updatestockIn,
} from '../../../service/stockInOutAcceService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': {
        const { brand, model, category, type, quantity, date, storage, name, nic, mobile, mobileType, cost, stock, code, barcode, sellingPrice ,imi,cid} = req.body;
        if (!brand) {
          res.status(400).json({ error: 'stock In name is required' });
          return;
        }
        const id = await createstockIn(req.body);
        res.status(201).json({ message: 'stock In created', id });
        break;
      }
      case 'GET': {
        const stockIns = await getstockIns();
        res.status(200).json(stockIns);
        break;
      }
      case 'PUT': {
        const { id, quantity, type } = req.body;
        if (!id){
          res.status(400).json({ error: 'ID and quantity are required' });
          return;
        }
        try {
          await updatestockIn(id, quantity);
          res.status(200).json({ message: 'Stock updated successfully' });
        } catch (error:any) {
          console.error('Error updating stock:', error);
          res.status(500).json({ 
            error: 'Failed to update stock quantity',
            details: error.message || error 
          });
        }
        break;
      }
      default: {
        res.setHeader('Allow', ['POST', 'GET', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        break;
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred', });
  }
}
