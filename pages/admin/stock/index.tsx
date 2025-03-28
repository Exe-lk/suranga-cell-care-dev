import React, { useEffect, useRef, useState } from 'react';
import type { NextPage } from 'next';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import Card, { CardBody, CardTitle } from '../../../components/bootstrap/Card';
import Dropdown, { DropdownToggle, DropdownMenu } from '../../../components/bootstrap/Dropdown';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Checks, { ChecksGroup } from '../../../components/bootstrap/forms/Checks';
import { toPng, toSvg } from 'html-to-image';
import { DropdownItem } from '../../../components/bootstrap/Dropdown';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useGetStockInOutsQuery } from '../../../redux/slices/stockInOutAcceApiSlice';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import Swal from 'sweetalert2';
import {createstockDelete} from '../../../service/stockInOutAcceService';
import { useUpdateStockInOutMutation } from '../../../redux/slices/stockInOutAcceApiSlice';
import { Timestamp } from 'firebase/firestore';
import { useGetItemAccesQuery } from '../../../redux/slices/itemManagementAcceApiSlice';

const Index: NextPage = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const { data: StockInOuts, error, isLoading ,refetch} = useGetStockInOutsQuery(undefined);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(PER_COUNT['10000']);
	const [startDate, setStartDate] = useState<string>('');
	const [endDate, setEndDate] = useState<string>('');
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const stock = [{ stock: 'stockOut' }, { stock: 'stockIn' }];
	const [updateStockInOut] = useUpdateStockInOutMutation();
	const { data: itemAcces } = useGetItemAccesQuery(undefined);

	const filteredTransactions = StockInOuts?.filter((trans: any) => {
		const transactionDate = new Date(trans.date);
		const start = startDate ? new Date(startDate) : null;
		const end = endDate ? new Date(endDate) : null;
		if (start && end) {
			return transactionDate >= start && transactionDate <= end;
		} else if (start) {
			return transactionDate >= start;
		} else if (end) {
			return transactionDate <= end;
		}
		return true;
	});

	const handleClickDelete = async (stock: any) => {
		try {
			if (stock.stock === 'stockIn') {
				const relatedStockOuts = itemAcces?.filter(
					(item: any) => item.stock === 'stockOut' && item.barcode === stock.barcode
				);
	
				if (relatedStockOuts?.length > 0) {
					await Swal.fire({
						icon: 'error',
						title: 'Cannot Delete',
						text: 'This stockIn record is referenced by one or more stockOut records. Please delete the related stockOut records first.',
					});
					return;
				}
			}
	
			const result = await Swal.fire({
				title: 'Are you sure?',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, delete it!',
			});
	
			if (result.isConfirmed) {
				const deletePayload = {
					...stock,
					stock: 'Removed',
					status: false,
					timestamp: Timestamp.now(),
				};
	
				const deleteResponse = await createstockDelete(deletePayload);
	
				if (deleteResponse) {
					const barcodePrefix = stock.barcode?.substring(0, 4);
	
					if (barcodePrefix) {
						const matchingItem = itemAcces?.find(
							(item: any) => item.code.startsWith(barcodePrefix)
						);
	
						if (matchingItem) {
							let updatedQuantity;
							if (stock.stock === 'stockIn') {
								updatedQuantity = matchingItem.quantity - stock.quantity;
							} else if (stock.stock === 'stockOut') {
								updatedQuantity = matchingItem.quantity + stock.quantity;
							} else {
								throw new Error('Unknown stock type.');
							}
	
							const updatePayload = {
								...matchingItem,
								quantity: updatedQuantity,
							};
	
							const updateResponse = await updateStockInOut(updatePayload);
	
							if (updateResponse) {
								Swal.fire(
									'Deleted!',
									`Record deleted, and item quantity updated to ${updatedQuantity}.`,
									'success'
								);
								refetch();
							} else {
								throw new Error('Failed to update item quantity.');
							}
						} else {
							Swal.fire(
								'Deleted!',
								'Record deleted, but no matching item was found in itemAcces.',
								'warning'
							);
						}
					} else {
						throw new Error('Barcode prefix extraction failed.');
					}
				} else {
					throw new Error('Failed to create deleted stock record.');
				}
			}
		} catch (error) {
			console.error('Error deleting stock:', error);
			Swal.fire('Error', 'Failed to delete stock.', 'error');
		}
	};
	
		
	const handleExport = async (format: string) => {
		const table = document.querySelector('table');
		if (!table) return;
		modifyTableForExport(table as HTMLElement, true);
		try {
			switch (format) {
				case 'svg':
					await downloadTableAsSVG();
					break;
				case 'png':
					await downloadTableAsPNG();
					break;
				case 'csv':
					downloadTableAsCSV(table as HTMLElement);
					break;
				case 'pdf':
					downloadTableAsPDF(table as HTMLElement);
					break;
				default:
					console.warn('Unsupported export format: ', format);
			}
		} catch (error) {
			console.error('Error exporting table: ', error);
		} finally {
			modifyTableForExport(table as HTMLElement, false);
		}
	};
	const modifyTableForExport = (table: HTMLElement, hide: boolean) => {
		const rows = table.querySelectorAll('tr');
		rows.forEach((row) => {
			const lastCell = row.querySelector('td:last-child, th:last-child');
			if (lastCell instanceof HTMLElement) {
				if (hide) {
					lastCell.style.display = 'none';
				} else {
					lastCell.style.display = '';
				}
			}
		});
	};
	const downloadTableAsPNG = async () => {
		try {
			const table = document.querySelector('table');
			if (!table) {
				console.error('Table element not found');
				return;
			}
			const originalBorderStyle = table.style.border;
			table.style.border = '1px solid black';
			const dataUrl = await toPng(table, {
				cacheBust: true,
				style: {
					width: table.offsetWidth + 'px',
				},
			});
			table.style.border = originalBorderStyle;
			const link = document.createElement('a');
			link.href = dataUrl;
			link.download = 'table_data.png';
			link.click();
		} catch (error) {
			console.error('Error generating PNG: ', error);
		}
	};
	const downloadTableAsSVG = async () => {
		try {
			const table = document.querySelector('table');
			if (!table) {
				console.error('Table element not found');
				return;
			}
			const cells = table.querySelectorAll('th, td');
			const originalColors: string[] = [];
			cells.forEach((cell: any, index: number) => {
				originalColors[index] = cell.style.color;
				cell.style.color = 'black';
			});
			const dataUrl = await toSvg(table, {
				backgroundColor: 'white',
				cacheBust: true,
			});
			cells.forEach((cell: any, index: number) => {
				cell.style.color = originalColors[index];
			});
			const link = document.createElement('a');
			link.href = dataUrl;
			link.download = 'table_data.svg';
			link.click();
		} catch (error) {
			console.error('Error generating SVG: ', error);
		}
	};
	const downloadTableAsCSV = (table: HTMLElement) => {
		let csvContent = 'Category\n';
		const rows = table.querySelectorAll('tr');
		rows.forEach((row: any) => {
			const cols = row.querySelectorAll('td, th');
			const rowData = Array.from(cols)
				.slice(0, -1)
				.map((col: any) => `"${col.innerText}"`)
				.join(',');
			csvContent += rowData + '\n';
		});
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = 'table_data.csv';
		link.click();
	};
	const downloadTableAsPDF = (table: HTMLElement) => {
		try {
			const pdf = new jsPDF('p', 'pt', 'a4');
			const pageWidth = pdf.internal.pageSize.getWidth();
			const title = 'LOT Management';
			const titleFontSize = 18;
			pdf.setFontSize(titleFontSize);
			const textWidth = pdf.getTextWidth(title);
			const xPosition = (pageWidth - textWidth) / 2;
			pdf.text(title, xPosition, 40);
			const rows: any[] = [];
			const headers: any[] = [];
			const thead = table.querySelector('thead');
			if (thead) {
				const headerCells = thead.querySelectorAll('th');
				headers.push(
					Array.from(headerCells)
						.slice(0, -1)
						.map((cell: any) => cell.innerText),
				);
			}
			const tbody = table.querySelector('tbody');
			if (tbody) {
				const bodyRows = tbody.querySelectorAll('tr');
				bodyRows.forEach((row: any) => {
					const cols = row.querySelectorAll('td');
					const rowData = Array.from(cols)
						.slice(0, -1)
						.map((col: any) => col.innerText);
					rows.push(rowData);
				});
			}
			autoTable(pdf, {
				head: headers,
				body: rows,
				margin: { top: 50 },
				styles: {
					overflow: 'linebreak',
					cellWidth: 'wrap',
				},
				theme: 'grid',
			});
			pdf.save('table_data.pdf');
		} catch (error) {
			console.error('Error generating PDF: ', error);
			alert('Error generating PDF. Please try again.');
		}
	};

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, [StockInOuts]);

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
						id='searchInput'
						type='search'
						className='border-0 shadow-none bg-transparent'
						placeholder='Search...'
						onChange={(event: any) => setSearchTerm(event.target.value)}
						value={searchTerm}
						ref={inputRef}
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
									<ChecksGroup>
										{stock.map((brand, index) => (
											<Checks
												key={brand.stock}
												id={brand.stock}
												label={brand.stock}
												name={brand.stock}
												value={brand.stock}
												checked={selectedUsers.includes(brand.stock)}
												onChange={(event: any) => {
													const { checked, value } = event.target;
													setSelectedUsers((prevUsers) =>
														checked
															? [...prevUsers, value]
															: prevUsers.filter(
																	(brand) => brand !== value,
															  ),
													);
												}}
											/>
										))}
									</ChecksGroup>
									<FormGroup label='Start Date' className='col-6'>
										<Input
											type='date'
											onChange={(e: any) => setStartDate(e.target.value)}
											value={startDate}
										/>
									</FormGroup>
									<FormGroup label='End Date' className='col-6'>
										<Input
											type='date'
											onChange={(e: any) => setEndDate(e.target.value)}
											value={endDate}
										/>
									</FormGroup>
								</div>
							</div>
						</DropdownMenu>
					</Dropdown>
				</SubHeaderRight>
			</SubHeader>
			<Page>
				<div className='row h-100'>
					<div className='col-12'>
						<Card stretch>
							<CardTitle className='d-flex justify-content-between align-items-center m-4'>
								<div className='flex-grow-1 text-center text-primary'>
									Transactions
								</div>
								<Dropdown>
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
								</Dropdown>
							</CardTitle>
							<CardBody isScrollable className='table-responsive'>
								<table className='table  table-bordered border-primary table-hover text-center'>
									<thead className={'table-dark border-primary'}>
										<tr>
											<th>Date</th>
											<th>Code</th>
											<th>Category</th>
											<th>Brand</th>
											<th>Model</th>
											<th>Quantity</th>
											<th>Selling Price</th>
											<th>Description</th>
											<th>Stock</th>
											{/* <th></th> */}
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
												<td>Error fetching stocks.</td>
											</tr>
										)}
										{filteredTransactions &&
											dataPagination(
												filteredTransactions,
												currentPage,
												perPage,
											)
												.filter(
													(StockInOut: any) => StockInOut.status === true,
												)
											
												.filter((brand: any) => {
													const search = searchTerm.toLowerCase();
													return (
														brand.barcode?.toString().toLowerCase().includes(search) ||
														brand.brand?.toLowerCase().includes(search) ||
														brand.model?.toLowerCase().includes(search)
													);
												})
												.filter((brand: any) =>
													selectedUsers.length > 0
														? selectedUsers.includes(brand.stock)
														: true,
												)
												.filter((brand: any) =>
													['stockIn', 'stockOut'].includes(brand.stock), 
												)
												.sort((a:any, b:any) => a.code - b.code) 
												.map((brand: any, index: any) => (
													<tr key={index}>
														<td>{brand.date}</td>
														<th>{brand.barcode}</th>
														<td>{brand.category}</td>
														<td>{brand.brand}</td>
														<td>{brand.model}</td>
														<td>{brand.quantity}</td>
														<td>{brand.sellingPrice.toFixed(2)}</td>
														<td>{brand.description}</td>
														<td>{brand.stock}</td>
														{/* <td>
															<Button
																className='m-2'
																icon='Delete'
																color='danger'
																onClick={() =>
																	handleClickDelete(brand)
																}>
																
																</Button>
														</td> */}
													</tr>
												))}
									</tbody>
								</table>
							</CardBody>
							<PaginationButtons
								data={filteredTransactions}
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
		</PageWrapper>
	);
};
export default Index;
