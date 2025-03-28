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
import {
	useGetCategories1Query,
	useUpdateCategory1Mutation,
} from '../../redux/slices/category1ApiSlice';
import {getBrand, updateBrand} from '../../service/brand1Service'
import {getModel, updateModel} from '../../service/Model1Service'


interface CategoryEditModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const CategoryEditModal: FC<CategoryEditModalProps> = ({ id, isOpen, setIsOpen }) => {
	const { data: categoryData, refetch } = useGetCategories1Query(undefined);
	const [brandData, setBrandData] = useState<any[]>([]);

	useEffect(() => {
		const fetchBrandData = async () => {
			const data = await getBrand();
			setBrandData(data);
		};
		fetchBrandData();
	}, []);
	const [modelData, setModelData] = useState<any[]>([]);

	useEffect(() => {
		const fetchModelData = async () => {
			const data = await getModel();
			setModelData(data);
		};
		fetchModelData();
	}, []);
	const [updateCategory, { isLoading }] = useUpdateCategory1Mutation();

	const categoryToEdit = categoryData?.find((category: any) => category.id === id);

	const formik = useFormik({
		initialValues: {
			name: categoryToEdit?.name || '',
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: { name?: string } = {};
			if (!values.name.trim()) {
				errors.name = 'Required';
			} else if (values.name !== values.name.trim()) {
				errors.name = 'Category name cannot contain leading or trailing spaces';
			} else if (/\s$/.test(values.name)) {
				errors.name = 'Category name cannot end with a space';
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

				const data = {
					name: values.name.trim(),
					status: true,
					id: id,
				};
				await updateCategory(data).unwrap();

				const brandsToUpdate = brandData?.filter(
					(brand: any) => brand.category === categoryToEdit?.name
				);
				if (brandsToUpdate && brandsToUpdate.length > 0) {
					await Promise.all(
						brandsToUpdate.map((brand: any) =>
							updateBrand(brand.id, values.name.trim(), brand.name, brand.status)
						)
					);
				}

				const modelsToUpdate = modelData?.filter(
					(model: any) => model.category === categoryToEdit?.name
				);
				if (modelsToUpdate && modelsToUpdate.length > 0) {
					await Promise.all(
						modelsToUpdate.map((model: any) =>
							updateModel(model.id, model.name, model.description, model.brand, values.name.trim(), model.status)
						)
					);
				}

				refetch();
				await Swal.fire({ icon: 'success', title: 'Category Updated Successfully' });
				formik.resetForm();
				setIsOpen(false);
			} catch (error) {
				await Swal.fire({
					icon: 'error',
					title: 'Error',
					text: 'Failed to update the category. Please try again.',
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
				<ModalTitle id=''>{'Edit category'}</ModalTitle>
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
				</div>
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				<Button color='success' onClick={formik.handleSubmit}>
					Edit Category
				</Button>
			</ModalFooter>
		</Modal>
	);
};
CategoryEditModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default CategoryEditModal;
