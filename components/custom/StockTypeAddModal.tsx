import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import { useAddStockKeeperMutation } from '../../redux/slices/stockKeeperApiSlice';
import { useGetStockKeepersQuery } from '../../redux/slices/stockKeeperApiSlice';
import Swal from 'sweetalert2';

interface StockTypeAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const StockTypeAddModal: FC<StockTypeAddModalProps> = ({ id, isOpen, setIsOpen }) => {
	const [addStockKeeper, { isLoading }] = useAddStockKeeperMutation();
	const { refetch } = useGetStockKeepersQuery(undefined);
	const formik = useFormik({
		initialValues: {
			type: '',
			description: '',
			status: true,
		},
		validate: (values) => {
			const errors: {
				type?: string;
				description?: string;
			} = {};
			if (!values.description) {
				errors.description = 'Required';
			}
			if (!values.type) {
				errors.type = 'Required';
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
					const response: any = await addStockKeeper(values).unwrap();
					refetch();
					await Swal.fire({
						icon: 'success',
						title: 'Stock Keeper Created Successfully',
					});
					formik.resetForm();
					setIsOpen(false);
				} catch (error) {
					console.error('Error during handleSubmit: ', error);
					await Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Failed to add the stock keeper. Please try again.',
					});
				}
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				Swal.close;
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
				<ModalTitle id=''>{'New Stock Keeper Type'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='type' label='Stock Keeper Type' className='col-md-6'>
						<Input
							onChange={formik.handleChange}
							value={formik.values.type}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.type}
							invalidFeedback={formik.errors.type}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='description' label='Description' className='col-md-6'>
						<Input
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
					Create Stock Keeper Type
				</Button>
			</ModalFooter>
		</Modal>
	);
};
StockTypeAddModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default StockTypeAddModal;
