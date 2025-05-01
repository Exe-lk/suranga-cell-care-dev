import { supabase } from '../lib/supabase';

// Create Stock In Entry
export const createstockIn = async (values: any) => {
  const status = true;
  const timestamp = new Date(); // Supabase uses JS Date for timestamps
console.log(values)
  const { data, error } = await supabase
    .from('StockAcce')
    .insert([{ ...values, status,}])
    .select('id') // to return the inserted id

  if (error) {
    console.error('Error creating stock in:', error);
    return null;
  }

  return data?.[0]?.id;
};

// Get All Active Stock In Entries
export const getstockIns = async () => {
  const { data, error } = await supabase
    .from('StockAcce')
    .select('*')
    .eq('status', true);

  if (error) {
    console.error('Error fetching stock ins:', error);
    return [];
  }

  return data;
};

// Get Stock In Entry by ID
export const getstockInById = async (id: string) => {
  const { data, error } = await supabase
    .from('StockAcce')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching stock in by ID:', error);
    return null;
  }

  return data;
};

// Update Quantity in ItemManagementAcce Table
export const updatestockIn = async (id: string, quantity: string) => {
  const { error } = await supabase
    .from('ItemManagementAcce')
    .update({ quantity })
    .eq('id', id);

  if (error) {
    console.error('Error updating quantity:', error);
  }
};

// Create Stock Out Entry (still inserted into StockAcce)
export const createstockOut = async (
  model: string,
  brand: string,
  category: string,
  quantity: string,
  date: string,
  customerName: string,
  mobile: string,
  nic: string,
  email: string,
  barcode: string,
  cost: string,
  sellingPrice: string,
  stock: string,
  description: string
) => {
  const status = true;
  const timestamp = new Date();

  const { data, error } = await supabase
    .from('StockAcce')
    .insert([{
      model,
      brand,
      category,
      quantity,
      date,
      customerName,
      mobile,
      nic,
      email,
      barcode,
      cost,
      sellingPrice,
      stock,
      description,
      status,
      timestamp
    }])
    .select('id');

  if (error) {
    console.error('Error creating stock out:', error);
    return null;
  }

  return data?.[0]?.id;
};

// Mark Stock as Deleted (status = false)
export const createstockDelete = async (values: any) => {
  const status = false;
  const timestamp = new Date();

  const { data, error } = await supabase
    .from('StockAcce')
    .insert([{ ...values, status, timestamp }])
    .select('id');

  if (error) {
    console.error('Error creating stock delete:', error);
    return null;
  }

  return data?.[0]?.id;
};

// Get Stock In Entries by Date
export const getstockInByDate = async (date: string) => {
  const { data, error } = await supabase
    .from('StockAcce')
    .select('*')
    .eq('status', true)
    .eq('date', date);

  if (error) {
    console.error('Error fetching stock by date:', error);
    return [];
  }

  return data;
};
