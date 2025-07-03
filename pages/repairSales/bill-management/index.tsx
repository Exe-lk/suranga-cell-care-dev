import React, { useContext, useEffect, useRef, useState } from 'react';
import type { NextPage } from 'next';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import useDarkMode from '../../../hooks/useDarkMode';
import Page from '../../../layout/Page/Page';
import { database, firestore } from '../../../firebaseConfig';
import SubHeader, {
	SubHeaderLeft,
	SubHeaderRight,
	SubheaderSeparator,
} from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import Dropdown, { DropdownMenu, DropdownToggle } from '../../../components/bootstrap/Dropdown';
import Button from '../../../components/bootstrap/Button';
import Card, { CardBody, CardTitle } from '../../../components/bootstrap/Card';
import { collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import BillAddModal from '../../../components/custom/BillAddModal';
import BillDeleteModal from '../../../components/custom/BillDeleteModal';
import BillEditModal from '../../../components/custom/BillEditModal';
import Swal from 'sweetalert2';
import { useUpdateBillMutation, useGetBillsQuery } from '../../../redux/slices/billApiSlice';
import { toPng, toSvg } from 'html-to-image';
import { DropdownItem } from '../../../components/bootstrap/Dropdown';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import bill from '../../../assets/img/bill/WhatsApp_Image_2024-09-12_at_12.26.10_50606195-removebg-preview (1).png';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import Select from '../../../components/bootstrap/forms/Select';
import Option from '../../../components/bootstrap/Option';
const Index: NextPage = () => {
	const { darkModeStatus } = useDarkMode();
	const [searchTerm, setSearchTerm] = useState('');
	const [addModalStatus, setAddModalStatus] = useState<boolean>(false);
	const [deleteModalStatus, setDeleteModalStatus] = useState<boolean>(false);
	const [editModalStatus, setEditModalStatus] = useState<boolean>(false);
	const [id, setId] = useState<string>('');
	const { data: bills, error, isLoading ,refetch} = useGetBillsQuery(undefined);
	const [updateBill] = useUpdateBillMutation();
	const [dateInStart, setDateInStart] = useState<string>('');
	const [dateInEnd, setDateInEnd] = useState<string>('');
	const [dateOutStart, setDateOutStart] = useState<string>('');
	const [dateOutEnd, setDateOutEnd] = useState<string>('');
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(PER_COUNT['10000']);
	const inputRef = useRef<HTMLInputElement>(null);

	const filteredTransactions = bills?.filter((trans: any) => {
		const transactionDateIn = new Date(trans.dateIn);
		const transactionDateOut = trans.DateOut ? new Date(trans.DateOut) : null;
		const dateInStartObj = dateInStart ? new Date(dateInStart) : null;
		const dateInEndObj = dateInEnd ? new Date(dateInEnd) : null;
		const dateOutStartObj = dateOutStart ? new Date(dateOutStart) : null;
		const dateOutEndObj = dateOutEnd ? new Date(dateOutEnd) : null;
		const isDateInValid =
			(!dateInStartObj || transactionDateIn >= dateInStartObj) &&
			(!dateInEndObj || transactionDateIn <= dateInEndObj);
		const isDateOutValid = transactionDateOut
			? (!dateOutStartObj || transactionDateOut >= dateOutStartObj) &&
			  (!dateOutEndObj || transactionDateOut <= dateOutEndObj)
			: true;
		return isDateInValid && isDateOutValid;
	});

	const handleClickDelete = async (bill: any) => {
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
					id: bill.id,
					billNumber: bill.billNumber,
					dateIn: bill.dateIn,
					phoneDetail: bill.phoneDetail,
					phoneModel: bill.phoneModel,
					repairType: bill.repairType,
					technicianNum: bill.technicianNum,
					CustomerName: bill.CustomerName,
					CustomerMobileNum: bill.CustomerMobileNum,
					email: bill.email,
					NIC: bill.NIC,
					componentCost: bill.componentCost,
					repairCost: bill.repairCost,
					totalCost: bill.totalCost,
					Price: bill.Price,
					Status: bill.Status,
					DateOut: bill.DateOut,
					status: false,
				};
				await updateBill(values);
				Swal.fire('Deleted!', 'The bill has been deleted.', 'success');
			}
		} catch (error) {
			console.error('Error deleting document: ', error);
			Swal.fire('Error', 'Failed to delete bill.', 'error');
		}
	};

	const handleExport = async (format: string) => {
		const table = document.querySelector('table');
		if (!table) return;
		modifyTableForExport(table as HTMLElement, true);
		const clonedTable = table.cloneNode(true) as HTMLElement;
		const rows = clonedTable.querySelectorAll('tr');
		rows.forEach((row) => {
			const lastCell = row.querySelector('td:last-child, th:last-child');
			if (lastCell) {
				lastCell.remove();
			}
		});
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
		link.download = 'Bill-management Report.csv';
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
			const title = 'Bill-management Report';
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
					fontSize: 5,
					overflow: 'linebreak',
					cellPadding: 2,
				},
				headStyles: {
					fillColor: [80, 101, 166],
					textColor: [255, 255, 255],
					fontSize: 7,
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
			pdf.save('Bill-management Report.pdf');
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
			link.download = 'Bill-management Report.png';
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
			link.download = 'Bill-management Report.svg';
			link.click();
		} catch (error) {
			console.error('Error generating SVG: ', error);
			const table = document.querySelector('table');
			if (table) restoreLastCells(table);
		}
	};

	const getStatusColorClass = (status: string) => {
		switch (status) {
			case 'Waiting':
				return 'bg-success';
			case 'Ready to Repair':
				return 'bg-info';
			case 'In Progress':
				return 'bg-warning';
			case 'Reject':
				return 'bg-danger';
			case 'Repair Completed':
				return 'bg-lo50-primary';
			case 'HandOver':
				return 'bg-lo50-info';
		}
	};

	const statuschange = async (id:any,value:any) => {
		const response = await fetch(`/api/bill/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				Status: value,
			}),
		});

		if (response.ok) {
			console.log('Bill status updated successfully');
			// Update the local state or refetch data
			refetch();
		} else {
			console.error('Failed to update bill status');
		}
	};

	const handlePrintBill = (bill: any) => {
		const printWindow = window.open('', '_blank');
		if (!printWindow) return;

		const currentDate = new Date().toLocaleDateString();
		
		// Helper function to format array as string
		const formatArrayToString = (arr: any[]) => {
			if (!arr || !Array.isArray(arr) || arr.length === 0) return 'None';
			return arr.join(', ');
		};
		
		const printContent = `
			<!DOCTYPE html>
			<html>
			<head>
				<title>Bill - ${bill.billNumber}</title>
				<style>
					* {
						margin: 0;
						padding: 0;
						box-sizing: border-box;
					}
					body {
						font-family: 'Arial', sans-serif;
						background: white;
						margin: 0;
						padding: 20px;
					}
					.bill-container {
						width: 130mm;
						height: auto;
						background: #fff;
						border: 1px dashed #ccc;
						padding: 20px;
						font-family: Arial, sans-serif;
						font-size: 12px;
						color: black;
						margin: 0 auto;
					}
					.header h1 {
						font-size: 29px;
						font-family: initial;
						color: black;
						margin-bottom: 2px;
					}
					.header p {
						margin-bottom: 2px;
						color: black;
						font-size: 12px;
					}
					.divider {
						margin: 5px 0;
						display: block;
						border-top: 1px solid black;
						color: black;
					}
					.bill-details {
						margin-bottom: 5px;
						line-height: 1.2;
					}
					.bill-details table {
						width: 100%;
						border-collapse: collapse;
					}
					.bill-details td {
						color: black;
						padding: 2px 0;
						font-size: 12px;
					}
					.section-title {
						color: black;
						font-size: 12px;
						margin: 8px 0 3px 0;
						font-weight: bold;
					}
					.item-row {
						color: black;
						padding: 3px 0;
						border-bottom: 1px dotted #ccc;
						font-size: 11px;
					}
					.item-label {
						font-weight: bold;
						display: inline-block;
						width: 40%;
					}
					.item-value {
						display: inline-block;
						width: 58%;
					}
					.cost-section {
						margin-top: 10px;
						padding-top: 5px;
						border-top: 1px solid black;
					}
					.cost-row {
						display: flex;
						justify-content: space-between;
						padding: 2px 0;
						font-size: 12px;
					}
					.total-row {
						display: flex;
						justify-content: space-between;
						padding: 5px 0;
						font-size: 14px;
						font-weight: bold;
						border-top: 1px solid black;
						margin-top: 5px;
					}
					.status-section {
						text-align: center;
						margin: 10px 0;
						padding: 5px;
						background: #f0f0f0;
						border-radius: 3px;
					}
					.footer {
						text-align: center;
						font-size: 12px;
						color: black;
						margin-top: 10px;
						border-top: 1px solid black;
						padding-top: 5px;
					}
					.footer-small {
						text-align: right;
						font-size: 10px;
						color: black;
						margin-top: 5px;
					}
					.accessories-list {
						font-size: 10px;
						line-height: 1.3;
						word-wrap: break-word;
					}
					.condition-list {
						font-size: 10px;
						line-height: 1.3;
						word-wrap: break-word;
					}
					@media print {
						body { 
							margin: 0; 
							padding: 0;
						}
						.bill-container { 
							margin: 0;
							border: none;
						}
					}
				</style>
			</head>
			<body>
				<div class="bill-container">
					<!-- Header -->
					<div class="header text-left">
						<h1>Suranga Cell Care</h1>
						<p>No. 524/1A, Kandy Road, Kadawatha.</p>
						<p>Tel: +94 11 292 60 30 | Mobile: +94 76 401 77 28</p>
					</div>
					
					<span class="divider"></span>
					
					<!-- Bill Details -->
					<div class="bill-details">
						<table>
							<tr>
								<td style="width: 50%;">Bill No: ${bill.billNumber}</td>
								<td>Date: ${bill.dateIn}</td>
							</tr>
							<tr>
								<td>Customer: ${bill.CustomerName}</td>
								<td>Print: ${currentDate}</td>
							</tr>
							<tr>
								<td>Mobile: ${bill.CustomerMobileNum}</td>
								<td>Tech: ${bill.technicianNum}</td>
							</tr>
						</table>
					</div>
					
					<span class="divider"></span>
					
					<!-- Device Information -->
					<div class="section-title">DEVICE INFORMATION</div>
					<div class="item-row">
						<span class="item-label">Model:</span>
						<span class="item-value">${bill.phoneModel}</span>
					</div>
					<div class="item-row">
						<span class="item-label">Details:</span>
						<span class="item-value">${bill.phoneDetail}</span>
					</div>
					<div class="item-row">
						<span class="item-label">Repair Type:</span>
						<span class="item-value">${bill.repairType}</span>
					</div>
					${bill.color ? `
					<div class="item-row">
						<span class="item-label">Color:</span>
						<span class="item-value">${bill.color}</span>
					</div>
					` : ''}
					${bill.IME ? `
					<div class="item-row">
						<span class="item-label">IMEI:</span>
						<span class="item-value">${bill.IME}</span>
					</div>
					` : ''}
					
					<!-- Device Condition -->
					<div class="item-row">
						<span class="item-label">Condition:</span>
						<span class="item-value condition-list">${formatArrayToString(bill.Condition)}</span>
					</div>
					
					<span class="divider"></span>
					
					<!-- Customer Accessories -->
					<div class="section-title">CUSTOMER ACCESSORIES</div>
					<div class="item-row">
						<span class="item-label">Provided:</span>
						<span class="item-value accessories-list">${formatArrayToString(bill.Item)}</span>
					</div>
					
					<span class="divider"></span>
					
					<!-- Cost Breakdown -->
					<div class="section-title">COST BREAKDOWN</div>
					<div class="cost-section">
						<div class="cost-row">
							<span>Component Cost:</span>
							<span>Rs. ${bill.componentCost || '0.00'}</span>
						</div>
						<div class="cost-row">
							<span>Repair Cost:</span>
							<span>Rs. ${bill.repairCost || '0.00'}</span>
						</div>
						<div class="total-row">
							<span>TOTAL AMOUNT:</span>
							<span>Rs. ${bill.cost || bill.totalCost || '0.00'}</span>
						</div>
					</div>
					
					<!-- Status -->
					<div class="status-section">
						<strong>Status: ${bill.Status}</strong>
					</div>
					
					<!-- Customer Info -->
					<div class="section-title">CUSTOMER DETAILS</div>
					<div class="item-row">
						<span class="item-label">NIC:</span>
						<span class="item-value">${bill.NIC}</span>
					</div>
					<div class="item-row">
						<span class="item-label">Email:</span>
						<span class="item-value">${bill.email || 'N/A'}</span>
					</div>
					
					<!-- Footer -->
					<div class="footer">
						<div>...........................Thank You ... Come Again...........................</div>
						<div style="margin-top: 5px;">Bill No: ${bill.billNumber} | Tech: ${bill.technicianNum}</div>
					</div>
					<div class="footer-small">
						POS System by EXE.LK +94 70 332 9900
					</div>
				</div>
			</body>
			</html>
		`;

		printWindow.document.write(printContent);
		printWindow.document.close();
		printWindow.focus();
		printWindow.print();
		printWindow.close();
	};

	const getStatusColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'waiting': return '#28a745';
			case 'ready to repair': return '#17a2b8';
			case 'in progress': return '#ffc107';
			case 'reject': return '#dc3545';
			case 'repair completed': return '#6f42c1';
			case 'handover': return '#20c997';
			default: return '#6c757d';
		}
	};

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, [bills]);

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
									<FormGroup label='Date In Start' className='col-6'>
										<Input
											type='date'
											onChange={(e: any) => setDateInStart(e.target.value)}
											value={dateInStart}
										/>
									</FormGroup>
									<FormGroup label='Date In End' className='col-6'>
										<Input
											type='date'
											onChange={(e: any) => setDateInEnd(e.target.value)}
											value={dateInEnd}
										/>
									</FormGroup>
									<FormGroup label='Date Out Start' className='col-6'>
										<Input
											type='date'
											onChange={(e: any) => setDateOutStart(e.target.value)}
											value={dateOutStart}
										/>
									</FormGroup>
									<FormGroup label='Date Out End' className='col-6'>
										<Input
											type='date'
											onChange={(e: any) => setDateOutEnd(e.target.value)}
											value={dateOutEnd}
										/>
									</FormGroup>
								</div>
							</div>
						</DropdownMenu>
					</Dropdown>
					<SubheaderSeparator />
					<Button
						icon='AddCircleOutline'
						color='success'
						isLight
						onClick={() => setAddModalStatus(true)}>
						New Bill
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page>
				<div className='row h-100'>
					<div className='col-12'>
						<Card stretch>
							<CardTitle className='d-flex justify-content-between align-items-center m-4'>
								<div className='flex-grow-1 text-center text-primary'>
									Manage Bills
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
							<center>
								<div className='d-flex justify-content-center mb-3'>
									<div
										className='rounded-circle bg-success d-flex mx-2 '
										style={{ width: '15px', height: '15px', padding: '2px' }}>
										<span className='text-black'></span>
									</div>
									<div className='mx-2'>Waiting</div>{' '}
									<div
										className='rounded-circle bg-info d-flex mx-2 '
										style={{ width: '15px', height: '15px', padding: '2px' }}>
										<span className='text-black'></span>
									</div>
									<div className='mx-2'>Ready to Repair</div>{' '}
									<div
										className='rounded-circle bg-warning d-flex mx-2 '
										style={{ width: '15px', height: '15px', padding: '2px' }}>
										<span className='text-black'></span>
									</div>
									<div className='mx-2'>In Progress</div>{' '}
									<div
										className='rounded-circle bg-danger d-flex mx-2 '
										style={{ width: '15px', height: '15px', padding: '2px' }}>
										<span className='text-black'></span>
									</div>
									<div className='mx-2'>Reject</div>{' '}
									<div
										className='rounded-circle bg-lo50-primary d-flex mx-2 '
										style={{ width: '15px', height: '15px', padding: '2px' }}>
										<span className='text-black'></span>
									</div>
									<div className='mx-2'>Repair Completed</div>{' '}
									<div
										className='rounded-circle bg-lo50-info d-flex mx-2 '
										style={{ width: '15px', height: '15px', padding: '2px' }}>
										<span className='text-black'></span>
									</div>
									<div className='mx-2'>HandOver</div>{' '}
								</div>
							</center>
							<CardBody isScrollable className='table-responsive'>
								<table className='table  table-bordered border-primary table-hover text-center'>
									<thead className={'table-dark border-primary'}>
										<tr>
											<th>Date In</th>
											<th>Phone Details</th>
											<th>Bill Num</th>
											<th>Phone Model</th>
											<th>Repair Type</th>
											<th>Tech No.</th>
											<th>Customer Name</th>
											<th>Mobile Num</th>
											{/* <th>Email</th> */}
											<th>NIC</th>
											<th>Cost</th>
											<th>Status</th>
											{/* <th>Change Status</th> */}
											{/* <th>Date out</th> */}
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
												<td>Error fetching bills.</td>
											</tr>
										)}
										{filteredTransactions &&
											dataPagination(
												filteredTransactions,
												currentPage,
												perPage,
											)
												.filter((bill: any) =>
													searchTerm
														? bill.NIC.toLowerCase().includes(
																searchTerm.toLowerCase(),
														  ) ||
														  bill.CustomerName.toLowerCase().includes(
																searchTerm.toLowerCase(),
														  ) ||
														  bill.billNumber
																.toLowerCase()
																.includes(
																	searchTerm.toLowerCase(),
																) ||
														  bill.technicianNum
																.toLowerCase()
																.includes(searchTerm.toLowerCase())
														: true,
												)
												.map((bill: any, index: any) => (
													<tr key={index}>
														<td>{bill.dateIn}</td>
														<td>{bill.phoneDetail}</td>
														<td>{bill.billNumber}</td>
														<td>{bill.phoneModel}</td>
														<td>{bill.repairType}</td>
														<td>{bill.technicianNum}</td>
														<td>{bill.CustomerName}</td>
														<td>{bill.CustomerMobileNum}</td>
														{/* <td>{bill.email}</td> */}
														<td>{bill.NIC}</td>
														<td>{bill.totalCost}</td>
														<td>
															<span
																className={`badge rounded-pill ${getStatusColorClass(
																	bill.Status,
																)} text-black`}>
																{bill.Status}
															</span>
														</td>
														<td>
															<Button
																icon='Edit'
																color='info'
																onClick={() => (
																	setEditModalStatus(true),
																	setId(bill.id)
																)}></Button>
															<Button
																className='m-2'
																icon='Delete'
																color='danger'
																onClick={() =>
																	handleClickDelete(bill)
																}></Button>
															<Button
																className='m-2'
																icon='Print'
																color='success'
																onClick={() => handlePrintBill(bill)}
																title='Print Bill'></Button>
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
			<BillAddModal setIsOpen={setAddModalStatus} isOpen={addModalStatus} id='' />
			<BillDeleteModal setIsOpen={setDeleteModalStatus} isOpen={deleteModalStatus} id='' />
			<BillEditModal setIsOpen={setEditModalStatus} isOpen={editModalStatus} id={id} />
		</PageWrapper>
	);
};

export default Index;
