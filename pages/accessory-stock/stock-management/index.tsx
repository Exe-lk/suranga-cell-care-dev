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
import { useGetAllStockRecordsQuery } from '../../../redux/slices/stockInOutAcceApiSlice';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import Spinner from '../../../components/bootstrap/Spinner';

const Index: NextPage = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedDate, setSelectedDate] = useState('');
	const today = new Date();
	const [startDate, setStartDate] = useState<string>('');
	
	// Use our query to get ALL records - search works independently of date
	const { data: StockInOuts, error, isLoading } = useGetAllStockRecordsQuery(undefined);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(PER_COUNT['10000']);

	// Define stock types for filtering
	const stock = [
		{ stock: 'stockIn', label: 'Stock In' }, 
		{ stock: 'stockOut', label: 'Stock Out' }
	];
	// Start with both stock types selected
	const [selectedUsers, setSelectedUsers] = useState<string[]>(['stockIn', 'stockOut']);

	// Debug stock types
	useEffect(() => {
		if (StockInOuts) {
			console.log("Total stock records:", StockInOuts.length);
			const stockTypes = StockInOuts.map((item: any) => item.stock).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
			console.log("Stock types in data:", stockTypes);
			const stockOutCount = StockInOuts.filter((item: any) => item.stock === 'stockOut').length;
			const stockInCount = StockInOuts.filter((item: any) => item.stock === 'stockIn').length;
			console.log("Stock-out records count:", stockOutCount);
			console.log("Stock-in records count:", stockInCount);
		}
	}, [StockInOuts]);

	console.log(StockInOuts)
	const [endDate, setEndDate] = useState<string>('');
	const inputRef = useRef<HTMLInputElement>(null);

	// Improved filtering logic - search works independently, date is optional
	const filteredTransactions = StockInOuts?.filter((trans: any) => {
		// First filter by active status
		if (!trans.status) return false;
		
		// Apply stock type filtering
		if (selectedUsers.length > 0 && !selectedUsers.includes(trans.stock)) {
			return false;
		}
		
		// Apply search term filtering (independent of date)
		if (searchTerm) {
			const search = searchTerm.toLowerCase();
			const matchesSearch = (
				trans.barcode?.toString().toLowerCase().includes(search) ||
				trans.brand?.toLowerCase().includes(search) ||
				trans.model?.toLowerCase().includes(search) ||
				(trans.brand + ' ' + trans.model)?.toLowerCase().includes(search) ||
				(trans.category + " " + trans.brand + " " + trans.model)?.toLowerCase().includes(search) ||
				(trans.category + " " + trans.model + " " + trans.brand)?.toLowerCase().includes(search) ||
				trans.category?.toLowerCase().includes(search) ||
				trans.stock?.toLowerCase().includes(search) ||
				trans.description?.toLowerCase().includes(search)
			);
			if (!matchesSearch) return false;
		}
		
		// Apply date filtering ONLY if a date is selected (optional)
		if (startDate && startDate.trim() !== '') {
			const transactionDate = trans.date ? new Date(trans.date) : null;
			const start = new Date(startDate);
			
			// Skip records without a date or with an invalid date when date filter is active
			if (!transactionDate) return false;
			
			if (transactionDate < start) return false;
		}
		
		return true;
	});

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
						id='searchInput'
						type='search'
						className='border-0 shadow-none bg-transparent'
						placeholder='Search by barcode, brand, model, category, stock type, or description...'
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
										{stock.map((stockItem, index) => (
											<Checks
												key={stockItem.stock}
												id={stockItem.stock}
												label={stockItem.label}
												name={stockItem.stock}
												value={stockItem.stock}
												checked={selectedUsers.includes(stockItem.stock)}
												onChange={(event: any) => {
													const { checked, value } = event.target;
													setSelectedUsers((prevUsers) =>
														checked
															? [...prevUsers, value]
															: prevUsers.filter(
																	(type) => type !== value,
															  ),
													);
												}}
											/>
										))}
									</ChecksGroup>
									<FormGroup label='Date Filter (Optional)' className='col-6'>
										<Input
											type='date'
											onChange={(e: any) => setStartDate(e.target.value)}
											value={startDate}
											placeholder='Filter by start date (optional)'
										/>
									</FormGroup>
									<div className='col-12 mt-3'>
										<Button 
											color='info' 
											className='w-100'
											onClick={() => {
												setSelectedUsers(['stockIn', 'stockOut']);
												setStartDate('');
												setSearchTerm('');
												if (inputRef.current) {
													inputRef.current.value = '';
												}
											}}
										>
											Clear All Filters & Search
										</Button>
									</div>
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
									<thead className={'table-dark border-primary sticky-header'}>
										<tr>
											<th>Date / Time</th>
											<th>Code</th>
											<th>Category</th>
											<th>Brand</th>
											<th>Model</th>
											<th>Quantity</th>
											<th>Selling Price</th>
											<th>Cost</th>
											<th>Description</th>
											<th>Stock</th>
										</tr>
									</thead>
									<tbody>
										{isLoading && (
											<tr>
												<td colSpan={10}>Loading...</td>
											</tr>
										)}
										{error && (
											<tr>
												<td colSpan={10}>Error fetching stocks.</td>
											</tr>
										)}
										{filteredTransactions && filteredTransactions.length > 0 ? (
											// Sort records by date (newest first) and paginate
											dataPagination(
												filteredTransactions.sort((a: any, b: any) => {
													const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
													const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
													return dateB - dateA;
												}),
												currentPage,
												perPage,
											).map((brand: any, index: any) => {
												const formattedTimestamp = brand.created_at 
													? new Date(brand.created_at).toLocaleString() 
													: 'No timestamp';

												return (
													<tr key={index}>
														<td>{formattedTimestamp}</td>
														<th>{brand.barcode}</th>
														<td>{brand.category}</td>
														<td>{brand.brand}</td>
														<td>{brand.model}</td>
														<td>{brand.quantity}</td>
														<td>{brand.sellingPrice?.toFixed(2)}</td>
														<td>{brand.cost?.toFixed(2)}</td>
														<td>{brand.description}</td>
														<td>{brand.stock}</td>
													</tr>
												);
											})
										) : (
											<tr>
												<td colSpan={10} className="text-center py-4">
													No matching records found.
													{selectedUsers.length > 0 && selectedUsers.length < 2 && (
														<span> Current filters: <strong>{selectedUsers.join(', ')}</strong></span>
													)}
													{startDate && (
														<span> From date: <strong>{startDate}</strong></span>
													)}
													{searchTerm && (
														<span> Search: <strong>"{searchTerm}"</strong></span>
													)}
													<div className="mt-2">
														Try adjusting your filters or search terms.
														{(startDate || searchTerm || selectedUsers.length < 2) && (
															<Button
																color="link"
																size="sm"
																className="p-0 ms-2"
																onClick={() => {
																	setSelectedUsers(['stockIn', 'stockOut']);
																	setStartDate('');
																	setSearchTerm('');
																	if (inputRef.current) {
																		inputRef.current.value = '';
																	}
																}}
															>
																Clear all filters
															</Button>
														)}
													</div>
												</td>
											</tr>
										)}
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
