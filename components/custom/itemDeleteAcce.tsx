import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import Button from '../bootstrap/Button';
import Swal from 'sweetalert2';
import {
	useDeleteItemAcceMutation,
	useGetItemAccesQuery,
	useGetDeleteItemAccesQuery,
	useUpdateItemAcceMutation,
} from '../../redux/slices/itemManagementAcceApiSlice';

interface CategoryEditModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const CategoryEditModal: FC<CategoryEditModalProps> = ({ id, isOpen, setIsOpen }) => {
	const { data: ItemAcces, error, isLoading } = useGetDeleteItemAccesQuery(undefined);
	const [updateItemAcce] = useUpdateItemAcceMutation();
	const [deleteItemAcce] = useDeleteItemAcceMutation();
	const { refetch } = useGetDeleteItemAccesQuery(undefined);

	const handleClickDelete = async (itemAcce: any) => {
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
				await deleteItemAcce(itemAcce.id).unwrap();
				Swal.fire('Deleted!', 'The Item Acce has been deleted.', 'success');
				refetch();
			}
		} catch (error) {
			console.error('Error deleting dealer:', error);
			Swal.fire('Error', 'Failed to delete dealer.', 'error');
		}
	};

	const handleClickRestore = async (itemAcce: any) => {
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
				const values = {
					id: itemAcce.id,
					status: true,
					type: itemAcce.type,
					mobileType: itemAcce.mobileType,
					category: itemAcce.category,
					model: itemAcce.model,
					brand: itemAcce.brand,
					reorderLevel: itemAcce.reorderLevel,
					description: itemAcce.description,
					code: itemAcce.code,
					quantity: itemAcce.quantity,
					warranty: itemAcce.warranty,
				};
				await updateItemAcce(values).unwrap();
				Swal.fire('Restored!', 'The item has been restored.', 'success');
				refetch();
			}
		} catch (error) {
			console.error('Error restoring item:', error);
			Swal.fire('Error', 'Failed to restore item.', 'error');
		}
	};

	const handleDeleteAll = async () => {
		try {
			const { value: inputText } = await Swal.fire({
				title: 'Are you sure?',
				text: 'Please type "DELETE ALL" to confirm deleting all items.',
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
				for (const itemAcce of ItemAcces) {
					await deleteItemAcce(itemAcce.id).unwrap();
				}
				Swal.fire('Deleted!', 'All items have been deleted.', 'success');
				refetch();
			}
		} catch (error) {
			console.error('Error deleting all items:', error);
			Swal.fire('Error', 'Failed to delete all items.', 'error');
		}
	};

	const handleRestoreAll = async () => {
		try {
			const result = await Swal.fire({
				title: 'Are you sure?',
				text: 'This will restore all items.',
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
				for (const itemAcce of ItemAcces) {
					const values = {
						id: itemAcce.id,
						status: true,
						type: itemAcce.type,
						mobileType: itemAcce.mobileType,
						category: itemAcce.category,
						model: itemAcce.model,
						brand: itemAcce.brand,
						reorderLevel: itemAcce.reorderLevel,
						description: itemAcce.description,
						code: itemAcce.code,
						quantity: itemAcce.quantity,
						warranty: itemAcce.warranty,
					};
					await updateItemAcce(values).unwrap();
				}
				Swal.fire('Restored!', 'All items have been restored.', 'success');
				refetch();
			}
		} catch (error) {
			console.error('Error restoring all items:', error);
			Swal.fire('Error', 'Failed to restore all items.', 'error');
		}
	};

	return (
		<Modal isOpen={isOpen} aria-hidden={!isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader setIsOpen={setIsOpen} className='p-4'>
				<ModalTitle id=''>{'Recycle Bin'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<table className='table table-bordered border-primary table-modern table-hover text-center'>
					<thead>
						<tr>
							<th>Model</th>
							<th>
								<Button
									icon='Delete'
									onClick={handleDeleteAll}
									color='danger'
									isLight
									isDisable={!ItemAcces || ItemAcces.length === 0}>
									Delete All
								</Button>
								<Button
									icon='Restore'
									className='ms-3'
									onClick={handleRestoreAll}
									color='primary'
									isDisable={!ItemAcces || ItemAcces.length === 0}>
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
								<td>Error fetching items.</td>
							</tr>
						)}
						{ItemAcces &&
							ItemAcces.map((itemAcce: any, index: any) => (
								<tr key={index}>
									<td>{itemAcce.model}</td>
									<td>
										<Button
											icon='Restore'
											tag='a'
											color='info'
											onClick={() => handleClickRestore(itemAcce)}>
											Restore
										</Button>
										<Button
											className='m-2'
											icon='Delete'
											color='danger'
											onClick={() => handleClickDelete(itemAcce)}>
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
CategoryEditModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default CategoryEditModal;
