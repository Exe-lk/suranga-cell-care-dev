import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, } from '../bootstrap/Modal';
import showNotification from '../extras/showNotification';
import Icon from '../icon/Icon';
import FormGroup from '..//bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { firestore, storage } from '../../firebaseConfig';
import Swal from 'sweetalert2';
import Select from '../bootstrap/forms/Select';
import Option, { Options } from '../bootstrap/Option';
import {
	useUpdateStockInOutMutation,
	useGetStockInOutsQuery,
} from '../../redux/slices/stockInOutAcceApiSlice';

interface StockAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const StockAddModal: FC<StockAddModalProps> = ({ id, isOpen, setIsOpen }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const currentDate = new Date();
	const formattedDate = currentDate.toLocaleDateString();
	const { data: stockInOuts ,refetch} = useGetStockInOutsQuery(undefined);
	const stockInOutToEdit = stockInOuts?.find((stockInOut: any) => stockInOut.id === id);
	const [updateStockInOut, { isLoading }] = useUpdateStockInOutMutation();

	const formik = useFormik({
		initialValues: {
			id:'',
			quantity:stockInOutToEdit?.quantity || '',
			status:true,
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: {
				quantity?: string;
			} = {};
			if (!values.quantity) {
				errors.quantity = 'Required';
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
						quantity: values.quantity
					};
					await updateStockInOut(data).unwrap();
					await Swal.fire({
						icon: 'success',
						title: 'Item Dis Updated Successfully',
					});
					await refetch(); 
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
	
	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader setIsOpen={setIsOpen} className='p-4'>
				<ModalTitle id="">{'Edit Stock'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='quantity' label='Quantity' className='col-md-6'>
						<Input
							type='number'
							onChange={formik.handleChange}
							value={formik.values.quantity}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							validFeedback='Looks good!'
						/>
					</FormGroup>	
				</div>
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				<Button color='info' onClick={formik.handleSubmit} >
					Save
				</Button>
			</ModalFooter>
		</Modal>
	);
}
StockAddModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default StockAddModal;
