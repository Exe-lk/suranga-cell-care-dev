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
import { useGetBrandsQuery, useUpdateBrandMutation } from '../../redux/slices/brandApiSlice';
import { useGetCategoriesQuery } from '../../redux/slices/categoryApiSlice';
import Select from '../bootstrap/forms/Select';

interface BrandEditModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const BrandEditModal: FC<BrandEditModalProps> = ({ id, isOpen, setIsOpen }) => {
	const { data: brandData, refetch } = useGetBrandsQuery(undefined);
	const [updateBrand, { isLoading }] = useUpdateBrandMutation();
	const {
		data: categories,
		isLoading: categoriesLoading,
		isError,
	} = useGetCategoriesQuery(undefined);
	const brandToEdit = brandData?.find((brand: any) => brand.id === id);
	const { data: BrandData } = useGetBrandsQuery(undefined);

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
						category: values.category,
						name: values.name,
						status: true,
						id: id,
					};
					await updateBrand(data).unwrap();
					refetch();
					await Swal.fire({
						icon: 'success',
						title: 'Brand Updated Successfully',
					});
					formik.resetForm();
					setIsOpen(false);
				} catch (error) {
					await Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Failed to update the brand. Please try again.',
					});
				}
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				alert('An error occurred during file upload. Please try again later.');
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
							{categories?.map(
								(category: { id: string; name: string }, index: any) => (
									<option key={index} value={category.name}>
										{category.name}
									</option>
								),
							)}
						</Select>
					</FormGroup>
					<FormGroup id='name' label='Brand name' className='col-md-6'>
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
