import type { NextApiRequest, NextApiResponse } from 'next';
import { getstockInById, updatestockIn } from '../../../service/stockInOutAcceService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Dealer ID is required' });
    return;
  }
  try {
    switch (req.method) {
      case 'GET': {
        const dealer = await getstockInById(id as string);
        if (!dealer) {
          res.status(404).json({ error: 'Dealer not found' });
        } else {
          res.status(200).json(dealer);
        }
        break;
      }
      case 'PUT': {
        const { quantity } = req.body;
        // if (!quantity) {
        //   res.status(400).json({ error: 'Dealer name is required' });
        //   return;
        // }
        console.log(quantity)
        await updatestockIn(id as string, quantity);
        res.status(200).json({ message: 'Dealer updated' });
        break;
      }
      default: {
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        break;
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
}
