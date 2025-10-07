import React, { FC, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import showNotification from '../extras/showNotification';
import Icon from '../icon/Icon';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import { collection, addDoc, doc, setDoc, getDocs } from 'firebase/firestore';
import { firestore, storage } from '../../firebaseConfig';
import Swal from 'sweetalert2';
import Select from '../bootstrap/forms/Select';
import Option, { Options } from '../bootstrap/Option';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import Checks, { ChecksGroup } from '../bootstrap/forms/Checks';
import { useGetCategories1Query } from '../../redux/slices/category1ApiSlice';
import {
	useUpdateItemAcceMutation,
	useGetItemAccesQuery,
} from '../../redux/slices/itemManagementAcceApiSlice';
import { useGetBrands1Query } from '../../redux/slices/brand1ApiSlice';
import { useGetModels1Query } from '../../redux/slices/model1ApiSlice';

interface ItemAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

interface Category {
	categoryname: string;
}

const ItemAddModal: FC<ItemAddModalProps> = ({ id, isOpen, setIsOpen }) => {
	const [imageurl, setImageurl] = useState<any>(null);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [selectedCategory, setSelectedCategory] = useState<string>('');
	const [selectedBrand, setSelectedBrand] = useState<string>('');
	const {
		data: categories,
		isLoading: categoriesLoading,
		isError,
	} = useGetCategories1Query(undefined);
	const { data: brands } = useGetBrands1Query(undefined);
	const { data: models } = useGetModels1Query(undefined);
	const { data: itemAcces, refetch } = useGetItemAccesQuery(undefined);
	const itemAcceToEdit = itemAcces?.find((itemAcce: any) => itemAcce.id === id);
	const [updateItemAcce, { isLoading }] = useUpdateItemAcceMutation();

	const formik = useFormik(
		{

		enableReinitialize: true,
		initialValues: {
			id: '',
			code: itemAcceToEdit?.code || '',
			type: itemAcceToEdit?.type || '',
			mobileType: itemAcceToEdit?.mobileType || '',
			category: itemAcceToEdit?.category || '',
			model: itemAcceToEdit?.model || '',
			brand: itemAcceToEdit?.brand || '',
			quantity: itemAcceToEdit?.quantity || 0,
			reorderLevel: itemAcceToEdit?.reorderLevel || '',
			description: itemAcceToEdit?.description || '',
			status: true,
			warranty: itemAcceToEdit?.warranty || '',
		},
		validate: (values) => {
			const errors: {
				code?: string;
				type?: string;
				mobileType?: string;
				category?: string;
				model?: string;
				brand?: string;
				quantity?: string;
				reorderLevel?: string;
				description?: string;
			} = {};
			if (!values.code) errors.code = 'Code is required';
			if (!values.type) errors.type = 'Type is required';
			if (values.type === 'Mobile' && !values.mobileType)
				errors.mobileType = 'Mobile Type is required';
			if (!values.category) errors.category = 'Category is required';
			if (!values.model) errors.model = 'Model is required';
			if (!values.brand) errors.brand = 'Brand is required';
			return errors;
		},
		onSubmit: async (values) => {
			try {
				const process = Swal.fire({
					title: 'Processing...',
					html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
					allowOutsideClick: false,
					showCancelButton: false,
					showConfirmButton: false,
				});
				const data = {
					status: true,
					id: id,
					code: values.code,
					type: values.type,
					mobileType: values.mobileType,
					category: values.category,
					model: values.model,
					brand: values.brand,
					// quantity: values.quantity,
					reorderLevel: values.reorderLevel,
					description: values.description,
					warranty: values.warranty,
				};
				await updateItemAcce(data).unwrap();
				await refetch();
				await Swal.fire({
					icon: 'success',
					title: 'Item Acce Updated Successfully',
				});
				formik.resetForm();
				setIsOpen(false);
			} catch (error) {
				await Swal.fire({
					icon: 'error',
					title: 'Error',
					text: 'Failed to update the item. Please try again.',
				});
			}
		},
	});

	const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedCategory(e.target.value);
		formik.setFieldValue('category', e.target.value);
		setSelectedBrand('');
		formik.setFieldValue('brand', '');
		formik.setFieldValue('model', '');
	};

	const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedBrand(e.target.value);
		formik.setFieldValue('brand', e.target.value);
		formik.setFieldValue('model', '');
	};

	const filteredBrands = brands?.filter(
		(brand: any) => brand.category === selectedCategory || selectedCategory === 'Other',
	);
	const filteredModels = models?.filter(
		(model: any) =>
			model.brand === selectedBrand &&
			(model.category === selectedCategory || selectedCategory === 'Other'),
	);

	return (
		<Modal isOpen={isOpen} aria-hidden={!isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader
				setIsOpen={() => {
					setIsOpen(false);
					formik.resetForm();
				}}
				className='p-4'>
				<ModalTitle id=''>{'Edit Item'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='code' label='Code' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.code}
							name='code'
							placeholder='Enter Code'
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							validFeedback='Looks good!'
							readOnly
						/>
					</FormGroup>
					<FormGroup id='type' label='Type' className='col-md-6'>
						<Select
							ariaLabel='Default select type'
							placeholder='Open this select type'
							onChange={formik.handleChange}
							value={formik.values.type}
							name='type'
							isValid={formik.isValid}
							validFeedback='Looks good!'>
							<Option value=''>Select the Type</Option>
							<Option value='Mobile'>Mobile</Option>
							<Option value='Accessory'>Accessory</Option>
						</Select>
					</FormGroup>
					{/* <FormGroup id='quantity' label='Quantity' className='col-md-6'>
						<Input
							type='number'
							onChange={formik.handleChange}
							value={formik.values.quantity}
							onBlur={formik.handleBlur}
							name='quantity'
							readOnly
						/>
					</FormGroup> */}
					{formik.values.type === 'Mobile' && (
						<FormGroup id='mobileType' label='Mobile Type' className='col-md-6'>
							<Select
								ariaLabel='Select Mobile Type'
								onChange={formik.handleChange}
								value={formik.values.mobileType}
								name='mobileType'
								isValid={formik.isValid}
								validFeedback='Looks good!'>
								<Option value=''>Select Mobile Type</Option>
								<Option value='Brand New'>Brand New</Option>
								<Option value='Used'>Used</Option>
							</Select>
						</FormGroup>
					)}
					<FormGroup id='category' label='Category' className='col-md-6'>
						<Select
							ariaLabel='Category'
							onChange={handleCategoryChange}
							value={formik.values.category}
							onBlur={formik.handleBlur}>
							<Option value=''>Select a category</Option>
							{categoriesLoading && (
								<Option value='loading'>Loading categories...</Option>
							)}
							{isError && <Option value='error'>Error fetching categories</Option>}
							{categories?.map(
								(category: { id: string; name: string }, index: any) => (
									<Option key={index} value={category.name}>
										{category.name}
									</Option>
								),
							)}
						</Select>
					</FormGroup>
					{selectedCategory && (
						<FormGroup id='brandSelect' label='Brand' className='col-md-6'>
							<Select
								ariaLabel='Select brand'
								onChange={handleBrandChange}
								value={selectedBrand}
								onBlur={formik.handleBlur}>
								<Option value=''>Select Brand</Option>
								{filteredBrands?.map((brand: any, index: any) => (
									<Option key={index} value={brand.name}>
										{brand.name}
									</Option>
								))}
							</Select>
						</FormGroup>
					)}
					{selectedBrand && (
						<FormGroup id='modelSelect' label='Model' className='col-md-6'>
							<Select
								ariaLabel='Select model'
								onChange={formik.handleChange}
								value={formik.values.model}
								onBlur={formik.handleBlur}
								name='model'>
								<Option value=''>Select Model</Option>
								{filteredModels?.map((model: any, index: any) => (
									<Option key={index} value={model.name}>
										{model.name}
									</Option>
								))}
							</Select>
						</FormGroup>
					)}
					<FormGroup id='reorderLevel' label='Reorder Level' className='col-md-6'>
						<Input
							type='number'
							min={1}
							onChange={formik.handleChange}
							value={formik.values.reorderLevel}
							name='reorderLevel'
							placeholder='Enter Reorder Level'
							isValid={formik.isValid}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='description' label='Description' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.description}
							name='description'
							placeholder='Enter Description'
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='warranty' label='Warranty' className='col-md-6'>
						<Select
							id='warranty'
							name='warranty'
							ariaLabel='warranty'
							onChange={formik.handleChange}
							value={formik.values.warranty}
							onBlur={formik.handleBlur}>
							<option value=''>Select Warranty</option>
							<option value='No warranty '>No warranty</option>
							<option value='14 day checking warranty'>
								14 day checking warranty
							</option>
							<option value='1 month warranty'>1 month warranty</option>
							<option value='3 month warranty'>3 month warranty</option>
							<option value='6 month warranty'>6 month warranty</option>
							<option value='1 Year warranty'>1 Year warranty</option>
							<option value='5 year warranty'>5 year warranty</option>
							<option value='Company 1 Year warranty'>Company 1 Year warranty</option>
							<option value='Company 5 Year warranty'>Company 5 Year warranty</option>
						</Select>
					</FormGroup>
				</div>
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				<Button color='success' onClick={formik.handleSubmit}>
					Edit Item
				</Button>
			</ModalFooter>
		</Modal>
	);
};
ItemAddModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default ItemAddModal;
