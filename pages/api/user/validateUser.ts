import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;

    try {
      // Get the current session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session || !session.user || session.user.email !== email) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Optional: Additional validation can be added here
      return res.status(200).json({ message: 'User is authenticated' });
      
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
