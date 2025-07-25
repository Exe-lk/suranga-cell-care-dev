import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import showNotification from '../extras/showNotification';
import Icon from '../icon/Icon';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestore, storage } from '../../firebaseConfig';
import Swal from 'sweetalert2';
import { useGetModelsQuery, useUpdateModelMutation } from '../../redux/slices/modelApiSlice';
import { useGetBrandsQuery } from '../../redux/slices/brandApiSlice';
import Select from '../bootstrap/forms/Select';
import { useGetCategoriesQuery } from '../../redux/slices/categoryApiSlice';

interface ModelEditModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const ModelEditModal: FC<ModelEditModalProps> = ({ id, isOpen, setIsOpen }) => {
	const { data: modelData, refetch } = useGetModelsQuery(undefined);
	const [updateModel, { isLoading }] = useUpdateModelMutation();
	const [filteredBrands, setFilteredBrands] = useState([]);
	const { data: brands, isLoading: brandsLoading, isError } = useGetBrandsQuery(undefined);
	const {
		data: categories,
		isLoading: categoriesLoading,
		isError: categoriesError,
	} = useGetCategoriesQuery(undefined);
	const modelToEdit = modelData?.find((model: any) => model.id === id);
	const { data: ModelData } = useGetModelsQuery(undefined);

	const formik = useFormik({
		initialValues: {
			id: '',
			name: modelToEdit?.name || '',
			category: modelToEdit?.category || '',
			brand: modelToEdit?.brand || '',
			description: modelToEdit?.description || '',
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: {
				name?: string;
				category?: string;
				brand?: string;
				description?: string;
			} = {};
			if (!values.name) {
				errors.name = 'Required';
			  } else if (/\s$/.test(values.name)) {  // Check if the name ends with space
				errors.name = 'Model name cannot end with a space';
			  }
			  if (!values.category) {
				errors.category = 'Required';
			  }
			  if (!values.brand) {
				errors.brand = 'Required';
			  }
			return errors;
		},
		onSubmit: async (values) => {
			const trimmedValues = {
				...values,
				category: values.category.trim(),  
				brand: values.brand.trim(),
				name: values.name.trim(),
				description: values.description.trim(),
			};
			try {
				await refetch();
										
												const existingModel = ModelData?.find(
													(model: { id: string; name: string; category: string; brand: string }) =>
														model.id !== id && // Exclude the current model being edited
														model.name.toLowerCase() === trimmedValues.name.toLowerCase() &&
														model.category.toLowerCase() === trimmedValues.category.toLowerCase() &&
														model.brand.toLowerCase() === trimmedValues.brand.toLowerCase(),
												);
												
										
												if (existingModel) {
													await Swal.fire({
														icon: 'error',
														title: 'Duplicate Model',
														text: 'A model with this name already exists.',
													});
													return;
												}
				
				const process = Swal.fire({
					title: 'Processing...',
					html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
					allowOutsideClick: false,
					showCancelButton: false,
					showConfirmButton: false,
				});
				try {
					const data = {
						name: values.name,
						category: values.category,
						brand: values.brand,
						description: values.description,
						status: true,
						id: id,
					};
					await updateModel(data).unwrap();
					refetch();
					await Swal.fire({
						icon: 'success',
						title: 'Model Updated Successfully',
					});
					formik.resetForm();
					setIsOpen(false);
				} catch (error) {
					await Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Failed to update the model. Please try again.',
					});
				}
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				alert('An error occurred during file upload. Please try again later.');
			}
		},
	});

	useEffect(() => {
		if (formik.values.category) {
			const categoryBrands = brands?.filter(
				(brand: { category: string }) => brand.category === formik.values.category,
			);
			setFilteredBrands(categoryBrands);

		if (categoryBrands?.length === 0) {
			// Reset the brand field
			formik.setFieldValue('brand', ''); 
		  }
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
				<ModalTitle id=''>{'Edit Model'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='name' label='Name' className='col-md-6'>
						<Input
							name='name'
							value={formik.values.name}
							onChange={formik.handleChange}
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
					</FormGroup>
					<FormGroup id='brand' label='Brand Name' className='col-md-6'>
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
					</FormGroup>
					<FormGroup id='description' label='Description' className='col-12'>
						<Input
							name='description'
							value={formik.values.description}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.description}
							invalidFeedback={formik.errors.description}
							validFeedback='Looks good!'
							placeholder='Enter model description...'
						/>
					</FormGroup>
				</div>
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				<Button color='success' onClick={formik.handleSubmit}>
					Edit Model
				</Button>
			</ModalFooter>
		</Modal>
	);
};
ModelEditModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default ModelEditModal;
