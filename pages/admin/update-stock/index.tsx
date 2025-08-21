import React, { useEffect, useRef, useState } from 'react';
import type { NextPage } from 'next';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import Card, { CardBody, CardTitle } from '../../../components/bootstrap/Card';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import { useFormik } from 'formik';
import Swal from 'sweetalert2';
import { useGetItemAcceByIdQuery, useUpdateItemAcceMutation } from '../../../redux/slices/itemManagementAcceApiSlice';
import { useUpdateStockInOutMutation } from '../../../redux/slices/stockInOutAcceApiSlice';
import { supabase } from '../../../lib/supabase';
import useDarkMode from '../../../hooks/useDarkMode';


const Index: NextPage = () => {
	const [itemCode, setItemCode] = useState<string>('');
	const [itemData, setItemData] = useState<any>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [itemLoading, setItemLoading] = useState<boolean>(false);
	const [itemError, setItemError] = useState<boolean>(false);
	const [updateStockInOut] = useUpdateStockInOutMutation();
	const inputRef = useRef<HTMLInputElement>(null);
	const { darkModeStatus } = useDarkMode();

	// Function to search item by code
	const searchItemByCode = async (code: string) => {
		try {
			setItemLoading(true);
			setItemError(false);
			setItemData(null);

			const { data, error } = await supabase
				.from('ItemManagementAcce')
				.select('*')
				.eq('code', code)
				.single();

			if (error) {
				console.error('Error searching item by code:', error);
				setItemError(true);
				return null;
			}

			setItemData(data);
			return data;
		} catch (error) {
			console.error('Error in searchItemByCode:', error);
			setItemError(true);
			return null;
		} finally {
			setItemLoading(false);
		}
	};

	// Function to refetch item data
	const refetchItem = async () => {
		if (itemCode) {
			await searchItemByCode(itemCode);
		}
	};

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	const formik = useFormik({
		initialValues: {
			itemCode: '',
			currentStock: '',
			newStock: '',
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: Record<string, string> = {};
			
			if (!values.itemCode) {
				errors.itemCode = 'Item Code is required';
			}
			
			
			 if (parseInt(values.newStock) < -1) {
				errors.newStock = 'Stock quantity cannot be negative';
			} else if (!/^\d+$/.test(values.newStock)) {
				errors.newStock = 'Stock quantity must be a valid number';
			}
			
			return errors;
		},
		onSubmit: async (values) => {
			if (!itemData) {
				Swal.fire({
					icon: 'error',
					title: 'Error',
					text: 'Please search for a valid item first',
				});
				return;
			}

			try {
				setLoading(true);
				
				// Show processing modal
				Swal.fire({
					title: 'Updating Stock...',
					html: 'Please wait while the stock is being updated.<br><div class="spinner-border" role="status"></div>',
					allowOutsideClick: false,
					showCancelButton: false,
					showConfirmButton: false,
				});
				console.log(values.newStock)
				// Call the API to update stock
				const response = await fetch('/api/stockInOutAcce/route', {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						id: itemData.id,
						quantity: values.newStock,
					}),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || 'Failed to update stock');
				}

				const result = await response.json();
				
				// Refetch item data to show updated quantity
				await refetchItem();
				
				// Show success message
				await Swal.fire({
					icon: 'success',
					title: 'Stock Updated Successfully',
					text: `Stock quantity updated from ${itemData.quantity} to ${values.newStock}`,
				});

				// Reset form
				formik.resetForm();
				setItemData(null);
				setItemCode('');

			} catch (error: any) {
				console.error('Error updating stock:', error);
				await Swal.fire({
					icon: 'error',
					title: 'Update Failed',
					text: error.message || 'Failed to update stock. Please try again.',
				});
			} finally {
				setLoading(false);
			}
		},
	});

	const handleItemSearch = async () => {
		if (!formik.values.itemCode.trim()) {
			Swal.fire({
				icon: 'warning',
				title: 'Missing Item Code',
				text: 'Please enter an Item Code to search',
			});
			return;
		}
		
		const code = formik.values.itemCode.trim();
		setItemCode(code);
		await searchItemByCode(code);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleItemSearch();
		}
	};

	return (
		<PageWrapper>
			<SubHeader>
				<SubHeaderLeft>
					<Icon icon='Update' size='2x' color='primary' />
					<span className='ms-2 fs-4 fw-bold'>Update Stock</span>
				</SubHeaderLeft>
			</SubHeader>
			<Page>
				<div className='row h-100'>
					<div className='col-12'>
						<Card stretch>
							<CardTitle className='d-flex align-items-center'>
								<Icon icon='Inventory' className='me-2' />
								Stock Update Form
							</CardTitle>
							<CardBody>
								<div className='row g-4'>
									{/* Item ID Search Section */}
									<div className='col-12'>
										<Card>
											<CardBody>
												<h5 className='card-title mb-3'>
													<Icon icon='Search' className='me-2' />
													Search Item
												</h5>
												<div className='row g-3'>
													<div className='col-md-8'>
														<FormGroup id='itemCode' label='Item Code'>
															<Input
																ref={inputRef}
																type='text'
																placeholder='Enter Item Code'
																value={formik.values.itemCode}
																onChange={formik.handleChange}
																onKeyPress={handleKeyPress}
																isValid={formik.isValid}
																isTouched={formik.touched.itemCode}
																invalidFeedback={formik.errors.itemCode}
																validFeedback='Looks good!'
															/>
														</FormGroup>
													</div>
													<div className='col-md-4 d-flex align-items-end'>
														<Button
															color='primary'
															isLight
															onClick={handleItemSearch}
															isDisable={itemLoading}
															className='w-100'>
															{itemLoading ? (
																<>
																	<Icon icon='Refresh' className='spin' />
																	<span className='ms-2'>Searching...</span>
																</>
															) : (
																<>
																	<Icon icon='Search' />
																	<span className='ms-2'>Search Item</span>
																</>
															)}
														</Button>
													</div>
												</div>
												
												{itemError && (
													<div className='alert alert-danger mt-3'>
														<Icon icon='Warning' className='me-2' />
														Item not found. Please check the Item Code and try again.
													</div>
												)}
											</CardBody>
										</Card>
									</div>

									{/* Item Details Section */}
									{itemData && (
										<div className='col-12'>
											<Card>
												<CardBody>
													<h5 className='card-title mb-3'>
														<Icon icon='Info' className='me-2' />
														Item Details
													</h5>
													<div className='row g-3'>
														<div className='col-md-3'>
															<label className='form-label fw-bold'>Item Code</label>
															<Input
																type='text'
																value={itemData.code || 'N/A'}
																readOnly
																className='fw-bold'
															/>
														</div>
														<div className='col-md-3'>
															<label className='form-label fw-bold'>Brand</label>
															<Input
																type='text'
																value={itemData.brand || 'N/A'}
																readOnly
																className='fw-bold'
															/>
														</div>
														<div className='col-md-3'>
															<label className='form-label fw-bold'>Model</label>
															<Input
																type='text'
																value={itemData.model || 'N/A'}
																readOnly
																className='fw-bold'
															/>
														</div>
														<div className='col-md-3'>
															<label className='form-label fw-bold'>Category</label>
															<Input
																type='text'
																value={itemData.category || 'N/A'}
																readOnly
																className='fw-bold'
															/>
														</div>
														<div className='col-md-4'>
															<label className='form-label fw-bold'>Type</label>
															<Input
																type='text'
																value={itemData.type || 'N/A'}
																readOnly
																className='fw-bold'
															/>
														</div>
														<div className='col-md-4'>
															<label className='form-label fw-bold text-primary'>
																Current Stock Quantity
															</label>
															<Input
																type='text'
																value={itemData.quantity || '0'}
																readOnly
																className='fw-bold fs-5 text-primary'
															/>
														</div>
														<div className='col-md-4'>
															<label className='form-label fw-bold'>Description</label>
															<Input
																type='text'
																value={itemData.description || 'N/A'}
																readOnly
																className='fw-bold'
															/>
														</div>
													</div>
												</CardBody>
											</Card>
										</div>
									)}

									{/* Stock Update Section */}
									{itemData && (
										<div className='col-12'>
											<Card>
												<CardBody>
													<h5 className='card-title mb-3'>
														<Icon icon='Edit' className='me-2' />
														Update Stock Quantity
													</h5>
													<form onSubmit={formik.handleSubmit}>
														<div className='row g-3'>
															<div className='col-md-6'>
																<FormGroup id='currentStock' label='Current Stock'>
																	<Input
																	type='text'
																	value={itemData.quantity || '0'}
																	readOnly
																	className='fw-bold'
																/>
																</FormGroup>
															</div>
															<div className='col-md-6'>
																<FormGroup id='newStock' label='New Stock Quantity *'>
																	<Input
																		type='number'
																		min={0}
																		placeholder='Enter new stock quantity'
																		value={formik.values.newStock}
																		onChange={formik.handleChange}
																		onBlur={formik.handleBlur}
																		isValid={formik.isValid}
																		isTouched={formik.touched.newStock}
																		invalidFeedback={formik.errors.newStock}
																		validFeedback='Looks good!'
																	/>
																</FormGroup>
															</div>
														</div>
														
														<div className='mt-4 d-flex gap-3'>
															<Button
																type='submit'
																color='success'
																size='lg'
																isDisable={!formik.isValid || loading}>
																{loading ? (
																	<>
																		<Icon icon='Refresh' className='spin' />
																		<span className='ms-2'>Updating...</span>
																	</>
																) : (
																	<>
																		<Icon icon='Save' />
																		<span className='ms-2'>Update Stock</span>
																	</>
																)}
															</Button>
															<Button
																type='button'
																color='secondary'
																size='lg'
																isLight
																onClick={() => {
																	formik.resetForm();
																	setItemData(null);
																	setItemCode('');
																}}>
																<Icon icon='Close' />
																<span className='ms-2'>Clear</span>
															</Button>
														</div>
													</form>
												</CardBody>
											</Card>
										</div>
									)}

									{/* Help Section */}
									<div className='col-12'>
										<Card>
											<CardBody>
												<h6 className='card-title text-muted'>
													<Icon icon='Help' className='me-2' />
													How to use this form:
												</h6>
												<ul className='text-muted mb-0'>
													<li>Enter the Item Code in the search field</li>
													<li>Click "Search Item" or press Enter to find the item</li>
													<li>Review the current item details and stock quantity</li>
													<li>Enter the new stock quantity</li>
													<li>Click "Update Stock" to save changes</li>
												</ul>
											</CardBody>
										</Card>
									</div>
								</div>
							</CardBody>
						</Card>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default Index;
