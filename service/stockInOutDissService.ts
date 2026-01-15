// import { firestore } from '../firebaseConfig';
// import {
// 	addDoc,
// 	collection,
// 	getDocs,
// 	doc,
// 	updateDoc,
// 	deleteDoc,
// 	getDoc,
// 	query,
// 	where,
// 	Timestamp,
// 	orderBy,
// 	limit,
// 	setDoc,
// } from 'firebase/firestore';

// export const createstockIn = async (values: any) => {
// 	console.log(values);
// 	values.status = true;
// 	values.timestamp = Timestamp.now();
// 	values.barcodePrefix = values.barcode.toString().slice(0, 4);
// 	const docRef = doc(firestore, 'Stock', values.barcode); // Use barcode as document ID
// 	await setDoc(docRef, values);
// 	const { quantity } = values;
// 	const subCollectionRef = collection(docRef, 'subStock');

// 	let uniqueId = 1000;

// 	for (let i = 0; i < quantity; i++) {
// 		const barcodeValue = values.barcode + uniqueId;
// 		await setDoc(doc(subCollectionRef, barcodeValue), {
// 			id: docRef.id,
// 			uniqueId: uniqueId.toString(),
// 			status: false,
// 			barcode: barcodeValue,
// 			print: false,
// 		});
// 		uniqueId += 1;
// 	}

// 	return docRef.id;
// };

// export const getstockInByDate = async (date: string, searchTerm: any) => {
// 	// if (searchTerm == '') {
// 		const q = query(
// 			collection(firestore, 'Stock'),
// 			where('status', '==', true),
// 			where('date', '==', date),
// 		);

// 		const querySnapshot = await getDocs(q);
// 		const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

// 		return data;
	
// };

// export const getAllSubStockData = async () => {
// 	try {
// 		const stockCollectionRef = collection(firestore, 'Stock');
// 		const stockSnapshot = await getDocs(stockCollectionRef);
// 		let allSubStockData: any[] = [];
// 		for (const stockDoc of stockSnapshot.docs) {
// 			const stockDocId = stockDoc.id;
// 			const subStockCollectionRef = collection(firestore, 'Stock', stockDocId, 'subStock');
// 			const subStockSnapshot = await getDocs(subStockCollectionRef);
// 			const subStockData = subStockSnapshot.docs.map((subDoc) => ({
// 				id: subDoc.id,
// 				parentStockId: stockDocId,
// 				...subDoc.data(),
// 			}));
// 			allSubStockData = allSubStockData.concat(subStockData);
// 		}
// 		return allSubStockData;
// 	} catch (error) {
// 		console.error('Error fetching all subStock data:', error);
// 		throw new Error('Failed to fetch subStock data.');
// 	}
// };

// export const updateSubStock = async (stockDocId: string, subStockDocId: string, values: any) => {
// 	try {
// 		const subStockDocRef = doc(firestore, 'Stock', stockDocId, 'subStock', subStockDocId);
// 		await updateDoc(subStockDocRef, values);
// 		return { success: true, message: 'SubStock status updated successfully.' };
// 	} catch (error) {
// 		console.error('Error updating subStock:', error);
// 		throw new Error('Failed to update subStock.');
// 	}
// };
// export const updateSubStockById = async (subStockId: string) => {
// 	try {
// 		const stockCollectionRef = collection(firestore, 'Stock');
// 		const stockSnapshot = await getDocs(stockCollectionRef);

// 		for (const stockDoc of stockSnapshot.docs) {
// 			const stockDocId = stockDoc.id;
// 			const subStockCollectionRef = collection(firestore, 'Stock', stockDocId, 'subStock');
// 			const subStockQuery = query(subStockCollectionRef, where('__name__', '==', subStockId));
// 			const subStockSnapshot = await getDocs(subStockQuery);

// 			if (!subStockSnapshot.empty) {
// 				const subStockDocRef = doc(firestore, 'Stock', stockDocId, 'subStock', subStockId);
// 				await updateDoc(subStockDocRef, { status: true });
// 				return { success: true, message: 'SubStock status updated successfully.' };
// 			}
// 		}

// 		throw new Error('SubStock not found.');
// 	} catch (error) {
// 		console.error('Error updating subStock:', error);
// 		throw new Error('Failed to update subStock.');
// 	}
// };

// const findLargestUniqueId = (data: any[]) => {
// 	if (!data || data.length === 0) {
// 		throw new Error('No data available to find uniqueId.');
// 	}
// 	const largestUniqueId = data.reduce((max, item) => {
// 		const uniqueId = parseInt(item.uniqueId, 10);
// 		return uniqueId > max ? uniqueId : max;
// 	}, 0);
// 	return largestUniqueId;
// };

// // export const getstockIns = async () => {
// // 	const q = query(collection(firestore, 'Stock'), where('status', '==', true));
// // 	const querySnapshot = await getDocs(q);
// // 	return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
// // };
// export const getstockIns = async () => {
// 	try {
// 		const q = query(collection(firestore, 'Stock'), where('status', '==', true));
// 		const querySnapshot = await getDocs(q);
// 		const stockData = [];

// 		for (const stockDoc of querySnapshot.docs) {
// 			const stockDocId = stockDoc.id;
// 			const stockInfo: any = { id: stockDocId, ...stockDoc.data(), subStock: [] };

// 			const subStockCollectionRef = collection(firestore, 'Stock', stockDocId, 'subStock');
// 			const subStockSnapshot = await getDocs(subStockCollectionRef);

// 			const subStockData = subStockSnapshot.docs.map((subDoc) => ({
// 				id: subDoc.id,
// 				...subDoc.data(),
// 			}));

// 			stockInfo.subStock = subStockData;
// 			stockData.push(stockInfo);
// 		}

// 		return stockData;
// 	} catch (error) {
// 		console.error('Error fetching stockIns with subStock data:', error);
// 		throw new Error('Failed to fetch stockIns and subStock data.');
// 	}
// };
// export const getstockInById = async (id: string) => {
// 	// const stockInRef = doc(firestore, 'Stock', id);
// 	// const stockInSnap = await getDoc(stockInRef);
// 	// if (stockInSnap.exists()) {
// 	// 	return { id: stockInSnap.id, ...stockInSnap.data() };
// 	// } else {
// 	// 	return null;
// 	// }

// 	const q = query(collection(firestore, 'Stock'), where('barcodePrefix', '==', id));
// 	const querySnapshot = await getDocs(q);
// 	return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
// };

// export const updatestockIn = async (id: string, quantity: string) => {
// 	const stockInRef = doc(firestore, 'ItemManagementDis', id);
// 	await updateDoc(stockInRef, { quantity });
// };

// export const createstockOut = async (data: any) => {
// 	data.status = true;
// 	data.timestamp = Timestamp.now();
// 	const docRef = await addDoc(collection(firestore, 'Stock'), data);
// 	return docRef.id;
// };


import { supabase } from '../lib/supabase';

export const createstockIn = async (values: any) => {
	try {
	  console.log(values);
	  values.status = true;
	  values.timestamp = new Date().toISOString(); // Supabase uses ISO date strings
	  values.barcodePrefix = values.barcode.toString().slice(0, 4);
  
	  // Insert into Stock table
	  const { data: stockData, error: stockError } = await supabase
		.from('Stock')
		.insert([values])
		.select(); // get inserted row
  
	  if (stockError) throw stockError;
  
	  const stockId = stockData[0].id;
	  const { quantity } = values;
  
	  let uniqueId = 1000;
	  const subStockRows = [];
  
	  for (let i = 0; i < quantity; i++) {
		const barcodeValue = values.barcode + uniqueId;


		subStockRows.push({
		id:barcodeValue,
		  stock_id: values.barcode, // Foreign key to Stock table
		  uniqueId: uniqueId.toString(),
		  status: false,
		  barcode: barcodeValue,
		  print: false,
		});
		uniqueId += 1;
	  }
  
	  // Insert all subStock at once
	  const { error: subStockError } = await supabase
		.from('subStock')
		.insert(subStockRows);
  
	  if (subStockError) throw subStockError;
  
	  return stockId;
	} catch (error) {
	  console.error('Error creating stockIn:', error);
	  throw error;
	}
  };
  export const getstockInByDate = async (date: string, searchTerm: any, limit: number = 500, offset: number = 0) => {
	// #region agent log
	const serviceStartTime = Date.now();
	const logId = `[${Date.now()}]`;
	console.log(`${logId} getstockInByDate entry`, { date, searchTerm, limit, offset });
	fetch('http://127.0.0.1:7242/ingest/32556381-b070-455f-ac8b-feae48209138',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stockInOutDissService.ts:240',message:'getstockInByDate entry',data:{date,searchTerm,limit,offset},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C,D'})}).catch(()=>{});
	// #endregion
	try {
		// Build count query to get total records
		let countQuery = supabase
		  .from('Stock')
		  .select('*', { count: 'exact', head: true })
		  .eq('status', true);
		
		// Build data query with pagination
		let dataQuery = supabase
		  .from('Stock')
		  .select('*')
		  .eq('status', true);
		
		// Add date filter if provided
		if (date) {
		  countQuery = countQuery.eq('date', date);
		  dataQuery = dataQuery.eq('date', date);
		}
		
		// Add search filter if provided
		if (searchTerm) {
		  const searchFilter = `barcode.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,suppName.ilike.%${searchTerm}%`;
		  countQuery = countQuery.or(searchFilter);
		  dataQuery = dataQuery.or(searchFilter);
		}
		
		// Apply pagination
		dataQuery = dataQuery
		  .order('code', { ascending: false })
		  .range(offset, offset + limit - 1);
		
		// #region agent log
		console.log(`${logId} Before Supabase query execution`, { hasDate: !!date, hasSearchTerm: !!searchTerm, limit, offset });
		fetch('http://127.0.0.1:7242/ingest/32556381-b070-455f-ac8b-feae48209138',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stockInOutDissService.ts:256',message:'Before Supabase query execution',data:{hasDate:!!date,hasSearchTerm:!!searchTerm,limit,offset},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'})}).catch(()=>{});
		// #endregion
	  
		// Execute both queries
		const [dataResult, countResult] = await Promise.all([
			dataQuery,
			countQuery
		]);
		
		const { data, error } = dataResult;
		const { count, error: countError } = countResult;
		
		// #region agent log
		const elapsed = Date.now() - serviceStartTime;
		console.log(`${logId} After Supabase query execution`, { hasError: !!error, errorMessage: error?.message, dataLength: data?.length || 0, totalCount: count || 0, elapsed });
		fetch('http://127.0.0.1:7242/ingest/32556381-b070-455f-ac8b-feae48209138',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stockInOutDissService.ts:258',message:'After Supabase query execution',data:{hasError:!!error,errorMessage:error?.message,dataLength:data?.length||0,totalCount:count||0,elapsed:Date.now()-serviceStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'})}).catch(()=>{});
		// #endregion
	  
		if (error) {
		  // #region agent log
		  console.error(`${logId} Supabase query error:`, { errorCode: error.code, errorMessage: error.message, errorDetails: error.details, elapsed });
		  fetch('http://127.0.0.1:7242/ingest/32556381-b070-455f-ac8b-feae48209138',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stockInOutDissService.ts:260',message:'Supabase query error',data:{errorCode:error.code,errorMessage:error.message,errorDetails:error.details,elapsed:Date.now()-serviceStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
		  // #endregion
		  console.error('Error fetching stock by date with search:', error);
		  return { data: [], totalCount: 0 };
		}
		
		if (countError) {
		  console.error('Error fetching total count:', countError);
		}
		
		// #region agent log
		console.log(`${logId} getstockInByDate success exit`, { dataLength: data?.length || 0, totalCount: count || 0, elapsed });
		fetch('http://127.0.0.1:7242/ingest/32556381-b070-455f-ac8b-feae48209138',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stockInOutDissService.ts:265',message:'getstockInByDate success exit',data:{dataLength:data?.length||0,totalCount:count||0,elapsed:Date.now()-serviceStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,D'})}).catch(()=>{});
		// #endregion
	  
		return { data: data || [], totalCount: count || 0 };
	} catch (error) {
		// #region agent log
		const elapsed = Date.now() - serviceStartTime;
		console.error(`${logId} getstockInByDate exception:`, { errorMessage: error instanceof Error ? error.message : String(error), errorStack: error instanceof Error ? error.stack : undefined, elapsed });
		fetch('http://127.0.0.1:7242/ingest/32556381-b070-455f-ac8b-feae48209138',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'stockInOutDissService.ts:270',message:'getstockInByDate exception',data:{errorMessage:error instanceof Error?error.message:String(error),errorStack:error instanceof Error?error.stack:undefined,elapsed:Date.now()-serviceStartTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
		// #endregion
		console.error('Exception in getstockInByDate:', error);
		throw error;
	}
  };
  export const getAllSubStockData = async () => {
	try {
	  const { data, error } = await supabase
		.from('subStock')
		.select('*');
  
	  if (error) throw error;
  
	  return data;
	} catch (error) {
	  console.error('Error fetching all subStock data:', error);
	  throw error;
	}
  };
  export const updateSubStock = async (subStockDocId: string, values: any) => {
	try { 
		console.log(subStockDocId)
	  const { error } = await supabase
		.from('subStock')
		.update(values)
		.eq('barcode', subStockDocId);
  
	  if (error) throw error;
  
	  return { success: true, message: 'SubStock updated successfully.' };
	} catch (error) {
	  console.error('Error updating subStock:', error);
	  throw error;
	}
  };
  export const updateSubStockById = async (subStockId: string) => {
	try {
	  const { error } = await supabase
		.from('subStock')
		.update({ status: true })
		.eq('barcode', subStockId);
  
	  if (error) throw error;
  
	  return { success: true, message: 'SubStock status updated successfully.' };
	} catch (error) {
	  console.error('Error updating subStock by ID:', error);
	  throw error;
	}
  };
  export const getstockIns = async () => {
	try {
	  const { data: stockData, error: stockError } = await supabase
		.from('Stock')
		.select(`
		  *
		`)
		.eq('status', true);
  
	  if (stockError) throw stockError;
  
	  return stockData;
	} catch (error) {
	  console.error('Error fetching stockIns with subStock:', error);
	  throw error;
	}
  };
  export const getstockInById = async (id: string) => {
	const { data, error } = await supabase
	  .from('Stock')
	  .select('*')
	  .eq('barcodePrefix', id);
  
	if (error) {
	  console.error('Error fetching stock by ID:', error);
	  throw error;
	}
  
	return data;
  };
  export const updatestockIn = async (id: string, quantity: string) => {
	const { error } = await supabase
	  .from('ItemManagementDis')
	  .update({ quantity })
	  .eq('id', id);
  
	if (error) {
	  console.error('Error updating stockIn:', error);
	  throw error;
	}
  };
  export const createstockOut = async (data: any) => {
	data.status = true;
	data.timestamp = new Date().toISOString();
  
	const { data: newStock, error } = await supabase
	  .from('Stock')
	  .insert([data])
	  .select();
  
	if (error) {
	  console.error('Error creating stockOut:', error);
	  throw error;
	}
  
	return newStock[0].id;
  };

export const getStockOutByTechnician = async (technicianId: string) => {
	try {
		const { data, error } = await supabase
			.from('Stock')
			.select('*')
			.eq('technicianNum', technicianId)
			.eq('stock', 'stockOut')
			.eq('status', true);

		if (error) {
			console.error('Error fetching stock out by technician:', error);
			throw error;
		}

		return data;
	} catch (error) {
		console.error('Error fetching stock out by technician:', error);
		throw error;
	}
};
  