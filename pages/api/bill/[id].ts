import type { NextApiRequest, NextApiResponse } from 'next';
import { getBillById, updateBill, deleteBill } from '../../../service/billService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Bill ID is required' });
    return;
  }
  try {
    switch (req.method) {
      case 'GET': {
        const bill = await getBillById(id as string);
        if (!bill) {
          res.status(404).json({ error: 'Bill not found' });
        } else {
          res.status(200).json(bill);
        }
        break;
      }
      case 'PUT': {
        const { billNumber,dateIn,phoneDetail, phoneModel, repairType, technicianNum, CustomerName, CustomerMobileNum, NIC, componentCost,repairCost,cost, Price, Status, DateOut, status } = req.body;
        if (!phoneDetail) {
          res.status(400).json({ error: 'Phone Detail is required' });
          return;
        }
      
        await updateBill(req.body);
        res.status(200).json({ message: 'Bill updated' });
        break;
      }
      case 'DELETE': {
        await deleteBill(id as string);
        res.status(200).json({ message: 'Bill deleted' });
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
