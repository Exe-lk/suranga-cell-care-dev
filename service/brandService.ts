import { supabase } from '../lib/supabase';

// Create brand
export const createBrand = async (name: string, category: string) => {
  console.log(name)
  const { data, error } = await supabase
    .from('BrandDisplay')
    .insert([{ name, category, status: true,description:""}])
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

// Get active brands
export const getBrand = async () => {
  const { data, error } = await supabase
    .from('BrandDisplay')
    .select('*')
    .eq('status', true);

  if (error) throw error;
  return data;
};

// Get deleted brands
export const getDeleteBrand = async () => {
  const { data, error } = await supabase
    .from('BrandDisplay')
    .select('*')
    .eq('status', false);

  if (error) throw error;
  return data;
};

// Get brand by ID
export const getBrandById = async (id: string) => {
  const { data, error } = await supabase
    .from('BrandDisplay')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
};

// Basic update
export const updateBrand1 = async (id: string, name: string, category: string, status: boolean) => {
  const { error } = await supabase
    .from('BrandDisplay')
    .update({ name, category, status })
    .eq('id', id);

  if (error) throw error;
};

// Full update with references in other tables
export const updateBrand = async (id: string, name: string, category: string, status: boolean) => {

  const { data: brandDoc, error: brandError } = await supabase
    .from('BrandDisplay')
    .select('*')
    .eq('id', id)
    .single();

  if (brandError || !brandDoc) {
    console.error(`Brand with ID "${id}" does not exist.`);
    return;
  }

  const oldName = brandDoc.name;
  const oldCategory = brandDoc.category;

  // Update brand
  const { error: updateBrandErr } = await supabase
    .from('BrandDisplay')
    .update({ name, category, status })
    .eq('id', id);

  if (updateBrandErr) throw updateBrandErr;

  // Update related documents in ItemManagementDis
  const { data: items, error: itemError } = await supabase
    .from('ItemManagementDis')
    .select('id')
    .eq('brand', oldName)
    .eq('category', oldCategory);

  if (itemError) throw itemError;

  for (const item of items) {
    await supabase
      .from('ItemManagementDis')
      .update({ brand: name, category: category })
      .eq('id', item.id);
  }

  // Update related documents in Stock
  const { data: stocks, error: stockError } = await supabase
    .from('Stock')
    .select('id')
    .eq('brand', oldName)
    .eq('category', oldCategory);

  if (stockError) throw stockError;

  for (const stock of stocks) {
    await supabase
      .from('Stock')
      .update({ brand: name, category: category })
      .eq('id', stock.id);
  }
  
  // Update related models in ModelDisplay table
  const { data: models, error: modelError } = await supabase
    .from('ModelDisplay')
    .select('id')
    .eq('brand', oldName)
    .eq('category', oldCategory);

  if (modelError) throw modelError;

  for (const model of models) {
    await supabase
      .from('ModelDisplay')
      .update({ brand: name, category: category })
      .eq('id', model.id);
  }
};

// Delete brand
export const deleteBrand = async (id: string) => {
  const { error } = await supabase
    .from('BrandDisplay')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const searchBrands = async (searchTerm: string) => {
  const { data, error } = await supabase
    .from('BrandDisplay')
    .select('*')
    .eq('status', true)
    .or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);

  if (error) throw error;
  return data;
};
