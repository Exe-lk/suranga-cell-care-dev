import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Select from '../bootstrap/forms/Select';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import Swal from 'sweetalert2';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import { useGetBrands1Query, useUpdateBrand1Mutation } from '../../redux/slices/brand1ApiSlice';
import { useGetCategories1Query } from '../../redux/slices/category1ApiSlice';
import { getModel, updateModel } from '../../service/Model1Service';

interface BrandEditModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const BrandEditModal: FC<BrandEditModalProps> = ({ id, isOpen, setIsOpen }) => {
	const { data: brandData, refetch } = useGetBrands1Query(undefined);
	const [updateBrand, { isLoading }] = useUpdateBrand1Mutation();
	const {
		data: categories,
		isLoading: categoriesLoading,
		isError,
	} = useGetCategories1Query(undefined);

	const brandToEdit = brandData?.find((brand: any) => brand.id === id);

	const formik = useFormik({
		initialValues: {
			id: '',
			category: brandToEdit?.category || '',
			name: brandToEdit?.name || '',
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: {
				category?: string;
				name?: string;
			} = {};
		
			if (!values.category.trim()) {
				errors.category = 'Required';
			} else if (/\s$/.test(values.category)) {
				errors.category = 'Category name cannot contain trailing spaces';
			}
		
			if (!values.name.trim()) {
				errors.name = 'Required';
			} else if (/\s$/.test(values.name)) {
				errors.name = 'Brand name cannot contain trailing spaces';
			}
			return errors;
		},
	
		onSubmit: async (values) => {
			try {
				await refetch();
						
								const trimmedName = values.name.trim();
								const trimmedCategory  = values.category.trim();
								const existingBrand = brandData?.find(
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
									return;
								}

			  Swal.fire({
				title: 'Processing...',
				html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
				allowOutsideClick: false,
				showCancelButton: false,
				showConfirmButton: false,
			  });
		  
			  // Check if the selected category matches the brand's category before proceeding with the update
			  const modelsToUpdate = (await getModel())?.filter(
				(model: any) =>
				  model.brand === brandToEdit?.name && model.category === brandToEdit?.category
			  );
		  
			  if (modelsToUpdate && modelsToUpdate.length > 0) {
				// Update models with the new brand name if both brand and category match
				await Promise.all(
				  modelsToUpdate.map((model: any) =>
					updateModel(
					  model.id,
					  model.name,
					  model.description,
					  values.name, // Updated brand name
					  model.category,
					  model.status
					)
				  )
				);
			  } else {
				// If no matching models were found, show a warning message
				await Swal.fire({
				  icon: 'warning',
				  title: 'No Matching Models',
				  text: 'No models found with the same brand and category. Please check the details.',
				});
				// return;
			  }
		  
			  const data = {
				category: values.category,
				name: values.name,
				status: true,
				id: id,
			  };
		  
			  // Update the brand details
			  await updateBrand(data).unwrap();
		  
			  // Refetch the updated brand data
			  refetch();
		  
			  await Swal.fire({
				icon: 'success',
				title: 'Brand Updated Successfully',
			  });
			  formik.resetForm();
			  setIsOpen(false);
			} catch (error) {
			  console.error('Error updating brand: ', error);
			  await Swal.fire({
				icon: 'error',
				title: 'Error',
				text: 'Failed to update the brand. Please try again.',
			  });
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
				<ModalTitle id=''>{'Edit Brand'}</ModalTitle>
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
							{categories?.map((category: { id: string; name: string },index : any) => (
								<option key={index} value={category.name}> 
									{category.name}
								</option>
							))}
						</Select>
					</FormGroup>
					<FormGroup id='name' label='Brand Name' className='col-md-6'>
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
				</div>
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				<Button color='success' onClick={formik.handleSubmit}>
					Edit Brand
				</Button>
			</ModalFooter>
		</Modal>
	);
};

BrandEditModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default BrandEditModal;
