import React, { useEffect, useRef, useState } from 'react';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import 'react-simple-keyboard/build/css/index.css';
import Swal from 'sweetalert2';
import Card, { CardBody, CardFooter } from '../../../components/bootstrap/Card';
import { Dropdown } from 'primereact/dropdown';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Checks, { ChecksGroup } from '../../../components/bootstrap/forms/Checks';
import {
	useGetStockInOutsQuery as useGetStockInOutsdisQuery,
	useUpdateStockInOutMutation,
} from '../../../redux/slices/stockInOutAcceApiSlice';
import MyDefaultHeader from '../../_layout/_headers/CashierHeader';
import { Creatbill, Getbills } from '../../../service/accessoryService';
import Page from '../../../layout/Page/Page';
import Spinner from '../../../components/bootstrap/Spinner';
import { useGetItemAccesQuery } from '../../../redux/slices/itemManagementAcceApiSlice';

function index() {
	const [orderedItems, setOrderedItems] = useState<any[]>([]);
	const { data: Accstock, error, isLoading } = useGetStockInOutsdisQuery(undefined);
	const [updateStockInOut] = useUpdateStockInOutMutation();
	const { data: itemAcces } = useGetItemAccesQuery(undefined);
	const [items, setItems] = useState<any[]>([]);
	const [selectedBarcode, setSelectedBarcode] = useState<any[]>([]);
	const [selectedProduct, setSelectedProduct] = useState<string>('');
	const [quantity, setQuantity] = useState<any>(null);
	const [payment, setPayment] = useState(true);
	const [amount, setAmount] = useState<number>(0);
	const [id, setId] = useState<number>(0);
	const [casher, setCasher] = useState<any>({});
	const currentDate = new Date().toLocaleDateString('en-CA');
	const currentTime = new Date().toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
	});
	const [isQzReady, setIsQzReady] = useState(false);
	const [currentDraftId, setCurrentDraftId] = useState<number | null>(null);
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
		if (dropdownRef.current) {
			dropdownRef.current.focus();
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
	const handleaddKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handlePopupOk();
		}
		if (e.key === 'ArrowRight') {
			if (inputRef.current) {
				inputRef.current.focus();
			}
			e.preventDefault();
		}
		if (e.key === 'ArrowUp') {
			if (dropdownRef.current) {
				dropdownRef.current.focus();
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
	const handleSaveDraft = () => {
		if (orderedItems.length === 0) {
			Swal.fire('Error', 'No items to save as draft.', 'error');
			return;
		}

		const savedDrafts = JSON.parse(localStorage.getItem('drafts') || '[]');
		const newDraft = {
			draftId: new Date().getTime(), // Unique identifier
			orders: orderedItems,
		};
		localStorage.setItem('drafts', JSON.stringify([...savedDrafts, newDraft]));
		setOrderedItems([]);
		Swal.fire('Success', 'Draft saved successfully.', 'success');
	};

	// Load a selected draft into orderedItems
	const handleLoadDraft = (draft: any) => {
		if (draft && draft.orders) {
			setOrderedItems(draft.orders);
			setCurrentDraftId(draft.draftId); // Set the orders part of the draft
			Swal.fire('Success', 'Draft loaded successfully.', 'success');
		} else {
			Swal.fire('Error', 'Invalid draft data.', 'error');
		}
	};
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

	const handlePopupOk = async () => {
		if (!selectedProduct || quantity <= 0) {
			Swal.fire('Error', 'Please select a product and enter a valid quantity.', 'error');
			return;
		}
		const selectedItem = items.find((item) => item.barcode === selectedProduct);
		if (selectedItem) {
			console.log(selectedItem);
			if (selectedItem.type == 'displaystock') {
				const existingItemIndex = orderedItems.findIndex(
					(item) => item.barcode.slice(0, 4) === selectedProduct.slice(0, 4),
				);
				const existingItem = orderedItems.find((item) => item.barcode === selectedProduct);
				if (!existingItem) {
					const barcode = [...selectedBarcode, selectedProduct];
					setSelectedBarcode(barcode);
				}
				let updatedItems;
				if (existingItemIndex !== -1) {
					updatedItems = [...orderedItems];
					updatedItems[existingItemIndex] = {
						...selectedItem,
						quantity: updatedItems[existingItemIndex].quantity + 1,
					};
				} else {
					updatedItems = [...orderedItems, { ...selectedItem, quantity: 1 }];
				}
				setOrderedItems(updatedItems);
			} else {
				const existingItemIndex = orderedItems.findIndex(
					(item) => item.barcode === selectedProduct,
				);
				let updatedItems;
				if (existingItemIndex !== -1) {
					updatedItems = [...orderedItems];
					updatedItems[existingItemIndex] = {
						...selectedItem,
						quantity,
					};
				} else {
					updatedItems = [...orderedItems, { ...selectedItem, quantity }];
				}
				setOrderedItems(updatedItems);
			}
			setSelectedProduct('');
			setQuantity(0);
			if (dropdownRef.current) {
				dropdownRef.current.focus();
			}
			Swal.fire({
				title: 'Success',
				text: 'Product added/replaced successfully.',
				icon: 'success',
				showConfirmButton: false,
				timer: 1000,
			});
		} else {
			Swal.fire('Error', 'Selected item not found.', 'error');
		}
	};

	const handleDeleteItem = (code: string) => {
		const updatedItems = orderedItems.filter((item) => item.barcode !== code);
		setOrderedItems(updatedItems);
		Swal.fire({
			title: 'Success',
			text: 'Item removed successfully.',
			icon: 'success',
			showConfirmButton: false,
			timer: 1000,
		});
	};

	const calculateSubTotal = () => {
		return orderedItems
			.reduce((sum, val) => sum + val.sellingPrice * val.quantity, 0)
			.toFixed(2);
	};

	const calculateDiscount = () => {
		return orderedItems
			.reduce((sum, val) => sum + ((val.price * val.quantity) / 100) * val.discount, 0)
			.toFixed(2);
	};

	const calculateTotal = () => {
		return orderedItems
			.reduce((sum, val) => sum + val.sellingPrice * val.quantity, 0)
			.toFixed(2);
	};

	const addbill = async () => {
		console.log(orderedItems);
		if (
			amount >= Number(calculateSubTotal()) &&
			amount > 0 &&
			Number(calculateSubTotal()) > 0
		) {
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
					const totalAmount = calculateSubTotal();
					const currentDate = new Date();
					const formattedDate = currentDate.toLocaleDateString();
					const savedDrafts = JSON.parse(localStorage.getItem('drafts') || '[]');
					const updatedDrafts = savedDrafts.filter(
						(draft: any) => draft.draftId !== currentDraftId,
					);
					localStorage.setItem('drafts', JSON.stringify(updatedDrafts));
					const values = {
						orders: orderedItems,
						time: currentTime,
						date: formattedDate,
						// casheir: casher.email,
						amount: Number(totalAmount),
						type: payment ? 'cash' : 'card',
						id: id,
					};
					Creatbill(values);
					for (const item of orderedItems) {
						const { cid, barcode, quantity } = item; // Destructure the fields from the current item
						const id = cid;
						const barcodePrefix = barcode.slice(0, 4);

						const matchingItem = itemAcces?.find(
							(accessItem: any) => accessItem.code === barcodePrefix,
						);

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
				}
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				alert('An error occurred. Please try again later.');
			}
		} else {
			Swal.fire('Warning..!', 'Insufficient amount', 'error');
		}
	};
	const printbill = async () => {
		if (
			amount >= Number(calculateSubTotal()) &&
			amount > 0 &&
			Number(calculateSubTotal()) > 0
		) {
			console.log(orderedItems)
			try {
				const result = await Swal.fire({
					title: 'Are you sure?',
					// text: 'You will not be able to recover this status!',
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: 'Yes, Print Bill!',
				});

				if (result.isConfirmed) {
					const currentDate = new Date();
					const formattedDate = currentDate.toLocaleDateString();
					
					if (!isQzReady || typeof window.qz === 'undefined') {
						console.error('QZ Tray is not ready.');
						alert('QZ Tray is not loaded yet. Please try again later.');
						return;
					}
					try {
						if (!window.qz.websocket.isActive()) {
							await window.qz.websocket.connect();
						}
						const config = window.qz.configs.create('EPSON TM-U220 Receipt');
						const data = [
							'\x1B\x40',
							'\x1B\x61\x01',
							'\x1D\x21\x11',
							'\x1B\x45\x01', // ESC E 1 - Bold on
							'Suranga Cell Care\n\n', // Store name
							'\x1B\x45\x00', // ESC E 0 - Bold off
							'\x1D\x21\x00',
							'\x1B\x4D\x00',
							'No.524/1/A,\nKandy Road,Kadawatha\n',
							'011 292 6030/ 071 911 1144\n',
							'\x1B\x61\x00',
							`Date        : ${formattedDate}\n`,
							`START TIME  : ${currentTime}\n`,
							`INVOICE NO  : ${id}\n`,
							'\x1B\x61\x00',
							'---------------------------------\n',
							'Product Qty  U/Price    Net Value\n',
							'---------------------------------\n',
							...orderedItems.map(
								({ quantity, sellingPrice, category, model,  }) => {
									const netValue = sellingPrice * quantity;
									// const truncatedName =
									// 	brand.length > 10 ? brand.substring(0, 10) + '...' : brand;

									// Define receipt width (e.g., 42 characters for typical printers)
									const receiptWidth = 42;

									// Create the line dynamically
									const line = `${category} ${model}`;
									const quantityStr = `${quantity}`;
									const priceStr = `${sellingPrice.toFixed(2)}`;
									const netValueStr = `${netValue.toFixed(2)}`;

									// Calculate spacing to align `netValueStr` to the right
									const totalLineLength =
	
										quantityStr.length +
										priceStr.length +
										netValueStr.length +
										6; // 6 spaces for fixed spacing
										const remainingSpaces = Math.max(
											0,
											receiptWidth - totalLineLength
										  );

									return `${line}\n         ${quantityStr}    ${priceStr}${' '.repeat(
										remainingSpaces,
									)}${netValueStr}\n`;
								},
							),

							'---------------------------------\n',
							'\x1B\x61\x01',
							'\x1B\x45\x01',
							'\x1D\x21\x10',
							'\x1B\x45\x01',
							`SUB TOTAL\nRs ${calculateSubTotal()}\n`,
							'\x1B\x45\x00',
							'\x1D\x21\x00',
							'\x1B\x45\x00',
							'\x1B\x61\x00',
							'---------------------------------\n',
							`Cash Received   : ${amount}.00\n`,
							`Balance         : ${(amount - Number(calculateSubTotal())).toFixed(
								2,
							)}\n`,
							`No. of Pieces   : ${orderedItems.length}\n`,
							'---------------------------------\n',
							'\x1B\x61\x01',
							'THANK YOU COME AGAIN !\n',
							'---------------------------------\n',
							'\x1B\x61\x01',
							'Retail POS by EXE.lk\n',
							'Call: 070 332 9900\n',
							'---------------------------------\n',
							'\x1D\x56\x41',
						];
						await window.qz.print(config, data);
					} catch (error) {
						console.error('Printing failed', error);
					}
				}
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				alert('An error occurred. Please try again later.');
			}
		} else {
			Swal.fire('Warning..!', 'Insufficient amount', 'error');
		}
	};
	const startbill = async () => {
		if (orderedItems.length > 0) {
			const result = await Swal.fire({
				title: 'Are you sure?',
				// text: 'You will not be able to recover this status!',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, Print Bill!',
			});

			if (result.isConfirmed) {
				setOrderedItems([]);
				setAmount(0);
				setQuantity(0);
				setSelectedProduct('');
				if (dropdownRef.current) {
					dropdownRef.current.focus();
				}
			}
		} else {
			setOrderedItems([]);
			setAmount(0);
			setQuantity(0);
			setSelectedProduct('');
			if (dropdownRef.current) {
				dropdownRef.current.focus();
			}
		}
	};
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
			<PageWrapper className=''>
				<MyDefaultHeader
					onSaveDraft={handleSaveDraft}
					onLoadDraft={handleLoadDraft}
					startBill={startbill}
				/>
				<div className='row m-4'>
					<div className='col-8 mb-3 mb-sm-0'>
						<Card stretch className='mt-4' style={{ height: '80vh' }}>
							<CardBody isScrollable>
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										height: '100%',
									}}>
									{/* Scrollable Table Content */}
									<div style={{ flex: 1, overflowY: 'auto' , height: '100vh', }}>
										<table className='table table-hover table-bordered border-primary' >
											<thead className={'table-dark border-primary'}>
												<tr>
													<th>Name</th>
													<th>Qty</th>
													<th>U/Price(LKR)</th>
													<th>D/Amount(LKR)</th>
													<th>Net Value(LKR)</th>
													<th></th>
												</tr>
											</thead>
											<tbody>
												{orderedItems.map((val: any, index: any) => (
													<tr key={index}>
														<td>
															{val.category} {val.model} {val.brand}
														</td>
														<td>{val.quantity}</td>
														<td>{val.sellingPrice}</td>
														<td>
															{/* {((val.sellingPrice * val.quantity) / 100) * val.discount} */}
														</td>
														<td>{val.sellingPrice * val.quantity}</td>
														<td>
															<Button
																icon='delete'
																onClick={() =>
																	handleDeleteItem(val.barcode)
																}></Button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
									{/* Fixed Total Row */}
									<div>
										{/* <table className='table table-bordered border-primary'>
											<tbody>
												<tr>
													<td colSpan={4} className='text fw-bold'>
														Total
													</td>
													<td className='fw-bold text-end'>
														{calculateSubTotal()}
													</td>{' '}
													
													<td></td>
												</tr>
											</tbody>
										</table> */}
									</div>
								</div>
							</CardBody>
							<CardFooter className='pb-1'>
								{/* Two cards side by side occupying full width */}
								<div className='d-flex w-100'>
									<Card className='col-4 flex-grow-1 me-2'>
										<CardBody>
											<FormGroup
												id='product'
												label='Barcode ID'
												className='col-12'>
												<Dropdown
													aria-label='State'
													editable
													ref={dropdownRef}
													placeholder='-- Select Product --'
													className='selectpicker col-12'
													options={
														items
															? items.map((type: any) => ({
																	value: type.barcode,
																	label: type.barcode,
															  }))
															: [{ value: '', label: 'No Data' }]
													}
													onChange={(e: any) =>
														setSelectedProduct(e.target.value)
													}
													onKeyDown={handleDropdownKeyPress}
													// onBlur={formik.handleBlur}
													value={selectedProduct}
												/>
											</FormGroup>
											<FormGroup
												id='quantity'
												label='Quantity'
												className='col-12 mt-2'>
												<Input
													ref={quantityRef}
													type='number'
													onKeyDown={handleaddKeyPress}
													onChange={(e: any) =>
														setQuantity(Number(e.target.value))
													}
													value={quantity}
													min={0}
													validFeedback='Looks good!'
												/>
											</FormGroup>
											<div className='d-flex justify-content-end mt-2'>
												{/* <button className='btn btn-danger me-2'>Cancel</button> */}
												<Button
													color='success'
													className=''
													onClick={handlePopupOk}>
													ADD
												</Button>
											</div>
										</CardBody>
									</Card>
									<Card className='flex-grow-1 ms-2'>
										<CardBody>
											<>
												<FormGroup
													id='amount'
													label='Amount (LKR)'
													className='col-12 mt-2'>
													<Input
														type='number'
														ref={inputRef} // Attach a ref to the input
														onChange={(e: any) => {
															let value = e.target.value;
															if (
																value.length > 1 &&
																value.startsWith('0')
															) {
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

												<ChecksGroup isInline className='pt-2'>
													<Checks
														ref={cashRef}
														onKeyDown={cashchange}
														id='inlineCheckOne'
														label='Cash'
														name='checkOne'
														checked={payment}
														onClick={(e) => {
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
														onClick={(e) => {
															setPayment(false);
														}}
													/>
												</ChecksGroup>
												<Button
													ref={printRef}
													color='info'
													className='mt-4 w-100'
													onClick={printbill}
													onKeyDown={printchange}>
													Print Bill
												</Button>
												<Button
													ref={endRef}
													color='success'
													className='mt-4 w-100'
													onClick={addbill}
													onKeyDown={salechange}>
													End Sale
												</Button>
											</>
										</CardBody>
									</Card>
								</div>
							</CardFooter>
						</Card>
					</div>
					{/* Second Card */}
					<div className='col-4'>
						<Card stretch className='mt-4 p-4' style={{ height: '80vh' }}>
							<CardBody isScrollable>
								<div
									// ref={printRef} // Attach the ref here
									style={{
										width: '300px',
										fontSize: '12px',
										backgroundColor: 'white',
										color: 'black',
									}}
									className='p-3'>
									<center>
										{/* <img src={Logo} style={{ height: 50, width: 100 }} alt='' /> */}
										<p>
											<b>Suranga Cell Care</b>
											<br />
											No.524/1/A,
											<br />
											Kandy Road,
											<br />
											Kadawatha
											<br />
											TEL : 011 292 6030/ 071 911 1144
										</p>
									</center>
									<div className='d-flex justify-content-between align-items-center mt-4'>
										<div className='text-start'>
											<p className='mb-0'>
												DATE &nbsp;&emsp; &emsp; &emsp;:&emsp;{currentDate}
											</p>
											<p className='mb-0'>
												START TIME&emsp;:&emsp;{currentTime}
											</p>
											<p className='mb-0'>
												{' '}
												INVOICE NO&nbsp; &nbsp;:&emsp;{id}
											</p>
										</div>
									</div>

									<hr />
									<hr />
									<p>
										Product &emsp;Qty&emsp;&emsp; U/Price&emsp;&emsp;&emsp; Net
										Value
									</p>

									<hr />

									{orderedItems.map(
										(
											{
												cid,
												category,
												model,
												brand,
												quantity,
												price,
												discount,
												barcode,
												sellingPrice,
											}: any,
											index: any,
										) => (
											<p>
												{index + 1}. {category} {model} {brand}
												<br />
												{barcode}&emsp;
												{quantity}&emsp;&emsp;&emsp;
												{sellingPrice}.00&emsp;&emsp;&emsp;&emsp;
												{(sellingPrice * quantity).toFixed(2)}
											</p>
										),
									)}

									<hr />

									<div className='d-flex justify-content-between'>
										{/* <div>Discount</div>
									<div>
										<strong>{calculateDiscount()}</strong>
									</div> */}
									</div>
									<div className='d-flex justify-content-between'>
										<div>
											<strong>Sub Total</strong>
										</div>
										<div>
											<strong>{calculateSubTotal()}</strong>
										</div>
									</div>
									<hr />
									<div className='d-flex justify-content-between'>
										<div>Cash Received</div>
										<div>{amount}.00</div>
									</div>
									<div className='d-flex justify-content-between'>
										<div>Balance</div>
										<div>{amount - Number(calculateSubTotal())}</div>
									</div>
									<div className='d-flex justify-content-between'>
										<div>No.Of Pieces</div>
										<div>{orderedItems.length}</div>
									</div>

									<hr />
									<center>THANK YOU COME AGAIN</center>
									<hr />

									<center style={{ fontSize: '11px' }}></center>
								</div>
							</CardBody>
						</Card>
					</div>
				</div>
			</PageWrapper>
		</>
	);
}

export default index;
