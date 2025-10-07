import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import { useAddStockOutMutation } from '../../redux/slices/stockInOutAcceApiSlice';
import { useGetStockInOutsQuery } from '../../redux/slices/stockInOutAcceApiSlice';
import { useGetItemAcceByIdQuery } from '../../redux/slices/itemManagementAcceApiSlice';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import Select from '../bootstrap/forms/Select';
import Swal from 'sweetalert2';
import Checks, { ChecksGroup } from '../bootstrap/forms/Checks';
import { useGetItemAccesQuery } from '../../redux/slices/itemManagementAcceApiSlice';

interface StockAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
	quantity: any;
	refetch: () => void;
}

const formatTimestamp = (seconds: number, nanoseconds: number): string => {
	const date = new Date(seconds * 1000);
	const formattedDate = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		hour12: true,
		timeZoneName: 'short',
	}).format(date);
	return formattedDate;
};

interface StockOut {
	id: string;
	model: string;
	brand: string;
	category: string;
	quantity: string;
	date: string;
	name: string;
	mobile: string;
	nic: string;
	barcode: string;
	cost: string;
	sellingPrice: string;
	stock: string;
	status: boolean;
	description: string;
	code: string;
}

const StockAddModal: FC<StockAddModalProps> = ({ id, isOpen, setIsOpen, quantity, refetch }) => {
	const [stockOut, setStockOut] = useState<StockOut>({
		id: '',
		model: '',
		brand: '',
		category: '',
		quantity: '',
		date: '',
		name: '',
		mobile: '',
		nic: '',
		barcode: '',
		cost: '',
		code: '',
		sellingPrice: '',
		stock: 'stockOut',
		status: true,
		description: '',
	});
	const [selectedCost, setSelectedCost] = useState<string | null>(null);
	const [barcodeSearch, setBarcodeSearch] = useState<string>('');
	const {
		data: stockInData,
		isLoading: stockInLoading,
		isError: stockInError,
	} = useGetStockInOutsQuery(undefined);
	const [addstockOut] = useAddStockOutMutation();
	const { data: stockOutData, isSuccess } = useGetItemAcceByIdQuery(id);

	useEffect(() => {
		if (isSuccess && stockOutData) {
			setStockOut(stockOutData);
		}
	}, [isSuccess, stockOutData]);
console.log(stockInData)
	// Filter for accessory stock-in items only
	const filteredStockIn = stockInData?.filter(
		(item: { stock: string; type: string }) => 
			item.stock === 'stockIn',
	);

	const handleBarcodeSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const searchValue = e.target.value;
		setBarcodeSearch(searchValue);
		formik.setFieldValue("barcode", searchValue);
		
		// Check if typed value matches any barcode exactly
		const matchedStock = filteredStockIn?.find(
			(item: { barcode: string }) => item.barcode === searchValue
	);
		setSelectedCost(matchedStock ? matchedStock.cost : null);
};

	const stockInQuantity = quantity;
	const formik = useFormik({
		initialValues: {
			brand: stockOut.brand,
			model: stockOut.model,
			category: stockOut.category,
			quantity: '',
			date: '',
			name: '',
			mobile: '',
			nic: '',
			barcode: '',
			cost: '',
			sellingPrice: '',
			stock: 'stockOut',
			status: true,
			description: '',
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: any = {};
			if (!values.quantity || values.quantity === '') {
				errors.quantity = 'Quantity is required';
			} else if (isNaN(Number(values.quantity)) || Number(values.quantity) <= 0) {
				errors.quantity = 'Quantity must be a positive number';
			}
			
			if (!values.date) errors.date = 'Date Out is required';
			if (!values.barcode) errors.barcode = 'Date In is required';
			
			if (!values.sellingPrice || values.sellingPrice === '') {
				errors.sellingPrice = 'Selling Price is required';
			} else if (isNaN(Number(values.sellingPrice)) || Number(values.sellingPrice) < 0) {
				errors.sellingPrice = 'Selling Price must be a non-negative number';
			}
			
			return errors;
		},
		onSubmit: async (values) => {
			try {
				// Check if current stock is zero
				if (stockInQuantity <= 0) {
					Swal.fire({
						icon: 'error',
						title: 'No Stock Available',
						text: 'Current stock is 0. Stock out operation cannot be performed.',
					});
					return;
				}
				
				// Check if requested quantity exceeds available stock
				const stockOutQuantity = values.quantity ? parseInt(values.quantity) : 0;
				if (stockOutQuantity > stockInQuantity) {
					Swal.fire({
						icon: 'error',
						title: 'Insufficient Stock',
						text: `Requested quantity (${stockOutQuantity}) exceeds available stock (${stockInQuantity}).`,
					});
					return;
				}
			
				Swal.fire({
					title: 'Processing...',
					html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
					allowOutsideClick: false,
					showCancelButton: false,
					showConfirmButton: false,
				});
				await refetch();
				
				// Validate and convert numeric values
				if (isNaN(stockInQuantity) || isNaN(stockOutQuantity)) {
					Swal.fire({
						icon: 'error',
						title: 'Invalid Quantity',
						text: 'Quantity must be a valid number.',
					});
					return;
				}
				
				// Ensure sellingPrice is a number
				if (values.sellingPrice === '' || isNaN(Number(values.sellingPrice))) {
					Swal.fire({
						icon: 'error',
						title: 'Invalid Selling Price',
						text: 'Selling Price must be a valid number.',
					});
					return;
				}
				
				const updatedQuantity = stockInQuantity - stockOutQuantity;
				if (updatedQuantity < 0) {
					Swal.fire({
						icon: 'error',
						title: 'Insufficient Stock',
						text: 'The stock out quantity exceeds available stock.',
					});
					return;
				}
				
				// Clone values and ensure numeric fields are properly formatted
				const processedValues = {
					...values,
					id: id, // include id for backend to update item quantity
					quantity: Number(values.quantity),
					sellingPrice: Number(values.sellingPrice),
					cost: values.cost ? Number(values.cost) : null,
					stock: 'stockOut',
					status: true
				};
				
				console.log("Submitting stock-out with values:", processedValues);
				
				const response = await addstockOut(processedValues).unwrap();

				console.log("Stock-out created response:", response);
				await refetch();
				await Swal.fire({ icon: 'success', title: 'Stock Out Created Successfully' });
				formik.resetForm();
				setIsOpen(false);
			} catch (error) {
				console.error('Stock out error:', error);
				await Swal.fire({
					icon: 'error',
					title: 'Error',
					text: 'Failed to add the item. Please try again.',
				});
			}
		},
	});

	const formatMobileNumber = (value: string) => {
		let sanitized = value.replace(/\D/g, '');
		if (!sanitized.startsWith('0')) sanitized = '0' + sanitized;
		return sanitized.slice(0, 10);
	};

	return (
		<Modal isOpen={isOpen} aria-hidden={!isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader
				setIsOpen={() => {
					setIsOpen(false);
					setSelectedCost(null);
					setBarcodeSearch('');
					formik.resetForm();
				}}
				className='p-4'>
				<ModalTitle id=''>{'Stock Out'}</ModalTitle>
			</ModalHeader>

			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='model' label='Model' className='col-md-6'>
						<Input type='text' value={formik.values.model} readOnly />
					</FormGroup>
					<FormGroup id='brand' label='Brand' className='col-md-6'>
						<Input type='text' value={formik.values.brand} readOnly />
					</FormGroup>
					<FormGroup id='category' label='Category' className='col-md-6'>
						<Input type='text' value={formik.values.category} readOnly />
					</FormGroup>
					<FormGroup id='quantity' label='Quantity' className='col-md-6'>
						<Input
							type='number'
							min={1}
							placeholder='Enter Quantity'
							value={formik.values.quantity}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							name='quantity'
							isValid={formik.isValid}
							isTouched={formik.touched.quantity}
							invalidFeedback={formik.errors.quantity}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='date' label='Date Out' className='col-md-6'>
						<Input
							type='date'
							max={new Date().toISOString().split('T')[0]}
							placeholder='Enter Date'
							value={formik.values.date}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							name='date'
							isValid={formik.isValid}
							isTouched={formik.touched.date}
							invalidFeedback={formik.errors.date}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='barcode' label='Barcode' className='col-md-6'>
						<input
							type='text'
							className={`form-control ${
								formik.touched.barcode && formik.errors.barcode ? 'is-invalid' : ''
							}`}
							list='barcode-options'
							placeholder='Type or select barcode'
							value={formik.values.barcode}
							onChange={handleBarcodeSearchChange}
							onBlur={formik.handleBlur}
							name='barcode'
						/>
						<datalist id='barcode-options'>
							{stockInLoading && <option value=''>Loading barcodes...</option>}
							{stockInError && <option value=''>Error fetching barcodes</option>}
							{filteredStockIn?.filter((item:any) => item.barcode.startsWith(stockOut.code)).map(
								(
									item: {
										id: string;
										barcode: string;
									},
									index: any,
								) => (
									<option key={index} value={item.barcode} />
								),
							)}
						</datalist>
					</FormGroup>
					{formik.touched.barcode && formik.errors.barcode && (
						<div className='col-md-6'>
							<div className='invalid-feedback d-block'>{formik.errors.barcode}</div>
						</div>
					)}

					{selectedCost && (
						<FormGroup id='cost' label='Cost(Per Unit)' className='col-md-6'>
							<Input type='text' value={selectedCost} readOnly />
						</FormGroup>
					)}
					<FormGroup id='sellingPrice' label='Selling Price(lkr)' className='col-md-6'>
						<Input
							type='number'
							min={0}
							placeholder='Enter Selling Price'
							value={formik.values.sellingPrice}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							name='sellingPrice'
							isValid={formik.isValid}
							isTouched={formik.touched.sellingPrice}
							invalidFeedback={formik.errors.sellingPrice}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					{/* <FormGroup id='customerName' label='Customer Name' className='col-md-6'>
						<Input
							type='text'
							placeholder='Enter Customer Name'
							value={formik.values.customerName}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.customerName}
							invalidFeedback={formik.errors.customerName}
							validFeedback='Looks good!'
						/>
					</FormGroup> */}
					{/* <FormGroup id='mobile' label='Mobile' className='col-md-6'>
						<Input
							type='text'
							value={formik.values.mobile}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								const input = e.target.value.replace(/\D/g, '');
								formik.setFieldValue('mobile', formatMobileNumber(input));
							}}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.mobile}
							invalidFeedback={formik.errors.mobile}
							validFeedback='Looks good!'
						/>
					</FormGroup> */}
					{/* <FormGroup id='nic' label='NIC' className='col-md-6'>
						<Input
							type='text'
							placeholder='Enter NIC'
							value={formik.values.nic}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							name='nic'
							isValid={formik.isValid}
							isTouched={formik.touched.nic}
							invalidFeedback={formik.errors.nic}
							validFeedback='Looks good!'
						/>
					</FormGroup> */}
					{/* <FormGroup id='email' label='Email' className='col-md-6'>
						<Input
							type='text'
							placeholder='Enter Email'
							value={formik.values.email}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							name='email'
							isValid={formik.isValid}
							isTouched={formik.touched.email}
							invalidFeedback={formik.errors.email}
							validFeedback='Looks good!'
						/>
					</FormGroup> */}
					<FormGroup id='description' label='Description (Reason)' className='col-md-6'>
						<Input
							type='text'
							placeholder='Enter Description'
							value={formik.values.description}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							name='description'
							isValid={formik.isValid}
							isTouched={formik.touched.description}
							invalidFeedback={formik.errors.description}
							validFeedback='Looks good!'
						/>
					</FormGroup>
				</div>
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				<Button color='success' onClick={formik.handleSubmit}>
					Stock Out
				</Button>
			</ModalFooter>
		</Modal>
	);
};
StockAddModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default StockAddModal;
