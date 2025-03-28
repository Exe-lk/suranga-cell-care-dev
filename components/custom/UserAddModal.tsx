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
import { useAddUserMutation } from '../../redux/slices/userManagementApiSlice';
import { useGetUsersQuery } from '../../redux/slices/userManagementApiSlice';

interface UserAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}
const UserAddModal: FC<UserAddModalProps> = ({ id, isOpen, setIsOpen }) => {
	const [imageurl, setImageurl] = useState<any>(null);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [addUser, { isLoading }] = useAddUserMutation();
	const { refetch } = useGetUsersQuery(undefined);

	const formik = useFormik({
		initialValues: {
			name: '',
			role: '',
			nic: '',
			email: '',
			mobile: '',
			status: true,
			level:'level 1'
		},
		validate: (values) => {
			const errors: {
				role?: string;
				name?: string;
				nic?: string;
				email?: string;
				password?: string;
				mobile?: string;
				level?:string;
			} = {};
			if (!values.role) {
				errors.role = 'Required';
			}
			if (!values.name) {
				errors.name = 'Required';
			}
			if (!values.level) {
				errors.level = 'Required';
			}
			if (!values.mobile) {
				errors.mobile = 'Required';
			} else if (values.mobile.length !== 10) {
				errors.mobile = 'Mobile number must be exactly 10 digits';
			}
			if (!values.nic) {
				errors.nic = 'Required';
			} else if (!/^\d{9}[Vv]$/.test(values.nic) && !/^\d{12}$/.test(values.nic)) {
				errors.nic = 'NIC must be 9 digits followed by "V" or 12 digits';
			}
			if (!values.email) {
				errors.email = 'Required';
			} else if (!values.email.includes('@')) {
				errors.email = 'Invalid email format.';
			} else if (values.email.includes(' ')) {
				errors.email = 'Email should not contain spaces.';
			} else if (/[A-Z]/.test(values.email)) {
				errors.email = 'Email should be in lowercase only.';
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
					const response: any = await addUser(values).unwrap();
					refetch();
					await Swal.fire({
						icon: 'success',
						title: 'User Created Successfully',
					});
					formik.resetForm();
					setIsOpen(false);
				} catch (error) {
					console.error('Error during handleSubmit: ', error);
					await Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Your Email or NIC is already in use',
					});
				}
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				Swal.close;
				alert('An error occurred during file upload. Please try again later.');
			}
		},
	});

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
				<ModalTitle id=''>{'New User'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='name' label='Name' className='col-md-6'>
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
					<FormGroup id='role' label='Role' className='col-md-6'>
						<Select
							ariaLabel='Default select example'
							onChange={formik.handleChange}
							value={formik.values.role}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.role}
							invalidFeedback={formik.errors.role}>
							<Option>Select the role</Option>
							<Option value={'bill keeper'}>Bill Keeper</Option>
							<Option value={'accessosry stock keeper'}>
								Accessosry Stock Keeper
							</Option>
							<Option value={'display stock keeper'}>Display Stock Keeper</Option>
							<Option value={'cashier'}>Cashier</Option>
							<Option value={'Repair Sales'}>Repair Sales</Option>
							<Option value={'Viewer'}>Viewer</Option>
							<Option value={'Accessory sales assitant'}>Accessory sales assitant</Option>
						</Select>
					</FormGroup>
					{formik.values.role=="cashier" &&(
						<FormGroup id='level' label='Level' className='col-md-6'>
						<Select
							ariaLabel='Default select example'
							onChange={formik.handleChange}
							value={formik.values.level}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.level}
							invalidFeedback={formik.errors.level}>
							<Option>Select the role</Option>
							<Option value={'level 1'}>Level 1</Option>
							<Option value={'level 2'}>Level 2</Option>
							
						</Select>
					</FormGroup>
					)}
					<FormGroup id='mobile' label='Mobile number' className='col-md-6'>
						<Input
							type='text'
							value={formik.values.mobile}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								const input = e.target.value.replace(/\D/g, '');
								formik.setFieldValue('mobile', formatMobileNumber(input));
							}}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.mobile}
							invalidFeedback={formik.errors.mobile}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='nic' label='NIC' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.nic}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.nic}
							invalidFeedback={formik.errors.nic}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='email' label='Email' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.email}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.email}
							invalidFeedback={formik.errors.email}
							validFeedback='Looks good!'
						/>
					</FormGroup>
				</div>
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				<Button color='success' onClick={formik.handleSubmit}>
					Create User
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
