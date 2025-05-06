import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import Button from '../bootstrap/Button';
import Swal from 'sweetalert2';
import {
	useDeleteCategory1Mutation,
	useUpdateCategory1Mutation,
	useGetDeleteCategories1Query,
} from '../../redux/slices/category1ApiSlice';

interface CategoryEditModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
	refetchMainPage: () => void;
}

const CategoryEditModal: FC<CategoryEditModalProps> = ({
	id,
	isOpen,
	setIsOpen,
	refetchMainPage,
}) => {
	const [deleteCategory] = useDeleteCategory1Mutation();
	const [updateCategory] = useUpdateCategory1Mutation();
	const { data: categories, error, isLoading, refetch } = useGetDeleteCategories1Query(undefined);

	useEffect(() => {
		if (isOpen && categories) {
			refetch();
		}
	}, [isOpen, categories, refetch]);

	const handleClickDelete = async (category: any) => {
		const confirmation = await Swal.fire({
			title: 'Are you sure?',
			text: 'Please type "DELETE" to confirm.',
			input: 'text',
			inputValidator: (value) =>
				value !== 'DELETE' ? 'You need to type "DELETE" to confirm!' : null,
			showCancelButton: true,
			confirmButtonText: 'Delete',
		});
		if (confirmation.value === 'DELETE') {
			const process = Swal.fire({
				title: 'Processing...',
				html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
				allowOutsideClick: false,
				showCancelButton: false,
				showConfirmButton: false,
			});
			await deleteCategory(category.id)
				.unwrap()
				.then(() => {
					Swal.fire('Deleted!', 'The category has been permentaly deleted.', 'success');
					refetch();
				})
				.catch((error) => {
					console.error('Error deleting category:', error);
					Swal.fire('Error', 'Failed to delete category.', 'error');
				});
		}
	};

	const handleClickRestore = async (category: any) => {
		if (!categories) {
			console.error('No categories to restore.');
			return;
		}
		try {
			const result = await Swal.fire({
				title: 'Are you sure?',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, restore it!',
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
					id: category.id,
					name: category.name,
					status: true,
				};
				await updateCategory(values);
				Swal.fire('Restored!', 'The category has been restored.', 'success');
				refetch();
				refetchMainPage();
			}
		} catch (error) {
			console.error('Error restoring category:', error);
			Swal.fire('Error', 'Failed to restore category.', 'error');
		}
	};

	const handleDeleteAll = async () => {
		const confirmation = await Swal.fire({
			title: 'Are you sure?',
			text: 'Type "DELETE ALL" to confirm deleting all categories.',
			input: 'text',
			inputValidator: (value) =>
				value !== 'DELETE ALL' ? 'You need to type "DELETE ALL" to confirm!' : null,
			showCancelButton: true,
			confirmButtonText: 'Delete All',
		});
		if (confirmation.value === 'DELETE ALL') {
			const process = Swal.fire({
				title: 'Processing...',
				html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
				allowOutsideClick: false,
				showCancelButton: false,
				showConfirmButton: false,
			});
			for (const category of categories) {
				await deleteCategory(category.id).unwrap();
			}
			Swal.fire('Deleted!', 'All categories have been permentaly deleted.', 'success');
			refetch();
		}
	};

	const handleRestoreAll = async () => {
		const confirmation = await Swal.fire({
			title: 'Are you sure?',
			text: 'Restore all categories?',
			showCancelButton: true,
			confirmButtonText: 'Restore All',
		});
		if (confirmation.isConfirmed) {
			const process = Swal.fire({
				title: 'Processing...',
				html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
				allowOutsideClick: false,
				showCancelButton: false,
				showConfirmButton: false,
			});
			for (const category of categories) {
				const updatedCategory = { ...category, status: true };
				await updateCategory(updatedCategory).unwrap();
			}
			Swal.fire('Restored!', 'All categories have been restored.', 'success');
			refetch();
			refetchMainPage();
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
							<th>Category name</th>
							<th>
								<Button
									icon='Delete'
									color='danger'
									onClick={handleDeleteAll}
									isDisable={!categories || categories.length === 0 || isLoading}>
									Delete All
								</Button>
								<Button
									icon='Restore'
									color='info'
									className='ms-3'
									onClick={handleRestoreAll}
									isDisable={!categories || categories.length === 0 || isLoading}>
									Restore All
								</Button>
							</th>
						</tr>
					</thead>
					<tbody>
						{isLoading && (
							<tr>
								<td colSpan={2}>Loading...</td>
							</tr>
						)}
						{error && (
							<tr>
								<td colSpan={2}>Error fetching categories.</td>
							</tr>
						)}
						{categories &&
							categories.length > 0 &&
							categories.map((category: any, index: any) => (
								<tr key={index}>
									<td>{category.name}</td>
									<td>
										<Button
											icon='Restore'
											tag='a'
											color='info'
											onClick={() => handleClickRestore(category)}
												isDisable={!categories || categories.length === 0 || isLoading}>
											Restore
										</Button>
										<Button
											className='m-2'
											icon='Delete'
											color='danger'
											onClick={() => handleClickDelete(category)}
													isDisable={!categories || categories.length === 0 || isLoading}>
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
