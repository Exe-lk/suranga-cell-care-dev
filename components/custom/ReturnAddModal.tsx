import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import Swal from 'sweetalert2';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import {
	useAddStockInMutation,
	useUpdateSubStockInOutMutation,
} from '../../redux/slices/stockInOutDissApiSlice';
import { useGetItemDisByIdQuery } from '../../redux/slices/itemManagementDisApiSlice';
import { useGetItemDissQuery } from '../../redux/slices/itemManagementDisApiSlice';
import { useGetSuppliersQuery } from '../../redux/slices/supplierApiSlice';
import { useUpdateStockInOutMutation } from '../../redux/slices/stockInOutDissApiSlice';
import { useGetStockInOutsQuery } from '../../redux/slices/stockInOutDissApiSlice';
import Select from '../bootstrap/forms/Select';
import Checks, { ChecksGroup } from '../bootstrap/forms/Checks';
import { saveReturnData1, updateQuantity1 } from '../../service/returnAccesory';
import { supabase } from '../../lib/supabase';

interface StockAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;

}

interface StockIn {
	barcode: number;
	cid: string;
	brand: string;
	model: string;
	category: string;
	quantity: string;
	date: string;
	suppName: string;
	code: string;
	cost: string;
	stock: string;
	boxNumber: string;
	description: string;
	status: boolean;
	printlable: number;
}

const StockReturnModal: FC<StockAddModalProps> = ({ id, isOpen, setIsOpen}) => {
	const { refetch } = useGetItemDissQuery(undefined);
	const [condition, setCondition] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [stock, setStock] = useState<any>('');

	// Handle item code input change
	const handleItemCodeInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		formik.setFieldValue('itemId', value);
		if (value.length >= 10) {
			const { data, error }: any = await supabase
				.from('StockAcce')
				.select('id, code, brand, model, category,barcode,date,suppName')
				.eq('barcode', value.slice(0, 10));
			setStock(data[0]);
		}
	};

	// Function to get item details by code from ItemManagementDis

	const formik = useFormik({
		initialValues: {
			itemId: '',
			condition: '',
			fault: '',
			sendDate:''
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: {
				itemId?: string;
				condition?: string;
				fault?: string;
				sendDate?: string;
			} = {};

			if (!values.itemId) {
				errors.itemId = 'Item Code is required';
			}
			
			if (!values.fault) {
				errors.fault = 'fault is required';
			}
			if (!values.sendDate) {
				errors.sendDate = 'Start date is required';
			}
			return errors;
		},
		onSubmit: async (values) => {
			try {
				setIsSubmitting(true);
				// Show processing message
				Swal.fire({
					title: 'Processing...',
					html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
					allowOutsideClick: false,
					showCancelButton: false,
					showConfirmButton: false,
				});

				

				const returnData = {
					barcode: values.itemId, // Using item code as barcode for compatibility
					brand: stock.brand || '',
					category: stock.category || '',
					model: stock.model || '',
					fault: values.fault,
					code:stock.code,
					dealer:stock.suppName,
					datein:stock.date,
					senddate: values.sendDate,
				};
				const { data: insertedData, error: insertError } = await supabase
				.from('returnPhone')
				.insert([returnData])
				.select(); // Return the inserted data
		  
			  if (insertError) {
				console.error('Supabase insert error:', insertError);
				throw insertError;
			  }
				
				Swal.fire({
					icon: 'success',
					title: 'Return Processed Successfully',
					text: `Item has been returned with condition: ${condition}`,
				});
				// Reset form and state
				formik.resetForm();
				setCondition('');
				setIsOpen(false);
				setStock("")
			} catch (error) {
				console.error('Error processing return:', error);
				Swal.fire({
					icon: 'error',
					title: 'Error',
					text: 'An unexpected error occurred. Please try again.',
				});
				setIsSubmitting(false);
			}
		},
	});

	// Reset form and state when modal closes
	const handleModalClose = () => {
		setIsOpen(false);
		formik.resetForm();
		setCondition('');
		setSearchTerm('');
		setStock("")
	};

	return (
		<Modal isOpen={isOpen} aria-hidden={!isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader setIsOpen={handleModalClose} className='p-4'>
				<ModalTitle id=''>{'Return Stock'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4 mt-2'>
					<FormGroup id='itemId' label='Item Code' className='col-md-6'>
						<Input
							type='number'
							placeholder='Search by item code, brand, model, or category...'
							value={formik.values.itemId}
							onChange={handleItemCodeInputChange}
							isValid={formik.isValid}
							isTouched={formik.touched.itemId}
							invalidFeedback={formik.errors.itemId}
							validFeedback='Looks good!'
						/>
					</FormGroup>

					{/* add table hear */}
					{stock && (
						<div className='col-12 mb-3'>
							<table className='table table-bordered table-sm'>
								<thead>
									<tr>
										<th>Code</th>
										<th>item</th>
										<th>Date In</th>
										<th>Dealer</th>
										
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>{stock.code}</td>
										<td> {stock.category}{stock.brand}{stock.model}</td>
										<td>{stock.date}</td>
										<td>{stock.suppName}</td>
									
									</tr>
								</tbody>
							</table>
						</div>
					)}
					
					<FormGroup id='fault' label='Fault' className='col-md-6'>
						<Input
							type='text'
							placeholder='Enter fault ...'
							value={formik.values.fault}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							name='fault'
							isValid={formik.isValid}
							isTouched={formik.touched.fault}
							invalidFeedback={formik.errors.fault}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='sendDate' label='Send Date' className='col-md-6'>
						<Input
							type='date'
							
							value={formik.values.sendDate}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							name='sendDate'
							isValid={formik.isValid}
							isTouched={formik.touched.sendDate}
							invalidFeedback={formik.errors.sendDate}
							validFeedback='Looks good!'
						/>
					</FormGroup>
				</div>
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				<Button color='success' onClick={formik.handleSubmit} isDisable={isSubmitting}>
					{isSubmitting ? 'Processing...' : 'Process Return'}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

StockReturnModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default StockReturnModal;
