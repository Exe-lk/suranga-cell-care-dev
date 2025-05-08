import { supabase } from '../lib/supabase';

export const createCategory = async (name: string) => {console.log(name);
	const status = true;
	const timestamp = new Date();
	const { data, error } = await supabase
		.from('CategoryDisplay')
		.insert([{ name, status, timestamp }])
		.select()
		.single(); // Return a single row

	if (error) throw error;
	return data.id; // Or whatever ID field you use
};

export const getCategory = async () => {
	const { data, error } = await supabase
		.from('CategoryDisplay')
		.select('*')
		.eq('status', true);

	if (error) throw error;

	return data;
};

export const getDeleteCategory = async () => {
	const { data, error } = await supabase
		.from('CategoryDisplay')
		.select('*')
		.eq('status', false);

	if (error) throw error;
	return data;
};

export const getCategoryById = async (id: string) => {
	const { data, error } = await supabase
		.from('CategoryDisplay')
		.select('*')
		.eq('id', id)
		.single();

	if (error) return null;
	return data;
};

export const updateCategory1 = async (id: string, name: string, status: boolean) => {
	const { error } = await supabase
		.from('CategoryDisplay')
		.update({ name, status })
		.eq('id', id);

	if (error) throw error;
};

export const updateCategory = async (id: string, newName: string, status: boolean) => {
	try {
		// Get old category name
		const { data: category, error: catErr } = await supabase
			.from('CategoryDisplay')
			.select('name')
			.eq('id', id)
			.single();

		if (catErr || !category) {
			console.error(`Category with ID "${id}" not found.`);
			return;
		}

		const oldName = category.name;

		// Update category
		const { error: updateCatErr } = await supabase
			.from('CategoryDisplay')
			.update({ name: newName, status })
			.eq('id', id);

		if (updateCatErr) throw updateCatErr;

		// Update matching ItemManagementDis
		const { data: items, error: itemErr } = await supabase
			.from('ItemManagementDis')
			.select('id')
			.eq('category', oldName);

		if (itemErr) throw itemErr;

		for (const item of items) {
			await supabase
				.from('ItemManagementDis')
				.update({ category: newName })
				.eq('id', item.id);
		}

		// Update matching Stock
		const { data: stocks, error: stockErr } = await supabase
			.from('Stock')
			.select('id')
			.eq('category', oldName);

		if (stockErr) throw stockErr;

		for (const stock of stocks) {
			await supabase
				.from('Stock')
				.update({ category: newName })
				.eq('id', stock.id);
		}

		// Update matching Brand records
		const { data: brands, error: brandErr } = await supabase
			.from('BrandDisplay')
			.select('id')
			.eq('category', oldName);

		if (brandErr) throw brandErr;

		for (const brand of brands) {
			await supabase
				.from('BrandDisplay')
				.update({ category: newName })
				.eq('id', brand.id);
		}

		// Update matching Model records
		const { data: models, error: modelErr } = await supabase
			.from('ModelDisplay')
			.select('id')
			.eq('category', oldName);

		if (modelErr) throw modelErr;

		for (const model of models) {
			await supabase
				.from('ModelDisplay')
				.update({ category: newName })
				.eq('id', model.id);
		}

		console.log(`Updated category and reflected changes in related tables.`);
	} catch (error) {
		console.error('Error updating category:', error);
	}
};

export const deleteCategory = async (id: string) => {
	const { error } = await supabase
		.from('CategoryDisplay')
		.delete()
		.eq('id', id);

	if (error) throw error;
};

export const searchCategories = async (searchTerm: string) => {
	const { data, error } = await supabase
		.from('CategoryDisplay')
		.select('*')
		.eq('status', true)
		.ilike('name', `%${searchTerm}%`);

	if (error) throw error;
	return data;
};
