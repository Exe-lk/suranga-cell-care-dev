import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createBill,
  getBills,
  updateBill,
  deleteBill,
} from '../../../service/billService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': {
        const { phoneDetail } = req.body;
        if (!phoneDetail) {
          res.status(400).json({ error: 'Phone Detail is required' });
          return;
        }
        const id = await createBill(req.body);
        res.status(201).json({ message: 'Bill created', id });
        break;
      }
      case 'GET': {
        const bills = await getBills();
        res.status(200).json(bills);
        break;
      }
      case 'PUT': {
        const { id, billNumber,dateIn,phoneDetail, phoneModel, repairType, technicianNum, CustomerName, CustomerMobileNum, NIC,componentCost,repairCost, cost, Price, Status, DateOut, status } = req.body;
        if (!id || !phoneDetail) {
          res.status(400).json({ error: 'Bill ID and phone detail are required' });
          return;
        }
        await updateBill(req.body);
        res.status(200).json({ message: 'Bill updated' });
        break;
      }
      case 'DELETE': {
        const { id } = req.body;
        if (!id) {
          res.status(400).json({ error: 'Bill ID is required' });
          return;
        }
        await deleteBill(id);
        res.status(200).json({ message: 'Bill deleted' });
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
