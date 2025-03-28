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
			id: id,
			billNumber: billToEdit?.billNumber || '',
			dateIn: billToEdit?.dateIn || '',
			phoneDetail: billToEdit?.phoneDetail || '',
			phoneModel: billToEdit?.phoneModel || '',
			repairType: billToEdit?.repairType || '',
			technicianNum: billToEdit?.technicianNum || '',
			color: billToEdit?.color || '',
			IME: billToEdit?.IME || '',
			Condition: billToEdit?.Condition || [],
			Item: billToEdit?.Item || [],
			CustomerName: billToEdit?.CustomerName || '',
			CustomerMobileNum: billToEdit?.CustomerMobileNum || '',
			NIC: billToEdit?.NIC || '',
			componentCost: billToEdit?.componentCost || '',
			repairCost: billToEdit?.repairCost || '',
			cost: billToEdit?.cost || '',
			Price: billToEdit?.Price || '',
			Status: billToEdit?.Status || '',
			DateOut: billToEdit?.DateOut || '',
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: {
				phoneDetail?: string;
				dateIn?: string;
				billNumber?: string;
				phoneModel?: string;
				repairType?: string;
				technicianNum?: string;
				CustomerName?: string;
				CustomerMobileNum?: string;
				NIC?: string;
				componentCost?: string;
				repairCost?: string;
				cost?: string;
				Price?: string;
				Status?: string;
				DateOut?: string;
			} = {};
			if (!values.phoneDetail) errors.phoneDetail = 'Phone Detail is required.';
			if (!values.billNumber) errors.billNumber = 'Bill Number is required.';
			if (!values.phoneModel) errors.phoneModel = 'Phone Model is required.';
			if (!values.repairType) errors.repairType = 'Repair Type is required.';
			// if (!values.technicianNum) errors.technicianNum = 'Technician No is required.';
			if (!values.CustomerName) errors.CustomerName = 'Customer Name is required.';
			if (!values.CustomerMobileNum)
				errors.CustomerMobileNum = 'Customer Mobile Number is required.';
			if (values.CustomerMobileNum.length !== 10)
				errors.CustomerMobileNum = 'Mobile Number must be 10 digits';
			if (!values.NIC) {
				errors.NIC = 'Required';
			} else if (!/^\d{9}[Vv]$/.test(values.NIC) && !/^\d{12}$/.test(values.NIC)) {
				errors.NIC = 'NIC must be 9 digits followed by "V" or 12 digits';
			}
			// if (!values.componentCost) errors.componentCost = 'Component Cost is required.';
			// else if (parseFloat(values.componentCost) <= 0)
			// 	errors.componentCost = 'Component Cost must be greater than 0';
			// if (!values.repairCost) errors.repairCost = 'Repair Cost is required.';
			// else if (parseFloat(values.repairCost) <= 0)
			// 	errors.repairCost = 'Repair Cost must be greater than 0';
			// if (!values.Price) errors.Price = 'Price is required.';
			// else if (parseFloat(values.Price) <= 0) errors.Price = 'Price must be greater than 0';
			if (!values.Status) errors.Status = 'Status is required.';
			if (!values.dateIn) errors.dateIn = 'Date In is required.';
			if (values.Status === 'Reject' || values.Status === 'Repair Completed') {
				if (!values.DateOut) errors.DateOut = 'Date Out is required.';
			} else if (new Date(values.DateOut) <= new Date(values.dateIn)) {
				errors.DateOut = 'Date Out must be after Date In.';
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
					console.log(values);
					const data = {
						billNumber: values.billNumber,
						dateIn: values.dateIn,
						phoneDetail: values.phoneDetail,
						phoneModel: values.phoneModel,
						repairType: values.repairType,
						technicianNum: values.technicianNum,
						CustomerName: values.CustomerName,
						CustomerMobileNum: values.CustomerMobileNum,
						NIC: values.NIC,
						componentCost: values.componentCost,
						repairCost: values.repairCost,
						cost: values.cost,
						Price: values.Price,
						Status: values.Status,
						DateOut: values.DateOut,
						status: true,
						id: id,
					};
					await updateBill(values).unwrap();
					refetch();
					await Swal.fire({
						icon: 'success',
						title: 'Bill Updated Successfully',
					});
					formik.resetForm();
					setIsOpen(false);
				} catch (error) {
					await Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Failed to update the bill. Please try again.',
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

	useEffect(() => {
		const componentCost = parseFloat(formik.values.componentCost) || 0;
		const repairCost = parseFloat(formik.values.repairCost) || 0;
		formik.setFieldValue('cost', (componentCost + repairCost).toFixed(2));
	}, [formik.values.componentCost, formik.values.repairCost]);

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
					<FormGroup id='billNumber' label='Bill Number' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.billNumber}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.billNumber}
							invalidFeedback={formik.errors.billNumber}
							validFeedback='Looks good!'
							readOnly
						/>
					</FormGroup>
					<FormGroup id='dateIn' label='Date In' className='col-md-6'>
						<Input
							type='date'
							onChange={formik.handleChange}
							value={formik.values.dateIn}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.dateIn}
							invalidFeedback={formik.errors.dateIn}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='phoneDetail' label='Phone Detail' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.phoneDetail}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.phoneDetail}
							invalidFeedback={formik.errors.phoneDetail}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='phoneModel' label='Phone Model' className='col-md-6'>
						<Select
							ariaLabel='Select phoneModel'
							placeholder='Select a Phone Model'
							onChange={formik.handleChange}
							value={formik.values.phoneModel}
							name='phoneModel'
							isValid={formik.isValid}
							isTouched={formik.touched.phoneModel}
							invalidFeedback={formik.errors.phoneModel}
							validFeedback='Looks good!'
							disabled={modelsLoading || isError}>
							<Option value=''>Select a phoneModel</Option>
							{models?.map((model: any, index: any) => (
								<Option key={index} value={model.name}>
									{model.name}
								</Option>
							))}
						</Select>
						{modelsLoading ? <p>Loading models...</p> : <></>}
						{modelsError ? <p>Error loading models. Please try again.</p> : <></>}
					</FormGroup>
					<FormGroup id='IME' label='IME' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.IME}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.IME}
							invalidFeedback={formik.errors.IME}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='color' label='Colour' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.color}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.color}
							invalidFeedback={formik.errors.color}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='repairType' label='Repair Type' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.repairType}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.repairType}
							invalidFeedback={formik.errors.repairType}
							validFeedback='Looks good!'
						/>
					</FormGroup>

					<FormGroup id='Condition' label='Condition' className='col-md-3'>
						<>
							{['Power On', 'Display', 'Display Light', 'Touch Pad'].map(
								(condition) => (
									<div key={condition} className='form-check'>
										<input
											type='checkbox'
											id={condition}
											name='Condition'
											value={condition}
											checked={formik.values.Condition.toString().includes(
												condition,
											)}
											onChange={(e) => {
												const { checked, value } = e.target;
												formik.setFieldValue(
													'Condition',
													checked
														? [...formik.values.Condition, value]
														: formik.values.Condition.filter(
																(c: string) => c !== value,
														  ),
												);
											}}
											onBlur={formik.handleBlur}
											className='form-check-input'
										/>
										<label htmlFor={condition} className='form-check-label'>
											{condition}
										</label>
									</div>
								),
							)}
							
						</>
					</FormGroup>

					<FormGroup id='Item' label='Accessories - from Customer' className='col-md-3'>
						<>
							{[
								'Battery',
								'Back Cover',
								'Chager',
								'SIM',
								'SIM Card Tray',
								'Memory Card',
								'Memory Card Tray',
							].map((Item) => (
								<div key={Item} className='form-check'>
									<input
										type='checkbox'
										id={Item}
										name='Item'
										value={Item}
										checked={formik.values.Item.toString().includes(Item)}
										onChange={(e) => {
											const { checked, value } = e.target;
											formik.setFieldValue(
												'Item',
												checked
													? [...formik.values.Item, value]
													: formik.values.Condition.filter(
															(c: string) => c !== value,
													  ),
											);
										}}
										onBlur={formik.handleBlur}
										className='form-check-input'
									/>
									<label htmlFor={Item} className='form-check-label'>
										{Item}
									</label>
								</div>
							))}
							
						</>
					</FormGroup>
					{/* <FormGroup id='technicianNum' label='Technician No' className='col-md-6'>
						<Select
							ariaLabel='Select Technician'
							placeholder='Select a Technician'
							onChange={formik.handleChange}
							value={formik.values.technicianNum}
							name='technicianNum'
							isValid={formik.isValid}
							isTouched={formik.touched.technicianNum}
							invalidFeedback={formik.errors.technicianNum}
							validFeedback='Looks good!'
							disabled={techniciansLoading || isError}>
							<Option value=''>Select a Technician</Option>
							{technicians?.map((technician: any, index: any) => (
								<Option key={index} value={technician.technicianNum}>
									{technician.technicianNum}
								</Option>
							))}
						</Select>
						{techniciansLoading ? <p>Loading technicians...</p> : <></>}
						{isError ? <p>Error loading technicians. Please try again.</p> : <></>}
					</FormGroup> */}
					<FormGroup id='CustomerName' label='Customer Name' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.CustomerName}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.CustomerName}
							invalidFeedback={formik.errors.CustomerName}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup
						id='CustomerMobileNum'
						label='Customer Mobile Number'
						className='col-md-6'>
						<Input
							type='text'
							value={formik.values.CustomerMobileNum}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								const input = e.target.value.replace(/\D/g, '');
								formik.setFieldValue(
									'CustomerMobileNum',
									formatMobileNumber(input),
								);
							}}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.CustomerMobileNum}
							invalidFeedback={formik.errors.CustomerMobileNum}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='NIC' label='NIC' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.NIC}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.NIC}
							invalidFeedback={formik.errors.NIC}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					{/* <FormGroup id='componentCost' label='Component Cost (lkr)' className='col-md-6'>
						<Input
							type='number'
							onChange={formik.handleChange}
							value={formik.values.componentCost}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.componentCost}
							invalidFeedback={formik.errors.componentCost}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='repairCost' label='Repair Cost (lkr)' className='col-md-6'>
						<Input
							type='number'
							onChange={formik.handleChange}
							value={formik.values.repairCost}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.repairCost}
							invalidFeedback={formik.errors.repairCost}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='cost' label='Cost (lkr)' className='col-md-6'>
						<Input
							type='number'
							onChange={formik.handleChange}
							value={formik.values.cost}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.cost}
							invalidFeedback={formik.errors.cost}
							validFeedback='Looks good!'
							readOnly
						/>
					</FormGroup>*/}
					<FormGroup id='Price' label='Price (lkr)' className='col-md-6'>
						<Input
							type='number'
							onChange={formik.handleChange}
							value={formik.values.Price}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.Price}
							invalidFeedback={formik.errors.Price}
							validFeedback='Looks good!'
						/>
					</FormGroup> 
					{/* <FormGroup id='Status' label='Status' className='col-md-6'>
						<Select
							ariaLabel='Default select Status'
							placeholder='Open this select Status'
							onChange={formik.handleChange}
							value={formik.values.Status}
							name='Status'
							isValid={formik.isValid}
							isTouched={formik.touched.Status}
							invalidFeedback={formik.errors.Status}
							validFeedback='Looks good!'>
							<Option value=''>Select the Status</Option>
							<Option value='Waiting'>Waiting</Option>
							<Option value='Ready to Repair'>Ready to Repair</Option>
							<Option value='In Progress'>In Progress</Option>
							<Option value='Reject'>Reject</Option>
							<Option value='Repair Completed'>Repair Completed</Option>
						</Select>
					</FormGroup> */}
					{formik.values.Status === 'Reject' ||
					formik.values.Status === 'Repair Completed' ? (
						<FormGroup id='DateOut' label='Date Out' className='col-md-6'>
							<Input
								type='date'
								onChange={formik.handleChange}
								value={formik.values.DateOut}
								onBlur={formik.handleBlur}
								isValid={formik.isValid}
								isTouched={formik.touched.DateOut}
								invalidFeedback={formik.errors.DateOut}
								validFeedback='Looks good!'
							/>
						</FormGroup>
					) : null}
				</div>
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				<Button color='success' onClick={formik.handleSubmit}>
					Edit Bill
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
