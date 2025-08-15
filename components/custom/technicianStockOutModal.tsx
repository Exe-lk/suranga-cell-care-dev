import React from 'react';
import Modal, { ModalHeader, ModalTitle, ModalBody, ModalFooter } from '../bootstrap/Modal';
import Button from '../bootstrap/Button';
import { useGetStockOutByTechnicianQuery } from '../../redux/slices/stockInOutDissApiSlice';


interface TechnicianStockOutModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	technicianId: string;
	technicianName: string;
}

const TechnicianStockOutModal: React.FC<TechnicianStockOutModalProps> = ({
	isOpen,
	setIsOpen,
	technicianId,
	technicianName,
}) => {
	const { data: stockOutItems, isLoading, error } = useGetStockOutByTechnicianQuery(technicianId, {
		skip: !isOpen || !technicianId,
	});

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} size='lg' isCentered>
			<ModalHeader setIsOpen={setIsOpen}>
				<ModalTitle id=''>Stock Out Items - {technicianName}</ModalTitle>
			</ModalHeader>
			<ModalBody>
				{isLoading && (
					<div className='text-center'>
						<div className='spinner-border' role='status'>
							<span className='visually-hidden'>Loading...</span>
						</div>
					</div>
				)}
				
				{error && (
					<div className='alert alert-danger'>
						Error loading stock out items. Please try again.
					</div>
				)}

				{!isLoading && !error && stockOutItems && stockOutItems.length === 0 && (
					<div className='alert alert-info'>
						No stock out items found for this technician.
					</div>
				)}

				{!isLoading && !error && stockOutItems && stockOutItems.length > 0 && (
					<div className='table-responsive'>
						<table className='table table-bordered table-hover'>
							<thead className='table-dark'>
								<tr>
									<th>Brand</th>
									<th>Model</th>
									<th>Category</th>
									<th>Quantity</th>
									<th>Date</th>
									<th>Description</th>
								</tr>
							</thead>
							<tbody>
								{stockOutItems.map((item: any, index: number) => (
									<tr key={index}>
										<td>{item.brand || 'N/A'}</td>
										<td>{item.model || 'N/A'}</td>
										<td>{item.category || 'N/A'}</td>
										<td>{item.quantity || 'N/A'}</td>
										<td>{item.date || 'N/A'}</td>
										<td>{item.description || 'N/A'}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</ModalBody>
			<ModalFooter>
				<Button color='secondary' onClick={() => setIsOpen(false)}>
					Close
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default TechnicianStockOutModal; 