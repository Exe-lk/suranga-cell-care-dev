import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createSupplier,
  getDeleteSuppliers,
  updateSupplier,
  deleteSupplier,
} from '../../../service/supplierService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': {
        const { name, email, address, mobileNumber, item,type } = req.body;
        if (!name) {
          res.status(400).json({ error: 'Supplier name is required' });
          return;
        }
        const id = await createSupplier(name, email, address, mobileNumber, item, type);
        res.status(201).json({ message: 'Supplier created', id });
        break;
      }
      case 'GET': {
        const suppliers = await getDeleteSuppliers();
        res.status(200).json(suppliers);
        break;
      }
      case 'PUT': {
        const { id, name, email, address, mobileNumber, item, status,type } = req.body;
        if (!id || !name) {
          res.status(400).json({ error: 'Supplier ID and name are required' });
          return;
        }
        await updateSupplier(id, name, email, address, mobileNumber, item, status,type);
        res.status(200).json({ message: 'Supplier updated' });
        break;
      }
      case 'DELETE': {
        const { id } = req.body;
        if (!id) {
          res.status(400).json({ error: 'Supplier ID is required' });
          return;
        }
        await deleteSupplier(id);
        res.status(200).json({ message: 'Supplier deleted' });
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
