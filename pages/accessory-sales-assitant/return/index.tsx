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

	const [returnType, setReturnType] = useState('');
	const [condition, setCondition] = useState('');
	const [id, setId] = useState('');
	useEffect(() => {
		if (barcode.length >= 4 && itemAcces) {
			const prefix = barcode.slice(0, 4);
			const matchedItem = itemAcces.find((item: { code: string; quantity: string }) =>
				item.code.startsWith(prefix),
			);

			if (matchedItem) {
				setId(matchedItem.id);
			} else {
			}
		}
	}, [barcode, itemAcces]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'accessorybill');
				const querySnapshot = await getDocs(dataCollection);
				const firebaseData: any = querySnapshot.docs.map((doc) => {
					const data = doc.data() as any;
					return {
						...data,
						cid: doc.id,
					};
				});
				console.log(firebaseData);
				setOrders(firebaseData);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, []);

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
			const process = Swal.fire({
				title: 'Processing...',
				html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
				allowOutsideClick: false,
				showCancelButton: false,
				showConfirmButton: false,
			});
			const barcode = values.barcode;
			console.log(barcode);
			console.log(itemAcces);
			if (barcode.length >= 4 && itemAcces) {
				const prefix = barcode.slice(0, 4);

				const matchedItem = itemAcces.find((item: { code: string; quantity: string }) =>
					item.code.startsWith(prefix),
				);
				console.log(matchedItem);
				if (matchedItem) {
					if (values.condition === 'Good') {
						console.log(Number(matchedItem.quantity));
						console.log(values.quantity);
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
		},
	});
	const handlebillClick = async (value: any) => {
		console.log(orders);
		const selectedOrder: any = orders.find((order: any) => order.id == value);
		if (selectedOrder) {
			console.log('Found Order:', selectedOrder.date);
			await setSelectedOrder(selectedOrder.orders);
			formik.setFieldValue('date_sold', selectedOrder.date);
			formik.setFieldValue('name', selectedOrder.name);
			formik.setFieldValue('contact', selectedOrder.contact);
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
								onChange={formik.handleChange}
								className='col-md-12'>
								<Input
									onChange={(e: any) => {
										handlebillClick(e.target.value);
									}}
									value={formik.values.Bill_number}
									onBlur={formik.handleBlur}
									isValid={formik.isValid}
									isTouched={formik.touched.Bill_number}
									invalidFeedback={formik.errors.Bill_number}
									validFeedback='Looks good!'
								/>
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
										// id='Same Item'
										label='Same Item'
										name='Same Item'
										value='Same Item'
										onChange={(e: any) => {
											setReturnType(e.target.value),
												formik.setFieldValue('returnType', e.target.value);
										}}
										checked={returnType == 'Same Item'}
									/>
									<Checks
										id='New Item'
										label='New Item'
										name='New Item'
										value='New Item'
										onChange={(e: any) => {
											setReturnType(e.target.value),
												formik.setFieldValue('returnType', e.target.value);
										}}
										checked={returnType == 'New Item'}
									/>
									<Checks
										id='Exchange'
										label='Exchange'
										name='Exchange'
										value='Exchange'
										onChange={(e: any) => {
											setReturnType(e.target.value),
												formik.setFieldValue('returnType', e.target.value);
										}}
										checked={returnType == 'Exchange'}
									/>
									<Checks
										id='Cash'
										label='Cash'
										name='Cash'
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
										id='Good'
										label='Good'
										name='Good'
										value='Good'
										onChange={(e: any) => {
											setCondition(e.target.value);
											formik.setFieldValue('condition', e.target.value);
										}}
										checked={condition == 'Good'}
									/>
									<Checks
										id='Bad'
										label='Bad'
										name='Bad'
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
