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
import Select from '../../../components/bootstrap/forms/Select';
import Option from '../../../components/bootstrap/Option';

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
	const [showLowStockAlert, setShowLowStockAlert] = useState(false);
	const [lowStockItems, setLowStockItems] = useState<any[]>([]);
	const [lowStockAlertShown, setLowStockAlertShown] = useState(false);
	const {
		data: itemAcces,
		error,
		isLoading,
		refetch,
	} = useGetItemAcces1Query({ page: currentPage, perPage, lastDoc,searchtearm:searchTerm });
	console.log(itemAcces?.data);
	const data = itemAcces?.data || [];
	const [updateItemAcce] = useUpdateItemAcceMutation();
	const inputRef = useRef<HTMLInputElement>(null);
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const type = [{ type: 'Accessory' }, { type: 'Mobile' }];
	const [quantity, setQuantity] = useState<any>();
	
	// New filter states
	const [selectedStockTypes, setSelectedStockTypes] = useState<string[]>([]);
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
	const [selectedModels, setSelectedModels] = useState<string[]>([]);
	
	// Get unique values for filters from data
	const uniqueStockTypes = Array.from(new Set(data.map((item: any) => item.mobileType).filter(Boolean))) as string[];
	const uniqueCategories = Array.from(new Set(data.map((item: any) => item.category).filter(Boolean))) as string[];
	const uniqueBrands = Array.from(new Set(data.map((item: any) => item.brand).filter(Boolean))) as string[];
	const uniqueModels = Array.from(new Set(data.map((item: any) => item.model).filter(Boolean))) as string[];

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

	// Check for low stock items and show alert only once on initial load
	useEffect(() => {
		if (data && data.length > 0 && !lowStockAlertShown) {
			// Find items that are at or below reorder level
			const lowItems = data.filter((item: any) => 
				item.quantity <= item.reorderLevel
			);
			setLowStockItems(lowItems);
			if (lowItems.length > 0) {
				setShowLowStockAlert(true);
				setLowStockAlertShown(true);
				// Show notification only on initial load
				Swal.fire({
					title: 'Low Stock Alert',
					html: `
						<style>
							.low-stock-table {
								width: 100%;
								border-collapse: collapse;
								margin-top: 10px;
							}
							.low-stock-table th,
							.low-stock-table td {
								border: 1px solid #ddd;
								padding: 8px;
								text-align: left;
							}
							.low-stock-table th {
								background-color: #f2f2f2;
								font-weight: bold;
							}
							.low-stock-table tbody tr {
								background-color: rgba(255, 193, 7, 0.1);
							}
							.low-stock-table tbody tr:nth-child(even) {
								background-color: rgba(255, 193, 7, 0.2);
							}
							.table-container {
								max-height: 400px;
								overflow-y: auto;
								margin-top: 10px;
							}
							.warning-icon {
								color: #ffc107;
								font-size: 48px;
								margin-bottom: 10px;
							}
						</style>
						<div style="text-align: center;">
							<div class="warning-icon">⚠️</div>
							<p style="margin-bottom: 20px; color: #666;">${lowItems.length} item(s) are at or below their reorder level:</p>
						</div>
						<div class="table-container">
							<table class="low-stock-table">
								<thead>
									<tr>
										<th>Item</th>
										<th>Category</th>
										<th>Quantity</th>
										<th>Reorder Level</th>
									</tr>
								</thead>
								<tbody>
									${lowItems.map((item: any) => `
										<tr>
											<td>${item.brand} ${item.model}</td>
											<td>${item.category || 'N/A'}</td>
											<td style="text-align: center; color: ${item.quantity === 0 ? '#dc3545' : '#ffc107'}; font-weight: bold;">${item.quantity}</td>
											<td style="text-align: center;">${item.reorderLevel}</td>
										</tr>
									`).join('')}
								</tbody>
							</table>
						</div>
					`,
					icon: 'warning',
					confirmButtonText: 'OK',
					width: 700,
					customClass: {
						popup: 'low-stock-popup'
					}
				});
			}
		}
	}, [data, lowStockAlertShown]);

	const getRowStyle = (item: any) => {
		if (item.quantity <= item.reorderLevel) {
			return {
				backgroundColor: 'rgba(255, 193, 7, 0.1)', // Light yellow background for low stock
			};
		}
		return {};
	};

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

	const exportToCSV = (data: any[], filename = "items.csv") => {
		if (!data || data.length === 0) return;

		// Define the CSV headers
		const headers = [
			"brand",
			"category",
			"code",
			"created_at",
			"description",
			"id",
			"mobileType",
			"model",
			"quantity",
			"reorderLevel",
			"status",
			"type",
			"warranty"
		];

		// Create CSV rows
		const csvRows = [
			headers.join(","), // header row
			...data.map(item =>
				headers.map(header => {
					let value = item[header];
					// Escape quotes and commas
					if (typeof value === "string") {
						value = `"${value.replace(/"/g, '""')}"`;
					}
					return value;
				}).join(",")
			)
		];

		// Create a Blob and trigger download
		const csvContent = csvRows.join("\n");
		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
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
									{uniqueStockTypes.length > 0 && (
										<FormGroup label='Stock Type' className='col-12'>
											<ChecksGroup>
												{uniqueStockTypes.map((stockType) => (
													<Checks
														key={stockType}
														id={stockType}
														label={stockType}
														name={stockType}
														value={stockType}
														checked={selectedStockTypes.includes(stockType)}
														onChange={(event: any) => {
															const { checked, value } = event.target;
															setSelectedStockTypes((prev) =>
																checked
																	? [...prev, value]
																	: prev.filter((item) => item !== value),
															);
														}}
													/>
												))}
											</ChecksGroup>
										</FormGroup>
									)}
									{uniqueCategories.length > 0 && (
										<FormGroup label='Category' className='col-12'>
											<ChecksGroup>
												{uniqueCategories.map((category) => (
													<Checks
														key={category}
														id={category}
														label={category}
														name={category}
														value={category}
														checked={selectedCategories.includes(category)}
														onChange={(event: any) => {
															const { checked, value } = event.target;
															setSelectedCategories((prev) =>
																checked
																	? [...prev, value]
																	: prev.filter((item) => item !== value),
															);
														}}
													/>
												))}
											</ChecksGroup>
										</FormGroup>
									)}
									{uniqueBrands.length > 0 && (
										<FormGroup label='Brand' className='col-12'>
											<ChecksGroup>
												{uniqueBrands.map((brand) => (
													<Checks
														key={brand}
														id={brand}
														label={brand}
														name={brand}
														value={brand}
														checked={selectedBrands.includes(brand)}
														onChange={(event: any) => {
															const { checked, value } = event.target;
															setSelectedBrands((prev) =>
																checked
																	? [...prev, value]
																	: prev.filter((item) => item !== value),
															);
														}}
													/>
												))}
											</ChecksGroup>
										</FormGroup>
									)}
									{uniqueModels.length > 0 && (
										<FormGroup label='Model' className='col-12'>
											<ChecksGroup>
												{uniqueModels.map((model) => (
													<Checks
														key={model}
														id={model}
														label={model}
														name={model}
														value={model}
														checked={selectedModels.includes(model)}
														onChange={(event: any) => {
															const { checked, value } = event.target;
															setSelectedModels((prev) =>
																checked
																	? [...prev, value]
																	: prev.filter((item) => item !== value),
															);
														}}
													/>
												))}
											</ChecksGroup>
										</FormGroup>
									)}
								</div>
							</div>
						</DropdownMenu>
					</Dropdown>
					{lowStockItems.length > 0 && (
						<Button
							icon='Warning'
							color='warning'
							isLight
							onClick={() => {
								Swal.fire({
									title: 'Low Stock Items',
									html: `
										<style>
											.low-stock-table {
												width: 100%;
												border-collapse: collapse;
												margin-top: 10px;
											}
											.low-stock-table th,
											.low-stock-table td {
												border: 1px solid #ddd;
												padding: 8px;
												text-align: left;
											}
											.low-stock-table th {
												background-color: #f2f2f2;
												font-weight: bold;
											}
											.low-stock-table tbody tr {
												background-color: rgba(255, 193, 7, 0.1);
											}
											.low-stock-table tbody tr:nth-child(even) {
												background-color: rgba(255, 193, 7, 0.2);
											}
											.table-container {
												max-height: 400px;
												overflow-y: auto;
												margin-top: 10px;
											}
											.warning-icon {
												color: #ffc107;
												font-size: 48px;
												margin-bottom: 10px;
											}
										</style>
										<div style="text-align: center;">
											<div class="warning-icon">⚠️</div>
											<p style="margin-bottom: 20px; color: #666;">The following items are at or below their reorder level:</p>
										</div>
										<div class="table-container">
											<table class="low-stock-table">
												<thead>
													<tr>
														<th>Item</th>
														<th>Category</th>
														<th>Quantity</th>
														<th>Reorder Level</th>
													</tr>
												</thead>
												<tbody>
													${lowStockItems.map((item: any) => `
														<tr>
															<td>${item.brand} ${item.model}</td>
															<td>${item.category || 'N/A'}</td>
															<td style="text-align: center; color: ${item.quantity === 0 ? '#dc3545' : '#ffc107'}; font-weight: bold;">${item.quantity}</td>
															<td style="text-align: center;">${item.reorderLevel}</td>
														</tr>
													`).join('')}
												</tbody>
											</table>
										</div>
									`,
									icon: 'warning',
									confirmButtonText: 'OK',
									width: 700,
									customClass: {
										popup: 'low-stock-popup'
									}
								});
							}}
							className='position-relative'>
							Low Stock Alert
							<span className='position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger'>
								{lowStockItems.length}
								<span className='visually-hidden'>low stock items</span>
							</span>
						</Button>
					)}
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
								<Button
									icon='UploadFile'
									color='warning'
									onClick={() => exportToCSV(data)}
								>
									Export CSV
								</Button>
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
											{/* <th></th>
											<th></th>
											<th></th>
											<th></th> */}
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
										{data &&
											data
												?.filter((itemAcces: any) =>
													selectedUsers.length > 0
														? selectedUsers.includes(itemAcces.type)
														: true,
												)
												.filter((itemAcces: any) =>
													selectedStockTypes.length > 0
														? selectedStockTypes.includes(itemAcces.mobileType)
														: true,
												)
												.filter((itemAcces: any) =>
													selectedCategories.length > 0
														? selectedCategories.includes(itemAcces.category)
														: true,
												)
												.filter((itemAcces: any) =>
													selectedBrands.length > 0
														? selectedBrands.includes(itemAcces.brand)
														: true,
												)
												.filter((itemAcces: any) =>
													selectedModels.length > 0
														? selectedModels.includes(itemAcces.model)
														: true,
												)
												.sort((a:any, b:any) => a.quantity - b.quantity)
												.map((itemAcces: any, index: any) => (
													<tr key={index} style={getRowStyle(itemAcces)}>
														<td>{itemAcces.code}</td>
														<td>{itemAcces.type}</td>
														{/* <td>{itemAcces.mobileType}</td> */}
														<td>{itemAcces.category}</td>
														<td>{itemAcces.model}</td>
														<td>{itemAcces.brand}</td>
														<td>
															{itemAcces.quantity}
															{itemAcces.quantity <= itemAcces.reorderLevel && (
																<Icon icon='Warning' color='warning' className='ms-2' />
															)}
														</td>
														<td>{itemAcces.reorderLevel}</td>
														<td>{itemAcces.description}</td>
														{/* <td>
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
																onClick={() => {
																	if (itemAcces.quantity <= 0) {
																		Swal.fire({
																			icon: 'error',
																			title: 'No Stock Available',
																			text: 'Current stock is 0. Stock out operation cannot be performed.',
																		});
																		return;
																	}
																	refetch();
																	setEditstockModalStatus(true);
																	setId(itemAcces.id);
																	setQuantity(itemAcces.quantity);
																}}></Button>
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
														</td> */}
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
								data={data}
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
				refetch={refetch}
			/>
			<StockOutModal
				setIsOpen={setEditstockModalStatus}
				isOpen={editstockModalStatus}
				id={id}
				quantity={quantity}
				refetch={refetch}
			/>
			<ItemDeleteModal setIsOpen={setDeleteModalStatus} isOpen={deleteModalStatus} id='' />
		</PageWrapper>
	);
};

export default Index;
