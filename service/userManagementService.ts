import { supabase } from '../lib/supabase';

export const createUser = async (name: string, role: any, nic: string, email: string, mobile: string) => {
  let authUserId: string | null = null;
  
  try {
    console.log('Starting user creation process...');
    console.log('Input data:', { name, role, nic, email, mobile });
    
    // Check if NIC already exists - simplified approach
    console.log('Checking if NIC exists...');
    const { data: nicCheck, error: nicCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('nic', nic)
      .limit(1);
    
    if (nicCheckError) {
      console.error('Error checking NIC:', nicCheckError);
      throw new Error(`Error checking NIC: ${nicCheckError.message}`);
    }
    
    if (nicCheck && nicCheck.length > 0) {
      console.log('NIC already exists');
      throw new Error('NIC already exists');
    }
    
    // Check if email already exists - simplified approach
    console.log('Checking if email exists...');
    const { data: emailCheck, error: emailCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1);
    
    if (emailCheckError) {
      console.error('Error checking email:', emailCheckError);
      throw new Error(`Error checking email: ${emailCheckError.message}`);
    }
    
    if (emailCheck && emailCheck.length > 0) {
      console.log('Email already exists');
      throw new Error('Email already exists');
    }
    
    console.log('No duplicates found, proceeding with auth creation...');
    
    // Create user account with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: nic, // Using NIC as default password
      options: {
        data: {
          name: name,
          role: role,
          nic: nic,
          mobile: mobile,
        }
      }
    });
    
    if (authError) {
      console.error('Authentication error:', authError);
      throw new Error(`Authentication error: ${authError.message}`);
    }
    
    if (!authData.user) {
      console.error('No user data returned from auth');
      throw new Error('Failed to create user in authentication system');
    }
    
    authUserId = authData.user.id;
    console.log('Auth user created successfully with ID:', authUserId);
    
    // Prepare user data for database insertion
    const userData = {
      name, 
      role, 
      nic, 
      email, 
      mobile, 
      status: true, 
      auth_user_id: authUserId
    };
    
    console.log('Inserting user data into database:', userData);
    
    // Add user to Supabase users table
    const { data: user, error: dbError } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (dbError) {
      console.error('Database insertion error:', dbError);
      console.error('Error details:', {
        code: dbError.code,
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint
      });
      throw new Error(`Database error: ${dbError.message}`);
    }
    
    if (!user) {
      console.error('No user data returned from database insertion');
      throw new Error('User was not created in database');
    }
    
    console.log('User created successfully in database with ID:', user.id);
    return user.id;
    
  } catch (error: any) {
    console.error('Error in createUser function:', error);
    
    // If we created an auth user but database insertion failed, log for cleanup
    if (authUserId) {
      console.log('Database insertion failed, auth user ID that needs cleanup:', authUserId);
      console.log('Please manually delete this auth user from Supabase dashboard if needed');
    }
    
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

export const updateUser = async (id: string, status: boolean, name: string, role: string, nic: string, email: string, mobile: string) => {
  try {
    // Get current user data to check if email changed
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('email, auth_user_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      throw new Error(`Error fetching current user: ${fetchError.message}`);
    }
    
    // Update user in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        name, 
        role, 
        nic, 
        email, 
        mobile, 
        status 
      })
      .eq('id', id);
    
    if (updateError) {
      throw new Error(`Database update error: ${updateError.message}`);
    }
    
    // If email changed and user has auth_user_id, update auth email
    if (currentUser.email !== email && currentUser.auth_user_id) {
      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
        currentUser.auth_user_id,
        { 
          email: email,
          user_metadata: {
            name: name,
            role: role,
            nic: nic,
            mobile: mobile,
          }
        }
      );
      
      if (authUpdateError) {
        console.warn('Failed to update auth email, but database was updated:', authUpdateError.message);
      }
    }
    
    console.log(`User with ID ${id} updated successfully.`);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  try {
    // Get the user first to get auth_user_id
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('email, nic, auth_user_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      throw new Error(`Error fetching user: ${fetchError.message}`);
    }
    
    if (!user) {
      throw new Error(`User with ID ${id} not found.`);
    }
    
    // Delete from Supabase Auth if auth_user_id exists
    if (user.auth_user_id) {
      try {
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.auth_user_id);
        if (authDeleteError) {
          console.warn('Failed to delete from auth, but continuing with database deletion:', authDeleteError.message);
        }
    } catch (authError) {
        console.warn('Auth deletion error:', authError);
      // Continue with database deletion even if auth deletion fails
      }
    }
    
    // Delete from Supabase database
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
