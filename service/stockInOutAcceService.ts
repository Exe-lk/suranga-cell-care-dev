import { supabase } from '../lib/supabase';

// Create Stock In Entry
export const createstockIn = async (values: any) => {
	const status = true;
	const created_at = new Date(); // Supabase uses JS Date for timestamps

	console.log('=== SERVICE: createstockIn DEBUG START ===');
	console.log('Raw input values:', values);
	console.log('Input barcode value:', values.barcode);
	console.log('Input barcode type:', typeof values.barcode);

	// Handle numeric fields - convert empty strings to null or default values
	const processedValues = { ...values, status, created_at };

	if (processedValues.quantity === '') processedValues.quantity = null;
	if (processedValues.cost === '') processedValues.cost = null;
	if (processedValues.sellingPrice === '') processedValues.sellingPrice = null;

	// Convert string numeric values to actual numbers
	if (processedValues.quantity) processedValues.quantity = Number(processedValues.quantity);
	if (processedValues.cost) processedValues.cost = Number(processedValues.cost);
	if (processedValues.sellingPrice)
		processedValues.sellingPrice = Number(processedValues.sellingPrice);

	console.log('=== SERVICE: Processed values before DB insert ===');
	console.log('Processed values:', processedValues);
	console.log('Final barcode value:', processedValues.barcode);
	console.log('Final barcode type:', typeof processedValues.barcode);

	const { data, error } = await supabase.from('StockAcce').insert([processedValues]).select('id'); // to return the inserted id

	console.log('=== SERVICE: Database operation result ===');
	console.log('Supabase insert data:', data);
	console.log('Supabase insert error:', error);

	if (error) {
		console.error('=== SERVICE: Error creating stock in ===');
		console.error('Database error details:', error);
		return null;
	}

	console.log('=== SERVICE: createstockIn DEBUG END ===');
	console.log('Successfully created record with ID:', data?.[0]?.id);
	return data?.[0]?.id;
};

// Get All Active Stock In Entries
export const getstockIns = async () => {
	const { data, error } = await supabase.from('StockAcce').select('*').eq('status', true);

	const { data: firstBatch, error: err1 } = await supabase
		.from('StockAcce')
		.select('*')
		.range(0, 999) // First 1000 rows
		.eq('status', true);
	const { data: secondBatch, error: err2 } = await supabase
		.from('StockAcce')
		.select('*')
		.range(1000, 1999)
		.eq('status', true); // Next 800 rows
	const { data: theredBatch, error: err3 } = await supabase
		.from('StockAcce')
		.select('*')
		.range(2000, 2999)
		.eq('status', true);
	const { data: forthBatch, error: err4 } = await supabase
		.from('StockAcce')
		.select('*')
		.range(3000, 3999)
		.eq('status', true);
    const { data: fithBatch, error: err5 } = await supabase
		.from('StockAcce')
		.select('*')
		.range(4000, 4999)
		.eq('status', true);
 // Combine both batches
 const allData = [...(firstBatch || []), ...(secondBatch || []),...(theredBatch || []),...(forthBatch || []),...(fithBatch|| [])];

	if (error) {
		console.error('Error fetching stock ins:', error);
		return [];
	}
console.log(allData.length)
	return allData;
};

// Get Stock In Entry by ID
export const getstockInById = async (id: string) => {
	const { data, error } = await supabase.from('StockAcce').select('*').eq('id', id).single();

	if (error) {
		console.error('Error fetching stock in by ID:', error);
		return null;
	}

	return data;
};

// Update Quantity in ItemManagementAcce Table
export const updatestockIn = async (id: string, quantity: string) => {
	try {
		// First get the current item to ensure it exists
		const { data: item, error: getError } = await supabase
			.from('ItemManagementAcce')
			.select('*')
			.eq('id', id)
			.single();

		if (getError) {
			console.error('Error fetching item before update:', getError);
			throw getError;
		}

		if (!item) {
			throw new Error(`Item with ID ${id} not found`);
		}

		// Update the item quantity
		const { error } = await supabase
			.from('ItemManagementAcce')
			.update({ quantity })
			.eq('id', id);

		if (error) {
			console.error('Error updating quantity:', error);
			throw error;
		}

		console.log(`Successfully updated quantity for item ${id} to ${quantity}`);
		return true;
	} catch (error) {
		console.error('Error in updatestockIn:', error);
		throw error;
	}
};

export const createstockOut = async (values: any) => {
	console.log('Creating stock out with original values:', values);

	const processedValues = {
		...values,
		status: true,
		created_at: new Date(),
		stock: 'stockOut',
	};

	// Handle numeric fields
	if (processedValues.quantity) processedValues.quantity = Number(processedValues.quantity);
	if (processedValues.cost) processedValues.cost = Number(processedValues.cost);
	if (processedValues.sellingPrice)
		processedValues.sellingPrice = Number(processedValues.sellingPrice);

	console.log('Inserting stock out with processed values:', processedValues);

	const { data, error } = await supabase.from('StockAcce').insert([processedValues]).select('id');

	if (error) {
		console.error('Error creating stock out:', error);
		throw error;
	}

	console.log('Stock out created with ID:', data?.[0]?.id);
	return data?.[0]?.id;
};

export const createstockDelete = async (values: any) => {
	const status = false;
	const created_at = new Date();

	const { data, error } = await supabase
		.from('StockAcce')
		.insert([{ ...values, status, created_at }])
		.select('id');

	if (error) {
		console.error('Error creating stock delete:', error);
		return null;
	}

	return data?.[0]?.id;
};

// Get Stock In/Out Entries by Date
export const getstockInByDate = async (date: string) => {
	console.log('Fetching stock with date:', date);

	const query = supabase.from('StockAcce').select('*').eq('status', true);

	if (date && date !== 'undefined' && date !== 'null') {
		query.eq('date', date);
	}

	const { data, error } = await query;

	if (error) {
		console.error('Error fetching stock by date:', error);
		return [];
	}

	console.log('Stock data fetched:', data?.length, 'records');
	console.log(
		'Stock types:',
		data
			?.map((item) => item.stock)
			.filter((value, index, self) => self.indexOf(value) === index),
	);

	return data;
};

export const getAllStockRecords = async () => {
	console.log('Fetching ALL stock records without date filtering');

	const { data, error } = await supabase
		.from('StockAcce')
		.select('*')
		.eq('status', true)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching all stock records:', error);
		return [];
	}

	console.log('Total records fetched:', data?.length);
	console.log(
		'Stock types present:',
		data?.map((item) => item.stock).filter((v, i, a) => a.indexOf(v) === i),
	);
	console.log('stockOut records:', data?.filter((item) => item.stock === 'stockOut').length);
	console.log('stockIn records:', data?.filter((item) => item.stock === 'stockIn').length);

	return data;
};
