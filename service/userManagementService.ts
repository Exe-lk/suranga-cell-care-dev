import { supabase } from '../lib/supabase';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser as deleteAuthUser } from 'firebase/auth';

export const createUser = async (name: string, role: any, nic: string, email: string, mobile: string, level: string) => {
  try {
    // Check if NIC already exists
    const { data: nicExists, error: nicCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('nic', nic)
      .single();
    
    if (nicCheckError && nicCheckError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      throw new Error(`Error checking NIC: ${nicCheckError.message}`);
    }
    
    if (nicExists) {
      throw new Error('NIC already exists');
    }
    
    // Check if email already exists
    const { data: emailExists, error: emailCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (emailCheckError && emailCheckError.code !== 'PGRST116') {
      throw new Error(`Error checking email: ${emailCheckError.message}`);
    }
    
    if (emailExists) {
      throw new Error('Email already exists');
    }
    
    // Create user account with Firebase Auth (keeping this as requested)
    const userCredential = await createUserWithEmailAndPassword(auth, email, nic);
    const firebaseUser = userCredential.user;
    
    // Add user to Supabase users table
    const { data: user, error } = await supabase
      .from('users')
      .insert([
        { 
          name, 
          role, 
          nic, 
          email, 
          mobile, 
          status: true, 
          level,
          firebase_uid: firebaseUser.uid // Store Firebase UID in Supabase for reference
        }
      ])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    return user.id;
  } catch (error: any) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUser = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('status', true);
  
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  
  return data;
};

export const getDeleteUser = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('status', false);
  
  if (error) {
    console.error('Error fetching deleted users:', error);
    throw error;
  }
  
  return data;
};

export const getUserById = async (id: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
  
  return data;
};

export const updateUser = async (id: string, name: string, role: any, nic: string, email: string, mobile: string, status: boolean, level: string) => {
  console.log(name, role, nic, email, mobile, status, level);
  
  const { error } = await supabase
    .from('users')
    .update({ name, role, nic, email, mobile, status, level })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  try {
    // Get the user first
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('email, nic, firebase_uid')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      throw new Error(`Error fetching user: ${fetchError.message}`);
    }
    
    if (!user) {
      throw new Error(`User with ID ${id} not found.`);
    }
    
    try {
      // Attempt to delete from Firebase Auth
      // First sign in as the user
      const userCredential = await signInWithEmailAndPassword(auth, user.email, user.nic);
      const firebaseUser = userCredential.user;
      // Then delete the user
      await deleteAuthUser(firebaseUser);
    } catch (authError) {
      console.error('Firebase auth deletion error:', authError);
      // Continue with database deletion even if auth deletion fails
    }
    
    // Delete from Supabase
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log(`User with ID ${id} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
