import { supabase } from '../lib/supabase';

export const SignInUser = async (email: string, password: string) => {
  try {
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      console.error('Error signing in:', authError);
      return null;
    }

    if (!authData.user) {
      console.error('No user data returned from sign in');
      return null;
    }

    // Get user position and level from the users table
    const userPosition = await getUserPositionByEmail(email);
    const userLevel = await getUserPositionBylevel(email);
    
    return { 
      user: authData.user, 
      position: userPosition, 
      level: userLevel 
    };
  } catch (error) {
    console.error('Error signing in:', error);
    return null;
  }
};

export const getUserPositionByEmail = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('email', email)
      .eq('status', true)
      .single();
    
    if (error) {
      console.error('Error fetching user position:', error);
      return null;
    }
    
    return data?.role || null;
  } catch (error) {
    console.error('Error fetching user position:', error);
    return null;
  }
};

export const getUserPositionBylevel = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('level')
      .eq('email', email)
      .eq('status', true)
      .single();
    
    if (error) {
      console.error('Error fetching user level:', error);
      return null;
    }
    
    return data?.level || null;
  } catch (error) {
    console.error('Error fetching user level:', error);
    return null;
  }
};

export default SignInUser;
