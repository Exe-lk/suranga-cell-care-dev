import React, { FC, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import showNotification from '../extras/showNotification';
import Icon from '../icon/Icon';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import { collection, addDoc } from 'firebase/firestore';
import { firestore, storage, auth } from '../../firebaseConfig';
import Swal from 'sweetalert2';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import Select from '../bootstrap/forms/Select';
import Option from '../bootstrap/Option';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useUpdateDealerMutation, useGetDealersQuery } from '../../redux/slices/delearApiSlice';

interface UserAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}
const UserAddModal: FC<UserAddModalProps> = ({ id, isOpen, setIsOpen }) => {
	const { data: dealers, refetch } = useGetDealersQuery(undefined);
	const [updateDealer, { isLoading }] = useUpdateDealerMutation();
	const dealerToEdit = dealers?.find((dealer: any) => dealer.id === id);

	const formik = useFormik({
		initialValues: {
			id: '',
			name: dealerToEdit?.name || '',
			item: dealerToEdit?.item || [''],
			email: dealerToEdit?.email || '',
			address: dealerToEdit?.address || '',
			mobileNumber: dealerToEdit?.mobileNumber || '',
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: {
				name?: string;
				item?: string[];
				email?: string;
				address?: string;
				mobileNumber?: string;
			} = {};
			if (!values.name) {
				errors.name = 'Name is required';
			}
			if (!values.email) {
				errors.email = 'Required';
			} else if (!values.email.includes('@')) {
				errors.email = 'Invalid email format.';
			} else if (values.email.includes(' ')) {
				errors.email = 'Email should not contain spaces.';
			}else if (/[A-Z]/.test(values.email)) {
				errors.email = 'Email should be in lowercase only.';
			}
			if (!values.address) {
				errors.address = 'Address is required';
			}
			if (!values.mobileNumber) {
				errors.mobileNumber = 'Mobile Number is required';
			} else if (values.mobileNumber.length !== 10) {
				errors.mobileNumber = 'Mobile Number must be 10 digits.';
			}
			const itemErrors: string[] = values.item
				.map((item: string, index: number) => {
					if (!item.trim()) {
						return `Item ${index + 1} cannot be empty.`;
					}
					return '';
				})
				.filter((error: string) => error !== '');
			if (itemErrors.length > 0) {
				errors.item = itemErrors;
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
						name: values.name,
						item: values.item,
						email: values.email,
						address: values.address,
						mobileNumber: values.mobileNumber,
						status: true,
						id: id,
					};
					await updateDealer(data).unwrap();
					refetch();
					await Swal.fire({
						icon: 'success',
						title: 'Dealer Updated Successfully',
					});
					formik.resetForm();
					setIsOpen(false);
				} catch (error) {
					await Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Failed to update the dealer. Please try again.',
					});
				}
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				alert('An error occurred during file upload. Please try again later.');
			}
		},
	});

	const addItemField = () => {
		formik.setValues({
			...formik.values,
			item: [...formik.values.item, ''],
		});
	};

	const removeItemField = (index: number) => {
		const newItems = [...formik.values.item];
		newItems.splice(index, 1);
		formik.setValues({
			...formik.values,
			item: newItems,
		});
	};

	const formatMobileNumber = (value: string) => {
		let sanitized = value.replace(/\D/g, '');
		if (!sanitized.startsWith('0')) sanitized = '0' + sanitized;
		return sanitized.slice(0, 10);
	};

	return (
		<Modal isOpen={isOpen} aria-hidden={!isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader
				setIsOpen={() => {
					setIsOpen(false);
					formik.resetForm();
				}}
				className='p-4'>
				<ModalTitle id=''>{'Edit Dealer'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='name' label='Dealer Name' className='col-md-6'>
						<Input
							name='name'
							onChange={formik.handleChange}
							value={formik.values.name}
							onBlur={formik.handleBlur}
							isTouched={!!formik.touched.name}
							isValid={formik.isValid}
							invalidFeedback={
								typeof formik.errors.name === 'string'
									? formik.errors.name
									: undefined
							}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					{formik.values.item.map((sub: any, index: any) => (
						<FormGroup
							key={index}
							id={`item-${index}`}
							label={`Item ${index + 1}`}
							className='col-md-6'>
							<div className='d-flex align-items-center'>
								<Input
									name={`item[${index}]`}
									onChange={formik.handleChange}
									value={formik.values.item[index]}
									onBlur={formik.handleBlur}
									isValid={formik.isValid}
									isTouched={
										!!(
											Array.isArray(formik.touched.item) &&
											formik.touched.item[index]
										)
									}
									invalidFeedback={
										formik.errors.item
											? Array.isArray(formik.errors.item)
												? (formik.errors.item[index] as string)
												: (formik.errors.item as string)
											: undefined
									}
									validFeedback='Looks good!'
								/>
								<button
									type='button'
									onClick={() => removeItemField(index)}
									className='btn btn-outline-danger ms-2'>
									<Icon icon='Delete' />
								</button>
							</div>
						</FormGroup>
					))}
					<div className='col-md-12'>
						<Button color='info' onClick={addItemField}>
							Add Item
						</Button>
					</div>
					<FormGroup id='email' label='Email' className='col-md-6'>
						<Input
							name='email'
							onChange={formik.handleChange}
							value={formik.values.email}
							onBlur={formik.handleBlur}
							isTouched={!!formik.touched.email}
							isValid={formik.isValid}
							invalidFeedback={
								typeof formik.errors.email === 'string'
									? formik.errors.email
									: undefined
							}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='address' label='Address' className='col-md-6'>
						<Input
							name='address'
							onChange={formik.handleChange}
							value={formik.values.address}
							onBlur={formik.handleBlur}
							isTouched={!!formik.touched.address}
							isValid={formik.isValid}
							invalidFeedback={
								typeof formik.errors.address === 'string'
									? formik.errors.address
									: undefined
							}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='mobileNumber' label='Mobile number' className='col-md-6'>
						<Input
							type='text'
							value={formik.values.mobileNumber}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								const input = e.target.value.replace(/\D/g, '');
								formik.setFieldValue('mobileNumber', formatMobileNumber(input));
							}}
							onBlur={formik.handleBlur}
							isTouched={!!formik.touched.mobileNumber}
							isValid={formik.isValid}
							invalidFeedback={
								typeof formik.errors.mobileNumber === 'string'
									? formik.errors.mobileNumber
									: undefined
							}
							validFeedback='Looks good!'
						/>
					</FormGroup>
				</div>
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				<Button color='success' onClick={formik.handleSubmit}>
					Edit Dealer
				</Button>
			</ModalFooter>
		</Modal>
	);
};
UserAddModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default UserAddModal;
