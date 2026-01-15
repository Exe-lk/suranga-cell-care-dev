import type { NextApiRequest, NextApiResponse } from 'next';
import {
	createstockOut,
	getAllSubStockData,
	getstockInByDate,
	updateSubStock,
} from '../../../service/stockInOutDissService';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	// #region agent log
	const startTime = Date.now();
	const logId = `[${Date.now()}]`;
	console.log(`${logId} API route handler entry`, { method: req.method, query: req.query });
	fetch('http://127.0.0.1:7242/ingest/32556381-b070-455f-ac8b-feae48209138',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route1.ts:12',message:'API route handler entry',data:{method:req.method,query:req.query},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
	// #endregion
	try {
		switch (req.method) {
			case 'POST': {
				const { model } = req.body;
				if (!model) {
					res.status(400).json({ error: 'stock In name is required' });
					return;
				}
				// console.log(req.body)
				const id = await createstockOut(req.body);
				res.status(201).json({ message: 'stock In created', id });
				break;
			}
			case 'GET': {
				const { date, searchTerm, limit, offset } = req.query;
				// Parse pagination parameters with defaults
				const limitNum = limit ? parseInt(limit as string, 10) : 500;
				const offsetNum = offset ? parseInt(offset as string, 10) : 0;
				// #region agent log
				console.log(`${logId} Before getstockInByDate call`, { date, searchTerm, limit: limitNum, offset: offsetNum });
				fetch('http://127.0.0.1:7242/ingest/32556381-b070-455f-ac8b-feae48209138',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route1.ts:30',message:'Before getstockInByDate call',data:{date,searchTerm,limit:limitNum,offset:offsetNum},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,D'})}).catch(()=>{});
				// #endregion
				// Use the updated service function that supports search terms and pagination
				const result = await getstockInByDate(
					date as string || '', 
					searchTerm as string || '',
					limitNum,
					offsetNum
				);
				// #region agent log
				const elapsed = Date.now() - startTime;
				console.log(`${logId} After getstockInByDate call`, { dataLength: result?.data?.length || 0, totalCount: result?.totalCount || 0, elapsed });
				fetch('http://127.0.0.1:7242/ingest/32556381-b070-455f-ac8b-feae48209138',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route1.ts:37',message:'After getstockInByDate call',data:{dataLength:result?.data?.length||0,totalCount:result?.totalCount||0,elapsed:Date.now()-startTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,D'})}).catch(()=>{});
				// #endregion
				res.status(200).json(result);
				break;
			}
			case 'PUT': {
				const { id, subid, values } = req.body;
				// console.log(req.body)
				await updateSubStock(subid, values);
				res.status(200).json({ message: 'stock In updated' });
				break;
			}
			default: {
				res.setHeader('Allow', ['POST', 'GET', 'PUT']);
				res.status(405).end(`Method ${req.method} Not Allowed`);
				break;
			}
		}
		// #region agent log
		console.log(`${logId} API route handler success exit`, { method: req.method, elapsed: Date.now() - startTime });
		fetch('http://127.0.0.1:7242/ingest/32556381-b070-455f-ac8b-feae48209138',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route1.ts:52',message:'API route handler success exit',data:{method:req.method,elapsed:Date.now()-startTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
		// #endregion
	} catch (error) {
		// #region agent log
		const elapsed = Date.now() - startTime;
		const errorDetails = {
			message: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
			method: req.method,
			query: req.query,
			elapsed
		};
		console.error(`${logId} API route handler error:`, errorDetails);
		fetch('http://127.0.0.1:7242/ingest/32556381-b070-455f-ac8b-feae48209138',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route1.ts:55',message:'API route handler error',data:{errorMessage:error instanceof Error?error.message:String(error),errorStack:error instanceof Error?error.stack:undefined,elapsed:Date.now()-startTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
		// #endregion
		res.status(500).json({ 
			error: 'An error occurred',
			message: error instanceof Error ? error.message : 'Unknown error',
			elapsed
		});
	}
}
