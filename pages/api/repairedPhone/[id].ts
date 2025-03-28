import type { NextApiRequest, NextApiResponse } from 'next';
import { updaterepairedPhone } from '../../../service/repairedPhone';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Dealer ID is required' });
    return;
  }
  try {
    switch (req.method) {
      case 'PUT': {
        const { Status } = req.body;
        if (!Status) {
          res.status(400).json({ error: 'Dealer name is required' });
          return;
        }
        await updaterepairedPhone(id as string, Status);
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
