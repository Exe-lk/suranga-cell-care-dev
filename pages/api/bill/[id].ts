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
        console.log('API received data:', req.body);
        const { billNumber,dateIn,phoneDetail, phoneModel, repairType, technicianNum, CustomerName, CustomerMobileNum, NIC, componentCost,repairCost,totalCost, Price, Status, DateOut, status } = req.body;
        
        // Check if this is a cost update or general bill update
        const isCostUpdate = componentCost !== undefined || repairCost !== undefined || totalCost !== undefined;
        const isGeneralUpdate = phoneDetail !== undefined;
        
        if (!isCostUpdate && !isGeneralUpdate) {
          res.status(400).json({ error: 'Either cost fields or phone detail is required for update' });
          return;
        }
      
        await updateBill(req.body);
        console.log('Update completed successfully');
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
