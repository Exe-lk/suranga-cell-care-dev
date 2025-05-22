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
	const [stockIn, setStockIn] = useState<StockIn>({
		cid: '',
		brand: '',
		model: '',
		category: '',
		quantity: '',
		date: '',
		suppName: '',
		cost: '',
		code: '',
		stock: 'stockIn',
		boxNumber: '',
		description: '',
		status: true,
		barcode: 0,
		printlable: 0,
	});
	const { data: itemDiss } = useGetItemDissQuery(undefined);
	const { refetch } = useGetItemDissQuery(undefined);
	const [updateSubStockInOut] = useUpdateSubStockInOutMutation();
	const [condition, setCondition] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Function to get stock item details from Supabase
	const getStockItemByBarcode = async (barcode: string) => {
		try {
			const { data, error } = await supabase
				.from('StockDis')
				.select('*')
				.eq('barcode', barcode)
				.single();

			if (error) {
				console.error('Error fetching stock item:', error);
				return null;
			}

			return data;
		} catch (error) {
			console.error('Error in getStockItemByBarcode:', error);
			return null;
		}
	};

	const formik = useFormik({
		initialValues: {
			itemId: '',
			condition: '',
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: {
				itemId?: string;
				condition?: string;
			} = {};

			if (!values.itemId) {
				errors.itemId = 'Barcode/Item ID is required';
			}
			if (!condition) {
				errors.condition = 'Condition is required';
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

				// Get the barcode from form
				const barcode = values.itemId?.toString();
				
				// Get stock item details
				const stockItem = await getStockItemByBarcode(barcode);
				
				if (!stockItem) {
					Swal.fire({
						icon: 'error',
						title: 'Item Not Found',
						text: `Could not find item with barcode: ${barcode}`,
					});
					setIsSubmitting(false);
					return;
				}

				// Format current date
				const now = new Date();
				const month = now.toLocaleString('default', { month: 'short' });
				const day = now.getDate();
				const year = now.getFullYear();
				const formattedDate = `${month} ${day} ${year}`;

				// Prepare data for saving to returnDisplay table
				const returnData = {
					barcode: values.itemId,
					brand: stockItem.brand || '',
					category: stockItem.category || '',
					model: stockItem.model || '',
					condition: condition,
					date: formattedDate,
				};

				// Save return data to Supabase using the service
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

				// Update item quantity if condition is 'Good'
				if (condition === 'Good') {
					// Find the matching item in the inventory
					const prefix = values.itemId?.toString().slice(0, 4);
					const matchedItem = itemDiss?.find(
						(item: { code: string; quantity: string }) =>
							item.code.startsWith(prefix)
					);

					if (matchedItem) {
						// Update quantity (increase by 1)
						await updateQuantity1(matchedItem.id, Number(matchedItem.quantity) + 1);
					}

					// Update the stock item status
					try {
						const { error } = await supabase
							.from('StockDis')
							.update({ status: false })
							.eq('barcode', barcode);

						if (error) {
							console.error('Error updating stock item status:', error);
						}
					} catch (updateError) {
						console.error('Error in update operation:', updateError);
					}
				}

				// Refresh the items data
				refetch();
				
				// Show success message
				Swal.fire({
					icon: 'success',
					title: 'Return Processed Successfully',
					text: `Item has been returned with condition: ${condition}`,
				});

				// Reset form
				formik.resetForm();
				setCondition('');
				setIsSubmitting(false);
				setIsOpen(false);
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

	return (
		<Modal isOpen={isOpen} aria-hidden={!isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader
				setIsOpen={() => {
					setIsOpen(false);
					formik.resetForm();
					setCondition('');
				}}
				className='p-4'>
				<ModalTitle id=''>{'Return Stock'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4 mt-2'>
					<FormGroup id='itemId' label='Item Barcode/ID' className='col-md-6'>
						<Input
							type='text'
							placeholder='Enter Item Barcode/ID'
							value={formik.values.itemId}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.itemId}
							invalidFeedback={formik.errors.itemId}
							validFeedback='Looks good!'
						/>
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
