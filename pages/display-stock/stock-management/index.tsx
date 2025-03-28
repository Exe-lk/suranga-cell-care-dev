import React, { useEffect, useRef, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import useDarkMode from '../../../hooks/useDarkMode';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, {
	SubHeaderLeft,
	SubHeaderRight,
	SubheaderSeparator,
} from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import Card, { CardBody, CardTitle } from '../../../components/bootstrap/Card';
import StockAddModal from '../../../components/custom/ItemAddModal';
import StockEditModal from '../../../components/custom/StockEditModal';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import Dropdown, { DropdownToggle, DropdownMenu } from '../../../components/bootstrap/Dropdown';

import Swal from 'sweetalert2';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Checks, { ChecksGroup } from '../../../components/bootstrap/forms/Checks';
import { toPng, toSvg } from 'html-to-image';
import { DropdownItem }from '../../../components/bootstrap/Dropdown';
import jsPDF from 'jspdf'; 
import autoTable from 'jspdf-autotable';
import { useGetStockInOutByDateQuery, useGetStockInOutsQuery , useUpdateStockInOutMutation } from '../../../redux/slices/stockInOutDissApiSlice';
import bill from '../../../assets/img/bill/WhatsApp_Image_2024-09-12_at_12.26.10_50606195-removebg-preview (1).png';


const Index: NextPage = () => {
	const { darkModeStatus } = useDarkMode(); 
	const [searchTerm, setSearchTerm] = useState(''); 
	const [addModalStatus, setAddModalStatus] = useState<boolean>(false);
	const [editModalStatus, setEditModalStatus] = useState<boolean>(false);
	const [id, setId] = useState<string>(''); 
	const today = new Date();
	const [startDate, setStartDate] = useState<string>(today.toISOString().split('T')[0]);
console.log(startDate)
	const { data: StockInOuts, error, isLoading } = useGetStockInOutByDateQuery({startDate,searchtearm:searchTerm} );
	console.log(StockInOuts)
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(PER_COUNT['10000']);
	const [updateStockInOut] = useUpdateStockInOutMutation();
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const stock = [
		{ stock: 'stockOut' },
		{ stock: 'stockIn' },
	];

	const [endDate, setEndDate] = useState<string>(''); 
	const inputRef = useRef<HTMLInputElement>(null);

	// const filteredTransactions = StockInOuts?.filter((trans: any) => {
	// 	const transactionDate = new Date(trans.date); 
	// 	const start = startDate ? new Date(startDate) : null; 
	// 	const end = endDate ? new Date(endDate) : null; 
	// 	if (start && end) {
	// 		return transactionDate >= start && transactionDate <= end;
	// 	} 
	// 	else if (start) {
	// 		return transactionDate >= start;
	// 	} 
	// 	else if (end) {
	// 		return transactionDate <= end;
	// 	}
	// 	return true; 
	// });

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, [ StockInOuts]);

const handleExport = async (format: string) => {
	const table = document.querySelector('table');
	if (!table) return;
	const clonedTable = table.cloneNode(true) as HTMLElement;
	const clonedTableStyles = getComputedStyle(table);
	clonedTable.setAttribute('style', clonedTableStyles.cssText);
	try {
		switch (format) {
			case 'svg':
				await downloadTableAsSVG();
				break;
			case 'png':
				await downloadTableAsPNG();
				break;
			case 'csv':
				downloadTableAsCSV(clonedTable);
				break;
			case 'pdf': 
				await downloadTableAsPDF(clonedTable);
				break;
			default:
				console.warn('Unsupported export format: ', format);
		}
	} catch (error) {
		console.error('Error exporting table: ', error);
	}
};
const downloadTableAsCSV = (table: any) => {
			let csvContent = '';
			const rows = table.querySelectorAll('tr');
			rows.forEach((row: any) => {
				const cols = row.querySelectorAll('td, th');
				const rowData = Array.from(cols)
					.map((col: any) => `"${col.innerText}"`)
					.join(',');
				csvContent += rowData + '\n';
			});
			const blob = new Blob([csvContent], { type: 'text/csv' });
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = 'Transactions Report.csv';
			link.click();
};
const downloadTableAsPDF = async (table: HTMLElement) => {
try {
	const pdf = new jsPDF('p', 'pt', 'a4');
	const pageWidth = pdf.internal.pageSize.getWidth();
	const pageHeight = pdf.internal.pageSize.getHeight();
	const rows: any[] = [];
	const headers: any[] = [];
	pdf.setLineWidth(1);
	pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
	const logoData = await loadImage(bill); 
	const logoWidth = 100; 
	const logoHeight = 40; 
	const logoX = 20; 
	const logoY = 20; 
	pdf.addImage(logoData, 'PNG', logoX, logoY, logoWidth, logoHeight); 
	pdf.setFontSize(8);
	pdf.setFont('helvetica', 'bold');
	pdf.text('Suranga Cell-Care(pvt).Ltd.', 20, logoY + logoHeight + 10);
	const title = 'Transactions Report';
	pdf.setFontSize(16);
	pdf.setFont('helvetica', 'bold');
	const titleWidth = pdf.getTextWidth(title);
	const titleX = pageWidth - titleWidth - 20;
	pdf.text(title, titleX, 30); 
	const currentDate = new Date().toLocaleDateString();
	const dateX = pageWidth - pdf.getTextWidth(currentDate) - 20;
	pdf.setFontSize(12);
	pdf.text(currentDate, dateX, 50); 
	const thead = table.querySelector('thead');
	if (thead) {
		const headerCells = thead.querySelectorAll('th');
		headers.push(Array.from(headerCells).map((cell: any) => cell.innerText));
	}
	const tbody = table.querySelector('tbody');
	if (tbody) {
		const bodyRows = tbody.querySelectorAll('tr');
		bodyRows.forEach((row: any) => {
			const cols = row.querySelectorAll('td');
			const rowData = Array.from(cols).map((col: any) => col.innerText);
			rows.push(rowData);
		});
	}
	const tableWidth = pageWidth * 0.9; 
	const tableX = (pageWidth - tableWidth) / 2; 
	autoTable(pdf, {
		head: headers,
		body: rows,
		startY: 100, 
		margin: { left: 20, right: 20 }, 
		styles: {
			fontSize: 10, 
			overflow: 'linebreak',
			cellPadding: 4, 
		},
		headStyles: {
			fillColor: [80, 101, 166], 
			textColor: [255, 255, 255],
			fontSize: 12, 
		},
		columnStyles: {
			0: { cellWidth: 'auto' }, 
			1: { cellWidth: 'auto' }, 
			2: { cellWidth: 'auto' }, 
			3: { cellWidth: 'auto' }, 
		},
		tableWidth: 'wrap',
		theme: 'grid',
	});
	pdf.save('Transactions Report.pdf');
} catch (error) {
	console.error('Error generating PDF: ', error);
	alert('Error generating PDF. Please try again.');
}
};
const loadImage = (url: string): Promise<string> => {
return new Promise((resolve, reject) => {
	const img = new Image();
	img.src = url;
	img.crossOrigin = 'Anonymous';
	img.onload = () => {
		const canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.drawImage(img, 0, 0);
			const dataUrl = canvas.toDataURL('image/png'); 
			resolve(dataUrl);
		} else {
			reject('Failed to load the logo image.');
		}
	};
	img.onerror = () => {
		reject('Error loading logo image.');
	};
});
};
const hideLastCells = (table: HTMLElement) => {
const rows = table.querySelectorAll('tr');
rows.forEach((row) => {
	const lastCell = row.querySelector('td:last-child, th:last-child');
	if (lastCell instanceof HTMLElement) {
		lastCell.style.visibility = 'hidden';  
		lastCell.style.border = 'none'; 
		lastCell.style.padding = '0';  
		lastCell.style.margin = '0';  
	}
});
};
const restoreLastCells = (table: HTMLElement) => {
const rows = table.querySelectorAll('tr');
rows.forEach((row) => {
	const lastCell = row.querySelector('td:last-child, th:last-child');
	if (lastCell instanceof HTMLElement) {
		lastCell.style.visibility = 'visible'; 
		lastCell.style.border = '';  
		lastCell.style.padding = '';  
		lastCell.style.margin = '';  
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
	link.download = 'Transactions Report.png';
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
	hideLastCells(table);
	const dataUrl = await toSvg(table, {
		backgroundColor: 'white',
		cacheBust: true,
		style: {
			width: table.offsetWidth + 'px',
			color: 'black',
		},
	});
	restoreLastCells(table);
	const link = document.createElement('a');
	link.href = dataUrl;
	link.download = 'Transactions Report.svg';
	link.click();
} catch (error) {
	console.error('Error generating SVG: ', error);
	const table = document.querySelector('table');
	if (table) restoreLastCells(table);
}
};

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
						onChange={(event: any) => {
							setSearchTerm(event.target.value);
						}}
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
									<FormGroup label='Stock type' className='col-12'>
									<ChecksGroup>
											{stock.map((stockInOut, index) => (
												<Checks
													key={stockInOut.stock}
													id={stockInOut.stock}
													label={stockInOut.stock}
													name={stockInOut.stock}
													value={stockInOut.stock}
													checked={selectedUsers.includes(stockInOut.stock)}
													onChange={(event: any) => {
														const { checked, value } = event.target;
														setSelectedUsers(
															(prevUsers) =>
																checked
																	? [...prevUsers, value] 
																	: prevUsers.filter(
																			(stockInOut) =>
																				stockInOut !== value,
																	  ), 
														);
													}}
												/>
											))}
										</ChecksGroup>
									</FormGroup>
									<FormGroup label='Date' className='col-6'>
										<Input type='date' onChange={(e: any) => setStartDate(e.target.value)} value={startDate} />
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
									<Button
										icon='UploadFile'
										color='warning'>
										Export
									</Button>
								</DropdownToggle>
								<DropdownMenu isAlignmentEnd>
									<DropdownItem onClick={() => handleExport('svg')}>Download SVG</DropdownItem>
									<DropdownItem onClick={() => handleExport('png')}>Download PNG</DropdownItem>
									<DropdownItem onClick={() => handleExport('csv')}>Download CSV</DropdownItem>
									<DropdownItem onClick={() => handleExport('pdf')}>Download PDF</DropdownItem>
								</DropdownMenu>
							</Dropdown>
							</CardTitle>
							<CardBody isScrollable className='table-responsive'>
							<table className='table  table-bordered border-primary table-hover text-center'>
							<thead className={"table-dark border-primary"}>
										<tr>
											<th>Date</th>
											<th>Code</th>
											<th>Category</th>
											<th>Brand</th>
											<th>Model</th>
											<th>Quantity</th>
											<th>Cost</th>
											<th>Selling Price</th>
											<th>Supplier/Technician</th>
											<th>Stock</th>
										</tr>
									</thead>
									<tbody>
										{isLoading &&(
											<tr>
												<td>Loadning...</td>
											</tr>
										)}
										{
											error && (
												<tr>
													<td>Error fetching stocks.</td>
												</tr>
											)
										}
										{
											StockInOuts &&
											dataPagination(StockInOuts, currentPage, perPage)
											// .filter((stockInOut: any) =>
											// 	searchTerm
											// 		? stockInOut.barcode?.includes(searchTerm.slice(0, 8))
											// 		: true,
											// )
											.filter((stockInOut: any) =>
												selectedUsers.length > 0
													? selectedUsers.includes(stockInOut.stock)
													: true,
											)
											// .filter((brand: any) => {
													
											// 	const search = searchTerm.toLowerCase();
											// 	return (
											// 		brand.code?.toString().toLowerCase().includes(searchTerm.slice(0, 4)) ||
											// 		(brand.brand + ' ' + brand.model)?.toLowerCase().includes(search) ||
											// 		(brand.category+" "+brand.brand+" "+brand.model)?.toLowerCase().includes(search) ||
											// 		(brand.category+" "+brand.model+" "+brand.brand)?.toLowerCase().includes(search) ||
											// 		brand.model?.toLowerCase().includes(search) ||
											// 		brand.technicianNum?.toLowerCase().includes(search) ||
											// 		brand.brand?.toLowerCase().includes(search) ||
											// 		brand.category?.toLowerCase().includes(search)
											// 	);
											// })
											.sort((a: any, b: any) => b.code - a.code)
												.map((brand:any,index: any) => (
													<tr key={index}>
														<td>{brand.date}</td>
														<td>{brand.code}</td>
														{/* <td>{brand.barcode}</td> */}
														<td>{brand.category}</td>
														<td>{brand.brand}</td>
														<td>{brand.model}</td>
														<td>{brand.quantity}</td>
														<td>{brand.cost}</td>
														<td>{brand.sellingPrice }</td>
														<td>{brand.suppName|| brand.technicianNum}</td>
														<td>{brand.stock}</td>
													</tr>
												))
										}
									</tbody>
								</table>
							</CardBody>
							<PaginationButtons
								data={StockInOuts}
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
			<StockEditModal setIsOpen={setEditModalStatus} isOpen={editModalStatus} id={id} />
		</PageWrapper>
	);
};

export default Index;
