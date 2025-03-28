import React, { FC, useEffect, useRef, useState } from 'react';
import PageWrapper from '../layout/PageWrapper/PageWrapper';
import {
	addDoc,
	collection,
	getDocs,
	doc,
	updateDoc,
	deleteDoc,
	getDoc,
	query,
	where,
} from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import 'react-simple-keyboard/build/css/index.css';
import Swal from 'sweetalert2';
import Card, { CardBody } from '../components/bootstrap/Card';
import { Dropdown } from 'primereact/dropdown';
import FormGroup from '../components/bootstrap/forms/FormGroup';
import Input from '../components/bootstrap/forms/Input';
import Button from '../components/bootstrap/Button';
import Checks, { ChecksGroup } from '../components/bootstrap/forms/Checks';
import {
	useGetStockInOutsQuery as useGetStockInOutsdisQuery,
	useUpdateStockInOutMutation,
} from '../redux/slices/stockInOutAcceApiSlice';
import { Creatbill, Getbills } from '../service/accessoryService';
import Page from '../layout/Page/Page';
import Spinner from '../components/bootstrap/Spinner';
import { useGetItemAccesQuery } from '../redux/slices/itemManagementAcceApiSlice';
import SubHeader, { SubHeaderLeft } from '../layout/SubHeader/SubHeader';
import router from 'next/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import $ from 'jquery';
import image from '../assets/img/bill/WhatsApp_Image_2024-09-12_at_12.26.10_50606195-removebg-preview (1).png';
import { toPng } from 'html-to-image';
interface CategoryEditModalProps {
	data: any;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const Print: FC<CategoryEditModalProps> = ({ data, isOpen, setIsOpen }) => {
	const [orderedItems, setOrderedItems] = useState<any[]>(data.orders);
	const { data: Accstock, error, isLoading } = useGetStockInOutsdisQuery(undefined);
	const [updateStockInOut] = useUpdateStockInOutMutation();
	const { data: itemAcces } = useGetItemAccesQuery(undefined);
	const [items, setItems] = useState<any[]>([]);
	const [customer, setCustomer] = useState<any[]>([]);
	const [payment, setPayment] = useState(true);
	const [contact, setContact] = useState<number>(0);
	const [name, setName] = useState<string>('');
	const [amount, setAmount] = useState<number>(0);
	const [id, setId] = useState<number>(0);
	const [status, setStaus] = useState<boolean>(true);
	const currentDate = new Date().toLocaleDateString('en-CA');
	const currentTime = new Date().toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
	});
	const [isQzReady, setIsQzReady] = useState(false);
	const dropdownRef = useRef<Dropdown>(null);
	const quantityRef = useRef<HTMLInputElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const cardRef = useRef<HTMLInputElement>(null);
	const cashRef = useRef<HTMLInputElement>(null);
	const printRef = useRef<any>(null);
	const endRef = useRef<any>(null);

	useEffect(() => {
		const script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/qz-tray@2.2.4/qz-tray.min.js';
		script.async = true;

		script.onload = () => {
			console.log('QZ Tray script loaded.');
			setIsQzReady(true);
		};

		script.onerror = () => {
			console.error('Failed to load QZ Tray script.');
		};

		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const querySnapshot = await getDocs(collection(firestore, 'accessorybill'));
				const dataList = querySnapshot.docs.map((doc) => ({
					id: parseInt(doc.id, 10), // Ensure `id` is a number
					...doc.data(),
				}));
				console.log('Data List:', dataList);
				const largestId = dataList.reduce(
					(max, item) => (item.id > max ? item.id : max),
					0,
				);
				console.log('Largest ID:', largestId);
				setId(largestId + 1);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};

		fetchData();
	}, [orderedItems]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const querySnapshot = await getDocs(collection(firestore, 'customer'));
				const dataList = querySnapshot.docs.map((doc) => ({
					...doc.data(),
				}));
				setCustomer(dataList);
				console.log(dataList);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};

		fetchData();
	}, [orderedItems]);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, [Accstock]);

	const handleDropdownKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			if (quantityRef.current) {
				quantityRef.current.focus();
			}
			e.preventDefault();
		}
		if (e.key === 'ArrowRight') {
			if (inputRef.current) {
				inputRef.current.focus();
			}
			e.preventDefault();
		}
	};

	const amountchange = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowLeft') {
			if (dropdownRef.current) {
				dropdownRef.current.focus();
			}
			e.preventDefault();
		}
		if (e.key === 'ArrowDown') {
			if (cashRef.current) {
				cashRef.current.focus();
			}
			e.preventDefault();
		}
	};

	const cashchange = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowUp') {
			if (inputRef.current) {
				inputRef.current.focus();
			}
			e.preventDefault();
		}
		if (e.key === 'ArrowRight') {
			if (cardRef.current) {
				cardRef.current.focus();
			}
			e.preventDefault();
		}
		if (e.key === 'Enter') {
			setPayment(true);
		}
		if (e.key === 'ArrowDown') {
			if (printRef.current) {
				printRef.current.focus();
			}
			e.preventDefault();
		}
	};
	const cardchange = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowUp') {
			if (inputRef.current) {
				inputRef.current.focus();
			}
			e.preventDefault();
		}
		if (e.key === 'ArrowLeft') {
			if (cashRef.current) {
				cashRef.current.focus();
			}
			e.preventDefault();
		}
		if (e.key === 'Enter') {
			setPayment(false);
		}
		if (e.key === 'ArrowDown') {
			if (printRef.current) {
				printRef.current.focus();
			}
			e.preventDefault();
		}
	};
	const printchange = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowUp') {
			if (cashRef.current) {
				cashRef.current.focus();
			}
			e.preventDefault();
		}
		if (e.key === 'ArrowDown') {
			if (endRef.current) {
				endRef.current.focus();
			}
			e.preventDefault();
		}
		if (e.key === 'ArrowLeft') {
			if (quantityRef.current) {
				quantityRef.current.focus();
			}
			e.preventDefault();
		}
	};
	const salechange = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowUp') {
			if (printRef.current) {
				printRef.current.focus();
			}
			e.preventDefault();
		}
	};

	// useEffect(() => {
	// 	const cashier = localStorage.getItem('user');
	// 	if (cashier) {
	// 		const jsonObject = JSON.parse(cashier);
	// 		console.log(jsonObject);
	// 		setCasher(jsonObject);
	// 	}
	// }, []);

	// Save current orderedItems as a draft

	useEffect(() => {
		const fetchData = async () => {
			try {
				const updatedAccstock = Accstock.map((item: any) => ({
					...item,
					currentQuantity: item.quantity, // Add currentQuantity field
					// Optionally remove the old quantity field if not needed
				}));

				const result1 = updatedAccstock.filter((item: any) => item.stock === 'stockIn');
				const combinedResult = [...result1];
				setItems(combinedResult);
				console.log(combinedResult);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};

		fetchData();
	}, [isLoading]);

	const calculateSubTotal = () => {
		return orderedItems
			.reduce((sum, val) => sum + val.sellingPrice * val.quantity, 0)
			.toFixed(2);
	};

	const addbill = async () => {
		console.log(data);
		if (amount >= data.netValue && amount > 0 && Number(data.netValue) > 0) {
			try {
				const result = await Swal.fire({
					title: 'Are you sure?',
					text: 'You will not be able to recover this status!',
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: 'Yes, End Bill!',
				});

				if (result.isConfirmed) {
					Swal.fire({
						title: 'Processing...',
						html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
						allowOutsideClick: false,
						showCancelButton: false,
						showConfirmButton: false,
					});
					const totalAmount = calculateSubTotal();
					const currentDate = new Date();
					const formattedDate = currentDate.toLocaleDateString();

					if (!status) {
						await addDoc(collection(firestore, 'customer'), { name, contact });
					}
					// data.contact = contact;
					// data.name = name;
					data.print = true;
					data.amount = amount;
			
					const supplierRef = doc(firestore, 'accessorybill', data.cid);
					await updateDoc(supplierRef, data);

					for (const item of orderedItems) {
						const { cid, barcode, quantity } = item; // Destructure the fields from the current item
						const id = cid;
						const barcodePrefix = barcode.slice(0, 4);

						const matchingItem = itemAcces?.find(
							(accessItem: any) => accessItem.code === barcodePrefix,
						);
						console.log(matchingItem);
						if (matchingItem) {
							const quantity1 = matchingItem.quantity;

							const updatedQuantity = quantity1 - quantity;
							try {
								// Call the updateStockInOut function to update the stock
								await updateStockInOut({ id, quantity: updatedQuantity }).unwrap();
							} catch (error) {
								console.error(`Failed to update stock for ID: ${id}`, error);
							}
						} else {
							console.warn(`No matching item found for barcode: ${barcode}`);
						}
					}
					Swal.fire({
						title: 'Success',
						text: 'Bill has been added successfully.',
						icon: 'success',
						showConfirmButton: false,
						timer: 1000,
					});
					setOrderedItems([]);
					setAmount(0);
					setContact(0);
					setName('');
					setIsOpen(false);
				}
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				alert('An error occurred. Please try again later.');
			}
		} else {
			Swal.fire('Warning..!', 'Insufficient amount', 'error');
		}
	};

	const contactchanget = async (value: any) => {
		if (value.length > 1 && value.startsWith('0')) {
			value = value.substring(1);
		}
		setContact(value);
		if (value.length === 9) {
			const matchingCustomer = customer.find((customer) => customer.contact === value);

			if (matchingCustomer) {
				const { customer: customerId, contact, name } = matchingCustomer; // Extract specific fields
				setName(name);
				setStaus(true);
			} else {
				console.log('No matching customer found for the contact:', value);
				setStaus(false);
			}
		}
	};
	const invoiceRef: any = useRef();
	const handlePrint = async () => {
		if (amount >= data.netValue && amount > 0 && Number(data.netValue) > 0) {
			console.log(orderedItems);
			try {
				const result = await Swal.fire({
					title: 'Are you sure?',
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: 'Yes, Print Bill!',
				});

				if (result.isConfirmed) {
					// Save the current body content to restore after printing
					const printContent: any = invoiceRef.current.innerHTML;

					// Temporarily hide other content on the page
					const originalContent = document.body.innerHTML;
					document.body.innerHTML = printContent;

					// Trigger the print dialog
					window.print();

					// Restore the original content after printing
					document.body.innerHTML = originalContent;



					const totalAmount = calculateSubTotal();
					const currentDate = new Date();
					const formattedDate = currentDate.toLocaleDateString();

					if (!status) {
						await addDoc(collection(firestore, 'customer'), { name, contact });
					}
					data.contact = contact;
					// data.name = name;
					data.print = true;
					// data.amount = amount;
			
					const supplierRef = doc(firestore, 'accessorybill', data.cid);
					await updateDoc(supplierRef, data);

					for (const item of orderedItems) {
						const { cid, barcode, quantity } = item; // Destructure the fields from the current item
						const id = cid;
						const barcodePrefix = barcode.slice(0, 4);

						const matchingItem = itemAcces?.find(
							(accessItem: any) => accessItem.code === barcodePrefix,
						);
						console.log(matchingItem);
						if (matchingItem) {
							const quantity1 = matchingItem.quantity;

							const updatedQuantity = quantity1 - quantity;
							try {
								// Call the updateStockInOut function to update the stock
								await updateStockInOut({ id, quantity: updatedQuantity }).unwrap();
							} catch (error) {
								console.error(`Failed to update stock for ID: ${id}`, error);
							}
						} else {
							console.warn(`No matching item found for barcode: ${barcode}`);
						}
					}
					Swal.fire({
						title: 'Success',
						text: 'Bill has been added successfully.',
						icon: 'success',
						showConfirmButton: false,
						timer: 1000,
					});
					setOrderedItems([]);
					setAmount(0);
					setContact(0);
					setName('');
					setIsOpen(false);
					window.location.reload();























					
				}
			} catch (error) {
				console.error('Error printing bill:', error);
				Swal.fire('Error', 'An error occurred while printing the bill.', 'error');
			}
		} else {
			Swal.fire('Validation Error', 'Please check the amount and net value.', 'warning');
		}
	};

	const chunkItems = (array: any[], chunkSize: number) => {
		const chunks = [];
		for (let i = 0; i < array.length; i += chunkSize) {
			chunks.push(array.slice(i, i + chunkSize));
		}
		
		return chunks;
	};

	// Split orderedItems into chunks of 5
	const chunks = chunkItems(orderedItems, 5);

	if (isLoading) {
		console.log(isLoading);
		return (
			<PageWrapper>
				<Page>
					<div className='row h-100 py-5'>
						<div className='col-12 text-center py-5 my-5'>
							<Spinner
								tag={'div'}
								color={'primary'}
								isGrow={false}
								size={50}
								className={''}
							/>
							<br />
							<br />
							<h2>Please Wait</h2>
						</div>
					</div>
				</Page>
			</PageWrapper>
		);
	}
	return (
		<>
			<div className='row '>
				<div className='col-5 mb-3 mb-sm-0'>
					<Card stretch className='mt-4' style={{ height: '80vh' }}>
						<CardBody isScrollable>
							<Button
								icon='ArrowBack'
								onClick={() => {
									setIsOpen(false);
								}}>
								Back Page
							</Button>
							<div
								className='ms-4 ps-3'
								ref={invoiceRef}
								id='invoice'
								style={{
									display: 'flex',
									color: 'black',
								}}>
								<div>
									{chunks.map((chunk, chunkIndex) => (
										<div
											key={chunkIndex}
											style={{
												width: '130mm',
												height: '130mm',
												background: '#fff',
												border: '1px dashed #ccc',
												padding: '20px',
												fontFamily: 'Arial, sans-serif',
												fontSize: '12px',
												position: 'relative', // Enables absolute positioning inside
											}}>
											{/* Header */}
											<div className='text-left '>
												<h1
													style={{
														fontSize: '29px',
														fontFamily: 'initial',
														color: 'black',
													}}>
													Suranga Cell Care
												</h1>
												<p style={{ marginBottom: '2px', color: 'black' }}>
													No. 524/1A, Kandy Road, Kadawatha.
												</p>
												<p style={{ marginBottom: '0', color: 'black' }}>
													Tel: +94 11 292 60 30 | Mobile: +94 76 401 77 28
												</p>
											</div>
											{/* <hr style={{ margin: '0 0 5px 0 ' ,color:"black"}} /> */}
											<span
												style={{
													marginBottom: '1px',
													display: 'block',
													borderTop: '1px solid black',
													color: 'black',
												}}></span>
											{/* Invoice Details */}
											<table
												className='table table-borderless'
												style={{
													marginBottom: '5px',
													lineHeight: '1.2',
												}}>
												<tbody style={{ color: 'black' }}>
													<tr>
														<td
															style={{
																width: '50%',
																color: 'black',
																padding: '2px 0 0 ',
															}}>
															Invoice No : {data.id}
														</td>
														<td
															style={{
																color: 'black',
																padding: '2px 0',
															}}>
															Invoice Date : {currentDate}
														</td>
													</tr>
													<tr>
														<td
															style={{
																color: 'black',
																padding: '2px 0',
															}}>Name:{data.name|| (" --")}</td>
														<td
															style={{
																color: 'black',
																padding: '2px 0',
															}}>
															Invoiced Time : {currentTime}
														</td>
													</tr>
												</tbody>
											</table>
											<span
												style={{
													marginBottom: '3px',
													display: 'block',
													borderTop: '1px solid black',
													color: 'black',
												}}></span>
											<p
												style={{
													marginBottom: '0',
													lineHeight: '1.2',
													fontSize: '12px',
													color: 'black',
												}}>
												Description
												&nbsp;&emsp;&nbsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&emsp;&emsp;&emsp;&emsp;&emsp;
												Price &nbsp;&emsp;&emsp;&emsp; Qty
												&nbsp;&emsp;&emsp; Amount
											</p>
											<span
												style={{
													marginTop: '3px',
													display: 'block',
													borderTop: '1px solid black',
													color: 'black',
												}}></span>
											{chunk.map(
												(
													{
														category,
														model,
														brand,
														quantity,
														sellingPrice,
														warranty,
														storage,
														imi
													}: any,
													index: number,
												) => (
													<table
														key={index}
														style={{
															color: 'black',
															width: '110mm',
															borderCollapse: 'collapse',
															fontSize: '12px',
														}}>
														<tbody>
															<tr>
																<td
																	style={{
																		color: 'black',
																		width: '52%',
																		padding: '5px',
																	}}>
																	{index + 1}. {brand}{' '}{model}{' '}{category}{' '}{storage}{' '}{imi}
																	<label
																		style={{
																			fontSize: '10px',
																		}}>
																		({warranty})
																	</label>
																</td>
																<td
																	style={{
																		color: 'black',
																		width: '20%',
																		textAlign: 'right',
																		padding: '5px',
																		paddingRight: '20px',
																	}}>
																	{sellingPrice.toFixed(2)}
																</td>
																<td
																	style={{
																		color: 'black',
																		width: '8%',
																		textAlign: 'right',
																		padding: '5px',
																	}}>
																	{quantity}
																</td>
																<td
																	style={{
																		color: 'black',
																		width: '20%',
																		textAlign: 'right',
																		padding: '5px',
																	}}>
																	{(
																		sellingPrice * quantity
																	).toFixed(2)}
																</td>
															</tr>
														</tbody>
													</table>
												),
											)}
											<div
												style={{
													position: 'absolute',
													top: '100mm',
													left: '0',
													width: '100%',
													padding: '0 20px',
												}}>
												<span
													className='position-absolute  start-55'
													style={{
														marginTop: '0px',
														display: 'block',
														width: 190,
														borderTop: '1px solid black',
														color: 'black',
													}}></span>
												<div
													className='position-relative me-4'
													style={{ color: 'black' }}>
													<div className='position-absolute start-60'>
														Total
													</div>
													<div className='position-absolute top-0 end-5'>
														{data.amount}.00
													</div>
												</div>
												<br />
												<span
													style={{
														marginBottom: '1px',
														display: 'block',
														borderTop: '1px solid black',
														color: 'black',
														width: 440,
													}}></span>
												<div
													className='position-relative me-4'
													style={{ color: 'black' }}>
													<div className='position-absolute top-0 start-0'>
														Cash
													</div>
													<div className='position-absolute top-0 end-50'>
														{amount}.00
													</div>
													<div className='position-absolute top-0 start-60'>
														Discount
													</div>
													<div className='position-absolute top-0 end-5'>
														{Number(data.totalDiscount).toFixed(2)}
													</div>
												</div>
												<br />
												<span
													className='position-absolute '
													style={{
														marginTop: '0px',
														display: 'block',
														borderTop: '1px solid black',
														color: 'black',
														width: 440,
													}}></span>
												<div
													className='position-relative me-4'
													style={{ color: 'black' }}>
													<div className='position-absolute top-0 start-0'>
														Balance
													</div>
													<div className='position-absolute top-0 end-50'>
														{Math.max(
															0,
															amount - data.netValue,
														).toFixed(2)}
													</div>
													<div
														className='position-absolute top-0 start-60 fw-bold'
														style={{ fontSize: '14px' }}>
														SUB TOTAL
													</div>
													<div
														className='position-absolute top-0 end-5 fw-bold'
														style={{ fontSize: '14px' }}>
														{data.netValue.toFixed(2)}
													</div>
												</div>
												<br />
												<span
													className='position-absolute '
													style={{
														marginTop: '1px',
														display: 'block',
														borderTop: '1px solid black',
														color: 'black',
														width: 440,
													}}></span>
												<div
													style={{
														textAlign: 'center',
														fontSize: '12px',
														color: 'black',
														marginTop: '3px',
													}}>
													...........................Thank You ... Come
													Again...........................
												</div>
												<div
													style={{
														textAlign: 'right',
														fontSize: '10px',
														color: 'black',
													}}>
													System by EXE.LK +94 70 332 9900
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</CardBody>
					</Card>
				</div>
				{/* Second Card */}
				<div className='col-7'>
					{/* Two cards side by side occupying full width */}
					<div className='d-flex w-100 mt-4'>
						<Card className='flex-grow-1 ms-2' style={{ height: '80vh' }}>
							<CardBody>
								<>
									{' '}
									<div style={{ fontSize: '18px' }}>
										Net Value : {data.netValue.toFixed(2)} LKR
									</div>
									<FormGroup
										id='amount'
										label='Amount (LKR)'
										className='col-12 mt-2'>
										<Input
											type='number'
											ref={inputRef} // Attach a ref to the input
											onChange={(e: any) => {
												let value = e.target.value;
												if (value.length > 1 && value.startsWith('0')) {
													value = value.substring(1);
												}
												setAmount(value);
											}}
											onKeyDown={amountchange}
											value={amount}
											min={0}
											validFeedback='Looks good!'
										/>
									</FormGroup>
									<div style={{ fontSize: '18px', marginTop: '5px' }}>
										Balance: {Math.max(0, amount - data.netValue).toFixed(2)}
										LKR
									</div>
									<FormGroup
										id='amount'
										label='Payment method'
										className='col-12 mt-2'>
										<ChecksGroup isInline className='pt-2'>
											<Checks
												ref={cashRef}
												onKeyDown={cashchange}
												id='inlineCheckOne'
												label='Cash'
												name='checkOne'
												checked={payment}
												onClick={(e: any) => {
													setPayment(true);
												}}
											/>
											<Checks
												ref={cardRef}
												onKeyDown={cardchange}
												id='inlineCheckTwo'
												label='Card'
												name='checkOne'
												checked={!payment}
												onClick={(e: any) => {
													setPayment(false);
												}}
											/>
										</ChecksGroup>
									</FormGroup>
									{/* <FormGroup label='Contact Number' className='col-12 mt-3'>
										<Input
											type='number'
											value={contact}
											min={0}
											onChange={(e: any) => {
												const value = e.target.value.slice(0, 9);
												contactchanget(value);
											}}
											validFeedback='Looks good!'
										/>
									</FormGroup>
									<FormGroup label='Customer Name' className='col-12 mt-3'>
										<Input
											disabled={status}
											type='text'
											value={name}
											min={0}
											onChange={(e: any) => {
												setName(e.target.value);
											}}
											validFeedback='Looks good!'
										/>
									</FormGroup> */}
									<Button
										ref={printRef}
										color='info'
										className='mt-4 p-4 w-100'
										style={{ fontSize: '1.25rem' }}
										onClick={handlePrint}
										onKeyDown={printchange}>
										Print Bill
									</Button>
									{/* <Button
										ref={endRef}
										color='success'
										className='mt-4 p-4 w-100'
										style={{ fontSize: '1.25rem' }}
										onClick={addbill}
										onKeyDown={salechange}>
										End Sale
									</Button> */}
								</>
							</CardBody>
						</Card>
					</div>
				</div>
			</div>
		</>
	);
};

export default Print;

// const printbill1 = async () => {
// 	if (amount >= data.netValue && amount > 0 && Number(data.netValue) > 0) {
// 		console.log(orderedItems);
// 		try {
// 			const result = await Swal.fire({
// 				title: 'Are you sure?',
// 				// text: 'You will not be able to recover this status!',
// 				icon: 'warning',
// 				showCancelButton: true,
// 				confirmButtonColor: '#3085d6',
// 				cancelButtonColor: '#d33',
// 				confirmButtonText: 'Yes, Print Bill!',
// 			});

// 			if (result.isConfirmed) {
// 				const currentDate = new Date();
// 				const formattedDate = currentDate.toLocaleDateString();

// 				if (!isQzReady || typeof window.qz === 'undefined') {
// 					console.error('QZ Tray is not ready.');
// 					alert('QZ Tray is not loaded yet. Please try again later.');
// 					return;
// 				}
// 				try {
// 					const chunks = chunkItems(orderedItems, 5);
// 					if (!window.qz.websocket.isActive()) {
// 						await window.qz.websocket.connect();
// 					}
// 					const config = window.qz.configs.create('EPSON LQ-310 ESC/P2');
// 					const data1 = [
// 						'\x1B\x40', // Initialize printer
// 						'\x1B\x61\x31', // Center alignment

// 						'\x1B\x21\x20', // Double-width font
// 						'Suranga Cell Care\n', // Header
// 						'\x1B\x21\x00', // Reset font to normal
// 						'\x1B\x4D\x01', // Select Font B

// 						'No. 524/1/A, Kandy Road, Kadawatha\n',
// 						'\x1B\x4D\x00', // Switch back to Font A
// 						'Tel: +94 11 292 60 30  Mobile: +94 719 111 144\n',
// 						'------------------------------------------\n',
// 						'\x1B\x61\x30', // Left alignment
// 						'Invoice No     : 111726\n',
// 						'Invoice Date   : 2025-01-11\n',
// 						'Invoiced Time  : 2.47 PM\n',

// 						'------------------------------------------\n',
// 						'Description           Price     Qty  Amount\n',
// 						'------------------------------------------\n',
// 						...orderedItems.map(
// 							({ name, quantity, sellingPrice, category, model, brand }) => {
// 								const netValue = sellingPrice * quantity;
// 								// const truncatedName =
// 								// 	brand.length > 10 ? brand.substring(0, 10) + '...' : brand;

// 								// Define receipt width (e.g., 42 characters for typical printers)
// 								const receiptWidth = 42;

// 								// Create the line dynamically
// 								const line = `${category} ${model}`;
// 								const quantityStr = `${quantity}`;
// 								const priceStr = `${sellingPrice.toFixed(2)}`;
// 								const netValueStr = `${netValue.toFixed(2)}`;

// 								// Calculate spacing to align `netValueStr` to the right
// 								const totalLineLength =
// 									line.length +
// 									quantityStr.length +
// 									priceStr.length +
// 									netValueStr.length +
// 									6; // 6 spaces for fixed spacing
// 								const remainingSpaces = receiptWidth - totalLineLength;

// 								return `${line}\n(warranty 0  days  )     ${priceStr}${' '.repeat(
// 									remainingSpaces,
// 								)}    ${quantityStr}  ${netValueStr}\n`;
// 							},
// 						),
// 						'------------------------------------------\n',
// 						'------------------------------------------\n',
// 						'\x1B\x61\x01', // Center alignment
// 						'\x1B\x45\x01', // Bold text ON
// 						'\x1D\x21\x11', // Double width and double height
// 						`SUB TOTAL\nRs ${calculateSubTotal()}\n`, // Print Sub Total and value
// 						'\x1B\x45\x00', // Bold text OFF
// 						'\x1D\x21\x00', // Reset to normal text size
// 						'\x1B\x61\x00', // Left alignment
// 						'------------------------------------------\n',

// 						'Thank You ... Come Again\n\n',

// 						'\x1D\x56\x41', // Cut paper
// 					];

// 					// Iterate over the items and append them to the commands
// 					chunks.forEach((item: any, index) => {
// 						const { category, model, brand, sellingPrice, quantity } = item;
// 						const description = `${index + 1}. ${category} ${model} ${brand}`;
// 						const price = sellingPrice;
// 						const amount = sellingPrice * quantity;

// 						// Add formatted item line
// 						// escPosCommands.push(
// 						//   `${description.padEnd(20)} ${price.padStart(8)} ${quantity
// 						// 	.toString()
// 						// 	.padStart(5)} ${amount.toString().padStart(10)}\n`
// 						// );
// 					});

// 					// Add footer content
// 					//   escPosCommands.push(
// 					// 	'------------------------------------------\n', // Divider
// 					// 	// `Total: ${data.netValue.padStart(35)}\n\n`, // Total
// 					// 	'Cashier Signature: _____________________\n\n', // Cashier signature
// 					// 	'Sales Person Signature: ________________\n\n', // Salesperson signature
// 					// 	'\x1B\x61\x01', // Center alignment
// 					// 	'...Thank You ... Come Again...\n', // Thank you message
// 					// 	'\x1D\x56\x42' // Partial cut
// 					//   );
// 					await window.qz.print(config, data1);
// 				} catch (error) {
// 					console.error('Printing failed', error);
// 				}
// 			}
// 		} catch (error) {
// 			console.error('Error during handleUpload: ', error);
// 			alert('An error occurred. Please try again later.');
// 		}
// 	} else {
// 		Swal.fire('Warning..!', 'Insufficient amount', 'error');
// 	}
// };
// const printbill = async () => {
// 	if (amount >= data.netValue && amount > 0 && Number(data.netValue) > 0) {
// 		console.log(orderedItems);
// 		try {
// 			const result = await Swal.fire({
// 				title: 'Are you sure?',
// 				icon: 'warning',
// 				showCancelButton: true,
// 				confirmButtonColor: '#3085d6',
// 				cancelButtonColor: '#d33',
// 				confirmButtonText: 'Yes, Print Bill!',
// 			});

// 			if (result.isConfirmed) {
// 				const invoiceElement = document.getElementById('invoice');
// 				if (!invoiceElement) {
// 					throw new Error('Invoice element not found');
// 				}

// 				// Generate image from the invoice element
// 				const image = await toPng(invoiceElement, { width: 513, height: 513 }); // 140mm = 531px
// 				toPng(invoiceElement, { width: 531, height: 531 }) // 140mm = 531px (1mm = 3.779528px)
// 					.then((dataUrl) => {
// 						const link = document.createElement('a');
// 						link.download = 'invoice.png';
// 						link.href = dataUrl;
// 						link.click();
// 					})
// 					.catch((error) => {
// 						console.error('Failed to generate image:', error);
// 					});
// 				// Ensure QZ Tray WebSocket is active
// 				if (!window.qz.websocket.isActive()) {
// 					await window.qz.websocket.connect();
// 				}
// 				var opts = getUpdatedOptions(false);
// 				// Configure QZ printing
// 				const config = window.qz.configs.create('EPSON LQ-310 ESC/P2'); // Replace with your printer name
// 				const printData: any = [
// 					{ type: 'pixel', format: 'image', flavor: 'file', data: image },
// 					// { type: 'raw', format: 'image', data: image, options: opts },
// 				];

// 				// Print the image
// 				await window.qz.print(config, printData);

// 				// Show success message
// 				Swal.fire('Printed!', 'The bill has been printed.', 'success');
// 			}
// 		} catch (error) {
// 			console.error('Error printing bill:', error);
// 			Swal.fire('Error', 'An error occurred while printing the bill.', 'error');
// 		}
// 	} else {
// 		Swal.fire('Validation Error', 'Please check the amount and net value.', 'warning');
// 	}
// };

// function getUpdatedOptions(onlyPixel: any) {
// 	if (onlyPixel) {
// 		return {
// 			pageWidth: $('#pPxlWidth').val(),
// 			pageHeight: $('#pPxlHeight').val(),
// 			pageRanges: $('#pPxlRange').val(),
// 			ignoreTransparency: $('#pPxlTransparent').prop('checked'),
// 			altFontRendering: $('#pPxlAltFontRendering').prop('checked'),
// 		};
// 	} else {
// 		return {
// 			language: $("input[name='pLanguage']:checked").val(),
// 			x: $('#pX').val(),
// 			y: $('#pY').val(),
// 			dotDensity: $('#pDotDensity').val(),
// 			xmlTag: $('#pXml').val(),
// 			pageWidth: $('#pRawWidth').val(),
// 			pageHeight: $('#pRawHeight').val(),
// 		};
// 	}
// }
