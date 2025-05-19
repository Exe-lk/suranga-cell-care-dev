import React, { FC, useRef, useState, useEffect } from 'react';
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
import { useUpdateBillMutation, useGetBillsQuery } from '../../redux/slices/billApiSlice';
import { useGetTechniciansQuery } from '../../redux/slices/technicianManagementApiSlice';
import { useGetModelsQuery } from '../../redux/slices/modelApiSlice';

interface UserAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const UserAddModal: FC<UserAddModalProps> = ({ id, isOpen, setIsOpen }) => {
	const { data: bills, refetch } = useGetBillsQuery(undefined);
	const [updateBill, { isLoading }] = useUpdateBillMutation();
	const {
		data: technicians,
		isLoading: techniciansLoading,
		isError,
	} = useGetTechniciansQuery(undefined);
		const {
			data: models,
			isLoading: modelsLoading,
			isError: modelsError,
		} = useGetModelsQuery(undefined);
	const billToEdit = bills?.find((bill: any) => bill.id === id);

	const formik = useFormik({
		initialValues: {
			technicianNum: billToEdit?.technicianNum || '',
			Price: billToEdit?.Price || '',
			componentCost: billToEdit?.componentCost || '',
			repairCost: billToEdit?.repairCost || '',
			cost: billToEdit?.cost || ''
		},
		enableReinitialize: true,
		onSubmit: async (values) => {
			if (!billToEdit) {
				Swal.fire('Error', 'Could not find bill to edit', 'error');
				return;
			}
			
			try {
				Swal.fire({
					title: 'Processing...',
					html: 'Updating bill information...',
					allowOutsideClick: false,
					showCancelButton: false,
					showConfirmButton: false,
					didOpen: () => {
						Swal.showLoading();
					}
				});
				
				// Copy all existing bill data to ensure we don't lose anything
				const updateData = {
					// CRITICAL: For Supabase, we need to use billNumber as the ID
					id: billToEdit.billNumber,
					billNumber: billToEdit.billNumber,
					dateIn: billToEdit.dateIn,
					phoneDetail: billToEdit.phoneDetail,
					phoneModel: billToEdit.phoneModel,
					repairType: billToEdit.repairType,
					CustomerName: billToEdit.CustomerName,
					CustomerMobileNum: billToEdit.CustomerMobileNum,
					email: billToEdit.email,
					NIC: billToEdit.NIC,
					componentCost: billToEdit.componentCost,
					repairCost: billToEdit.repairCost,
					cost: billToEdit.cost,
					Status: billToEdit.Status,
					DateOut: billToEdit.DateOut,
					status: billToEdit.status || true,
					color: billToEdit.color,
					IME: billToEdit.IME,
					
					// The actual fields we're updating:
					technicianNum: values.technicianNum,
					Price: values.Price,
					
					// Handle array fields properly
					Condition: billToEdit.Condition || [],
					Item: billToEdit.Item || []
				};
				
				// Log for debugging
				console.log('UPDATING BILL WITH DATA:', updateData);
				
				// Use the supabase mutation
				const result = await updateBill(updateData).unwrap();
				console.log('UPDATE RESULT:', result);
				
				// Force a data refresh
				await refetch();
				
				Swal.fire({
					icon: 'success',
					title: 'Bill Updated',
					text: `Successfully updated bill information`
				});
				
				setIsOpen(false);
			} catch (error) {
				console.error('ERROR UPDATING BILL:', error);
				
				Swal.fire({
					icon: 'error',
					title: 'Update Failed',
					text: 'Failed to update bill information. Check console for details.'
				});
			}
		},
	});

	const formatMobileNumber = (value: string) => {
		let sanitized = value.replace(/\D/g, '');
		if (!sanitized.startsWith('0')) sanitized = '0' + sanitized;
		return sanitized.slice(0, 10);
	};

	useEffect(() => {
		const componentCost = parseFloat(formik.values.componentCost) || 0;
		const repairCost = parseFloat(formik.values.repairCost) || 0;
		formik.setFieldValue('cost', (componentCost + repairCost).toFixed(2));
	}, [formik.values.componentCost, formik.values.repairCost]);

	return (
		<Modal isOpen={isOpen} aria-hidden={!isOpen} setIsOpen={setIsOpen} size='lg' titleId={id}>
			<ModalHeader
				setIsOpen={() => {
					setIsOpen(false);
					formik.resetForm();
				}}
				className='p-4'>
				<ModalTitle id=''>Edit Bill</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='technicianNum' label='Technician Number' className='col-md-6'>
						<Select
							ariaLabel='Select Technician'
							placeholder='Select a Technician'
							onChange={formik.handleChange}
							value={formik.values.technicianNum}
							name='technicianNum'
							isValid={formik.isValid}
							disabled={techniciansLoading || isLoading}>
							<Option value=''>Select a Technician</Option>
							{technicians?.map((technician: any, index: any) => (
								<Option key={index} value={technician.technicianNum}>
									{technician.technicianNum}
								</Option>
							))}
						</Select>
						<>
							{techniciansLoading && <p>Loading technicians...</p>}
							{isError && <p>Error loading technicians. Please try again.</p>}
						</>
					</FormGroup>
					
					<FormGroup id='Price' label='Price (LKR)' className='col-md-6'>
						<Input
							type='number'
							onChange={formik.handleChange}
							value={formik.values.Price}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
						/>
					</FormGroup>
				</div>
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				<Button color='danger' onClick={() => setIsOpen(false)}>
					Cancel
				</Button>
				<Button 
					color='success' 
					onClick={formik.handleSubmit}
					isDisable={isLoading}>
					Update Bill
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
