import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import showNotification from '../extras/showNotification';
import Icon from '../icon/Icon';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import Swal from 'sweetalert2';
import useDarkMode from '../../hooks/useDarkMode';
import Dropdown, { DropdownMenu, DropdownToggle } from '../bootstrap/Dropdown';
import {
	useDeleteSupplierMutation,
	useGetSuppliersQuery,
	useGetDeleteSuppliersQuery,
	useUpdateSupplierMutation,
} from '../../redux/slices/supplierApiSlice';

interface UserEditModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const UserEditModal: FC<UserEditModalProps> = ({ id, isOpen, setIsOpen }) => {
	const { data: suppliers, error, isLoading } = useGetDeleteSuppliersQuery(undefined);
	const [updateSupplier] = useUpdateSupplierMutation();
	const [deleteSupplier] = useDeleteSupplierMutation();
	const { refetch } = useGetDeleteSuppliersQuery(undefined);

	const handleClickDelete = async (supplier: any) => {
		try {
			const { value: inputText } = await Swal.fire({
				title: 'Are you sure?',
				text: 'Please type "DELETE" to confirm',
				input: 'text',
				icon: 'warning',
				inputValidator: (value) => {
					if (value !== 'DELETE') {
						return 'You need to type "DELETE" to confirm!';
					}
				},
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, delete it!',
			});
			if (inputText === 'DELETE') {
				const process = Swal.fire({
					title: 'Processing...',
					html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
					allowOutsideClick: false,
					showCancelButton: false,
					showConfirmButton: false,
				});
				await deleteSupplier(supplier.id).unwrap();
				Swal.fire('Deleted!', 'The supplier has been permentaly deleted.', 'success');

				refetch();
			}
		} catch (error) {
			console.error('Error deleting supplier:', error);
			Swal.fire('Error', 'Failed to delete supplier.', 'error');
		}
	};

	const handleClickRestore = async (supplier: any) => {
		try {
			const result = await Swal.fire({
				title: 'Are you sure?',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, Restore it!',
			});
			if (result.isConfirmed) {
				const process = Swal.fire({
					title: 'Processing...',
					html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
					allowOutsideClick: false,
					showCancelButton: false,
					showConfirmButton: false,
				});
				const values = await {
					id: supplier.id,
					name: supplier.name,
					status: true,
					item: supplier.item,
					email: supplier.email,
					address: supplier.address,
					mobileNumber: supplier.mobileNumber,
					type: supplier.type,
				};
				await updateSupplier(values);
				Swal.fire('Restored!', 'The supplier has been restored.', 'success');
			}
		} catch (error) {
			console.error('Error deleting document: ', error);
			Swal.fire('Error', 'Failed to delete supplier.', 'error');
		}
	};

	const handleDeleteAll = async () => {
		try {
			const { value: inputText } = await Swal.fire({
				title: 'Are you sure?',
				text: 'Please type "DELETE ALL" to confirm deleting all suppliers',
				input: 'text',
				icon: 'warning',
				inputValidator: (value) => {
					if (value !== 'DELETE ALL') {
						return 'You need to type "DELETE ALL" to confirm!';
					}
				},
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, delete all!',
			});
			if (inputText === 'DELETE ALL') {
				const process = Swal.fire({
					title: 'Processing...',
					html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
					allowOutsideClick: false,
					showCancelButton: false,
					showConfirmButton: false,
				});
				for (const supplier of suppliers) {
					await deleteSupplier(supplier.id).unwrap();
				}
				Swal.fire('Deleted!', 'All suppliers have been permentaly deleted.', 'success');
				refetch();
			}
		} catch (error) {
			console.error('Error deleting all suppliers:', error);
			Swal.fire('Error', 'Failed to delete all suppliers.', 'error');
		}
	};

	const handleRestoreAll = async () => {
		try {
			const result = await Swal.fire({
				title: 'Are you sure?',
				text: 'This will restore all suppliers.',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, restore all!',
			});
			if (result.isConfirmed) {
				const process = Swal.fire({
					title: 'Processing...',
					html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
					allowOutsideClick: false,
					showCancelButton: false,
					showConfirmButton: false,
				});
				for (const supplier of suppliers) {
					const values = {
						id: supplier.id,
						name: supplier.name,
						status: true,
						item: supplier.item,
						email: supplier.email,
						address: supplier.address,
						mobileNumber: supplier.mobileNumber,
						type: supplier.type,
					};
					await updateSupplier(values).unwrap();
				}
				Swal.fire('Restored!', 'All suppliers have been restored.', 'success');
				refetch();
			}
		} catch (error) {
			console.error('Error restoring all suppliers:', error);
			Swal.fire('Error', 'Failed to restore all suppliers.', 'error');
		}
	};

	return (
		<Modal isOpen={isOpen} aria-hidden={!isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader setIsOpen={setIsOpen} className='p-4'>
				<ModalTitle id=''>{'Recycle Bin'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<table className='table table-bordered border-primary  table-hover'>
					<thead className={'table-dark border-primary'}>
						<tr>
							<th>Supplier</th>
							<th>
								<Button
									icon='Delete'
									onClick={handleDeleteAll}
									color='danger'
									isLight
									isDisable={!suppliers || suppliers.length === 0 || isLoading}>
									Delete All
								</Button>
								<Button
									icon='Restore'
									className='ms-3'
									onClick={handleRestoreAll}
									color='primary'
									isDisable={!suppliers || suppliers.length === 0 || isLoading}>
									Restore All
								</Button>
							</th>
						</tr>
					</thead>
					<tbody>
						{isLoading && (
							<tr>
								<td>Loading...</td>
							</tr>
						)}
						{error && (
							<tr>
								<td>Error fetching suppliers.</td>
							</tr>
						)}
						{suppliers &&
							suppliers.map((supplier: any, index: any) => (
								<tr key={index}>
									<td>{supplier.name}</td>
									<td>
										<Button
											icon='Restore'
											tag='a'
											color='info'
											onClick={() => handleClickRestore(supplier)}>
											Restore
										</Button>
										<Button
											className='m-2'
											icon='Delete'
											color='danger'
											onClick={() => handleClickDelete(supplier)}>
											Delete
										</Button>
									</td>
								</tr>
							))}
					</tbody>
				</table>
			</ModalBody>
		</Modal>
	);
};
UserEditModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default UserEditModal;
