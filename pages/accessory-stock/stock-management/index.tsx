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
import { useGetStockInOutByDateQuery, useGetStockInOutsQuery } from '../../../redux/slices/stockInOutAcceApiSlice';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import Spinner from '../../../components/bootstrap/Spinner';

const Index: NextPage = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedDate, setSelectedDate] = useState('');
	const today = new Date();
	const [startDate, setStartDate] = useState<string>(today.toISOString().split('T')[0]);
	const { data: StockInOuts, error, isLoading } = useGetStockInOutByDateQuery(startDate);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(PER_COUNT['10000']);
	console.log(StockInOuts)
	const [endDate, setEndDate] = useState<string>('');
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const stock = [{ stock: 'stockOut' }, { stock: 'stockIn' }];

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
									<FormGroup label='Date' className='col-6'>
										<Input
											type='date'
											onChange={(e: any) => setStartDate(e.target.value)}
											value={startDate}
										/>
									</FormGroup>
									{/* <FormGroup label='End Date' className='col-6'>
										<Input
											type='date'
											onChange={(e: any) => setEndDate(e.target.value)}
											value={endDate}
										/>
									</FormGroup> */}
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
											<th>Description</th>
											<th>Stock</th>
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
														brand.model?.toLowerCase().includes(search)||
														(brand.brand + ' ' + brand.model)?.toLowerCase().includes(search) ||
														(brand.category+" "+brand.brand+" "+brand.model)?.toLowerCase().includes(search) ||
														(brand.category+" "+brand.model+" "+brand.brand)?.toLowerCase().includes(search) ||
														brand.category?.toLowerCase().includes(search)
													);
												})
												.filter((brand: any) =>
													selectedUsers.length > 0
														? selectedUsers.includes(brand.stock)
														: true,
												)
												.sort((a: any, b: any) => b.code - a.code)
												.map((brand: any, index: any) => {
													const formattedTimestamp = brand.timestamp
														?.toDate
														? brand.timestamp.toDate().toLocaleString() // Firestore Timestamp
														: new Date(
																brand.timestamp?.seconds * 1000,
														  ).toLocaleString(); // Handle raw seconds & nanoseconds

													return (
														<tr key={index}>
															<td>{formattedTimestamp}</td>
															<th>{brand.barcode}</th>
															<td>{brand.category}</td>
															<td>{brand.brand}</td>
															<td>{brand.model}</td>
															<td>{brand.quantity}</td>
															<td>{brand.sellingPrice?.toFixed(2)}</td>
															<td>{brand.description}</td>
															<td>{brand.stock}</td>
														</tr>
													);
												})}
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
