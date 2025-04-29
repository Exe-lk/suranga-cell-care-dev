import React, { useEffect, useRef, useState } from 'react';
import type { NextPage } from 'next';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import Card, { CardBody, CardTitle } from '../../../components/bootstrap/Card';
import Barcode from 'react-barcode';
import Swal from 'sweetalert2';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import {
	useGetStockInOutsQuery,
	useUpdateSubStockInOutMutation,
} from '../../../redux/slices/stockInOutDissApiSlice';
import makeAnimated from 'react-select/animated';
import { MultiSelect } from 'primereact/multiselect';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';

import { supabase } from '../../../lib/supabase'; // adjust path if needed
const Index: NextPage = () => {
	// const { data: StockInOuts, error, isLoading, refetch } = useGetStockInOutsQuery(undefined);
	const [updateSubStockInOut] = useUpdateSubStockInOutMutation();
	const [searchTerm, setSearchTerm] = useState('');
	const [startDate, setStartDate] = useState<string>('');
	const [endDate, setEndDate] = useState<string>('');
	const [StockInOuts, setStockInOuts] = useState<string[]>([]);
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const [isBrowserPrintLoaded, setIsBrowserPrintLoaded] = useState(false);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(PER_COUNT['10000']);
	const [selectedDevice, setSelectedDevice] = useState<any>(null);
	const [devices, setDevices] = useState<any>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const [selectedBarcodes, setSelectedBarcodes] = useState<{ [key: string]: any[] }>({});

	// const selectitem = async (id: any, index: any) => {
	// 	// await setSelectedBarcodes({})
	// 	const subStockCollectionRef = collection(firestore, 'Stock', id, 'subStock');
	// 	const subStockSnapshot = await getDocs(subStockCollectionRef);

	// 	const subStock = subStockSnapshot.docs.map((subDoc) => ({
	// 		id: subDoc.id,
	// 		...subDoc.data(),
	// 	}));

	// 	await setStockInOuts((prevStockInOuts) => {
	// 		return prevStockInOuts.map((item: any) =>
	// 			item.barcode === index ? { ...item, subStock } : item,
	// 		);
	// 	});
	// 	console.log(selectedBarcodes);
	// 	// console.log(subStock);
	// 	// console.log(index);
	// 	// console.log(StockInOuts);
	// };
	const selectitem = async (id: any, index: any) => {
		try {
			// Fetch substocks where stock_id = id
			const { data: subStock, error } = await supabase
				.from('subStock')
				.select('*')
				.eq('stock_id', id);
	
			if (error) throw error;
	
			await setStockInOuts((prevStockInOuts) => {
				return prevStockInOuts.map((item: any) =>
					item.barcode === index ? { ...item, subStock: subStock || [] } : item,
				);
			});
	
			console.log(selectedBarcodes);
		} catch (error) {
			console.error('Error fetching substock: ', error);
		}
	};
	
	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data: stocks, error } = await supabase
					.from('Stock')
					.select('id, barcode, barcodePrefix, boxNumber, brand, category, code, cost, date, description, itemId, model, printlable, quantity, sellingPrice, status, stock, suppName, billNumber, branchNum, dateIn, sellectedItem, sellerName, sellingPrice, technicianNum')
					.eq('status', true)
					.eq('stock', 'stockIn');
	
				if (error) throw error;
	
				const mappedStocks:any = stocks.map((stock) => ({
					...stock,
					subStock: [{}], // initially empty
				}));
	
				setStockInOuts(mappedStocks);
			} catch (error) {
				console.error('Error fetching stocks: ', error);
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, [StockInOuts]);

	useEffect(() => {
		if (StockInOuts) {
			// Initialize state based on subStock array where 'print' is false
			const initialSelections: { [key: string]: any[] } = {};
			StockInOuts.forEach((brand: any) => {
				const autoSelected = brand.subStock
					?.filter((item: any) => item.print === false) // Filter for print: false
					.map((item: any) => item.barcode); // Extract barcode values
				initialSelections[brand.id] = autoSelected;
			});
			setSelectedBarcodes(initialSelections);
		}
	}, [StockInOuts]);
	function onSelectMachineModel(e: any, brandId: string) {
		setSelectedBarcodes((prevState) => ({
			...prevState,
			[brandId]: e.value, // Update selected barcodes for this specific row
		}));
		console.log(`Selected Barcodes for Row ${brandId}: `, e.value);
	}

	const filteredTransactions = StockInOuts?.filter((trans: any) => {
		const transactionDate = new Date(trans.date);
		const start = startDate ? new Date(startDate) : null;
		const end = endDate ? new Date(endDate) : null;
		if (start && end) {
			return transactionDate >= start && transactionDate <= end;
		} else if (start) {
			return transactionDate >= start;
		} else if (end) {
			return transactionDate <= end;
		}
		return true;
	});

	useEffect(() => {
		if (typeof window !== 'undefined' && (window as any).BrowserPrint) {
			setIsBrowserPrintLoaded(true);
		} else {
			console.error('BrowserPrint SDK is not loaded');
		}
	}, []);

	useEffect(() => {
		const setup = () => {
			(window as any).BrowserPrint.getDefaultDevice(
				'printer',
				(device: any) => {
					setSelectedDevice(device);
					setDevices((prevDevices: any) => [...prevDevices, device]);
					(window as any).BrowserPrint.getLocalDevices(
						(deviceList: any) => {
							const newDevices = deviceList.filter(
								(dev: any) => dev.uid !== device.uid,
							);
							setDevices((prevDevices: any) => [...prevDevices, ...newDevices]);
							const zebraDevice = newDevices.find(
								(dev: any) => dev.manufacturer === 'Zebra Technologies',
							);
							if (zebraDevice) {
								setSelectedDevice(zebraDevice);
							}
						},
						() => {
							// alert('Error getting local devices');
						},
						'printer',
					);
				},
				(error: any) => {
					// alert(error);
				},
			);
		};
		if (isBrowserPrintLoaded) setup(); // Ensure BrowserPrint is loaded
	}, [isBrowserPrintLoaded]);

	const printLabels1 = (
		price: string,
		itemCode: string,
		itemName: string,
		selectedBarcodes: any[],
		id: string,
	) => {
		Swal.fire({
			title: 'Bar Code Print!',

			showCancelButton: true,
			confirmButtonText: 'Print',
		}).then((result) => {
			if (result.isConfirmed) {
				selectedBarcodes.map(async (subid: any) => {
					const values = {
						print: true,
					};

					await updateSubStockInOut({ id, subid, values }).unwrap();
				});
			}
		});
	};
	const printLabels = (
		price: string,
		itemCode: string,
		itemName: string,
		selectedBarcodes: any[],
		id: string,
	) => {
		Swal.fire({
			title: 'Bar Code Print!',

			showCancelButton: true,
			confirmButtonText: 'Print',
		}).then((result) => {
			if (result.isConfirmed) {

				selectedBarcodes.map(async (subid: any) => {
					const values = {
						print: true,
					};

					await updateSubStockInOut({ id, subid, values }).unwrap();
				});
				
				console.log(selectedBarcodes);
				// Number of barcodes to print
				const labelQuantity = selectedBarcodes.length;

				// Calculating rows and remaining labels
				let labelRawsQuantity = Math.floor(labelQuantity / 3);
				let lastRawLabelQuantity = labelQuantity % 3;

				let zplString = `
					CT~~CD,~CC^~CT~
					~JA
					^XA
					~TA000
					~JSN
					^LT-16
					^MNW
					^MTT
					^PON
					^PMN
					^LH0,0
					^JMA
					^PR6,6
					~SD15
					^JUS
					^LRN
					^CI27
					^PA0,1,1,0
					^XZ
				`;

				// Loop through full rows of 3 labels
				let currentIndex = 0;
				for (let i = 0; i < labelRawsQuantity; i++) {
					zplString += `^XA ^MMT ^PW815 ^LL200 ^LS2`;

					for (let j = 0; j < 3; j++) {
						const currentBarcode = selectedBarcodes[currentIndex++];
						zplString += `
							^FT${83 + j * 264},86^A0N,28,33^FH\\^CI28^FDRs ${price}^FS^CI27
							^BY2,3,52^FT${43 + j * 264},145^BCN,,N,N
							^FH\\^FD>;${currentBarcode}^FS
							^FT${43 + j * 264},58^A0N,20,20^FH\\^CI28^FD${itemName}^FS^CI27
							^FT${43 + j * 264},170^A0N,20,20^FH\\^CI28^FD ${currentBarcode}^FS^CI27
						`;
						// 						zplString += `
						//     ^FT${83 + j * 264},40^A0N,22,30^FH\\^CI28^FDSuranga Cell Care^FS^CI27
						//     ^FT${83 + j * 264},86^A0N,28,33^FH\\^CI28^FDRs ${price}^FS^CI27
						//     ^BY2,3,52^FT${43 + j * 264},145^BCN,,N,N
						//     ^FH\\^FD>;${currentBarcode}^FS
						//     ^FT${43 + j * 264},58^A0N,20,20^FH\\^CI28^FD${itemName}^FS^CI27
						//     ^FT${43 + j * 264},170^A0N,20,20^FH\\^CI28^FD ${currentBarcode}^FS^CI27
						// `;
					}
					zplString += `^PQ1,0,1,Y ^XZ`;
				}

				// Handle the remaining labels for the last row
				if (lastRawLabelQuantity > 0) {
					zplString += `^XA ^MMT ^PW815 ^LL200 ^LS2`;

					for (let j = 0; j < lastRawLabelQuantity; j++) {
						const currentBarcode = selectedBarcodes[currentIndex++];
						zplString += `
							^FT${83 + j * 264},86^A0N,28,33^FH\\^CI28^FDRs ${price}^FS^CI27
							^BY2,3,52^FT${43 + j * 264},145^BCN,,N,N
							^FH\\^FD>;${currentBarcode}^FS
							^FT${43 + j * 264},58^A0N,20,20^FH\\^CI28^FD${itemName}^FS^CI27
							^FT${43 + j * 264},170^A0N,20,20^FH\\^CI28^FD ${currentBarcode}^FS^CI27
						`;
					}

					zplString += `^PQ1,0,1,Y ^XZ`;
				}

				// Send ZPL string to the selected device
				selectedDevice.send(zplString, undefined, errorCallback);
			}
		});
	};
	var errorCallback = function (errorMessage: any) {
		// alert('Error: ' + errorMessage);
	};

	return (
		<PageWrapper>
			<SubHeader>
				<SubHeaderLeft>
					<label
						className='border-0 bg-transparent cursor-pointer me-0'
						htmlFor='searchInput'>
						<Icon icon='Search' size='2x' color='primary' />
					</label>
					<Input
						id='searchInput'
						type='search'
						className='border-0 shadow-none bg-transparent'
						placeholder='Search...'
						onChange={(event: any) => setSearchTerm(event.target.value)}
						value={searchTerm}
						ref={inputRef}
					/>
				</SubHeaderLeft>
			</SubHeader>
			<Page>
				<div className='row h-100'>
					<div className='col-12'>
						<Card stretch>
							<CardTitle className='d-flex justify-content-between align-items-center m-4'>
								<div className='flex-grow-1 text-center text-info'>
									Barcode Print
								</div>
							</CardTitle>
							<CardBody isScrollable className='table-responsive'>
								<table className='table  table-bordered border-primary table-hover text-center'>
									<thead className={'table-dark border-primary'}>
										<tr>
											<th>Date</th>
											<th>Stock Code</th>
											<th>Item Name</th>
											<th>Stock Quantity</th>
											{/* <th>Printed Lables</th> */}
											<th></th>

											<th>
												Select Printer
												<br />
												<select
													id='selected_device'
													onChange={(e) =>
														setSelectedDevice(
															devices.find(
																(device: any) =>
																	device.uid === e.target.value,
															),
														)
													}>
													{devices.map((device: any, index: any) => (
														<option key={index} value={device.uid}>
															{device.manufacturer ||
																device.model ||
																device.uid}
														</option>
													))}
												</select>
											</th>
										</tr>
									</thead>
									<tbody>
										{filteredTransactions &&
											dataPagination(
												filteredTransactions,
												currentPage,
												perPage,
											)
												.filter(
													(StockInOut: any) => StockInOut.status === true,
												)
												.filter((brand: any) => {
													if (
														brand.barcode
															?.toString()
															.includes(searchTerm.slice(0, 8))
													) {
														return brand;
													}
												})
												.filter((brand: any) =>
													selectedUsers.length > 0
														? selectedUsers.includes(brand.stock)
														: true,
												)
												.filter(
													(stockInOut: any) =>
														stockInOut.stock === 'stockIn',
												)
												.sort((a: any, b: any) => a.quantity - b.quantity)
												.map((brand: any, index: any) => (
													<tr key={brand.id}>
														<td>{brand.date}</td>
														<td>{brand.barcode}</td>
														<td>
															{brand.brand} {brand.category}{' '}
															{brand.model}
														</td>

														<td>{brand.quantity}</td>
														{/* <td>
															{brand.subStock
																? brand.subStock.filter(
																		(item: any) =>
																			item.print === true,
																  ).length
																: 0}
														</td> */}
														<td
															onClick={() => {
																selectitem(
																	brand.id,
																	brand.barcode,
																);
															}}>
															<MultiSelect
																value={
																	selectedBarcodes[brand.id] || []
																} // Use state value specific to this row or empty array
																onChange={(e) =>
																	onSelectMachineModel(
																		e,
																		brand.id,
																	)
																}
																// Pass brand.id to update specific row
																options={
																	brand.subStock
																		? brand.subStock.map(
																				(item: any) => ({
																					value: item.barcode,
																					text: item.barcode,
																				}),
																		  )
																		: [
																				{
																					value: '',
																					text: 'No Data',
																				},
																		  ]
																}
																optionLabel='text'
																filter
																placeholder='-- Select item  --'
																maxSelectedLabels={2}
																className='col-12'
															/>
														</td>

														<td>
															<Button
																icon='Print'
																color='info'
																onClick={() =>
																	printLabels(
																		brand.sellingPrice,
																		brand.code,
																		brand.brand +
																			' ' +
																			brand.model,
																		selectedBarcodes[
																			brand.id
																		] || [],
																		brand.id,
																	)
																}>
																Print
															</Button>
														</td>
													</tr>
												))}
									</tbody>
								</table>
							</CardBody>
							<PaginationButtons
								data={filteredTransactions}
								label='parts'
								setCurrentPage={setCurrentPage}
								currentPage={currentPage}
								perPage={perPage}
								setPerPage={setPerPage}
							/>
						</Card>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default Index;
