import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import Swal from 'sweetalert2';
import { useAddCategory1Mutation } from '../../redux/slices/category1ApiSlice';
import { useGetCategories1Query } from '../../redux/slices/category1ApiSlice';

interface CategoryEditModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const CategoryAddModal: FC<CategoryEditModalProps> = ({ id, isOpen, setIsOpen }) => {
	const [addCategory, { isLoading }] = useAddCategory1Mutation();
	const { data: categoryData,refetch } = useGetCategories1Query(undefined);
	console.log(categoryData);

	// const formik = useFormik({
	// 	initialValues: {
	// 		name: '',
	// 		status: true,
	// 	},
	// 	validate: (values) => {
	// 		const errors: {
	// 			name?: string;
	// 		} = {};
	// 		if (!values.name) {
	// 			errors.name = 'Required';
	// 		}
	// 		return errors;
	// 	},
	// 	onSubmit: async (values) => {
	// 		try {
	// 			await refetch();
		
	// 			const existingCategory = categoryData?.find(
	// 				(category: { name: string }) => category.name.toLowerCase() === values.name.toLowerCase()
	// 			);
		
	// 			if (existingCategory) {
	// 				await Swal.fire({
	// 					icon: 'error',
	// 					title: 'Duplicate Category',
	// 					text: 'A category with this name already exists.',
	// 				});
	// 				return;
	// 			}
		
	// 			Swal.fire({
	// 				title: 'Processing...',
	// 				html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
	// 				allowOutsideClick: false,
	// 				showCancelButton: false,
	// 				showConfirmButton: false,
	// 			});
		
	// 			const response: any = await addCategory(values).unwrap();
		
	// 			refetch();
		
	// 			await Swal.fire({
	// 				icon: 'success',
	// 				title: 'Category Created Successfully',
	// 			});
		
	// 			formik.resetForm();
	// 			setIsOpen(false);
	// 		} catch (error) {
	// 			console.error('Error during handleSubmit:', error);
	// 			await Swal.fire({
	// 				icon: 'error',
	// 				title: 'Error',
	// 				text: 'Failed to add the category. Please try again.',
	// 			});
	// 		}
	// 	},		
		
	// });

	const formik = useFormik({
		initialValues: {
			name: '',
			status: true,
		},
		validate: (values) => {
			const errors: {
				name?: string;
			} = {};
	
			if (!values.name.trim()) {
				errors.name = 'Required';
			} else if (values.name !== values.name.trim()) {
				errors.name = 'Category name cannot contain leading or trailing spaces';
			}
	
			return errors;
		},
		onSubmit: async (values) => {
			try {
				await refetch();
	
				const trimmedName = values.name.trim();
				const existingCategory = categoryData?.find(
					(category: { name: string }) => category.name.toLowerCase() === trimmedName.toLowerCase()
				);
	
				if (existingCategory) {
					await Swal.fire({
						icon: 'error',
						title: 'Duplicate Category',
						text: 'A category with this name already exists.',
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
	
				const response: any = await addCategory({ ...values, name: trimmedName }).unwrap();
	
				refetch();
	
				await Swal.fire({
					icon: 'success',
					title: 'Category Created Successfully',
				});
	
				formik.resetForm();
				setIsOpen(false);
			} catch (error) {
				console.error('Error during handleSubmit:', error);
				await Swal.fire({
					icon: 'error',
					title: 'Error',
					text: 'Failed to add the category. Please try again.',
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
				<ModalTitle id=''>{'New Category'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='name' label='Category Name' className='col-md-6'>
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
				<Button color='success' onClick={formik.handleSubmit}>
				Create Category
				</Button>
			</ModalFooter>
		</Modal>
	);
};
CategoryAddModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default CategoryAddModal;
