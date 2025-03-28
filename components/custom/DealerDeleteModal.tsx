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
	useDeleteDealerMutation,
	useGetDealersQuery,
	useGetDeleteDealersQuery,
	useUpdateDealerMutation,
} from '../../redux/slices/delearApiSlice';

interface UserEditModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const UserEditModal: FC<UserEditModalProps> = ({ id, isOpen, setIsOpen }) => {
	const { data: dealers, error, isLoading } = useGetDeleteDealersQuery(undefined);
	const [updateDealer] = useUpdateDealerMutation();
	const [deleteDealer] = useDeleteDealerMutation();
	const { refetch } = useGetDeleteDealersQuery(undefined);

	const handleClickDelete = async (dealer: any) => {
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
				await deleteDealer(dealer.id).unwrap();
				Swal.fire('Deleted!', 'The dealer has been permentaly deleted.', 'success');
				refetch();
			}
		} catch (error) {
			console.error('Error deleting dealer:', error);
			Swal.fire('Error', 'Failed to delete dealer.', 'error');
		}
	};

	const handleClickRestore = async (dealer: any) => {
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
					id: dealer.id,
					name: dealer.name,
					status: true,
					item: dealer.item,
					email: dealer.email,
					address: dealer.address,
					mobileNumber: dealer.mobileNumber,
				};
				await updateDealer(values);
				Swal.fire('Restored!', 'The dealer has been restored.', 'success');
			}
		} catch (error) {
			console.error('Error deleting document: ', error);
			Swal.fire('Error', 'Failed to delete dealer.', 'error');
		}
	};

	const handleDeleteAll = async () => {
		try {
			if (!dealers || dealers.length === 0) {
				Swal.fire('Error', 'No dealers available to delete.', 'error');
				return;
			}
			const { value: inputText } = await Swal.fire({
				title: 'Are you sure?',
				text: 'Please type "DELETE ALL" to confirm deleting all dealers',
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
				for (const dealer of dealers) {
					await deleteDealer(dealer.id).unwrap();
				}
				Swal.fire('Deleted!', 'All dealers have been permentaly deleted.', 'success');
				refetch();
			}
		} catch (error) {
			console.error('Error deleting all dealers:', error);
			Swal.fire('Error', 'Failed to delete all dealers.', 'error');
		}
	};

	const handleRestoreAll = async () => {
		try {
			if (!dealers || dealers.length === 0) {
				Swal.fire('Error', 'No dealers available to restore.', 'error');
				return;
			}
			const result = await Swal.fire({
				title: 'Are you sure?',
				text: 'This will restore all dealers.',
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
				for (const dealer of dealers) {
					const values = {
						id: dealer.id,
						name: dealer.name,
						status: true,
						item: dealer.item,
						email: dealer.email,
						address: dealer.address,
						mobileNumber: dealer.mobileNumber,
					};
					await updateDealer(values).unwrap();
				}
				Swal.fire('Restored!', 'All dealers have been restored.', 'success');
				refetch();
			}
		} catch (error) {
			console.error('Error restoring all dealers:', error);
			Swal.fire('Error', 'Failed to restore all dealers.', 'error');
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
							<th>Dealer</th>
							<th>
								<Button
									icon='Delete'
									onClick={handleDeleteAll}
									color='danger'
									isLight
									isDisable={!dealers || dealers.length === 0 || isLoading}>
									Delete All
								</Button>
								<Button
									icon='Restore'
									className='ms-3'
									onClick={handleRestoreAll}
									color='primary'
									isDisable={!dealers || dealers.length === 0 || isLoading}>
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
								<td>Error fetching dealers.</td>
							</tr>
						)}
						{dealers &&
							dealers.map((dealer: any, index: any) => (
								<tr key={index}>
									<td>{dealer.name}</td>
									<td>
										<Button
											icon='Restore'
											tag='a'
											color='info'
											onClick={() => handleClickRestore(dealer)}>
											Restore
										</Button>
										<Button
											className='m-2'
											icon='Delete'
											color='danger'
											onClick={() => handleClickDelete(dealer)}>
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
