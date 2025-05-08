// import { supabase } from '../lib/supabase';

// // Create a new brand
// export const createBrand = async (category: string, name: string) => {
// 	const { data, error } = await supabase
// 		.from('BrandAccessory')
// 		.insert([{ category, name, status: true, timestamp: new Date() }])
// 		.select('id') // If your table has an `id` column (e.g., serial primary key)
// 		.single();

// 	if (error) throw error;
// 	return data.id;
// };

// // Get active brands
// export const getBrand = async () => {
// 	const { data, error } = await supabase
// 		.from('BrandAccessory')
// 		.select('*')
// 		.eq('status', true);

// 	if (error) throw error;
// 	return data;
// };

// // Get deleted brands
// export const getDeleteBrand = async () => {
// 	const { data, error } = await supabase
// 		.from('BrandAccessory')
// 		.select('*')
// 		.eq('status', false);

// 	if (error) throw error;
// 	return data;
// };

// // Get brand by ID
// export const getBrandById = async (id: string) => {
// 	const { data, error } = await supabase
// 		.from('BrandAccessory')
// 		.select('*')
// 		.eq('id', id)
// 		.single();

// 	if (error) {
// 		if (error.code === 'PGRST116') return null; // not found
// 		throw error;
// 	}
// 	return data;
// };

// // Update brand and cascade updates to ItemManagementAcce and StockAcce
// export const updateBrand = async (id: string, category: string, name: string, status: boolean) => {
// 	// 1. Get the old brand info
// 	const { data: oldData, error: fetchError } = await supabase
// 		.from('BrandAccessory')
// 		.select('*')
// 		.eq('id', id)
// 		.single();

// 	if (fetchError || !oldData) {
// 		console.error(`Brand with ID "${id}" does not exist.`);
// 		return;
// 	}

// 	const oldName = oldData.name;
// 	const oldCategory = oldData.category;

// 	// 2. Update BrandAccessory record
// 	const { error: updateError } = await supabase
// 		.from('BrandAccessory')
// 		.update({ name, category, status })
// 		.eq('id', id);

// 	if (updateError) throw updateError;

// 	// 3. Update related documents in ItemManagementAcce
// 	const { data: itemDocs, error: itemFetchError } = await supabase
// 		.from('ItemManagementAcce')
// 		.select('id')
// 		.eq('brand', oldName)
// 		.eq('category', oldCategory);

// 	if (itemFetchError) throw itemFetchError;

// 	if (itemDocs.length > 0) {
// 		const itemIds = itemDocs.map((doc: any) => doc.id);

// 		const { error: itemUpdateError } = await supabase
// 			.from('ItemManagementAcce')
// 			.update({ brand: name, category })
// 			.in('id', itemIds);

// 		if (itemUpdateError) throw itemUpdateError;
// 	}

// 	// 4. Update related documents in StockAcce
// 	const { data: stockDocs, error: stockFetchError } = await supabase
// 		.from('StockAcce')
// 		.select('id')
// 		.eq('brand', oldName)
// 		.eq('category', oldCategory);

// 	if (stockFetchError) throw stockFetchError;

// 	if (stockDocs.length > 0) {
// 		const stockIds = stockDocs.map((doc: any) => doc.id);

// 		const { error: stockUpdateError } = await supabase
// 			.from('StockAcce')
// 			.update({ brand: name, category })
// 			.in('id', stockIds);

// 		if (stockUpdateError) throw stockUpdateError;
// 	}
// };

// // Delete brand
// export const deleteBrand = async (id: string) => {
// 	const { error } = await supabase
// 		.from('BrandAccessory')
// 		.delete()
// 		.eq('id', id);

// 	if (error) throw error;
// };
import { supabase } from '../lib/supabase';

// Create a new brand
export const createBrand = async (category: string, name: string) => {
	console.log('Creating brand:', { category, name });
	
	try {
		const { data, error } = await supabase
			.from('BrandAccessory')
			.insert([{category, name, status: true }])
			.select();

		if (error) {
			console.error('Error creating brand in Supabase:', error);
			throw error;
		}
		
		if (!data || data.length === 0) {
			throw new Error('No data returned from database after brand creation');
		}
		
		console.log('Brand created successfully:', data[0]);
		return data[0].id;
	} catch (error) {
		console.error('Exception in createBrand:', error);
		throw error;
	}
};

// Get active brands
export const getBrand = async () => {
	const { data, error } = await supabase
		.from('BrandAccessory')
		.select('*')
		.eq('status', true);

	if (error) throw error;
	return data;
	
};

// Get deleted brands
export const getDeleteBrand = async () => {
	const { data, error } = await supabase
		.from('BrandAccessory')
		.select('*')
		.eq('status', false);

	if (error) throw error;
	return data;
};

// Get brand by ID
export const getBrandById = async (id: string) => {
	const { data, error } = await supabase
		.from('BrandAccessory')
		.select('*')
		.eq('id', id)
		.single();

	if (error) {
		if (error.code === 'PGRST116') return null; // not found
		throw error;
	}
	return data;
};

// Update brand and cascade updates to ItemManagementAcce and StockAcce
export const updateBrand = async (id: string, category: string, name: string, status: boolean) => {
	// 1. Get the old brand info
	const { data: oldData, error: fetchError } = await supabase
		.from('BrandAccessory')
		.select('*')
		.eq('id', id)
		.single();

	if (fetchError || !oldData) {
		console.error(`Brand with ID "${id}" does not exist.`);
		return;
	}

	const oldName = oldData.name;
	const oldCategory = oldData.category;

	// 2. Update BrandAccessory record
	const { error: updateError } = await supabase
		.from('BrandAccessory')
		.update({ name, category, status })
		.eq('id', id);

	if (updateError) throw updateError;

	// 3. Update related documents in ItemManagementAcce
	const { data: itemDocs, error: itemFetchError } = await supabase
		.from('ItemManagementAcce')
		.select('id')
		.eq('brand', oldName)
		.eq('category', oldCategory);

	if (itemFetchError) throw itemFetchError;

	if (itemDocs.length > 0) {
		const itemIds = itemDocs.map((doc: any) => doc.id);

		const { error: itemUpdateError } = await supabase
			.from('ItemManagementAcce')
			.update({ brand: name, category })
			.in('id', itemIds);

		if (itemUpdateError) throw itemUpdateError;
	}

	// 4. Update related documents in StockAcce
	const { data: stockDocs, error: stockFetchError } = await supabase
		.from('StockAcce')
		.select('id')
		.eq('brand', oldName)
		.eq('category', oldCategory);

	if (stockFetchError) throw stockFetchError;

	if (stockDocs.length > 0) {
		const stockIds = stockDocs.map((doc: any) => doc.id);

		const { error: stockUpdateError } = await supabase
			.from('StockAcce')
			.update({ brand: name, category })
			.in('id', stockIds);

		if (stockUpdateError) throw stockUpdateError;
	}

	// 5. Update related models in ModelAccessory table
	const { data: modelDocs, error: modelFetchError } = await supabase
		.from('ModelAccessory')
		.select('id')
		.eq('brand', oldName)
		.eq('category', oldCategory);

	if (modelFetchError) throw modelFetchError;

	if (modelDocs.length > 0) {
		const modelIds = modelDocs.map((doc: any) => doc.id);

		const { error: modelUpdateError } = await supabase
			.from('ModelAccessory')
			.update({ brand: name, category })
			.in('id', modelIds);

		if (modelUpdateError) throw modelUpdateError;
	}
};

// Delete brand
export const deleteBrand = async (id: string) => {
	const { error } = await supabase
		.from('BrandAccessory')
		.delete()
		.eq('id', id);

	if (error) throw error;
};
