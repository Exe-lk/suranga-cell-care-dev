import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import Swal from 'sweetalert2';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import Select from '../bootstrap/forms/Select';
import Option from '../bootstrap/Option';
import Checks, { ChecksGroup } from '../bootstrap/forms/Checks';
import { useGetBrandsQuery } from '../../redux/slices/brandApiSlice';
import { useGetModelsQuery } from '../../redux/slices/modelApiSlice';
import {
	useAddItemDisMutation,
	useGetItemDissQuery,
} from '../../redux/slices/itemManagementDisApiSlice';
import { useGetCategoriesQuery } from '../../redux/slices/categoryApiSlice';

interface ItemAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const ItemAddModal: FC<ItemAddModalProps> = ({ id, isOpen, setIsOpen }) => {
	const [selectedCategory, setSelectedCategory] = useState<string>('Touch Pad');
	const [selectedBrand, setSelectedBrand] = useState<string>('');
	const [customCategory, setCustomCategory] = useState<string>('');
	const [addItemDis, { isLoading }] = useAddItemDisMutation();
	const { refetch } = useGetBrandsQuery(undefined);
	const { data: brands } = useGetBrandsQuery(undefined);
	const { data: models } = useGetModelsQuery(undefined);
	const { data: categories } = useGetCategoriesQuery(undefined);
	const { data: itemAcces } = useGetItemDissQuery(undefined);
	const [generatedCode, setGeneratedCode] = useState('');

	useEffect(() => {
		if (itemAcces?.length) {
			const lastCode = itemAcces
				.map((item: { code: string }) => item.code)
				.filter((code: string) => code)
				.reduce((maxCode: string, currentCode: string) => {
					const currentNumericPart = parseInt(currentCode.replace(/\D/g, ''), 10);
					const maxNumericPart = parseInt(maxCode.replace(/\D/g, ''), 10);
					return currentNumericPart > maxNumericPart ? currentCode : maxCode;
				}, '5000');
			const newCode = incrementCode(lastCode);
			setGeneratedCode(newCode);
		} else {
			setGeneratedCode('5000');
		}
	}, [itemAcces]);

	const incrementCode = (code: string) => {
		const numericPart = parseInt(code.replace(/\D/g, ''), 10);
		const incrementedNumericPart = (numericPart + 1).toString().padStart(4, '0');
		return incrementedNumericPart;
	};

	const formik = useFormik({
		initialValues: {
			code: generatedCode,
			model: 'Touch Pad',
			brand: '',
			reorderLevel: '',
			quantity: 0,
			boxNumber: '',
			category: 'Touch Pad',
			touchpadNumber: '',
			batteryCellNumber: '',
			warranty: '',
			otherCategory: '',
			status: true,
		},
		validate: (values) => {
			const errors: {
				model?: string;
				brand?: string;
				category?: string;
				reorderLevel?: string;
				quantity?: string;
				boxNumber?: string;
				touchpadNumber?: string;
				batteryCellNumber?: string;
				displaySNumber?: string;
				otherCategory?: string;
				warranty?:string;
			} = {};
			if (!values.model) {
				errors.model = 'Model is required';
			}
			if (!values.brand) {
				errors.brand = 'Brand is required';
			}
			// if (!values.category) {
			// 	errors.category = 'Category is required';
			// }
			if (!values.warranty) {
				errors.warranty = 'Category is required';
			}
			if (!values.reorderLevel) {
				errors.reorderLevel = 'Reorder Level is required';
			}
			if (!values.boxNumber) {
				errors.boxNumber = 'Box Number is required';
			}
			if (values.category === 'Touch Pad' && !values.touchpadNumber) {
				errors.touchpadNumber = 'Touchpad Number is required for Touch Pad category';
			}

			// if (values.category === 'Battery Cell' && !values.batteryCellNumber) {
			// 	errors.batteryCellNumber =
			// 		'Battery Cell Number is required for Battery Cell category';
			// }
			if (values.category === 'Other' && !values.otherCategory) {
				errors.otherCategory = 'Custom category name is required for "Other"';
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
					const response: any = await addItemDis({
						...values,
						code: generatedCode,
						category: values.category,
						brand: values.brand,
						model: values.model,
					}).unwrap();
					refetch();
					await Swal.fire({
						icon: 'success',
						title: 'Item Created Successfully',
					});
					setIsOpen(false);
					formik.resetForm();
					setSelectedCategory('');
					setSelectedBrand('');
				} catch (error) {
					await Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Failed to add the item. Please try again.',
					});
				}
			} catch (error) {
				console.error('Error: ', error);
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
	const derivedCategory = ['Battery Cell', 'Displays', 'Touch Pad'].includes(selectedCategory)
		? selectedCategory
		: 'Other';
	return (
		<Modal isOpen={isOpen} aria-hidden={!isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader
				setIsOpen={() => {
					setIsOpen(false);
					formik.resetForm();
					setSelectedCategory('Touch Pad');
					setSelectedBrand('');
				}}
				className='p-4'>
				<ModalTitle id=''>{'Create Item'}</ModalTitle>
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
								onChange={handleCategoryChange}
								checked={selectedCategory}
							/>
							<Checks
								type='radio'
								id='touchpad'
								label='Displays'
								name='category'
								value='Displays'
								onChange={handleCategoryChange}
								checked={selectedCategory}
							/>
							<Checks
								type='radio'
								id='touchpad'
								label='Battery Cell'
								name='category'
								value='Battery Cell'
								onChange={handleCategoryChange}
								checked={selectedCategory}
							/>
							<Checks
								type='radio'
								id='touchpad'
								label='Other'
								name='category'
								value='Other'
								onChange={handleCategoryChange}
								checked={derivedCategory}
							/>
						</ChecksGroup>
					</FormGroup>
					{selectedCategory !== 'Battery Cell' &&
						selectedCategory !== 'Displays' &&
						selectedCategory !== 'Touch Pad' && (
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
					{selectedCategory && (
						<FormGroup id='brandSelect' label='Brand' className='col-md-6'>
							<Select
								ariaLabel='Select brand'
								onChange={handleBrandChange}
								value={selectedBrand}
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
					)}
					{selectedBrand && (
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
					)}
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
							{selectedCategory === 'Touch Pad' && (
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

							{selectedCategory === 'Battery Cell' && (
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
			<ModalFooter className='p-4'>
				<Button color='success' onClick={() => formik.handleSubmit()} isDisable={isLoading}>
					Create Item
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
