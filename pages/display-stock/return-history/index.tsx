import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import Button from '../../../components/bootstrap/Button';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
} from '../../../components/bootstrap/Card';
import Dropdown, {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from '../../../components/bootstrap/Dropdown';
import Input from '../../../components/bootstrap/forms/Input';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, {
	SubHeaderLeft,
} from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import { useGetAllReturnsQuery } from '../../../redux/slices/returnDisplayApiSlice';
import moment from 'moment';

interface User {
	cid: string;
	image: string;
	name: string;
	position: string;
	email: string;
	mobile: number;
	NIC: number;
	profile_picture: string;
}

interface ReturnItem {
	id: number;
	barcode: string;
	brand: string;
	category: string;
	model: string;
	condition: string;
	date: string;
	created_at?: string;
	updated_at?: string;
}

const Index: React.FC = () => {
	const router = useRouter();
	const [expandedRow, setExpandedRow] = useState<number | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [searchDate, setSearchDate] = useState('');
	const [users, setUsers] = useState<User[]>([]);
	const [filteredOrders, setFilteredOrders] = useState<ReturnItem[]>([]);
	const [chunks, setChunks] = useState<any[]>([]);
	const [orderedItems, setOrderedItems] = useState<any>({});
	const invoiceRef = useRef<HTMLDivElement>(null);

	// Use the RTK Query hook to fetch returns
	const { data: returns, error, isLoading, refetch } = useGetAllReturnsQuery();

	// Toggle row expansion
	const toggleRow = (index: any) => {
		setExpandedRow(expandedRow === index ? null : index);
	};

	// Enhanced filter function with better search capabilities
	const filterReturns = (items: ReturnItem[]) => {
		if (!items) return [];
		
		return items.filter((item) => {
			// Date filter
			if (searchDate) {
				const dateFormatted = moment(searchDate).format('MMM D YYYY');
				if (item.date !== dateFormatted) return false;
			}
			
			// Search term filter
			if (searchTerm) {
				const search = searchTerm.toLowerCase();
				const searchableText = [
					item.barcode?.toString(),
					item.brand,
					item.model,
					item.category,
					item.condition,
					item.id?.toString()
				].filter(Boolean).join(' ').toLowerCase();
				
				if (!searchableText.includes(search)) return false;
			}
			
			return true;
		});
	};

	// Filter orders based on date and search term
	useEffect(() => {
		if (returns) {
			const filtered = filterReturns(returns);
			setFilteredOrders(filtered);
		}
	}, [returns, searchDate, searchTerm]);

	// Export data to CSV with enhanced data
	const handleExport = (format: string) => {
		if (format === 'csv' && filteredOrders.length > 0) {
			// Create headers
			const headers = [
				'Return ID',
				'Return Date',
				'Barcode',
				'Condition',
				'Category',
				'Brand',
				'Model',
				'Created At',
			];

			// Create rows
			const csvRows = [headers];

			// Add data rows
			filteredOrders.forEach((item) => {
				csvRows.push([
					item.id.toString(),
					item.date,
					item.barcode,
					item.condition,
					item.category || '',
					item.brand || '',
					item.model || '',
					item.created_at ? moment(item.created_at).format('YYYY-MM-DD HH:mm:ss') : '',
				]);
			});

			// Convert to CSV string
			const csvContent =
				'data:text/csv;charset=utf-8,' +
				csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

			// Download CSV
			const encodedUri = encodeURI(csvContent);
			const link = document.createElement('a');
			link.setAttribute('href', encodedUri);
			link.setAttribute('download', `return_history_${moment().format('YYYY-MM-DD')}.csv`);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			
			// Show success message
			Swal.fire({
				icon: 'success',
				title: 'Export Successful',
				text: `Exported ${filteredOrders.length} return records to CSV.`,
				timer: 2000,
				showConfirmButton: false
			});
		} else if (filteredOrders.length === 0) {
			Swal.fire({
				icon: 'warning',
				title: 'No Data to Export',
				text: 'There are no return records matching your current filters.',
			});
		}
	};

	// Function to clear all filters
	const clearFilters = () => {
		setSearchTerm('');
		setSearchDate('');
	};

	// Function to refresh data
	const handleRefresh = () => {
		refetch();
		Swal.fire({
			icon: 'success',
			title: 'Data Refreshed',
			text: 'Return history has been updated.',
			timer: 1500,
			showConfirmButton: false
		});
	};

	return (
		<>
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
							placeholder='Search by ID, barcode, brand, model, category, or condition...'
							onChange={(event: any) => {
								setSearchTerm(event.target.value);
							}}
							value={searchTerm}
						/>
					</SubHeaderLeft>
				</SubHeader>
				<Page>
					<div className='row h-100'>
						<div className='col-12'>
							<Card stretch>
								<CardTitle className='d-flex justify-content-between align-items-center m-4'>
									<div className='d-flex align-items-center gap-3'>
										<div>
											<label className='form-label mb-1'>Filter by Date:</label>
											<input
												type='date'
												onChange={(e: any) => setSearchDate(e.target.value)}
												value={searchDate}
												className='form-control'
												style={{ width: '200px' }}
											/>
										</div>
										{(searchTerm || searchDate) && (
											<Button
												color='secondary'
												size='sm'
												onClick={clearFilters}
												className='mt-4'>
												Clear Filters
											</Button>
										)}
										<Button
											color='info'
											size='sm'
											onClick={handleRefresh}
											className='mt-4'>
											<Icon icon='Refresh' className='me-1' />
											Refresh
										</Button>
									</div>
									<div className='flex-grow-1 text-center text-primary'>
										<h4>Return History</h4>
										<small className='text-muted'>
											{filteredOrders.length} of {returns?.length || 0} records
										</small>
									</div>
									<Dropdown>
										<DropdownToggle hasIcon={false}>
											<Button icon='UploadFile' color='warning'>
												Export
											</Button>
										</DropdownToggle>
										<DropdownMenu isAlignmentEnd>
											<DropdownItem onClick={() => handleExport('csv')}>
												<span>
													<Icon icon='FileDownload' className='me-2' />
													Download CSV
												</span>
											</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								</CardTitle>
								<CardBody isScrollable className='table-responsive'>
									{isLoading && (
										<div className="text-center p-4">
											<div className="spinner-border text-primary" role="status">
												<span className="visually-hidden">Loading...</span>
											</div>
											<p className="mt-2">Loading return data...</p>
										</div>
									)}
									{error && (
										<div className="alert alert-danger m-4">
											<Icon icon='Error' className='me-2' />
											Error loading return data. Please try again.
											<Button
												color='link'
												size='sm'
												onClick={handleRefresh}
												className='ms-2'>
												Retry
											</Button>
										</div>
									)}
									{!isLoading && !error && (
										<table className='table table-hover table-bordered border-primary'>
											<thead className={'table-dark border-primary'}>
												<tr>
													<th>Return ID</th>
													<th>Return Date</th>
													<th>Created At</th>
													<th>Barcode</th>
													<th>Condition</th>
													<th>Category</th>
													<th>Brand</th>
													<th>Model</th>
												</tr>
											</thead>
											<tbody>
												{filteredOrders.length > 0 ? (
													filteredOrders.map((item, index) => (
														<React.Fragment key={item.id}>
															<tr style={{ cursor: 'pointer' }}>
																<td>
																	<strong className="text-primary">#{item.id}</strong>
																</td>
																<td onClick={() => toggleRow(index)}>
																	{item.date}
																</td>
																<td onClick={() => toggleRow(index)}>
																	{item.created_at 
																		? moment(item.created_at).format('MMM D, YYYY HH:mm') 
																		: 'N/A'
																	}
																</td>
																<td onClick={() => toggleRow(index)}>
																	<span className="font-monospace">{item.barcode}</span>
																</td>
																<td onClick={() => toggleRow(index)}>
																	<span className={`badge ${item.condition === 'Good' ? 'bg-success' : 'bg-danger'}`}>
																		{item.condition}
																	</span>
																</td>
																<td onClick={() => toggleRow(index)}>
																	{item.category || 'N/A'}
																</td>
																<td onClick={() => toggleRow(index)}>
																	{item.brand || 'N/A'}
																</td>
																<td onClick={() => toggleRow(index)}>
																	{item.model || 'N/A'}
																</td>
															</tr>
														</React.Fragment>
													))
												) : (
													<tr>
														<td colSpan={8} className="text-center py-4">
															{returns?.length === 0 ? (
																<div>
																	<Icon icon='Inbox' size='3x' className='text-muted mb-3' />
																	<h5 className="text-muted">No Returns Found</h5>
																	<p className="text-muted">No return transactions have been recorded yet.</p>
																</div>
															) : (
																<div>
																	<Icon icon='Search' size='3x' className='text-muted mb-3' />
																	<h5 className="text-muted">No Matching Results</h5>
																	<p className="text-muted">
																		No returns found matching your current filters.
																		{searchDate && <><br/>Date filter: <strong>{searchDate}</strong></>}
																		{searchTerm && <><br/>Search term: <strong>"{searchTerm}"</strong></>}
																	</p>
																	<Button
																		color="link"
																		onClick={clearFilters}
																		className="p-0">
																		Clear all filters
																	</Button>
																</div>
															)}
														</td>
													</tr>
												)}
											</tbody>
										</table>
									)}
								</CardBody>
							</Card>
						</div>
					</div>
				</Page>
			</PageWrapper>
		</>
	);
};

export default Index;
