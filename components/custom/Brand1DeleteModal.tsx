import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import Button from '../bootstrap/Button';
import Swal from 'sweetalert2';
import {
	useDeleteBrand1Mutation,
	useUpdateBrand1Mutation,
	useGetDeleteBrands1Query,
} from '../../redux/slices/brand1ApiSlice';

interface BrandDeleteModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
	refetchMainPage: () => void;
}

const BrandDeleteModal: FC<BrandDeleteModalProps> = ({
	id,
	isOpen,
	setIsOpen,
	refetchMainPage,
}) => {
	const [deleteBrand] = useDeleteBrand1Mutation();
	const [updateBrand] = useUpdateBrand1Mutation();
	const { data: brands, error, isLoading, refetch } = useGetDeleteBrands1Query(undefined);

	const handleClickDelete = async (brand: any) => {
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
			await deleteBrand(brand.id)
				.unwrap()
				.then(() => {
					Swal.fire('Deleted!', 'The Brand has been permentaly deleted.', 'success');
					refetch();
				})
				.catch((error) => {
					console.error('Error deleting brand:', error);
					Swal.fire('Error', 'Failed to delete brand.', 'error');
				});
		}
	};

	const handleClickRestore = async (brand: any) => {
		if (!brands) {
			console.error('No users to restore.');
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
					id: brand.id,
					category: brand.category,
					name: brand.name,
					status: true,
				};
				await updateBrand(values);
				Swal.fire('Restored!', 'The Brand has been restored.', 'success');
				refetch();
				refetchMainPage();
			}
		} catch (error) {
			console.error('Error restoring Brand:', error);
			Swal.fire('Error', 'Failed to restore Brand.', 'error');
		}
	};

	const handleDeleteAll = async () => {
		const confirmation = await Swal.fire({
			title: 'Are you sure?',
			text: 'Type "DELETE ALL" to confirm deleting all brands.',
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
			for (const brand of brands) {
				await deleteBrand(brand.id).unwrap();
			}
			Swal.fire('Deleted!', 'All Brands have been permentaly deleted.', 'success');
			refetch();
		}
	};

	const handleRestoreAll = async () => {
		const confirmation = await Swal.fire({
			title: 'Are you sure?',
			text: 'Restore all brands?',
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
			for (const brand of brands) {
				const updatedBrand = { ...brand, status: true };
				await updateBrand(updatedBrand).unwrap();
			}
			Swal.fire('Restored!', 'All Brands have been restored.', 'success');
			refetch();
			refetchMainPage();
		}
	};

	useEffect(() => {
		if (isOpen && brands) {
			refetch();
		}
	}, [isOpen, brands, refetch]);

	return (
		<Modal isOpen={isOpen} aria-hidden={!isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader setIsOpen={setIsOpen} className='p-4'>
				<ModalTitle id=''>{'Recycle Bin'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<table className='table table-bordered border-primary table-modern table-hover text-center'>
					<thead>
						<tr>
							<th>Brand name</th>
							<th>
								<Button
									icon='Delete'
									color='danger'
									onClick={handleDeleteAll}
									isDisable={!brands || brands.length === 0 || isLoading}>
									Delete All
								</Button>
								<Button
									icon='Restore'
									color='info'
									className='ms-3'
									onClick={handleRestoreAll}
									isDisable={!brands || brands.length === 0 || isLoading}>
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
								<td colSpan={2}>Error fetching brands.</td>
							</tr>
						)}
						{brands &&
							brands.length > 0 &&
							brands.map((brand: any, index: any) => (
								<tr key={index}>
									<td>{brand.name}</td>
									<td>
										<Button
											icon='Restore'
											tag='a'
											color='info'
											onClick={() => handleClickRestore(brand)}>
											Restore
										</Button>
										<Button
											className='m-2'
											icon='Delete'
											color='danger'
											onClick={() => handleClickDelete(brand)}>
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
BrandDeleteModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default BrandDeleteModal;
