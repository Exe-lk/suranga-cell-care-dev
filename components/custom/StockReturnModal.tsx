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
	quantity: any;
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

const StockReturnModal: FC<StockAddModalProps> = ({ id, isOpen, setIsOpen, quantity }) => {
	const { refetch } = useGetItemDissQuery(undefined);
	const [condition, setCondition] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [stock, setStock] = useState<any>('');

	// Handle item code input change
	const handleItemCodeInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		formik.setFieldValue('itemId', value);
		if (value.length >= 8) {
			const { data, error }: any = await supabase
				.from('Stock')
				.select('id, code, brand, model, category, quantity')
				.eq('barcode', value.slice(0, 8));
			setStock(data[0]);
		}
	};

	// Function to get item details by code from ItemManagementDis
	const getItemByCode = async (code: string) => {
		try {
			const { data, error } = await supabase
				.from('ItemManagementDis')
				.select('*')
				.eq('code', code.slice(0, 4))
				.single();

			if (error) {
				console.error('Error fetching item:', error);
				return null;
			}

			return data;
		} catch (error) {
			console.error('Error in getItemByCode:', error);
			return null;
		}
	};

	const formik = useFormik({
		initialValues: {
			itemId: '',
			condition: '',
			reason: '',
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: {
				itemId?: string;
				condition?: string;
				reason?: string;
			} = {};

			if (!values.itemId) {
				errors.itemId = 'Item Code is required';
			}
			if (!condition) {
				errors.condition = 'Condition is required';
			}
			if (!values.reason) {
				errors.reason = 'Reason is required';
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

				const itemCode = values.itemId?.toString();
				const item = await getItemByCode(itemCode);
				if (!item) {
					Swal.fire({
						icon: 'error',
						title: 'Item Not Found',
						text: `Could not find item with code: ${itemCode}`,
					});
					setIsSubmitting(false);
					return;
				}
				const now = new Date();
				const month = now.toLocaleString('default', { month: 'short' });
				const day = now.getDate();
				const year = now.getFullYear();
				const formattedDate = `${month} ${day} ${year}`;

				const returnData = {
					barcode: values.itemId, // Using item code as barcode for compatibility
					brand: item.brand || '',
					category: item.category || '',
					model: item.model || '',
					condition: condition,
					reason: values.reason,
					date: formattedDate,
				};

				const success = await saveReturnData1(returnData);
				if (!success) {
					Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Failed to save return data to database.',
					});
					setIsSubmitting(false);
					return;
				}
				if (condition === 'Good') {
					await updateQuantity1(item.id, Number(item.quantity) + 1);
					await supabase
						.from('subStock')
						.update({ status: false })
						.eq('barcode', values.itemId);
				}
				refetch();
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
										<th>Brand</th>
										<th>Model</th>
										<th>Category</th>
										<th>Quantity</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>{stock.code}</td>
										<td>{stock.brand}</td>
										<td>{stock.model}</td>
										<td>{stock.category}</td>
										<td>{stock.quantity}</td>
									</tr>
								</tbody>
							</table>
						</div>
					)}
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
								checked={condition === 'Good'}
							/>
							<Checks
								id='Bad'
								label='Bad'
								name='Bad'
								value='Bad'
								onChange={(e: any) => {
									setCondition(e.target.value);
									formik.setFieldValue('condition', e.target.value);
								}}
								checked={condition === 'Bad'}
							/>
						</ChecksGroup>
					</FormGroup>
					<FormGroup id='reason' label='Reason' className='col-md-12'>
						<Input
							type='text'
							placeholder='Enter return reason...'
							value={formik.values.reason}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							name='reason'
							isValid={formik.isValid}
							isTouched={formik.touched.reason}
							invalidFeedback={formik.errors.reason}
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
