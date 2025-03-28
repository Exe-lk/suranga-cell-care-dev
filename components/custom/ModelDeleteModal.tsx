import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import Button from '../bootstrap/Button';
import Swal from 'sweetalert2';
import {
	useDeleteModelMutation,
	useUpdateModelMutation,
	useGetDeleteModelsQuery,
} from '../../redux/slices/modelApiSlice';

interface ModelDeleteModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
	refetchMainPage: () => void;
}

const ModelDeleteModal: FC<ModelDeleteModalProps> = ({
	id,
	isOpen,
	setIsOpen,
	refetchMainPage,
}) => {
	const [deleteModel] = useDeleteModelMutation();
	const [updateModel] = useUpdateModelMutation();
	const { data: models, error, isLoading, refetch } = useGetDeleteModelsQuery(undefined);

	useEffect(() => {
		if (isOpen && models) {
			refetch();
		}
	}, [isOpen, models, refetch]);

	const handleClickDelete = async (model: any) => {
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
			await deleteModel(model.id)
				.unwrap()
				.then(() => {
					Swal.fire('Deleted!', 'The Model has been permentaly deleted.', 'success');
					refetch();
				})
				.catch((error) => {
					console.error('Error deleting Model:', error);
					Swal.fire('Error', 'Failed to delete Model.', 'error');
				});
		}
	};

	const handleClickRestore = async (model: any) => {
		if (!models) {
			console.error('No models to restore.');
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
					id: model.id,
					name: model.name,
					category: model.category,
					brand: model.brand,
					status: true,
				};
				await updateModel(values);
				Swal.fire('Restored!', 'The Model has been restored.', 'success');
				refetch();
				refetchMainPage();
			}
		} catch (error) {
			console.error('Error restoring Model:', error);
			Swal.fire('Error', 'Failed to restore Model.', 'error');
		}
	};

	const handleDeleteAll = async () => {
		const confirmation = await Swal.fire({
			title: 'Are you sure?',
			text: 'Type "DELETE ALL" to confirm deleting all models.',
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
			for (const model of models) {
				await deleteModel(model.id).unwrap();
			}
			Swal.fire('Deleted!', 'All models have been  permentaly deleted.', 'success');
			refetch();
		}
	};

	const handleRestoreAll = async () => {
		const confirmation = await Swal.fire({
			title: 'Are you sure?',
			text: 'Restore all models?',
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
			for (const model of models) {
				const updatedModel = { ...model, status: true };
				await updateModel(updatedModel).unwrap();
			}
			Swal.fire('Restored!', 'All Model have been restored.', 'success');
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
							<th>Model name</th>
							<th>
								<Button
									icon='Delete'
									color='danger'
									onClick={handleDeleteAll}
									isDisable={!models || models.length === 0 || isLoading}>
									Delete All
								</Button>
								<Button
									icon='Restore'
									color='info'
									className='ms-3'
									onClick={handleRestoreAll}
									isDisable={!models || models.length === 0 || isLoading}>
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
								<td colSpan={2}>Error fetching models.</td>
							</tr>
						)}
						{models &&
							models.length > 0 &&
							models.map((model: any, index: any) => (
								<tr key={index}>
									<td>{model.name}</td>
									<td>
										<Button
											icon='Restore'
											tag='a'
											color='info'
											onClick={() => handleClickRestore(model)}>
											Restore
										</Button>
										<Button
											className='m-2'
											icon='Delete'
											color='danger'
											onClick={() => handleClickDelete(model)}>
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
ModelDeleteModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default ModelDeleteModal;
