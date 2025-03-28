import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import Button from '../bootstrap/Button';
import Swal from 'sweetalert2';
import {
	useDeleteStockKeeperMutation,
	useUpdateStockKeeperMutation,
	useGetDeleteStockKeepersQuery,
} from '../../redux/slices/stockKeeperApiSlice';

interface StockTypeDeleteModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
	refetchMainPage: () => void;
}

const StockTypeDeleteModal: FC<StockTypeDeleteModalProps> = ({
	id,
	isOpen,
	setIsOpen,
	refetchMainPage,
}) => {
	const [deleteStockKeeper] = useDeleteStockKeeperMutation();
	const [updateStockKeeper] = useUpdateStockKeeperMutation();
	const {
		data: stockKeepers,
		error,
		isLoading,
		refetch,
	} = useGetDeleteStockKeepersQuery(undefined);

	useEffect(() => {
		if (isOpen && stockKeepers) {
			refetch();
		}
	}, [isOpen, stockKeepers, refetch]);

	const handleClickDelete = async (stockKeeper: any) => {
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
			await deleteStockKeeper(stockKeeper.id)
				.unwrap()
				.then(() => {
					Swal.fire(
						'Deleted!',
						'The Stock Keeper has been permentaly deleted.',
						'success',
					);
					refetch();
				})
				.catch((error) => {
					console.error('Error deleting Stock Keeper:', error);
					Swal.fire('Error', 'Failed to delete Stock Keeper.', 'error');
				});
		}
	};

	const handleClickRestore = async (stockKeeper: any) => {
		if (!stockKeepers) {
			console.error('No stock types to restore.');
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
					id: stockKeeper.id,
					type: stockKeeper.type,
					description: stockKeeper.description,
					status: true,
				};
				await updateStockKeeper(values);
				Swal.fire('Restored!', 'The Stock Keeper has been restored.', 'success');
				refetch();
				refetchMainPage();
			}
		} catch (error) {
			console.error('Error restoring Stock Keeper:', error);
			Swal.fire('Error', 'Failed to restore Stock Keeper.', 'error');
		}
	};

	const handleDeleteAll = async () => {
		const confirmation = await Swal.fire({
			title: 'Are you sure?',
			text: 'Type "DELETE ALL" to confirm deleting all stock keepers.',
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
			for (const stockKeeper of stockKeepers) {
				await deleteStockKeeper(stockKeeper.id).unwrap();
			}
			Swal.fire('Deleted!', 'All Stock Keepers have been permentaly deleted.', 'success');
			refetch();
		}
	};

	const handleRestoreAll = async () => {
		const confirmation = await Swal.fire({
			title: 'Are you sure?',
			text: 'Restore all stock keepers?',
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
			for (const stockKeeper of stockKeepers) {
				const updatedStockKeeper = { ...stockKeeper, status: true };
				await updateStockKeeper(updatedStockKeeper).unwrap();
			}
			Swal.fire('Restored!', 'All Stock Keepers have been restored.', 'success');
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
							<th>Stock Keeper Type </th>
							<th>
								<Button
									icon='Delete'
									color='danger'
									onClick={handleDeleteAll}
									isDisable={
										!stockKeepers || stockKeepers.length === 0 || isLoading
									}>
									Delete All
								</Button>
								<Button
									icon='Restore'
									color='info'
									className='ms-3'
									onClick={handleRestoreAll}
									isDisable={
										!stockKeepers || stockKeepers.length === 0 || isLoading
									}>
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
								<td colSpan={2}>Error fetching stock keepers.</td>
							</tr>
						)}
						{stockKeepers &&
							stockKeepers.length > 0 &&
							stockKeepers.map((stockKeeper: any, index: any) => (
								<tr key={index}>
									<td>{stockKeeper.type}</td>
									<td>
										<Button
											icon='Restore'
											tag='a'
											color='info'
											onClick={() => handleClickRestore(stockKeeper)}>
											Restore
										</Button>
										<Button
											className='m-2'
											icon='Delete'
											color='danger'
											onClick={() => handleClickDelete(stockKeeper)}>
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
StockTypeDeleteModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default StockTypeDeleteModal;
