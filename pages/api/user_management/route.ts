import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
} from '../../../service/userManagementService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': {
        const { name, role, nic, email, mobile } = req.body;
        console.log('Creating user with data:', { name, role, nic, email, mobile });
        
        if (!name) {
          res.status(400).json({ error: 'Name is required' });
          return;
        }
        
        try {
          const id = await createUser(name, role, nic, email, mobile);
          console.log('User created successfully with ID:', id);
          res.status(201).json({ message: 'User created', id });
        } catch (createError: any) {
          console.error('User creation failed:', createError.message);
          
          // Handle specific user creation errors
          if (createError.message.includes('NIC already exists')) {
            res.status(409).json({ error: 'NIC already exists' });
          } else if (createError.message.includes('Email already exists')) {
            res.status(409).json({ error: 'Email already exists' });
          } else if (createError.message.includes('Authentication error')) {
            res.status(400).json({ error: 'Failed to create user account' });
          } else {
            console.error('User creation error:', createError);
            res.status(500).json({ error: createError.message || 'Failed to create user' });
          }
          return;
        }
        break;
      }
      case 'GET': {
        const users = await getUser();
        res.status(200).json(users);
        break;
      }
      case 'PUT': {
        const { id, status, name, role, nic, email, mobile } = req.body;
        if (!id || !name) {
          res.status(400).json({ error: 'User ID and name are required' });
          return;
        }
        await updateUser(id, status, name, role, nic, email, mobile);
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
  } catch (error: any) {
    console.error('API route error:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
