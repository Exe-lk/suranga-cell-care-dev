import React, { useState, useEffect } from 'react';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import 'react-simple-keyboard/build/css/index.css';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Button from '../../../components/bootstrap/Button';
import Checks, { ChecksGroup } from '../../../components/bootstrap/forms/Checks';
import { useGetStockInOutsQuery as useGetStockInOutsdisQuery } from '../../../redux/slices/stockInOutAcceApiSlice';
import MyDefaultHeader from '../../_layout/_headers/AdminHeader';
import Page from '../../../layout/Page/Page';
import Spinner from '../../../components/bootstrap/Spinner';
import { useGetItemAccesQuery } from '../../../redux/slices/itemManagementAcceApiSlice';
import Swal from 'sweetalert2';
import { saveReturnData, updateQuantity } from '../../../service/returnAccesory'; // New service function for Firestore
import { useFormik } from 'formik';
import Input from '../../../components/bootstrap/forms/Input';
import Select from '../../../components/bootstrap/forms/Select';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { useGetSuppliersQuery } from '../../../redux/slices/supplierApiSlice';
import { supabase } from '../../../lib/supabase';

function Index() {
	const { data: Accstock, error: accError } = useGetStockInOutsdisQuery(undefined);
	const { data: itemAcces, isLoading: itemLoading, refetch } = useGetItemAccesQuery(undefined);
	const [barcode, setBarcode] = useState('');
	const [quantity, setQuantity] = useState<any>(1);
	const [sellingPrice, setSellingPrice] = useState<number>();
	const [isItemDisabled, setIsItemDisabled] = useState(true);
	const [showSellingPrice, setShowSellingPrice] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const [dropdownOptions, setDropdownOptions] = useState([]);
	const [orders, setOrders] = useState([]);
	const [selectedorder, setSelectedOrder] = useState<any[]>([]);
	const [billSearchTerm, setBillSearchTerm] = useState('');
	const [showBillDropdown, setShowBillDropdown] = useState(false);
	const [filteredBills, setFilteredBills] = useState<any[]>([]);

	const [returnType, setReturnType] = useState('');
	const [condition, setCondition] = useState('');
	const [id, setId] = useState('');
	useEffect(() => {
		if (barcode.length >= 4 && itemAcces && Array.isArray(itemAcces)) {
			const prefix = barcode.slice(0, 4);
			const matchedItem = itemAcces.find((item: any) => {
				// Add proper type checking for item.code
				if (item && item.code) {
					const code = String(item.code); // Convert to string to ensure startsWith works
					return code.startsWith(prefix);
				}
				return false;
			});

			if (matchedItem) {
				setId(matchedItem.id);
			}
		}
	}, [barcode, itemAcces]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data, error }: any = await supabase.from('accessorybill').select('*');

				if (error) throw error;

				setOrders(data);
				setFilteredBills(data); // Initialize filtered bills
				// console.log(data);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};

		fetchData();
	}, []);

	// Filter bills based on search term
	useEffect(() => {
		if (billSearchTerm.trim() === '') {
			setFilteredBills(orders);
		} else {
			const filtered = orders.filter((order: any) => {
				const billNumber = order.id?.toString() || '';
				const customerName = order.name?.toLowerCase() || '';
				const searchLower = billSearchTerm.toLowerCase();
				
				return billNumber.includes(billSearchTerm) || 
				       customerName.includes(searchLower);
			});
			setFilteredBills(filtered);
		}
	}, [billSearchTerm, orders]);

	const currentDate = new Date().toLocaleDateString();
	const formik = useFormik({
		initialValues: {
			date: currentDate,
			date_sold: '',
			Bill_number: '',
			item: '',
			item1: '',
			barcode: '',
			sold_price: '',
			condition: '',
			Supplier: '',
			returnType: '',
			return_id: '',
			name: '',
			contact: '',
			qyantity: '',
		},
		validate: (values) => {
			const errors: Record<string, string> = {};

			if (!values.date) {
				errors.date = 'Date is required';
			}

			if (!values.date_sold) {
				errors.date_sold = 'Sold date is required';
			}

			if (!values.Bill_number) {
				errors.Bill_number = 'Bill number is required';
			} else if (!/^\d+$/.test(values.Bill_number)) {
				errors.Bill_number = 'Bill number must be numeric';
			}

			if (!values.item) {
				errors.item = 'Item is required';
			}

			// Sold price validation
			if (!values.sold_price) {
				errors.sold_price = 'Sold price is required';
			} else if (isNaN(Number(values.sold_price))) {
				errors.sold_price = 'Sold price must be a number';
			}

			// Condition validation
			if (!values.condition) {
				errors.condition = 'Condition is required';
			}

			// Supplier validation
			// if (!values.Supplier.trim()) {
			// 	errors.Supplier = 'Supplier is required';
			// }

			// Return type validation
			if (!values.returnType) {
				errors.returnType = 'Return type is required';
			}

			// Return ID validation

			// Name validation
			if (!values.name) {
				errors.name = 'Name is required';
			} else if (values.name !== values.name.trim()) {
				errors.name = 'Name cannot contain leading or trailing spaces';
			}

			if (!values.contact) {
				errors.contact = 'Name is required';
			}
			//  else if (!/^\d{9}$/.test(values.contact)) {
			// 	errors.contact = 'Contact must be a 10-digit number';
			// }

			return errors;
		},
		onSubmit: async (values: any) => {
			try {
			const process = Swal.fire({
				title: 'Processing...',
				html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
				allowOutsideClick: false,
				showCancelButton: false,
				showConfirmButton: false,
			});
			const barcode = values.barcode;
				console.log('Barcode:', barcode);
				console.log('ItemAcces:', itemAcces);
				
				if (barcode && barcode.length >= 4 && itemAcces && Array.isArray(itemAcces)) {
				const prefix = barcode.slice(0, 4);

					const matchedItem = itemAcces.find((item: any) => {
						// Add proper type checking for item.code
						if (item && item.code) {
							const code = String(item.code); // Convert to string to ensure startsWith works
							return code.startsWith(prefix);
						}
						return false;
					});
					
					console.log('Matched Item:', matchedItem);
				if (matchedItem) {
					if (values.condition === 'Good') {
							console.log('Current quantity:', Number(matchedItem.quantity));
							console.log('Return quantity:', values.qyantity);
						await updateQuantity(
							matchedItem.id,
							Number(matchedItem.quantity) + Number(values.qyantity),
						);
					}
				}
			}
				
			refetch();
			await saveReturnData(values);
			Swal.fire('Success', 'Return data saved successfully!', 'success');
			formik.resetForm();
			setReturnType('');
			setCondition('');
				setBillSearchTerm('');
				setSelectedOrder([]);
				setShowBillDropdown(false);
			} catch (error) {
				console.error('Error in onSubmit:', error);
				Swal.fire('Error', 'An error occurred while processing the return. Please try again.', 'error');
			}
		},
	});
	const handlebillClick = async (billId: any, billData?: any) => {
		console.log(orders);
		let selectedOrder: any;
		
		if (billData) {
			// Called from dropdown selection
			selectedOrder = billData;
		} else {
			// Called from manual input
			selectedOrder = orders.find((order: any) => order.id == billId);
		}
		
		if (selectedOrder) {
			console.log('Found Order:', selectedOrder.date);
			await setSelectedOrder(selectedOrder.orders);
			formik.setFieldValue('Bill_number', selectedOrder.id);
			formik.setFieldValue('date_sold', selectedOrder.date);
			formik.setFieldValue('name', selectedOrder.name);
			formik.setFieldValue('contact', selectedOrder.contact);
			setBillSearchTerm(selectedOrder.id.toString());
			setShowBillDropdown(false);
		} else {
			console.log('Order not found!');
		}
	};

	if (itemLoading) {
		return (
			<PageWrapper>
				<Page>
					<div className='row h-100 py-5'>
						<div className='col-12 text-center py-5 my-5'>
							<Spinner
								tag='div'
								color='primary'
								isGrow={false}
								size={50}
								className=''
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
		<PageWrapper>
			<MyDefaultHeader />
			<div
				className='row m-4'
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
				}}>
				<div className='col-6'>
					<Card stretch className='mt-4 p-4'>
						<CardBody>
							<FormGroup
								id='Bill_number'
								label='Bill Number'
								className='col-md-12'>
								<div style={{ position: 'relative' }}>
								<Input
										placeholder='Search bill number or customer name...'
										value={billSearchTerm}
									onChange={(e: any) => {
											setBillSearchTerm(e.target.value);
											setShowBillDropdown(true);
											formik.setFieldValue('Bill_number', e.target.value);
										}}
										onFocus={() => setShowBillDropdown(true)}
										onBlur={(e: any) => {
											// Delay hiding dropdown to allow for clicks
											setTimeout(() => setShowBillDropdown(false), 200);
										}}
									isValid={formik.isValid}
									isTouched={formik.touched.Bill_number}
									invalidFeedback={formik.errors.Bill_number}
									validFeedback='Looks good!'
								/>
									{showBillDropdown && (
										<div 
											style={{
												position: 'absolute',
												top: '100%',
												left: 0,
												right: 0,
												backgroundColor: 'white',
												border: '1px solid #ced4da',
												borderRadius: '0.375rem',
												maxHeight: '200px',
												overflowY: 'auto',
												zIndex: 1000,
												boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)'
											}}
										>
											{filteredBills.length > 0 ? (
												filteredBills.slice(0, 10).map((bill: any) => (
													<div
														key={bill.id}
														style={{
															padding: '8px 12px',
															cursor: 'pointer',
															borderBottom: '1px solid #f1f3f4',
															transition: 'background-color 0.15s ease-in-out'
														}}
														onMouseDown={(e) => e.preventDefault()} // Prevent input blur
														onClick={() => handlebillClick(bill.id, bill)}
														onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f8f9fa'}
														onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'white'}
													>
														<div style={{ fontWeight: 'bold', fontSize: '14px', color: '#495057' }}>
															Bill #{bill.id}
														</div>
														<div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
															Customer: {bill.name || 'N/A'} - {bill.contact || 'N/A'}
														</div>
														<div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
															Date: {bill.date || 'N/A'} - Amount: ${bill.amount || 0}
														</div>
													</div>
												))
											) : (
												<div style={{ padding: '12px', textAlign: 'center', color: '#6c757d', fontSize: '14px' }}>
													No bills found
												</div>
											)}
										</div>
									)}
								</div>
							</FormGroup>
							<FormGroup id='item1' label='Item' className='col-md-12'>
								<Select
									id='item1'
									name='item1'
									ariaLabel='item1'
									onChange={(e: any) => {
										// Get selected index
										const selectedIndex = e.target.value;
										// Get the corresponding object from selectedorder
										const order = selectedorder[selectedIndex];

										if (order) {
											console.log(order);
											formik.setFieldValue(
												'item',
												`${order.category} ${order.brand} ${order.model}`,
											);
											formik.setFieldValue('item1', selectedIndex);
											formik.setFieldValue(
												'sold_price',
												order.sellingPrice * order.quantity -
													order.discount,
											);
											formik.setFieldValue('qyantity', order.quantity);
											formik.setFieldValue('Supplier', order.suppName);
											formik.setFieldValue('barcode', order.barcode);
											setQuantity(order.quantity);
											setSellingPrice(
												order.sellingPrice -
													order.discount / order.quantity,
											);
										}
									}}
									value={formik.values.item1}
									isValid={formik.isValid}
									isTouched={formik.touched.item1}
									invalidFeedback={formik.errors.item1}
									onBlur={formik.handleBlur}>
									<option value=''>Select One</option>
									{selectedorder.map((order: any, dataIndex: number) => (
										<option key={dataIndex} value={dataIndex}>
											{order.category} {order.brand} {order.model}
										</option>
									))}
								</Select>
							</FormGroup>
							<FormGroup id='qyantity' label='Quantity' className='col-md-12'>
								<Input
									type='number'
									onChange={(e: any) => {
										const selectedquantity = e.target.value;
										if (selectedquantity <= quantity && selectedquantity >= 1) {
											formik.setFieldValue('qyantity', selectedquantity);
											formik.setFieldValue(
												'sold_price',
												Number(sellingPrice) * selectedquantity,
											);
										}
									}}
									min={1}
									value={formik.values.qyantity}
									onBlur={formik.handleBlur}
									isValid={formik.isValid}
									isTouched={formik.touched.qyantity}
									invalidFeedback={formik.errors.qyantity}
									validFeedback='Looks good!'
								/>
							</FormGroup>
							<FormGroup
								id='returnType'
								label='returnType'
								onChange={formik.handleChange}
								className='col-md-12'>
								<ChecksGroup
									isInline
									className='pt-2'
									isValid={formik.isValid}
									isTouched={formik.touched.returnType}
									invalidFeedback={formik.errors.returnType}
									onBlur={formik.handleBlur}>
									<Checks
										id='sameItem'
										label='Same Item'
										name='returnType'
										value='Same Item'
										onChange={(e: any) => {
											setReturnType(e.target.value),
												formik.setFieldValue('returnType', e.target.value);
										}}
										checked={returnType == 'Same Item'}
									/>
									<Checks
										id='newItem'
										label='New Item'
										name='returnType'
										value='New Item'
										onChange={(e: any) => {
											setReturnType(e.target.value),
												formik.setFieldValue('returnType', e.target.value);
										}}
										checked={returnType == 'New Item'}
									/>
									<Checks
										id='exchange'
										label='Exchange'
										name='returnType'
										value='Exchange'
										onChange={(e: any) => {
											setReturnType(e.target.value),
												formik.setFieldValue('returnType', e.target.value);
										}}
										checked={returnType == 'Exchange'}
									/>
									<Checks
										id='cash'
										label='Cash'
										name='returnType'
										value='Cash'
										onChange={(e: any) => {
											setReturnType(e.target.value),
												formik.setFieldValue('returnType', e.target.value);
										}}
										checked={returnType == 'Cash'}
									/>
								</ChecksGroup>
							</FormGroup>
							<FormGroup id='condition' label='Condition' className='col-md-12'>
								<ChecksGroup
									isInline
									className='pt-2'
									isTouched={formik.touched.condition}
									invalidFeedback={formik.errors.condition}>
									<Checks
										id='good'
										label='Good'
										name='condition'
										value='Good'
										onChange={(e: any) => {
											setCondition(e.target.value);
											formik.setFieldValue('condition', e.target.value);
										}}
										checked={condition == 'Good'}
									/>
									<Checks
										id='bad'
										label='Bad'
										name='condition'
										value='Bad'
										onChange={(e: any) => {
											setCondition(e.target.value),
												formik.setFieldValue('condition', e.target.value);
										}}
										checked={condition == 'Bad'}
									/>
								</ChecksGroup>
							</FormGroup>
							<FormGroup id='date_sold' label='Sold Date' className='col-md-12'>
								<Input
									// type='date'
									disabled
									onChange={formik.handleChange}
									value={formik.values.date_sold}
									onBlur={formik.handleBlur}
									isValid={formik.isValid}
									isTouched={formik.touched.date_sold}
									invalidFeedback={formik.errors.date_sold}
									validFeedback='Looks good!'
								/>
							</FormGroup>
							<FormGroup id='sold_price' label='Sold Price' className='col-md-12'>
								<Input
									disabled
									onChange={formik.handleChange}
									value={formik.values.sold_price}
									onBlur={formik.handleBlur}
									isValid={formik.isValid}
									isTouched={formik.touched.sold_price}
									invalidFeedback={formik.errors.sold_price}
									validFeedback='Looks good!'
								/>
							</FormGroup>

							<FormGroup id='name' label='Customer Name' className='col-md-12'>
								<Input
									onChange={formik.handleChange}
									value={formik.values.name}
									onBlur={formik.handleBlur}
									isValid={formik.isValid}
									isTouched={formik.touched.name}
									invalidFeedback={formik.errors.name}
									validFeedback='Looks good!'
								/>
							</FormGroup>
							<FormGroup
								id='contact'
								label='Customer Contact  '
								className='col-md-12'>
								<Input
									onChange={formik.handleChange}
									value={formik.values.contact}
									onBlur={formik.handleBlur}
									isValid={formik.isValid}
									isTouched={formik.touched.contact}
									invalidFeedback={formik.errors.contact}
									validFeedback='Looks good!'
								/>
							</FormGroup>
							<FormGroup id='Supplier' label='Supplier' className='col-md-12'>
								<Input
									disabled
									onChange={formik.handleChange}
									value={formik.values.Supplier}
									onBlur={formik.handleBlur}
									isValid={formik.isValid}
									isTouched={formik.touched.Supplier}
									invalidFeedback={formik.errors.Supplier}
									validFeedback='Looks good!'
								/>
							</FormGroup>
							{/* <FormGroup id='barcode' label='Barcode' className='col-12 mt-2'>
								<input
									type='text'
									id='barcode'
									name='barcode'
									className='form-control'
									value={barcode}
									onChange={(e) => setBarcode(e.target.value)}
								/>
							</FormGroup>
							<br></br>

							<FormGroup
								id='quantity'
								label='Available Quantity'
								className='col-12 mt-2'>
								<input
									type='text'
									id='quantity'
									name='quantity'
									className='form-control'
									value={quantity}
									readOnly
								/>
							</FormGroup>
							<br></br>

							<ChecksGroup isInline className='pt-2'>
								<Checks
									id='inlineCheckOne'
									label='Cash'
									name='Cash'
									value='Cash'
									onChange={handleCashClick}
									checked={returnType == 'Cash'}
								/>
								<Checks
									id='inlineCheckOne'
									label='Item'
									name='Item'
									value={'Item'}
									disabled={isItemDisabled}
									onChange={handleItemClick}
									checked={returnType == 'Item'}
								/>
							</ChecksGroup>
							{showSellingPrice && (
								<FormGroup
									id='sellingPrice'
									label='Selling Price'
									className='col-12 mt-2'>
									<input
										type='text'
										id='sellingPrice'
										name='sellingPrice'
										className='form-control'
										value={sellingPrice}
										onChange={(e) => {
											setSellingPrice(e.target.value);
										}}
									/>
								</FormGroup>
							)}
							<br></br>

							{showDropdown && (
								<FormGroup id='product' label='Barcode ID' className='col-12'>
									<select
										className='form-control'
										value={selectedBarcodeID}
										onChange={(e) => setSelectedBarcodeID(e.target.value)}>
										<option value=''>Select a Barcode</option>
										{dropdownOptions.map((option) => (
											<option key={option} value={option}>
												{option}
											</option>
										))}
									</select>
								</FormGroup>
							)}
							<br></br> */}

							<Button
								color='success'
								className='mt-4 w-100'
								onClick={formik.handleSubmit}>
								Return
							</Button>
						</CardBody>
					</Card>
				</div>
			</div>
		</PageWrapper>
	);
}

export default Index;
