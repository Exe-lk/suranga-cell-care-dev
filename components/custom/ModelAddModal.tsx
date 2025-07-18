import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import { useAddModelMutation } from '../../redux/slices/modelApiSlice';
import { useGetModelsQuery } from '../../redux/slices/modelApiSlice';
import Swal from 'sweetalert2';
import { useGetBrandsQuery } from '../../redux/slices/brandApiSlice';
import Select from '../bootstrap/forms/Select';
import { useGetCategoriesQuery } from '../../redux/slices/categoryApiSlice';


interface ModelAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const ModelAddModal: FC<ModelAddModalProps> = ({ id, isOpen, setIsOpen }) => {
	const [addModel, { isLoading }] = useAddModelMutation();
	const { refetch } = useGetModelsQuery(undefined);
	const [filteredBrands, setFilteredBrands] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { data: brands, isLoading: brandsLoading, isError } = useGetBrandsQuery(undefined);
	const {
		data: categories,
		isLoading: categoriesLoading,
		isError: categoriesError,
	} = useGetCategoriesQuery(undefined);
	const { data: ModelData } = useGetModelsQuery(undefined);

	const formik = useFormik({
		initialValues: {
			name: '',
			category: '',
			brand: '',
			description: '',
			status: true,
		},
		validate: (values) => {
			const errors: {
				name?: string;
				category?: string;
				brand?: string;
				description?: string;
			} = {};
			if (!values.name) {
				errors.name = 'Required';
			  } else if (/\s$/.test(values.name)) {  
				errors.name = 'Model Name cannot have trailing spaces';
			  }
		  
			  if (!values.category) {
				errors.category = 'Required';
			  } else if (/\s$/.test(values.category)) {
				errors.category = 'Category cannot have trailing spaces';
			  }
		  
			  if (!values.brand) {
				errors.brand = 'Required';
			  }
		
			return errors;
		},
		onSubmit: async (values) => {
			if (isSubmitting) return; // Prevent multiple submissions
			setIsSubmitting(true); // Set submitting state to true
			
			const trimmedValues = {
				...values,
				category: values.category.trim(),  
				brand: values.brand.trim(),
				name: values.name.trim(),
			};
			try {
				await refetch();

				const process = Swal.fire({
					title: 'Processing...',
					html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
					allowOutsideClick: false,
					showCancelButton: false,
					showConfirmButton: false,
				});
				try {
					const response: any = await addModel({
						...values,
						brand: values.brand,
						category: values.category,
					}).unwrap();
					refetch();
					await Swal.fire({
						icon: 'success',
						title: 'Model Created Successfully',
					});
					formik.resetForm();
					setIsOpen(false);
				} catch (error) {
					console.error('Error during handleSubmit: ', error);
					await Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Failed to add the model. Please try again.',
					});
				}
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				Swal.close;
				alert('An error occurred during file upload. Please try again later.');
			} finally {
				setIsSubmitting(false); // Reset submitting state
			}
		},
	});

	useEffect(() => {
		if (formik.values.category) {
			const categoryBrands = brands?.filter(
				(brand: { category: string }) => brand.category === formik.values.category,
			);
			setFilteredBrands(categoryBrands);
		} else {
			setFilteredBrands(brands);
		}
	}, [formik.values.category, brands]);

	return (
		<Modal isOpen={isOpen} aria-hidden={!isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader
				setIsOpen={() => {
					setIsOpen(false);
					formik.resetForm();
				}}
				className='p-4'>
				<ModalTitle id=''>{'New Model'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='name' label='Model Name' className='col-md-6'>
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
					<FormGroup id='category' label='Category' className='col-md-6'>
						<Select
							id='category'
							name='category'
							ariaLabel='category'
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
							{categoriesError && <option>Error fetching categories</option>}
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
					<FormGroup id='brand' label='Brand' className='col-md-6'>
						<Select
							id='brand'
							name='brand'
							ariaLabel='brand'
							onChange={formik.handleChange}
							value={formik.values.brand}
							onBlur={formik.handleBlur}
							className={`form-control ${
								formik.touched.brand && formik.errors.brand ? 'is-invalid' : ''
							}`}>
							<option value=''>Select a brand</option>
							{brandsLoading && <option>Loading brands...</option>}
							{isError && <option>Error fetching brands</option>}
							{filteredBrands?.map(
								(brand: { id: string; name: string }, index: any) => (
									<option key={index} value={brand.name}>
										{brand.name}
									</option>
								),
							)}
						</Select>
						{formik.touched.brand && formik.errors.brand ? (
							<div className='invalid-feedback'>{formik.errors.brand}</div>
						) : (
							<></>
						)}
					</FormGroup>
					<FormGroup id='description' label='Description' className='col-md-12'>
						<Input
							type='text'
							placeholder='Enter model description...'
							onChange={formik.handleChange}
							value={formik.values.description}
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
				<Button 
					color='success' 
					onClick={formik.handleSubmit} 
					isDisable={isSubmitting || formik.isSubmitting || isLoading}>
					{isSubmitting ? 'Creating...' : 'Create Model'}
				</Button>
			</ModalFooter>
		</Modal>
	);
};
ModelAddModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default ModelAddModal;
