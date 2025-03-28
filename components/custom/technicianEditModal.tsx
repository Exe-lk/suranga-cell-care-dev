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
import { firestore, storage,auth } from '../../firebaseConfig';
import Swal from 'sweetalert2';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import Select from '../bootstrap/forms/Select';
import Option from '../bootstrap/Option';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
	useUpdateTechnicianMutation,
	useGetTechniciansQuery,
} from '../../redux/slices/technicianManagementApiSlice'; 

interface UserAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const UserAddModal: FC<UserAddModalProps> = ({ id, isOpen, setIsOpen }) => {
	const { data: technicians,refetch } = useGetTechniciansQuery(undefined);
	const [updateTechnician, { isLoading }] = useUpdateTechnicianMutation();
	const technicianToEdit = technicians?.find((technician: any) => technician.id === id);

	const formik = useFormik({
		initialValues: {
			id: '',
			technicianNum:technicianToEdit?.technicianNum || '',
			name: technicianToEdit?.name || '',
			type : technicianToEdit?.type || '',
			mobileNumber: technicianToEdit?.mobileNumber || '',
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: { technicianNum?:string,name?: string; type?:String ;mobileNumber?: string; } = {};
			if (!values.technicianNum) {
				errors.technicianNum = 'Technician number is required';
			}
			if (!values.name) {
				errors.name = 'Name is required';
			}
			if (!values.type) {
				errors.type = 'Type is required';
			}
			if (!values.mobileNumber) {
				errors.mobileNumber = 'Mobile Number is required';
			}else if(values.mobileNumber.length !== 10){
				errors.mobileNumber = 'Mobile Number must be 10 digits';
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
						technicianNum: values.technicianNum,
						name: values.name,
						type: values.type,
						mobileNumber: values.mobileNumber,
						status: true,
						id: id,
					};
					await updateTechnician(data).unwrap();
					refetch(); 
					await Swal.fire({
						icon: 'success',
						title: 'Technician Updated Successfully',
					});
					formik.resetForm();
					setIsOpen(false); 
				} catch (error) {
					await Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Failed to update the Technician. Please try again.',
					});
				}
			} catch (error) {
				console.error('Error during handleUpload: ', error);
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
				<ModalTitle id=''>{'Edit Technician'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup
						id='technicianNum'
						label='Technician Number'
						onChange={formik.handleChange}
						className='col-md-6'>
						<Input
							name='technicianNum'
							onChange={formik.handleChange}
							value={formik.values.technicianNum}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.technicianNum}
							invalidFeedback={formik.errors.technicianNum}
							validFeedback='Looks good!'
							readOnly
						/>
					</FormGroup>
				<FormGroup
						id='name'
						label='Technician Name'
						className='col-md-6'>
						<Input
							name='name'
							onChange={formik.handleChange}
							value={formik.values.name}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.name}
							invalidFeedback={formik.errors.name}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup
						id='type'
						label='Type'
						className='col-md-6'>
						<Input
							name='type'
							onChange={formik.handleChange}
							value={formik.values.type}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.type}
							invalidFeedback={formik.touched.type}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup
						id='mobileNumber'
						label='Mobile Number'
						className='col-md-6'>
						<Input
							type='text'
							value={formik.values.mobileNumber}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								const input = e.target.value.replace(/\D/g, ''); 
								formik.setFieldValue('mobileNumber', formatMobileNumber(input));
							}}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.mobileNumber}
							invalidFeedback={formik.errors.mobileNumber}
							validFeedback='Looks good!'
						/>
					</FormGroup>
				</div>
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				<Button color='success' onClick={formik.handleSubmit}>
					Edit Technician
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
