import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createUser,
  getDeleteUser,
  updateUser,
  deleteUser,
} from '../../../service/userManagementService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': {
        const { name, role, nic, email, mobile,level } = req.body;
        if (!name) {
          res.status(400).json({ error: 'User name is required' });
          return;
        }
        const id = await createUser(name, role, nic, email, mobile,level);
        res.status(201).json({ message: 'User created', id });
        break;
      }
      case 'GET': {
        const users = await getDeleteUser();
        res.status(200).json(users);
        break;
      }
      case 'PUT': {
        const { id, name, role, nic, email, mobile, status,level } = req.body;
        if (!id || !name) {
          res.status(400).json({ error: 'User ID and name are required' });
          return;
        }
        await updateUser(id, name, role, nic, email, mobile, status,level);
        res.status(200).json({ message: 'User updated' });
        break;
      }
      case 'DELETE': {
        const { id } = req.body;
        if (!id) {
          res.status(400).json({ error: 'User ID is required' });
          return;
        }
        await deleteUser(id);
        res.status(200).json({ message: 'User deleted' });
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
