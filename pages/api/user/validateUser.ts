import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '../../../firebaseConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;

    try {
      // Check if the user is authenticated
      const user = auth.currentUser;

      if (!user || user.email !== email) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
