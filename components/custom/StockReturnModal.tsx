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
	
	// New state for item code dropdown
	const [availableItems, setAvailableItems] = useState<any[]>([]);
	const [filteredItems, setFilteredItems] = useState<any[]>([]);
	const [showDropdown, setShowDropdown] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [isLoadingItems, setIsLoadingItems] = useState(false);

	// Function to fetch available items from ItemManagementDis table
	const fetchAvailableItems = async () => {
		try {
			setIsLoadingItems(true);
			const { data, error } = await supabase
				.from('ItemManagementDis')
				.select('id, code, brand, model, category, quantity')
				.eq('status', true) // Only get active items
				.gt('quantity', 0) // Only items with quantity > 0
				.order('code', { ascending: true });

			if (error) {
				console.error('Error fetching items:', error);
				return;
			}

			setAvailableItems(data || []);
			setFilteredItems(data || []);
		} catch (error) {
			console.error('Error in fetchAvailableItems:', error);
		} finally {
			setIsLoadingItems(false);
		}
	};

	// Fetch items when modal opens
	useEffect(() => {
		if (isOpen) {
			fetchAvailableItems();
		}
	}, [isOpen]);

	// Filter items based on search term
	useEffect(() => {
		if (!searchTerm) {
			setFilteredItems(availableItems);
		} else {
			const filtered = availableItems.filter(item =>
				item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.category.toLowerCase().includes(searchTerm.toLowerCase())
			);
			setFilteredItems(filtered);
		}
	}, [searchTerm, availableItems]);

	// Handle item code input change
	const handleItemCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchTerm(value);
		formik.setFieldValue('itemId', value);
		setShowDropdown(true);
	};

	// Handle item code selection from dropdown
	const handleItemCodeSelect = (code: string) => {
		setSearchTerm(code);
		formik.setFieldValue('itemId', code);
		setShowDropdown(false);
	};

	// Function to get item details by code from ItemManagementDis
	const getItemByCode = async (code: string) => {
		try {
			const { data, error } = await supabase
				.from('ItemManagementDis')
				.select('*')
				.eq('code', code)
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

				// Get the item code from form
				const itemCode = values.itemId?.toString();
				
				// Get item details
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

				// Format current date
				const now = new Date();
				const month = now.toLocaleString('default', { month: 'short' });
				const day = now.getDate();
				const year = now.getFullYear();
				const formattedDate = `${month} ${day} ${year}`;

				// Prepare data for saving to returnDisplay table
				const returnData = {
					barcode: values.itemId, // Using item code as barcode for compatibility
					brand: item.brand || '',
					category: item.category || '',
					model: item.model || '',
					condition: condition,
					reason: values.reason,
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
					// Update quantity (increase by 1)
					await updateQuantity1(item.id, Number(item.quantity) + 1);
				}

				// Refresh the items data
				refetch();
				
				// Show success message
				Swal.fire({
					icon: 'success',
					title: 'Return Processed Successfully',
					text: `Item has been returned with condition: ${condition}`,
				});

				// Reset form and state
				formik.resetForm();
				setCondition('');
				setSearchTerm('');
				setShowDropdown(false);
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

	// Reset form and state when modal closes
	const handleModalClose = () => {
		setIsOpen(false);
		formik.resetForm();
		setCondition('');
		setSearchTerm('');
		setShowDropdown(false);
	};

	return (
		<Modal isOpen={isOpen} aria-hidden={!isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader
				setIsOpen={handleModalClose}
				className='p-4'>
				<ModalTitle id=''>{'Return Stock'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4 mt-2'>
					<FormGroup id='itemId' label='Item Code' className='col-md-6'>
						<div style={{ position: 'relative' }}>
							<Input
								type='text'
								placeholder='Search by item code, brand, model, or category...'
								value={searchTerm}
								onChange={handleItemCodeInputChange}
								onFocus={() => setShowDropdown(true)}
								onBlur={(e) => {
									// Delay hiding dropdown to allow click on options
									setTimeout(() => setShowDropdown(false), 200);
								}}
								isValid={formik.isValid}
								isTouched={formik.touched.itemId}
								invalidFeedback={formik.errors.itemId}
								validFeedback='Looks good!'
							/>
							
							{/* Dropdown for item code suggestions */}
							{showDropdown && (
								<div 
									style={{
										position: 'absolute',
										top: '100%',
										left: 0,
										right: 0,
										border: '1px solid #dee2e6',
										borderRadius: '0.375rem',
										maxHeight: '300px',
										overflowY: 'auto',
										zIndex: 1000,
										boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'
									}}
								>
									{isLoadingItems ? (
										<div className='p-3 text-center'>
											<div className="spinner-border spinner-border-sm" role="status">
												<span className="visually-hidden">Loading...</span>
											</div>
											<div className='mt-2'>Loading items...</div>
										</div>
									) : filteredItems.length > 0 ? (
										<>
											<div className='p-2 bg-light border-bottom'>
												<small className='text-muted'>
													{filteredItems.length} available item{filteredItems.length !== 1 ? 's' : ''}
												</small>
											</div>
											{filteredItems.slice(0, 10).map((item, index) => (
												<div
													key={index}
													className='p-3 border-bottom hover-bg-light cursor-pointer'
													style={{ cursor: 'pointer' }}
													onMouseDown={(e) => e.preventDefault()} // Prevent blur
													onClick={() => handleItemCodeSelect(item.code)}
													onMouseEnter={(e) => {
														e.currentTarget.style.backgroundColor = '#f8f9fa';
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.backgroundColor = 'transparent';
													}}
												>
													<div className='d-flex justify-content-between align-items-start'>
														<div>
															<div className='fw-bold text-primary'>{item.code}</div>
															<div className='small text-muted'>
																{item.brand} - {item.model}
															</div>
															<div className='small text-secondary'>{item.category}</div>
															<div className='small text-success'>Qty: {item.quantity}</div>
														</div>
													</div>
												</div>
											))}
											{filteredItems.length > 10 && (
												<div className='p-2 text-center text-muted'>
													<small>Showing first 10 results. Type to filter more...</small>
												</div>
											)}
										</>
									) : (
										<div className='p-3 text-center text-muted'>
											{searchTerm ? 'No matching items found' : 'No items available'}
										</div>
									)}
								</div>
							)}
						</div>
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
