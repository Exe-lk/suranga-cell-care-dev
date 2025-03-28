import type { NextApiRequest, NextApiResponse } from 'next';
import { getDealerById, updateDealer, deleteDealer } from '../../../service/dealerService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Dealer ID is required' });
    return;
  }
  try {
    switch (req.method) {
      case 'GET': {
        const dealer = await getDealerById(id as string);
        if (!dealer) {
          res.status(404).json({ error: 'Dealer not found' });
        } else {
          res.status(200).json(dealer);
        }
        break;
      }
      case 'PUT': {
        const { name, email, address, mobileNumber, item, status } = req.body;
        console.log(req.body)
        if (!name) {
          res.status(400).json({ error: 'Dealer name is required' });
          return;
        }
        await updateDealer(id as string, name, email, address, mobileNumber, item, status);
        res.status(200).json({ message: 'Dealer updated' });
        break;
      }
      case 'DELETE': {
        await deleteDealer(id as string);
        res.status(200).json({ message: 'Dealer deleted' });
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
