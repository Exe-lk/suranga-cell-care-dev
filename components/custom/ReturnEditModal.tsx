import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import Swal from 'sweetalert2';
import { supabase } from '../../lib/supabase';

interface CategoryEditModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const CategoryEditModal: FC<CategoryEditModalProps> = ({ id, isOpen, setIsOpen }) => {

const formik = useFormik({
		initialValues: {
			description:'',
			date:''
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: { description?: string,date?:string } = {};
			if (!values.description) {
				errors.description = 'Required';
			}
			if (!values.date) {
				errors.date = 'Required';
			}
			return errors;
		},
		onSubmit: async (values) => {
			try {
				
				Swal.fire({
					title: 'Processing...',
					html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
					allowOutsideClick: false,
					showCancelButton: false,
					showConfirmButton: false,
				});

				const data = {
					description: values.description,
					receivedate: values.date
					
				};
				await supabase
				.from('returnPhone')
				.update(data)
				.eq('id', id);

				await Swal.fire({ icon: 'success', title: 'Category Updated Successfully' });
				formik.resetForm();
				setIsOpen(false);
			} catch (error) {
				await Swal.fire({
					icon: 'error',
					title: 'Error',
					text: 'Failed to update the category. Please try again.',
				});
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
				<ModalTitle id=''>{'Edit Return'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='description' label='Description' className='col-md-6'>
						<Input
							name='description'
							value={formik.values.description}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.description}
							invalidFeedback={formik.errors.description}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='date' label='Receive Date ' className='col-md-6'>
						<Input
						type='date'
						
							value={formik.values.date}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.date}
							invalidFeedback={formik.errors.date}
							validFeedback='Looks good!'
						/>
					</FormGroup>
				</div>
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				<Button color='success' onClick={formik.handleSubmit}>
					Edit retutn 
				</Button>
			</ModalFooter>
		</Modal>
	);
};
CategoryEditModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default CategoryEditModal;
