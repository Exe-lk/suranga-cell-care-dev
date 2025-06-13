import React, { FC, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import Swal from 'sweetalert2';

interface CostEditModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
	billData: any;
	onUpdate: (id: string, updatedData: any) => void;
}

const CostEditModal: FC<CostEditModalProps> = ({ id, isOpen, setIsOpen, billData, onUpdate }) => {
	const formik = useFormik({
		initialValues: {
			componentCost: billData?.componentCost || '',
			repairCost: billData?.repairCost || '',
			totalCost: billData?.totalCost || '',
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: {
				componentCost?: string;
				repairCost?: string;
			} = {};
			if (!values.componentCost) errors.componentCost = 'Component Cost is required.';
			else if (parseFloat(values.componentCost) < 0)
				errors.componentCost = 'Component Cost must be 0 or greater';
			if (!values.repairCost) errors.repairCost = 'Repair Cost is required.';
			else if (parseFloat(values.repairCost) < 0)
				errors.repairCost = 'Repair Cost must be 0 or greater';
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

				const response = await fetch(`/api/bill/${billData?.billNumber || id}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						id: billData?.billNumber || id,
						componentCost: values.componentCost,
						repairCost: values.repairCost,
						totalCost: values.totalCost,
					}),
				});

				if (response.ok) {
					await Swal.fire({
						icon: 'success',
						title: 'Costs Updated Successfully',
					});
					onUpdate(id, values);
					formik.resetForm();
					setIsOpen(false);
				} else {
					await Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Failed to update costs. Please try again.',
					});
				}
			} catch (error) {
				console.error('Error updating costs: ', error);
				await Swal.fire({
					icon: 'error',
					title: 'Error',
					text: 'An error occurred. Please try again later.',
				});
			}
		},
	});

	useEffect(() => {
		const componentCost = parseFloat(formik.values.componentCost) || 0;
		const repairCost = parseFloat(formik.values.repairCost) || 0;
		formik.setFieldValue('totalCost', (componentCost + repairCost).toFixed(2));
	}, [formik.values.componentCost, formik.values.repairCost]);

	return (
		<Modal isOpen={isOpen} aria-hidden={!isOpen} setIsOpen={setIsOpen} size='lg' titleId={id}>
			<ModalHeader
				setIsOpen={() => {
					setIsOpen(false);
					formik.resetForm();
				}}
				className='p-4'>
				<ModalTitle id=''>Edit Costs - Bill #{billData?.billNumber}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<div className='col-12 mb-3'>
						<h6 className='text-muted'>Customer: {billData?.CustomerName}</h6>
						<h6 className='text-muted'>Phone Model: {billData?.phoneModel}</h6>
						<h6 className='text-muted'>Repair Type: {billData?.repairType}</h6>
					</div>
					
					<FormGroup id='componentCost' label='Component Cost (LKR)' className='col-md-6'>
						<Input
							type='number'
							min={0}
							step={0.01}
							onChange={formik.handleChange}
							value={formik.values.componentCost}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.componentCost}
							invalidFeedback={formik.errors.componentCost}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					
					<FormGroup id='repairCost' label='Repair Cost (LKR)' className='col-md-6'>
						<Input
							type='number'
							min={0}
							step={0.01}
							onChange={formik.handleChange}
							value={formik.values.repairCost}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.repairCost}
							invalidFeedback={formik.errors.repairCost}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					
					<FormGroup id='totalCost' label='Total Cost (LKR)' className='col-md-12'>
						<Input
							type='number'
							value={formik.values.totalCost}
							readOnly
							className='bg-light'
						/>
					</FormGroup>
				</div>
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				<Button 
					color='secondary' 
					onClick={() => {
						setIsOpen(false);
						formik.resetForm();
					}}
				>
					Cancel
				</Button>
				<Button color='success' onClick={formik.handleSubmit}>
					Update Costs
				</Button>
			</ModalFooter>
		</Modal>
	);
};

CostEditModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
	billData: PropTypes.object.isRequired,
	onUpdate: PropTypes.func.isRequired,
};

export default CostEditModal; 