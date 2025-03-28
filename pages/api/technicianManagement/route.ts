import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createTechnician,
  getTechnicians,
  updateTechnician,
  deleteTechnician,
} from '../../../service/technicianManagementService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': {
        const { technicianNum, name, type, mobileNumber } = req.body;
        if (!name) {
          res.status(400).json({ error: 'Technician name is required' });
          return;
        }
        const id = await createTechnician(technicianNum, name, type, mobileNumber);
        res.status(201).json({ message: 'Technician created', id });
        break;
      }
      case 'GET': {
        const technicians = await getTechnicians();
        res.status(200).json(technicians);
        break;
      }
      case 'PUT': {
        const { id, technicianNum, name, status, type, mobileNumber } = req.body;
        if (!id || !name) {
          res.status(400).json({ error: 'Technician ID and name are required' });
          return;
        }
        await updateTechnician(id, technicianNum, name, type, mobileNumber, status);
        res.status(200).json({ message: 'Technician updated' });
        break;
      }
      case 'DELETE': {
        const { id } = req.body;
        if (!id) {
          res.status(400).json({ error: 'Technician ID is required' });
          return;
        }
        await deleteTechnician(id);
        res.status(200).json({ message: 'Technician deleted' });
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
