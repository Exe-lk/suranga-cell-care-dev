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
import BillAddModal from '../../../components/custom/BillAddModal';
import BillDeleteModal from '../../../components/custom/BillDeleteModal';
import BillEditModal from '../../../components/custom/BillEditModal1';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../../components/bootstrap/Modal';
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
	const [costEditModalStatus, setCostEditModalStatus] = useState<boolean>(false);
	const [selectedBill, setSelectedBill] = useState<any>(null);
	const [componentCost, setComponentCost] = useState<string>('');
	const [repairCost, setRepairCost] = useState<string>('');
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

	// Handle cost editing modal
	const handleCostEdit = (bill: any) => {
		setSelectedBill(bill);
		setComponentCost(bill.componentCost?.toString() || '');
		setRepairCost(bill.repairCost?.toString() || '');
		setCostEditModalStatus(true);
	};

	// Update only costs
	const handleCostUpdate = async () => {
		if (!selectedBill) return;

		try {
			const componentCostNum = parseFloat(componentCost) || 0;
			const repairCostNum = parseFloat(repairCost) || 0;
			const totalCost = componentCostNum + repairCostNum;

			const values = {
				id: selectedBill.billNumber,
				billNumber: selectedBill.billNumber,
				dateIn: selectedBill.dateIn,
				phoneDetail: selectedBill.phoneDetail,
				phoneModel: selectedBill.phoneModel,
				repairType: selectedBill.repairType,
				technicianNum: selectedBill.technicianNum,
				CustomerName: selectedBill.CustomerName,
				CustomerMobileNum: selectedBill.CustomerMobileNum,
				email: selectedBill.email,
				NIC: selectedBill.NIC,
				componentCost: componentCostNum,
				repairCost: repairCostNum,
				totalCost: totalCost,
				Price: selectedBill.Price,
				Status: selectedBill.Status,
				DateOut: selectedBill.DateOut,
				status: selectedBill.status,
				Condition: selectedBill.Condition,
				Item: selectedBill.Item,
				color: selectedBill.color,
				IME: selectedBill.IME,
			};

			await updateBill(values);
			setCostEditModalStatus(false);
			setSelectedBill(null);
			setComponentCost('');
			setRepairCost('');
			refetch();
			Swal.fire('Success!', 'Costs have been updated successfully.', 'success');
		} catch (error) {
			console.error('Error updating costs:', error);
			Swal.fire('Error!', 'Failed to update costs.', 'error');
		}
	};

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
		const result = await Swal.fire({
			title: 'Are you sure?',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, Update it!',
		});
		if (result.isConfirmed) {
			try {
				// Get the bill that needs to be updated
				const billToUpdate = bills?.find((bill: any) => bill.id === id);
				
				if (!billToUpdate) {
					throw new Error('Bill not found');
				}
				
				// Prepare values for update
				const values = {
					id: billToUpdate.billNumber, // Use billNumber as id for Supabase
					billNumber: billToUpdate.billNumber,
					dateIn: billToUpdate.dateIn,
					phoneDetail: billToUpdate.phoneDetail,
					phoneModel: billToUpdate.phoneModel,
					repairType: billToUpdate.repairType,
					technicianNum: billToUpdate.technicianNum,
					CustomerName: billToUpdate.CustomerName,
					CustomerMobileNum: billToUpdate.CustomerMobileNum,
					email: billToUpdate.email,
					NIC: billToUpdate.NIC,
					componentCost: billToUpdate.componentCost,
					repairCost: billToUpdate.repairCost,
					totalCost: billToUpdate.totalCost,
					Price: billToUpdate.Price,
					Status: value, // Use the new status value
					DateOut: billToUpdate.DateOut,
					status: billToUpdate.status,
					// Include other fields from the bill as needed
					Condition: billToUpdate.Condition,
					Item: billToUpdate.Item,
					color: billToUpdate.color,
					IME: billToUpdate.IME,
				};
				
				// Use Redux mutation to update in Supabase
				await updateBill(values);
				
				Swal.fire("Updated!", "The status has been updated.", "success");
				refetch(); // Refresh the data
			} catch (error) {
				console.error("Error updating status:", error);
				Swal.fire("Error!", "Failed to update status.", "error");
			}
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
					{/* <SubheaderSeparator /> */}
					{/* <Button
						icon='AddCircleOutline'
						color='success'
						isLight
						onClick={() => setAddModalStatus(true)}>
						New Bill
					</Button> */}
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
											{/* <th>Cost</th>
											<th>Price</th> */}
											<th>Status</th>
											<th>Change Status</th>
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
														{/* <td>{bill.cost}</td>
														<td>{bill.Price}</td> */}
														<td>
															<span
																className={`badge rounded-pill ${getStatusColorClass(
																	bill.Status,
																)} text-black`}>
																{bill.Status}
															</span>
														</td>
														<td>
															
																<Select
																	ariaLabel='Default select Status'
																	// placeholder='Open this select Status'
																	onChange={(e:any)=>{statuschange(bill.id,e.target.value)}}
																	value={bill.Status}
																	name='Status'
																	
																	validFeedback='Looks good!'>
																	<Option value=''>
																		Select the Status
																	</Option>
																	<Option value='Waiting'>
																		Waiting
																	</Option>
																	<Option value='Ready to Repair'>
																		Ready to Repair
																	</Option>
																	<Option value='In Progress'>
																		In Progress
																	</Option>
																	<Option value='Reject'>
																		Reject
																	</Option>
																	<Option value='Repair Completed'>
																		Repair Completed
																	</Option>
																</Select>
															
														</td>
														{/* <td>{bill.DateOut}</td> */}
														<td>
															<Button
																icon='Edit'
																color='info'
																onClick={() => (
																	setEditModalStatus(true),
																	setId(bill.id)
																)}></Button>
															{/* <Button
																icon='AttachMoney'
																color='warning'
																className='ms-2'
																onClick={() => handleCostEdit(bill)}
																title='Edit Costs'></Button> */}
															{/* <Button
																className='m-2'
																icon='Delete'
																color='danger'
																onClick={() =>
																	handleClickDelete(bill)
																}></Button> */}
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
			
			{/* Cost Edit Modal */}
			{/* <Modal
				isOpen={costEditModalStatus}
				setIsOpen={setCostEditModalStatus}
				size='lg'
				titleId='costEditModal'>
				<ModalHeader setIsOpen={setCostEditModalStatus}>
					<ModalTitle id='costEditModal'>Edit Costs</ModalTitle>
				</ModalHeader>
				<ModalBody>
					<div className='row g-3'>
						<FormGroup id='componentCost' label='Component Cost' className='col-md-6'>
							<Input
								type='number'
								step={0.01}
								min={0}
								value={componentCost}
								onChange={(e: any) => setComponentCost(e.target.value)}
								placeholder='Enter component cost'
							/>
						</FormGroup>
						<FormGroup id='repairCost' label='Repair Cost' className='col-md-6'>
							<Input
								type='number'
								step={0.01}
								min={0}
								value={repairCost}
								onChange={(e: any) => setRepairCost(e.target.value)}
								placeholder='Enter repair cost'
							/>
						</FormGroup>
						<div className='col-12'>
							<div className='alert alert-info'>
								<strong>Total Cost: </strong>
								{((parseFloat(componentCost) || 0) + (parseFloat(repairCost) || 0)).toFixed(2)}
							</div>
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button
						color='secondary'
						onClick={() => {
							setCostEditModalStatus(false);
							setSelectedBill(null);
							setComponentCost('');
							setRepairCost('');
						}}>
						Cancel
					</Button>
					<Button color='primary' onClick={handleCostUpdate}>
						Update Costs
					</Button>
				</ModalFooter>
			</Modal> */}
		</PageWrapper>
	);
};

export default Index;
