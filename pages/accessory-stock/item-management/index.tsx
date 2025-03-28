import React, { useEffect, useRef, useState } from 'react';
import type { NextPage } from 'next';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import Card, { CardBody, CardTitle } from '../../../components/bootstrap/Card';
import ItemAddModal from '../../../components/custom/ItemAddModal';
import ItemEditModal from '../../../components/custom/ItemEditModal';
import StockAddModal from '../../../components/custom/stockAddModalAcces';
import StockOutModal from '../../../components/custom/StockOutModal';
import Dropdown, { DropdownToggle, DropdownMenu } from '../../../components/bootstrap/Dropdown';
import Swal from 'sweetalert2';
import ItemDeleteModal from '../../../components/custom/itemDeleteAcce';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Checks, { ChecksGroup } from '../../../components/bootstrap/forms/Checks';
import { toPng, toSvg } from 'html-to-image';
import { DropdownItem } from '../../../components/bootstrap/Dropdown';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
	useGetItemAcces1Query,
	useUpdateItemAcceMutation,
} from '../../../redux/slices/itemManagementAcceApiSlice';
import { useGetItemAccesQuery } from '../../../redux/slices/itemManagementAcceApiSlice';
import bill from '../../../assets/img/bill/WhatsApp_Image_2024-09-12_at_12.26.10_50606195-removebg-preview (1).png';
import { set } from 'date-fns';
import Spinner from '../../../components/bootstrap/Spinner';

const Index: NextPage = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [addModalStatus, setAddModalStatus] = useState<boolean>(false);
	const [editModalStatus, setEditModalStatus] = useState<boolean>(false);
	const [addstockModalStatus, setAddstockModalStatus] = useState<boolean>(false);
	const [editstockModalStatus, setEditstockModalStatus] = useState<boolean>(false);
	const [deleteModalStatus, setDeleteModalStatus] = useState<boolean>(false);
	const [id, setId] = useState<string>('');
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(PER_COUNT['100']);
	const [lastDoc, setLastDoc] = useState(null);
	const {
		data: itemAcces,
		error,
		isLoading,
		refetch,
	} = useGetItemAcces1Query({ page: currentPage, perPage, lastDoc,searchtearm:searchTerm });
	console.log(itemAcces?.data);
	const data = itemAcces?.data;
	const [updateItemAcce] = useUpdateItemAcceMutation();
	const inputRef = useRef<HTMLInputElement>(null);
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const type = [{ type: 'Accessory' }, { type: 'Mobile' }];
	const [quantity, setQuantity] = useState<any>();

	useEffect(() => {
		if (itemAcces?.lastDoc) {
			setLastDoc(itemAcces.lastDoc);
		}
	}, []);
	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, [itemAcces]);

	const handleClickDelete = async (itemAcce: any) => {
		if (itemAcce.quantity > 0) {
			Swal.fire('Error', 'Failed to delete stock item. stock quantity must be zero', 'error');

			return;
		}
		try {
			const result = await Swal.fire({
				title: 'Are you sure?',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, delete it!',
			});
			if (result.isConfirmed) {
				const values = await {
					id: itemAcce.id,
					type: itemAcce.type,
					mobileType: itemAcce.mobileType,
					category: itemAcce.category,
					model: itemAcce.model,
					quantity: itemAcce.quantity,
					brand: itemAcce.brand,
					reorderLevel: itemAcce.reorderLevel,
					description: itemAcce.description,
					code: itemAcce.code,
					status: false,
					warranty: itemAcce.warranty,
				};
				await updateItemAcce(values);
				Swal.fire('Deleted!', 'The Item Accessory has been deleted.', 'success');
			}
		} catch (error) {
			console.error('Error deleting document: ', error);
			Swal.fire('Error', 'Failed to delete employee.', 'error');
		}
	};

	if (isLoading) {
		console.log(isLoading);
		return (
			<PageWrapper>
				<Page>
					<div className='row h-100 py-5'>
						<div className='col-12 text-center py-5 my-5'>
							<Spinner
								tag={'div'}
								color={'primary'}
								isGrow={false}
								size={50}
								className={''}
							/>
							<br />
							<br />
							<h2>Please Wait</h2>
						</div>
					</div>
				</Page>
			</PageWrapper>
		);
	}
	return (
		<PageWrapper>
			<SubHeader>
				<SubHeaderLeft>
					<label
						className='border-0 bg-transparent cursor-pointer me-0'
						htmlFor='searchInput'>
						<Icon icon='Search' size='2x' color='primary' />
					</label>
					<Input
						ref={inputRef}
						id='searchInput'
						type='search'
						className='border-0 shadow-none bg-transparent'
						placeholder='Search...'
						onChange={(event: any) => {
							setSearchTerm(event.target.value);
						}}
						value={searchTerm}
					/>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Dropdown>
						<DropdownToggle hasIcon={false}>
							<Button
								icon='FilterAlt'
								color='dark'
								isLight
								className='btn-only-icon position-relative'></Button>
						</DropdownToggle>
						<DropdownMenu isAlignmentEnd size='lg'>
							<div className='container py-2'>
								<div className='row g-3'>
									<FormGroup label='Type' className='col-12'>
										<ChecksGroup>
											{type.map((itemAcces, index) => (
												<Checks
													key={itemAcces.type}
													id={itemAcces.type}
													label={itemAcces.type}
													name={itemAcces.type}
													value={itemAcces.type}
													checked={selectedUsers.includes(itemAcces.type)}
													onChange={(event: any) => {
														const { checked, value } = event.target;
														setSelectedUsers((prevUsers) =>
															checked
																? [...prevUsers, value]
																: prevUsers.filter(
																		(itemAcces) =>
																			itemAcces !== value,
																  ),
														);
													}}
												/>
											))}
										</ChecksGroup>
									</FormGroup>
								</div>
							</div>
						</DropdownMenu>
					</Dropdown>
					<Button
						icon='AddCircleOutline'
						color='success'
						isLight
						onClick={() => setAddModalStatus(true)}>
						Create Item
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page>
				<div className='row h-100'>
					<div className='col-12'>
						<Card stretch>
							<CardTitle className='d-flex justify-content-between align-items-center m-4'>
								<div className='flex-grow-1 text-center text-primary'>
									Manage Stock
								</div>
								{/* <Dropdown>
									<DropdownToggle hasIcon={false}>
										<Button icon='UploadFile' color='warning'>
											Export
										</Button>
									</DropdownToggle>
									<DropdownMenu isAlignmentEnd>
										<DropdownItem onClick={() => handleExport('svg')}>
											Download SVG
										</DropdownItem>
										<DropdownItem onClick={() => handleExport('png')}>
											Download PNG
										</DropdownItem>
										<DropdownItem onClick={() => handleExport('csv')}>
											Download CSV
										</DropdownItem>
										<DropdownItem onClick={() => handleExport('pdf')}>
											Download PDF
										</DropdownItem>
									</DropdownMenu>
								</Dropdown> */}
							</CardTitle>
							<CardBody isScrollable className='table-responsive'>
								<table className='table  table-bordered border-primary table-hover text-center'>
									<thead className={'table-dark border-primary'}>
										<tr>
											<th>Item Code</th>
											<th>Type</th>
											{/* <th>Mobile Type</th> */}
											<th>Category</th>
											<th>Model</th>
											<th>Brand</th>
											<th>Quantity</th>
											<th>Reorder Level</th>
											<th>Description</th>
											<th></th>
											<th></th>
											<th></th>
											<th></th>
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
										{itemAcces &&
											dataPagination(itemAcces.data, currentPage, perPage)
												.filter((itemAcces: any) =>
													selectedUsers.length > 0
														? selectedUsers.includes(itemAcces.type)
														: true,
												)
												
												// .filter((brand: any) => {
												// 	const search = searchTerm.toLowerCase();
												// 	return (
												// 		brand.code
												// 			?.toString()
												// 			.toLowerCase()
												// 			.includes(searchTerm.slice(0, 4)) ||
												// 		(brand.brand + ' ' + brand.model)
												// 			?.toLowerCase()
												// 			.includes(search) ||
												// 		(
												// 			brand.category +
												// 			' ' +
												// 			brand.brand +
												// 			' ' +
												// 			brand.model
												// 		)
												// 			?.toLowerCase()
												// 			.includes(search) ||
												// 		(
												// 			brand.category +
												// 			' ' +
												// 			brand.model +
												// 			' ' +
												// 			brand.brand
												// 		)
												// 			?.toLowerCase()
												// 			.includes(search) ||
												// 		brand.model
												// 			?.toLowerCase()
												// 			.includes(search) ||
												// 		brand.brand
												// 			?.toLowerCase()
												// 			.includes(search) ||
												// 		brand.category
												// 			?.toLowerCase()
												// 			.includes(search)
												// 	);
												// })
												.sort((a: any, b: any) => b.code - a.code)
												.map((itemAcces: any, index: any) => (
													<tr key={index}>
														<td>{itemAcces.code}</td>
														<td>{itemAcces.type}</td>
														{/* <td>{itemAcces.mobileType}</td> */}
														<td>{itemAcces.category}</td>
														<td>{itemAcces.model}</td>
														<td>{itemAcces.brand}</td>
														<td>{itemAcces.quantity}</td>
														<td>{itemAcces.reorderLevel}</td>
														<td>{itemAcces.description}</td>
														<td>
															<Button
																icon='CallReceived'
																tag='a'
																color='success'
																onClick={() => {
																	setAddstockModalStatus(true),
																		setId(itemAcces.id);
																	setQuantity(itemAcces.quantity);
																}}></Button>
														</td>
														<td>
															<Button
																icon='CallMissedOutgoing'
																tag='a'
																color='warning'
																onClick={() => (
																	refetch(),
																	setEditstockModalStatus(true),
																	setId(itemAcces.id),
																	setQuantity(itemAcces.quantity)
																)}></Button>
														</td>
														<td>
															<Button
																icon='Edit'
																tag='a'
																color='info'
																onClick={() => (
																	setEditModalStatus(true),
																	setId(itemAcces.id)
																)}></Button>
														</td>
														<td>
															<Button
																className='m-2'
																icon='Delete'
																color='danger'
																onClick={() =>
																	handleClickDelete(itemAcces)
																}></Button>
														</td>
													</tr>
												))}
									</tbody>
								</table>
								<Button
									icon='Delete'
									className='mb-5'
									onClick={() => setDeleteModalStatus(true)}>
									Recycle Bin
								</Button>
							</CardBody>
							<PaginationButtons
								data={itemAcces.data}
								label='parts'
								setCurrentPage={setCurrentPage}
								currentPage={currentPage}
								perPage={perPage}
								setPerPage={setPerPage}
							/>
						</Card>
					</div>
				</div>
			</Page>
			<ItemAddModal setIsOpen={setAddModalStatus} isOpen={addModalStatus} id='' />
			<ItemEditModal setIsOpen={setEditModalStatus} isOpen={editModalStatus} id={id} />
			<StockAddModal
				setIsOpen={setAddstockModalStatus}
				isOpen={addstockModalStatus}
				id={id}
				quantity={quantity}
			/>
			<StockOutModal
				setIsOpen={setEditstockModalStatus}
				isOpen={editstockModalStatus}
				id={id}
				quantity={quantity}
			/>
			<ItemDeleteModal setIsOpen={setDeleteModalStatus} isOpen={deleteModalStatus} id='' />
		</PageWrapper>
	);
};

export default Index;
