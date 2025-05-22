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
	const { data: returns, error, isLoading } = useGetAllReturnsQuery();

	// Toggle row expansion
	const toggleRow = (index: any) => {
		setExpandedRow(expandedRow === index ? null : index);
	};

	// Filter orders based on date
	useEffect(() => {
		if (returns) {
			if (searchDate) {
				const dateFormatted = moment(searchDate).format('MMM D YYYY');
				const filtered = returns.filter((item) => item.date === dateFormatted);
				setFilteredOrders(filtered);
			} else {
				setFilteredOrders(returns);
			}
		}
	}, [returns, searchDate]);

	// Export data to CSV
	const handleExport = (format: string) => {
		if (format === 'csv' && filteredOrders.length > 0) {
			// Create headers
			const headers = [
				'ID',
				'Date',
				'Barcode',
				'Condition',
				'Category',
				'Brand',
				'Model',
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
					item.category,
					item.brand,
					item.model,
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
			link.setAttribute('download', 'return_history.csv');
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
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
							placeholder='Search by barcode, brand, or model...'
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
									<div className='mt-2 mb-4'>
										Select date:
										<input
											type='date'
											onChange={(e: any) => setSearchDate(e.target.value)}
											value={searchDate}
											className='px-3 py-2 ms-4 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
										/>
									</div>
									<div className='flex-grow-1 text-center text-primary'>
										Return History
									</div>
									<Dropdown>
										<DropdownToggle hasIcon={false}>
											<Button icon='UploadFile' color='warning'>
												Export
											</Button>
										</DropdownToggle>
										<DropdownMenu isAlignmentEnd>
											<DropdownItem onClick={() => handleExport('csv')}>
												Download CSV
											</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								</CardTitle>
								<CardBody isScrollable className='table-responsive'>
									{isLoading && <div className="text-center p-4">Loading return data...</div>}
									{error && (
										<div className="alert alert-danger m-4">
											Error loading return data. Please try again.
										</div>
									)}
									{!isLoading && !error && (
										<table className='table table-hover table-bordered border-primary'>
											<thead className={'table-dark border-primary'}>
												<tr>
													<th>Return ID</th>
													<th>Date</th>
													<th>Barcode</th>
													<th>Condition</th>
													<th>Category</th>
													<th>Brand</th>
													<th>Model</th>
												</tr>
											</thead>
											<tbody>
												{filteredOrders
													.filter((item) => {
														if (searchTerm === '') {
															return item;
														} else if (
															item.barcode?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
															item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
															item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
															item.category?.toLowerCase().includes(searchTerm.toLowerCase())
														) {
															return item;
														}
														return false;
													})
													.map((item, index) => (
														<React.Fragment key={index}>
															<tr style={{ cursor: 'pointer' }}>
																<td>{item.id}</td>
																<td onClick={() => toggleRow(index)}>
																	{item.date}
																</td>
																<td onClick={() => toggleRow(index)}>
																	{item.barcode}
																</td>
																<td onClick={() => toggleRow(index)}>
																	<span className={`badge ${item.condition === 'Good' ? 'bg-success' : 'bg-danger'}`}>
																		{item.condition}
																	</span>
																</td>
																<td onClick={() => toggleRow(index)}>
																	{item.category}
																</td>
																<td onClick={() => toggleRow(index)}>
																	{item.brand}
																</td>
																<td onClick={() => toggleRow(index)}>
																	{item.model}
																</td>
															</tr>
														</React.Fragment>
													))}
												{filteredOrders.length === 0 && (
													<tr>
														<td colSpan={7} className="text-center">
															No returns found. {searchDate && "Try a different date or clear the date filter."}
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
