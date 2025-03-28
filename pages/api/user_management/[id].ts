import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById, updateUser, deleteUser } from '../../../service/userManagementService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }
  try {
    switch (req.method) {
      case 'GET': {
        const user = await getUserById(id as string);
        if (!user) {
          res.status(404).json({ error: 'User not found' });
        } else {
          res.status(200).json(user);
        }
        break;
      }
      case 'PUT': {
        const { name, role, nic, email, mobile, status,level } = req.body;
        if (!name) {
          res.status(400).json({ error: 'User name is required' });
          return;
        }
      
        await updateUser(id as string, name, role, nic, email, mobile, status,level);
        res.status(200).json({ message: 'User updated' });
        break;
      }
      case 'DELETE': {
        await deleteUser(id as string);
        res.status(200).json({ message: 'User deleted' });
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
