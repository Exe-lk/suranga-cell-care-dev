import type { NextApiRequest, NextApiResponse } from 'next';
import { Creatbill, Getbills } from '../../../service/accessoryService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        const bills = await Getbills();
        res.status(200).json(bills);
        break;
      }
      case 'POST': {
        const billData = req.body;
        try {
          const id = await Creatbill(billData);
          res.status(201).json({ message: 'Accessory bill created', id });
        } catch (err: any) {
          console.error('Error creating accessory bill:', err);
          res.status(500).json({ 
            error: 'Error creating accessory bill', 
            message: err.message,
            details: err.details || err.toString() 
          });
        }
        break;
      }
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API route error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      details: error.details || error.toString() 
    });
  }
} 