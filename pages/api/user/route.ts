import type { NextApiRequest, NextApiResponse } from 'next';
import {
  SignInUser,
  getUserPositionByEmail
} from '../../../service/authentication';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': {
        const { email, password } = req.body;
        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required' });
        }
        try {
          const userPosition = await getUserPositionByEmail(email);
          if (!userPosition) {
            return res.status(404).json({ error: 'Email not found' });
          }
          const signInResult = await SignInUser(email, password);
          if (!signInResult) {
            return res.status(401).json({ error: 'Incorrect password' });
          }
          return res.status(200).json({ message: 'User logged in', user: signInResult });
        } catch (error) {
          console.error('API Error:', error);
          return res.status(500).json({ error: 'An internal server error occurred.' });
        }
      }
      case 'GET': {
        const { email } = req.body;
        if (!email) {
          return res.status(400).json({ error: 'Email is required' });
        }
        const user = await getUserPositionByEmail(email);
        return res.status(200).json(user);
      }
      default:
        res.setHeader('Allow', ['POST', 'GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
}
