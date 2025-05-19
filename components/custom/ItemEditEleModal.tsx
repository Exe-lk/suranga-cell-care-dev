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
import {
	useUpdateItemDisMutation,
	useGetItemDissQuery,
} from '../../redux/slices/itemManagementDisApiSlice';
import { useGetBrandsQuery } from '../../redux/slices/brandApiSlice';
import { useGetModelsQuery } from '../../redux/slices/modelApiSlice';
import { useGetCategoriesQuery } from '../../redux/slices/categoryApiSlice';

interface ItemAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const ItemAddModal: FC<ItemAddModalProps> = ({ id, isOpen, setIsOpen }) => {
	const [imageurl, setImageurl] = useState<any>(null);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [selectedOption, setSelectedOption] = useState<string>('');
	const { data: itemDiss, refetch } = useGetItemDissQuery(undefined);
	const [updateItemDis, { isLoading }] = useUpdateItemDisMutation();
	const itemDisToEdit = itemDiss?.find((itemDis: any) => itemDis.id === id);
	const { data: brands } = useGetBrandsQuery({});

	const { data: models } = useGetModelsQuery(undefined);
	const { data: categories } = useGetCategoriesQuery(undefined);
	const [selectedCategory, setSelectedCategory] = useState<string>(itemDisToEdit?.category);
	const [selectedBrand, setSelectedBrand] = useState<string>('');
	const [customCategory, setCustomCategory] = useState<string>('');
	const divRef: any = useRef(null);

	const formik = useFormik({
		initialValues: {
			id: '',
			model: itemDisToEdit?.model || '',
			brand: itemDisToEdit?.brand || '',
			reorderLevel: itemDisToEdit?.reorderLevel || '',
			quantity: itemDisToEdit?.quantity || '',
			boxNumber: itemDisToEdit?.boxNumber || '',
			category: itemDisToEdit?.category || '',
			touchpadNumber: itemDisToEdit?.touchpadNumber || '',
			batteryCellNumber: itemDisToEdit?.batteryCellNumber || '',
			displaySNumber: itemDisToEdit?.displaySNumber || '',
			otherCategory: itemDisToEdit?.otherCategory || '',
			status: true,
			warranty: itemDisToEdit?.warranty || '',
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: {
				model?: string;
				brand?: string;
				reorderLevel?: string;
				quantity?: string;
				boxNumber?: string;
				category?: string;
				touchpadNumber?: string;
				batteryCellNumber?: string;
				displaySNumber?: string;
				otherCategory?: string;
				warranty?: string;
			} = {};
			if (!values.model) {
				errors.model = 'Model is required';
			}
			if (!values.brand) {
				errors.brand = 'Brand is required';
			}
			if (!values.category) {
				errors.category = 'Category is required';
			}
			if (!values.reorderLevel) {
				errors.reorderLevel = 'Reorder Level is required';
			}
			if (values.category === 'Touch Pad' && !values.touchpadNumber) {
				errors.touchpadNumber = 'Touchpad Number is required for Touch Pad category';
			}
			if (!values.warranty) {
				errors.warranty = 'Category is required';
			}
			// if (values.category === 'Displays' && !values.displaySNumber) {
			// 	errors.displaySNumber = 'Display Serial Number is required for Displays category';
			// }
			// if (values.category === 'Battery Cell' && !values.batteryCellNumber) {
			// 	errors.batteryCellNumber =
			// 		'Battery Cell Number is required for Battery Cell category';
			// }
			if (values.category === 'Other' && !values.otherCategory) {
				errors.otherCategory = 'Custom category name is required for "Other"';
			}
			if (!values.boxNumber) {
				errors.boxNumber = 'Box Number is required';
			}
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
				try {
					const data = {
						status: true,
						id: id,
						model: values.model,
						brand: values.brand,
						reorderLevel: values.reorderLevel,
						quantity: values.quantity,
						boxNumber: values.boxNumber,
						category: values.category,
						touchpadNumber: values.touchpadNumber,
						batteryCellNumber: values.batteryCellNumber,
						displaySNumber: values.displaySNumber,
						otherCategory: values.otherCategory,
					};
					await updateItemDis(data).unwrap();
					await refetch();
					await Swal.fire({
						icon: 'success',
						title: 'Item Dis Updated Successfully',
					});
					formik.resetForm();
					setIsOpen(false);
				} catch (error) {
					await Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Failed to update the item dis. Please try again.',
					});
				}
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				alert('An error occurred during file upload. Please try again later.');
			}
		},
	});

	const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSelectedCategory(e.target.value);
		formik.setFieldValue('category', e.target.value);
		setSelectedBrand('');
		formik.setFieldValue('brand', '');
		formik.setFieldValue('model', '');
		setCustomCategory('');
	};

	const handleCustomCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCustomCategory(e.target.value);
		formik.setFieldValue('otherCategory', e.target.value);
	};

	const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedBrand(e.target.value);
		formik.setFieldValue('brand', e.target.value);
		formik.setFieldValue('model', '');
	};

	const filteredBrands = brands?.filter(
		(brand: any) => brand.category === itemDisToEdit?.category || itemDisToEdit?.category === 'Other',
	);

	const filteredModels = models?.filter(
		(model: any) =>
			model.brand === itemDisToEdit?.brand &&
			(model.category === itemDisToEdit?.category || itemDisToEdit?.category === 'Other'),
	);

	return (
		<Modal isOpen={isOpen} aria-hidden={!isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader setIsOpen={setIsOpen} className='p-4'>
				<ModalTitle id=''>{'Edit Item'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='categorySelect' label='Category' className='col-md-12'>
						<ChecksGroup isInline>
							<Checks
								type='radio'
								id='touchpad'
								label='Touch Pad'
								name='category'
								value='Touch Pad'
								// onChange={handleCategoryChange}
								checked={formik.values.category}
							/>
							<Checks
								type='radio'
								id='displays'
								label='Displays'
								name='category'
								value='Displays'
								// onChange={handleCategoryChange}
								checked={formik.values.category}
							/>
							<Checks
								type='radio'
								id='batteryCell'
								label='Battery Cell'
								name='category'
								value='Battery Cell'
								// onChange={handleCategoryChange}
								checked={formik.values.category}
							/>
							<Checks
								type='radio'
								id='other'
								label='Other'
								name='category'
								value='Other'
								// onChange={handleCategoryChange}
								checked={formik.values.category}
							/>
						</ChecksGroup>
					</FormGroup>
					{formik.values.category === 'Other' && (
						<FormGroup
							id='categorySelectDropdown'
							label='Select Category'
							className='col-md-6'>
							<Select
								ariaLabel='Select category'
								onChange={handleCategoryChange}
								value={formik.values.category}
								onBlur={formik.handleBlur}
								isValid={formik.isValid}
								isTouched={formik.touched.category}
								invalidFeedback={formik.errors.category}
								validFeedback='Looks good!'>
								<Option value=''>Select Category</Option>
								{categories
									?.filter(
										(category: any) =>
											category.name !== 'Battery Cell' &&
											category.name !== 'Displays' &&
											category.name !== 'Touch Pad',
									)
									.map((category: any) => (
										<Option key={category.id} value={category.name}>
											{category.name}
										</Option>
									))}
							</Select>
						</FormGroup>
					)}

					<FormGroup id='brandSelect' label='Brand' className='col-md-6'>
						<Select
							ariaLabel='Select brand'
							onChange={formik.handleChange}
							value={formik.values.brand}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.brand}
							invalidFeedback={formik.errors.brand}
							validFeedback='Looks good!'>
							<Option value=''>Select Brand</Option>
							{filteredBrands?.map((brand: any) => (
								<Option key={brand.id} value={brand.name}>
									{brand.name}
								</Option>
							))}
						</Select>
					</FormGroup>

					<FormGroup id='categoryDropdown' label='Category' className='col-md-6'>
						<Select
							ariaLabel='Select category'
							onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
								formik.setFieldValue('category', e.target.value);
								setSelectedCategory(e.target.value);
							}}
							value={formik.values.category}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.category}
							invalidFeedback={formik.errors.category}
							validFeedback='Looks good!'>
							<Option value=''>Select Category</Option>
							{categories?.map((category: any) => (
								<Option key={category.id} value={category.name}>
									{category.name}
								</Option>
							))}
						</Select>
					</FormGroup>

					<FormGroup id='modelSelect' label='Model' className='col-md-6'>
						<Select
							ariaLabel='Select model'
							onChange={formik.handleChange}
							value={formik.values.model}
							onBlur={formik.handleBlur}
							name='model'
							isValid={formik.isValid}
							isTouched={formik.touched.model}
							invalidFeedback={formik.errors.model}
							validFeedback='Looks good!'>
							<Option value=''>Select Model</Option>
							{filteredModels?.map((model: any) => (
								<Option key={model.id} value={model.name}>
									{model.name}
								</Option>
							))}
						</Select>
					</FormGroup>

					{formik.values.model && (
						<>
							<FormGroup id='reorderLevel' label='Reorder Level' className='col-md-6'>
								<Input
									type='number'
									onChange={formik.handleChange}
									value={formik.values.reorderLevel}
									onBlur={formik.handleBlur}
									name='reorderLevel'
									isValid={formik.isValid}
									isTouched={formik.touched.reorderLevel}
									invalidFeedback={formik.errors.reorderLevel}
									validFeedback='Looks good!'
								/>
							</FormGroup>
							<FormGroup id='quantity' label='Quantity' className='col-md-6'>
								<Input
									type='number'
									onChange={formik.handleChange}
									value={formik.values.quantity}
									onBlur={formik.handleBlur}
									name='quantity'
									readOnly
									isValid={formik.isValid}
									isTouched={formik.touched.quantity}
									invalidFeedback={formik.errors.quantity}
									validFeedback='Looks good!'
								/>
							</FormGroup>
							<FormGroup id='boxNumber' label='Box Number' className='col-md-6'>
								<Input
									type='text'
									onChange={formik.handleChange}
									value={formik.values.boxNumber}
									onBlur={formik.handleBlur}
									name='boxNumber'
									isValid={formik.isValid}
									isTouched={formik.touched.boxNumber}
									invalidFeedback={formik.errors.boxNumber}
									validFeedback='Looks good!'
								/>
							</FormGroup>
							{formik.values.category === 'Touch Pad' && (
								<FormGroup
									id='touchpadNumber'
									label='Touchpad Number'
									className='col-md-6'>
									<Input
										type='text'
										onChange={formik.handleChange}
										value={formik.values.touchpadNumber}
										onBlur={formik.handleBlur}
										name='touchpadNumber'
										isValid={formik.isValid}
										isTouched={formik.touched.touchpadNumber}
										invalidFeedback={formik.errors.touchpadNumber}
										validFeedback='Looks good!'
									/>
								</FormGroup>
							)}
							{/* {formik.values.category === 'Displays' && (
								<FormGroup
									id='displaySNumber'
									label='Display Serial Number'
									className='col-md-6'>
									<Input
										type='text'
										onChange={formik.handleChange}
										value={formik.values.displaySNumber}
										onBlur={formik.handleBlur}
										name='displaySNumber'
									/>
								</FormGroup>
							)} */}
							{formik.values.category === 'Battery Cell' && (
								<FormGroup
									id='batteryCellNumber'
									label='Battery Cell Number'
									className='col-md-6'>
									<Input
										type='text'
										onChange={formik.handleChange}
										value={formik.values.batteryCellNumber}
										onBlur={formik.handleBlur}
										name='batteryCellNumber'
										isValid={formik.isValid}
										isTouched={formik.touched.batteryCellNumber}
										invalidFeedback={formik.errors.batteryCellNumber}
										validFeedback='Looks good!'
									/>
								</FormGroup>
							)}

							<FormGroup id='warranty' label='Warranty' className='col-md-6'>
								<Select
									id='warranty'
									name='warranty'
									ariaLabel='warranty'
									placeholder='select warranty'
									onChange={formik.handleChange}
									value={formik.values.warranty}
									onBlur={formik.handleBlur}
									isValid={formik.isValid}
									isTouched={formik.touched.warranty}
									invalidFeedback={formik.errors.warranty}
									validFeedback='Looks good!'>
									<option value='No warranty'>No warranty</option>
									<option value='14 day checking warranty'>
										14 day checking warranty
									</option>
									<option value='1 month warranty'>1 month warranty</option>
									<option value='3 month warranty'>3 month warranty</option>
									<option value='6 month warranty'>6 month warranty</option>
									<option value='1 Year warranty'>1 Year warranty</option>
									<option value='5 year warranty'>5 year warranty</option>
									<option value='Company 1 Year warranty'>
										Company 1 Year warranty
									</option>
									<option value='Company 5 Year warranty'>
										Company 5 Year warranty
									</option>
								</Select>
							</FormGroup>
						</>
					)}
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
