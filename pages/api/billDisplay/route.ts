import type { NextApiRequest, NextApiResponse } from 'next';
import {
    Creatbill,
    Getbills,
} from '../../../service/displayServices';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': {
        const {values } = req.body;
        try {
            const id = await Creatbill(values);
            res.status(201).json({ message: 'Bill created', id });
        } catch (error) {
            console.error('Error in Creatbill:', error);
            res.status(500).json({ error: 'An error occurred' });
        }        
        break;
      }
      case 'GET': {
        const bills = await Getbills();
        res.status(200).json(bills);
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
