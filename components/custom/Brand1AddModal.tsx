import React, { FC, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import { useAddBrand1Mutation } from '../../redux/slices/brand1ApiSlice';
import { useGetBrands1Query } from '../../redux/slices/brand1ApiSlice';
import { useGetCategories1Query } from '../../redux/slices/category1ApiSlice';
import Swal from 'sweetalert2';
import Select from '../bootstrap/forms/Select';

interface BrandAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const BrandAddModal: FC<BrandAddModalProps> = ({ id, isOpen, setIsOpen }) => {
	const [addBrand, { isLoading }] = useAddBrand1Mutation();
	const { data: BrandData, refetch } = useGetBrands1Query(undefined);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const {
		data: categories,
		isLoading: categoriesLoading,
		isError,
	} = useGetCategories1Query(undefined);

	const formik = useFormik({
		initialValues: {
			category: '',
			name: '',
			status: true,
		},
		validate: (values) => {
			const errors: {
				category?: string;
				name?: string;
			} = {};
			if (!values.category.trim()) {
				errors.category = 'Required';
			} else if (values.category !== values.category.trim()) {
				errors.category = 'Category name cannot contain leading or trailing spaces';
			}

			if (!values.name.trim()) {
				errors.name = 'Required';
			} else if (values.name !== values.name.trim()) {
				errors.name = 'Brand name cannot contain leading or trailing spaces';
			}
			return errors;
		},
		onSubmit: async (values) => {
			if (isSubmitting) return; // Prevent multiple submissions
			setIsSubmitting(true); // Set submitting state to true
			
			try {
				await refetch();
		
				const trimmedName = values.name.trim();
				const trimmedCategory = values.category.trim();
				
				if (!trimmedName || !trimmedCategory) {
					await Swal.fire({
						icon: 'error',
						title: 'Validation Error',
						text: 'Both brand name and category are required.',
					});
					setIsSubmitting(false); // Reset submitting state
					return;
				}
				
				const existingBrand = BrandData?.find(
					(brand: { name: string; category: string }) =>
						brand.name.toLowerCase() === trimmedName.toLowerCase() &&
						brand.category.toLowerCase() === trimmedCategory.toLowerCase()				
				);
				
				if (existingBrand) {
					await Swal.fire({
						icon: 'error',
						title: 'Duplicate Brand',
						text: 'A Brand with this name already exists.',
					});
					setIsSubmitting(false); // Reset submitting state
					return;
				}

				const processingSwal = Swal.fire({
					title: 'Processing...',
					html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
					allowOutsideClick: false,
					showCancelButton: false,
					showConfirmButton: false,
				});
				
				try {
					const response = await addBrand({
						name: trimmedName, 
						category: trimmedCategory,
						status: true
					}).unwrap();
					
					Swal.close();
					
					await Swal.fire({
						icon: 'success',
						title: 'Brand Created Successfully',
					});
					formik.resetForm();
					setIsOpen(false);
					refetch();
				} catch (error:any) {
					Swal.close();
					
					console.error('Error during brand creation: ', error);
					await Swal.fire({
						icon: 'error',
						title: 'Error',
						text: error.data?.details || error.data?.error || 'Failed to add the brand. Please try again.',
					});
				}
			} catch (error) {
				Swal.close();
				
				console.error('Error during form submission: ', error);
				await Swal.fire({
					icon: 'error',
					title: 'Error',
					text: 'An unexpected error occurred. Please try again later.',
				});
			} finally {
				setIsSubmitting(false); // Reset submitting state in all cases
			}
		},
	});

	return (
		<Modal isOpen={isOpen} aria-hidden={!isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader
				setIsOpen={() => {
					setIsOpen(false);
					formik.resetForm();
				}}
				className='p-4'>
				<ModalTitle id=''>{'New Brand'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='category' label='Category' className='col-md-6'>
						<Select
							id='category'
							name='category'
							ariaLabel='Category'
							onChange={formik.handleChange}
							value={formik.values.category}
							onBlur={formik.handleBlur}
							className={`form-control ${
								formik.touched.category && formik.errors.category
									? 'is-invalid'
									: ''
							}`}>
							<option value=''>Select a category</option>
							{categoriesLoading && <option>Loading categories...</option>}
							{isError && <option>Error fetching categories</option>}
							{categories?.map(
								(category: { id: string; name: string }, index: any) => (
									<option key={index} value={category.name}>
										{category.name}
									</option>
								),
							)}
						</Select>
						{formik.touched.category && formik.errors.category ? (
							<div className='invalid-feedback'>{formik.errors.category}</div>
						) : (
							<></>
						)}
					</FormGroup>
					<FormGroup id='name' label='Brand name' className='col-md-6'>
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
				</div>
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				<Button 
					color='success' 
					onClick={formik.handleSubmit} 
					isDisable={isSubmitting || formik.isSubmitting || isLoading}>
					{isSubmitting ? 'Creating...' : 'Create Brand'}
				</Button>
			</ModalFooter>
		</Modal>
	);
};
BrandAddModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default BrandAddModal;
