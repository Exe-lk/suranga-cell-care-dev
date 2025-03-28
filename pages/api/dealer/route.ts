import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createDealer,
  getDealers,
  updateDealer,
  deleteDealer,
} from '../../../service/dealerService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': {
        const { name, email, address, mobileNumber, item } = req.body;
        if (!name) {
          res.status(400).json({ error: 'Dealer name is required' });
          return;
        }
        const id = await createDealer(name, email, address, mobileNumber, item);
        res.status(201).json({ message: 'Dealer created', id });
        break;
      }
      case 'GET': {
        const dealers = await getDealers();
        res.status(200).json(dealers);
        break;
      }
      case 'PUT': {
        const { id, name, email, address, mobileNumber, item, status } = req.body;
        if (!id || !name) {
          res.status(400).json({ error: 'Dealer ID and name are required' });
          return;
        }
        await updateDealer(id, name, email, address, mobileNumber, item, status);
        res.status(200).json({ message: 'Dealer updated' });
        break;
      }
      case 'DELETE': {
        const { id } = req.body;
        if (!id) {
          res.status(400).json({ error: 'Dealer ID is required' });
          return;
        }
        await deleteDealer(id);
        res.status(200).json({ message: 'Dealer deleted' });
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
