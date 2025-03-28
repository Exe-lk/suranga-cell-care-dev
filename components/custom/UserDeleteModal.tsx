import React, { FC, useEffect } from 'react';
import Swal from 'sweetalert2';
import Modal, { ModalBody, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import Button from '../bootstrap/Button';
import {
	useDeleteUserMutation,
	useUpdateUserMutation,
	useGetDeleteUsersQuery,
} from '../../redux/slices/userManagementApiSlice';

interface UserDeleteModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	id: string;
	refetchMainPage: () => void;
}

const UserDeleteModal: FC<UserDeleteModalProps> = ({ id, isOpen, setIsOpen, refetchMainPage }) => {
	const [deleteUser] = useDeleteUserMutation();
	const [updateUser] = useUpdateUserMutation();
	const { data: users, error, isLoading, refetch } = useGetDeleteUsersQuery(undefined);

	useEffect(() => {
		if (isOpen && users) {
			refetch();
		}
	}, [isOpen, users, refetch]);

	const handleClickDelete = async (user: any) => {
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
			await deleteUser(user.id)
				.unwrap()
				.then(() => {
					Swal.fire('Deleted!', 'The user has been permentaly deleted.', 'success');
					refetch();
				})
				.catch((error) => {
					console.error('Error deleting user:', error);
					Swal.fire('Error', 'Failed to delete user.', 'error');
				});
		}
	};

	const handleClickRestore = async (user: any) => {
		if (!users) {
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
					id: user.id,
					name: user.name,
					status: true,
					role: user.role,
					mobile: user.mobile,
					email: user.email,
					nic: user.nic,
					level: user.level,
				};
				await updateUser(values);
				Swal.fire('Restored!', 'The user has been restored.', 'success');
				refetch();
				refetchMainPage();
			}
		} catch (error) {
			console.error('Error restoring user:', error);
			Swal.fire('Error', 'Failed to restore user.', 'error');
		}
	};

	const handleDeleteAll = async () => {
		const confirmation = await Swal.fire({
			title: 'Are you sure?',
			text: 'Type "DELETE ALL" to confirm deleting all users.',
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
			for (const user of users) {
				await deleteUser(user.id).unwrap();
			}
			Swal.fire('Deleted!', 'All users have been permentaly deleted.', 'success');
			refetch();
		}
	};

	const handleRestoreAll = async () => {
		const confirmation = await Swal.fire({
			title: 'Are you sure?',
			text: 'Restore all users?',
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
			for (const user of users) {
				const updatedUser = { ...user, status: true };
				await updateUser(updatedUser).unwrap();
			}
			Swal.fire('Restored!', 'All users have been restored.', 'success');
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
				<table className='table table-bordered border-primary table-modern table-hover'>
					<thead>
						<tr>
							<th>User</th>
							<th>
								<Button
									icon='Delete'
									color='danger'
									onClick={handleDeleteAll}
									isDisable={!users || users.length === 0 || isLoading}>
									Delete All
								</Button>
								<Button
									icon='Restore'
									color='info'
									className='ms-3'
									onClick={handleRestoreAll}
									isDisable={!users || users.length === 0 || isLoading}>
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
								<td colSpan={2}>Error fetching users.</td>
							</tr>
						)}
						{users &&
							users.length > 0 &&
							users.map((user: any, index: any) => (
								<tr key={index}>
									<td>{user.name}</td>
									<td>
										<Button
											icon='Restore'
											tag='a'
											color='info'
											onClick={() => handleClickRestore(user)}>
											Restore
										</Button>
										<Button
											className='m-2'
											icon='Delete'
											color='danger'
											onClick={() => handleClickDelete(user)}>
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

export default UserDeleteModal;
