import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import showNotification from '../extras/showNotification';
import Icon from '../icon/Icon';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import Swal from 'sweetalert2';
import {
	useGetStockKeepersQuery,
	useUpdateStockKeeperMutation,
} from '../../redux/slices/stockKeeperApiSlice';

interface StockTypeEditModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const StockTypeEditModal: FC<StockTypeEditModalProps> = ({ id, isOpen, setIsOpen }) => {
	const { data: stockKeeperData, refetch } = useGetStockKeepersQuery(undefined);
	const [updateStockKeeper, { isLoading }] = useUpdateStockKeeperMutation();
	const stockKeeperToEdit = stockKeeperData?.find((stockKeeper: any) => stockKeeper.id === id);

	const formik = useFormik({
		initialValues: {
			id: '',
			type: stockKeeperToEdit?.type || '',
			description: stockKeeperToEdit?.description || '',
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: {
				type?: string;
				description?: string;
			} = {};
			if (!values.type) {
				errors.type = 'Required';
			}
			if (!values.description) {
				errors.description = 'Required';
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
						type: values.type,
						description: values.description,
						status: true,
						id: id,
					};
					await updateStockKeeper(data).unwrap();
					refetch();
					await Swal.fire({
						icon: 'success',
						title: 'Stock Keeper Type Updated Successfully',
					});
					formik.resetForm();
					setIsOpen(false);
				} catch (error) {
					await Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Failed to update the stock type. Please try again.',
					});
				}
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				alert('An error occurred during file upload. Please try again later.');
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
				<ModalTitle id=''>{'Edit Stock Keeper Type'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='type' label='Type' className='col-md-6'>
						<Input
							name='type'
							value={formik.values.type}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.type}
							invalidFeedback={formik.errors.type}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='description' label='Description' className='col-md-6'>
						<Input
							name='description'
							onChange={formik.handleChange}
							value={formik.values.description}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.description}
							invalidFeedback={formik.errors.description}
							validFeedback='Looks good!'
						/>
					</FormGroup>
				</div>
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				<Button color='success' onClick={formik.handleSubmit}>
					Edit Stock Keeper Type
				</Button>
			</ModalFooter>
		</Modal>
	);
};
StockTypeEditModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default StockTypeEditModal;
