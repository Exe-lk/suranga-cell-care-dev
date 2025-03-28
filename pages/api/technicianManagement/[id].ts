import type { NextApiRequest, NextApiResponse } from 'next';
import { getTechnicianById, updateTechnician, deleteTechnician } from '../../../service/technicianManagementService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Technician ID is required' });
    return;
  }
  try {
    switch (req.method) {
      case 'GET': {
        const technician = await getTechnicianById(id as string);
        if (!technician) {
          res.status(404).json({ error: 'Technician not found' });
        } else {
          res.status(200).json(technician);
        }
        break;
      }
      case 'PUT': {
        const { technicianNum, name, type, mobileNumber, status } = req.body;
        if (!name) {
          res.status(400).json({ error: 'Technician name is required' });
          return;
        }
        await updateTechnician(id as string, technicianNum, name, type, mobileNumber, status);
        res.status(200).json({ message: 'Technician updated' });
        break;
      }
      case 'DELETE': {
        await deleteTechnician(id as string);
        res.status(200).json({ message: 'Technician deleted' });
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
