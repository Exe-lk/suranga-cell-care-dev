import React, {  useEffect, useRef, useState } from 'react';
import type { NextPage } from 'next';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
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
import bill from '../../../assets/img/bill/WhatsApp_Image_2024-09-12_at_12.26.10_50606195-removebg-preview (1).png';
import ModelAddModal from '../../../components/custom/Model1AddModal';
import ModelDeleteModal from '../../../components/custom/Model1DeleteModal';
import ModelEditModal from '../../../components/custom/Model1EditModal';
import Swal from 'sweetalert2';
import { useGetModels1Query ,useUpdateModel1Mutation} from '../../../redux/slices/model1ApiSlice';
import { toPng, toSvg } from 'html-to-image';
import { DropdownItem }from '../../../components/bootstrap/Dropdown';
import jsPDF from 'jspdf'; 
import autoTable from 'jspdf-autotable';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Checks, { ChecksGroup } from '../../../components/bootstrap/forms/Checks';
import { useGetItemAccesQuery } from '../../../redux/slices/itemManagementAcceApiSlice';


const Index: NextPage = () => {
	const [searchTerm, setSearchTerm] = useState(''); 
	const [addModalStatus, setAddModalStatus] = useState<boolean>(false); 
	const [deleteModalStatus, setDeleteModalStatus] = useState<boolean>(false);
	const [editModalStatus, setEditModalStatus] = useState<boolean>(false); 
	const [id, setId] = useState<string>(''); 
	const { data: models, error, isLoading, refetch } = useGetModels1Query(undefined);
	const [updateModel] = useUpdateModel1Mutation();
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(PER_COUNT['10000']);
	const inputRef = useRef<HTMLInputElement>(null);
	const brand = [
		{ brand: 'Samsung' },
		{ brand: 'Iphone' },
		{ brand: 'Oppo' },
		{ brand: 'Huawei' },
		{ brand: 'Vivo' },
		{ brand: 'Redmi' }
		];
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const { data: itemAcces } = useGetItemAccesQuery(undefined);
	

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, [models ]);

	// Add a refetch effect to refresh data when component mounts
	useEffect(() => {
		// Refetch models data to ensure we have the latest data after category updates
		refetch();
	}, [refetch]);

	const handleClickDelete = async (model: any) => {
		const isCategoryLinked = itemAcces.some((itemAcces: any) =>
			itemAcces.model === model.name &&
			itemAcces.category === model.category &&
			itemAcces.brand === model.brand
		  );
		
				if (isCategoryLinked) {
					Swal.fire(
						'Error',
						'Failed to delete model. please delete the items related to this.',
						'error',
					);
					return;
				}
		try {
			const result = await Swal.fire({
				title: 'Are you sure?',
				text: 'You will not be able to recover this model!',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, delete it!',
			});
			if (result.isConfirmed) {
				try {
					await updateModel({
						id:model.id,
						brand:model.brand,
						category: model.category,
						name:model.name,
						description:model.description,
						status:false,
				});
					Swal.fire('Deleted!', 'Model has been deleted.', 'success');
					refetch(); 
				} catch (error) {
					console.error('Error during handleDelete: ', error);
					Swal.fire(
						'Error',
						'An error occurred during deletion. Please try again later.',
						'error',
					);
				}
			}
		} catch (error) {
			console.error('Error deleting document: ', error);
			Swal.fire('Error', 'Failed to delete model.', 'error');
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
		}finally {
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
				link.download = 'Manage Accessory Model Report.csv';
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
        const title = 'Model-Accessory Report';
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
        autoTable(pdf, {
            head: headers,
            body: rows,
            margin: { top: 100 }, 
            styles: {
                overflow: 'linebreak',
                cellWidth: 'wrap',
            },
            headStyles: {
                fillColor: [80, 101, 166], 
                textColor: [255, 255, 255], 
            },
            theme: 'grid',
        });

        pdf.save('Manage Accessory Model Report.pdf');
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
        link.download = 'Manage Accessory Model Report.png';
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
		link.download = 'Manage Accessory Model Report.svg';
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
					ref={inputRef}
						id='searchInput'
						type='search'
						className='border-0 shadow-none bg-transparent'
						placeholder='Search by model, category or brand...'
						onChange={(event: any) => {
							setSearchTerm(event.target.value);
						}}
						value={searchTerm}
					/>
				</SubHeaderLeft>
				<SubHeaderRight>
					{/* <Dropdown>
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
									<FormGroup label='Brand type' className='col-12'>
										<ChecksGroup>
											{brand.map((model, index) => (
												<Checks
													key={model.brand}
													id={model.brand}
													label={model.brand}
													name={model.brand}
													value={model.brand}
													checked={selectedUsers.includes(model.brand)}
													onChange={(event: any) => {
														const { checked, value } = event.target;
														setSelectedUsers((prevUsers) =>
															checked
																? [...prevUsers, value]
																: prevUsers.filter(
																		(model) => model !== value,
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
					</Dropdown> */}
					{/* <SubheaderSeparator /> */}
					<Button
						icon='AddCircleOutline'
						color='success'
						isLight
						onClick={() => setAddModalStatus(true)}>
						New Model
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page>
				<div className='row h-100'>
					<div className='col-12'>
						<Card stretch>
							<CardTitle className='d-flex justify-content-between align-items-center m-4'>
								<div className='flex-grow-1 text-center text-primary'>Manage Model</div>
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
											<th>Category</th>
											<th>Brand</th>
											<th>Model name</th>
											<th>Description</th>
											<th></th>
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
													<td>Error fetching brands.</td>
												</tr>
											)
										}
										{
											models &&
											dataPagination(models, currentPage, perPage)
												.filter((model : any) =>
													model.status === true 
												)
												.filter((model : any) => 
													searchTerm 
													? model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
													model.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
													model.brand.toLowerCase().includes(searchTerm.toLowerCase()) 
													: true,
												)
												.filter((model: any) =>
													selectedUsers.length > 0
														? selectedUsers.includes(model.brand)
														: true,
												)
												.map((model:any, index: any) => (
													<tr key={index}>
														<td>{model.category}</td>
														<td>{model.brand}</td>
														<td>{model.name}</td>
														<td>{model.description}</td>
														<td>
															<Button
																icon='Edit'
																color='primary'
																onClick={() => {
																	setEditModalStatus(true);
																	setId(model.id);
																}}>
																Edit
															</Button>
															<Button
																icon='Delete'
																className='m-2'
																color='danger'
																onClick={() => handleClickDelete(model)}>
																Delete
															</Button>
														</td>
													</tr>
												))
										}
									</tbody>
								</table>
								<Button icon='Delete' className='mb-5'
								onClick={() => {
									refetch();
									setDeleteModalStatus(true)									
								}}>
								Recycle Bin</Button> 								
							</CardBody>
							<PaginationButtons
								data={models}
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
			<ModelAddModal setIsOpen={setAddModalStatus} isOpen={addModalStatus} id='' />
			<ModelDeleteModal setIsOpen={setDeleteModalStatus} isOpen={deleteModalStatus} id='' refetchMainPage={refetch} />
			<ModelEditModal setIsOpen={setEditModalStatus} isOpen={editModalStatus} id={id} />
		</PageWrapper>
	);
};

export default Index;
