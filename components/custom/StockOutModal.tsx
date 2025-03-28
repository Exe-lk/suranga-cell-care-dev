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
import { useUpdateStockInOutMutation } from '../../redux/slices/stockInOutAcceApiSlice';
import { useGetItemAccesQuery } from '../../redux/slices/itemManagementAcceApiSlice';

interface StockAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
	quantity: any;
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
	cid: string;
	model: string;
	brand: string;
	category: string;
	quantity: string;
	date: string;
	customerName: string;
	mobile: string;
	nic: string;
	email: string;
	barcode: string;
	cost: string;
	sellingPrice: string;
	stock: string;
	status: boolean;
	description: string;
}

const StockAddModal: FC<StockAddModalProps> = ({ id, isOpen, setIsOpen, quantity }) => {
	const [stockOut, setStockOut] = useState<StockOut>({
		cid: '',
		model: '',
		brand: '',
		category: '',
		quantity: '',
		date: '',
		customerName: '',
		mobile: '',
		nic: '',
		email: '',
		barcode: '',
		cost: '',
		sellingPrice: '',
		stock: 'stockOut',
		status: true,
		description: '',
	});
	const [selectedCost, setSelectedCost] = useState<string | null>(null);
	const {
		data: stockInData,
		isLoading: stockInLoading,
		isError: stockInError,
	} = useGetStockInOutsQuery(undefined);
	const [addstockOut] = useAddStockOutMutation();
	const { data: stockOutData, isSuccess } = useGetItemAcceByIdQuery(id);
	const [updateStockInOut] = useUpdateStockInOutMutation();
	const { refetch } = useGetItemAccesQuery(undefined);

	useEffect(() => {
		if (isSuccess && stockOutData) {
			setStockOut(stockOutData);
		}
	}, [isSuccess, stockOutData]);

	const filteredStockIn = stockInData?.filter(
		(item: { stock: string }) => item.stock === 'stockIn',
	);
	const handleDateInChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
	const selectedBarcode = e.target.value;
	formik.setFieldValue("barcode", selectedBarcode);
	const selectedStock = filteredStockIn?.find(
		(item: { barcode: string }) => item.barcode === selectedBarcode
	);
	setSelectedCost(selectedStock ? selectedStock.cost : null);
};

	const stockInQuantity = quantity;

	const formik = useFormik({
		initialValues: {
			brand: stockOut.brand,
			model: stockOut.model,
			category: stockOut.category,
			quantity: '',
			date: '',
			customerName: '',
			mobile: '',
			nic: '',
			email: '',
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
			if (!values.quantity) errors.quantity = 'Quantity is required';
			if (!values.date) errors.date = 'Date Out is required';
			if (!values.barcode) errors.barcode = 'Date In is required';
			if (!values.sellingPrice) errors.sellingPrice = 'Selling Price is required';
			// if (!values.customerName) errors.customerName = 'Customer Name is required';
			// if (!values.mobile) {
			// 	errors.mobile = 'Required';
			// } else if (values.mobile.length !== 10) {
			// 	errors.mobile = 'Mobile number must be exactly 10 digits';
			// }
			// if (!values.nic) {
			// 	errors.nic = 'Required';
			// } else if (!/^\d{9}[Vv]$/.test(values.nic) && !/^\d{12}$/.test(values.nic)) {
			// 	errors.nic = 'NIC must be 9 digits followed by "V" or 12 digits';
			// }
			// if (!values.email) {
			// 	errors.email = 'Required';
			// } else if (!values.email.includes('@')) {
			// 	errors.email = 'Invalid email format.';
			// } else if (values.email.includes(' ')) {
			// 	errors.email = 'Email should not contain spaces.';
			// } else if (/[A-Z]/.test(values.email)) {
			// 	errors.email = 'Email should be in lowercase only.';
			// }
			return errors;
		},
		onSubmit: async (values) => {
			try {
				Swal.fire({
					title: 'Processing...',
					html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
					allowOutsideClick: false,
					showCancelButton: false,
					showConfirmButton: false,
				});
				await refetch();
				const stockOutQuantity = values.quantity ? parseInt(values.quantity) : 0;
				if (isNaN(stockInQuantity) || isNaN(stockOutQuantity)) {
					Swal.fire({
						icon: 'error',
						title: 'Invalid Quantity',
						text: 'Quantity must be a valid number.',
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
				const response = await addstockOut(values).unwrap();
				await updateStockInOut({ id, quantity: updatedQuantity }).unwrap();
				refetch();
				await Swal.fire({ icon: 'success', title: 'Stock Out Created Successfully' });
				formik.resetForm();
				setIsOpen(false);
			} catch (error) {
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
						<Select
							id='barcode'
							name='barcode'
							ariaLabel='barcode'
							onChange={handleDateInChange}
							value={formik.values.barcode}
							onBlur={formik.handleBlur}
							className={`form-control ${
								formik.touched.barcode && formik.errors.barcode ? 'is-invalid' : ''
							}`}>
							<option value=''>Select a Barcode</option>
							{stockInLoading && <option>Loading barcodes...</option>}
							{stockInError && <option>Error fetching barcodes</option>}
							{filteredStockIn?.map(
								(
									item: {
										id: string;
										barcode: string;
									},
									index: any,
								) => (
									<option key={index} value={item.barcode}>
										{item.barcode}
									</option>
								),
							)}
							{formik.touched.barcode && formik.errors.barcode && (
								<div className='invalid-feedback'>{formik.errors.barcode}</div>
							)}
						</Select>
					</FormGroup>

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
