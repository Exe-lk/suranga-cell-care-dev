import React, { useEffect, useRef, useState } from 'react';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import Card, { CardBody, CardTitle } from '../../../components/bootstrap/Card';
import { number } from 'prop-types';
import Dropdown, {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from '../../../components/bootstrap/Dropdown';
import Button from '../../../components/bootstrap/Button';
import SubHeader, {
	SubHeaderLeft,
	SubHeaderRight,
	SubheaderSeparator,
} from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import Accessory from '../../../components/accessory';
import { useGetAccessoryBillsQuery } from '../../../redux/slices/accessoryBillApiSlice';

interface Orders {
	id: string;
	cid: string;
	casheir: string;
	date: string;
	amount: string;
	time: string;
	orders: { category: string; price: number | string; name: string; quentity: any }[];
}

const Index: React.FC = () => {
	const [searchyear, setSearchyear] = useState<number>(new Date().getFullYear());
	const [searchmonth, setSearchmonth] = useState<string>('');
	const [searchDate, setSearchDate] = useState<string>('');
	const [data, setData] = useState<any[]>([]);
	const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
	const [expandedRow, setExpandedRow] = useState(null);
	const [formStatus, setFormStatus] = useState<boolean>(false);
	const [searchTerm, setSearchTerm] = useState(''); // State for search term
	
	const { data: accessoryBills, isLoading, isError, refetch } = useGetAccessoryBillsQuery(undefined);
	
	const toggleRow = (index: any) => {
		setExpandedRow(expandedRow === index ? null : index);
	};

	const buttonRef = useRef<any>(null);

	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			// Check if the "F" key is pressed
			if (event.key === 'F' || event.key === 'f') {
				reloadPage();
			}
		};

		window.addEventListener('keydown', handleKeyPress);
	
		// Cleanup the event listener on component unmount
		return () => {
			window.removeEventListener('keydown', handleKeyPress);
		};
	}, []);

	useEffect(() => {
		const filterOrdersByDate = () => {
			if (!accessoryBills) return [];
			
			console.log('Filtering bills with date:', searchDate, 'month:', searchmonth);
			
			// If no filters are applied, return all bills
			if (!searchDate && !searchmonth) {
				return accessoryBills;
			}
			
			return accessoryBills.filter((order: any) => {
				try {
					const orderDate = new Date(order.date);
					const orderMonth = orderDate.toLocaleString('default', { month: 'short' });
					
					if (searchDate) {
						const formattedSearchDate = new Date(searchDate).toDateString();
						const formattedOrderDate = new Date(order.date).toDateString();
						
						console.log(`Comparing dates: ${formattedOrderDate} with ${formattedSearchDate}`);
						
						if (formattedOrderDate !== formattedSearchDate) {
							return false;
						}
					}
					
					if (searchmonth && orderMonth !== searchmonth) {
						return false;
					}
					
					return true;
				} catch (error) {
					console.error('Error filtering order:', order, error);
					return true; // Include records that cause errors in filtering
				}
			});
		};

		setFilteredOrders(filterOrdersByDate());
	}, [accessoryBills, searchyear, searchmonth, searchDate]);

	// Add more explicit debugging for accessoryBills
	useEffect(() => {
		console.log('Accessory bills from Supabase:', accessoryBills);
		
		if (!accessoryBills || accessoryBills.length === 0) {
			console.log('No accessory bills found in the response');
		} else {
			console.log('First accessory bill:', accessoryBills[0]);
		}
	}, [accessoryBills]);

	const handleExport = (format: any) => {
		if (format === 'csv') {
			// Flatten data
			const csvRows = [
				[
					'Date',
					'Start Time',
					'End Time',
					'Cashier',
					'Bill No',
					'Sub Total',
					'Item Name',
					'Unit Price',
					'Discount',
					'Quantity',
					'Total Price',
				], // Header row
			];

			accessoryBills.forEach((order: any) => {
				// Add the main order row
				csvRows.push([
					order.date,
					order.time,
					order.time,
					order.casheir,
					order.id,
					order.amount,
					'', // Empty columns for item details
					'',
					'',
					'',
					'',
				]);

				// Add rows for each item
				order.orders.forEach((item: any) => {
					csvRows.push([
						'', // Empty columns for the order details
						'',
						'',
						'',
						'',
						'',
						item.name,
						item.price,
						item.discount,
						item.quantity,
						item.price * item.quantity,
					]);
				});
			});

			// Convert to CSV string
			const csvContent =
				'data:text/csv;charset=utf-8,' +
				csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

			// Download CSV
			const encodedUri = encodeURI(csvContent);
			const link = document.createElement('a');
			link.setAttribute('href', encodedUri);
			link.setAttribute('download', 'purchasing_history.csv');
			document.body.appendChild(link); // Required for Firefox
			link.click();
			document.body.removeChild(link);
		}
	};
	
	const reloadPage = () => {
		refetch();
	};
	
	return (
		<>
			<PageWrapper>
				{formStatus ? (
					<Accessory setIsOpen={setFormStatus} isOpen={formStatus} data={data} />
				) : (
					<>
						<SubHeader>
							<SubHeaderLeft>
								{/* Search input */}
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
								/>
							</SubHeaderLeft>
							<SubHeaderRight>
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
							</SubHeaderRight>
						</SubHeader>
						<Page>
							<div className='row h-100'>
								<div className='col-12'>
									<Card stretch>
										<CardTitle className='d-flex justify-content-between align-items-center m-4'>
											<div className='mt-2 mb-4'>
												Select date :
												<input
													type='date'
													onChange={(e: any) =>
														setSearchDate(e.target.value)
													}
													value={searchDate}
													className='px-3 py-2 ms-4 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
												/>
											</div>
											<div className='flex-grow-1 text-center text-primary'>
												Orders
											</div>
											<Button icon='Search' onClick={reloadPage} ref={buttonRef} color='info'>
											Find
										</Button>
										</CardTitle>
										<CardBody isScrollable className='table-responsive'>
											{isLoading && (
												<div className="d-flex justify-content-center my-3">
													<div className="spinner-border text-primary" role="status">
														<span className="visually-hidden">Loading...</span>
													</div>
												</div>
											)}
											
											{isError && (
												<div className="alert alert-danger" role="alert">
													Error loading accessory bills. Please try again.
												</div>
											)}
											
											{!isLoading && !isError && (
												<table className='table table-hover table-bordered border-primary'>
													<thead className={'table-dark border-primary'}>
														<tr>
															<th>Date</th>
															<th>Time</th>
															<th>Bill No</th>
															<th>Customer Name</th>
															<th>Contact</th>
															<th>Sub Total (LKR)</th>
															<th></th>
														</tr>
													</thead>
													<tbody>
														{filteredOrders
															?.filter((val) => {
																if (searchTerm === '') {
																	return true; // Return all records if no search term
																} else if (val.id && val.id.toString().includes(searchTerm)) {
																	return true; // Return matching records
																}
																return false; 
															})
															.sort((a: any, b: any) => {
																// Make sorting safer by checking if id exists and is a number
																const idA = typeof a.id === 'number' ? a.id : parseInt(a.id);
																const idB = typeof b.id === 'number' ? b.id : parseInt(b.id);
																return isNaN(idB) || isNaN(idA) ? 0 : idB - idA; // Fallback to 0 if NaN
															})
															.map((order, index) => (
																<React.Fragment key={index}>
																	<tr style={{ cursor: 'pointer' }}>
																		<td
																			onClick={() =>
																				toggleRow(index)
																			}>
																			{order.date}
																		</td>
																		<td
																			onClick={() =>
																				toggleRow(index)
																			}>
																			{order.time}
																		</td>
																		<td
																			onClick={() =>
																				toggleRow(index)
																			}>
																			{order.id}
																		</td>
																		<td
																			onClick={() =>
																				toggleRow(index)
																			}>
																			{order.name}
																		</td>
																		<td
																			onClick={() =>
																				toggleRow(index)
																			}>
																			{order.contact}
																		</td>
																		<td
																			onClick={() =>
																				toggleRow(index)
																			}>
																			{order.amount - (order.totalDiscount || 0)}.00
																		</td>
																		<td>
																			<Button
																				icon='Print'
																				color='success'
																				onClick={() => {
																					setFormStatus(true),
																						setData(order);
																				}}>
																				Print
																			</Button>
																		</td>
																	</tr>
																	{expandedRow === index && (
																		<tr>
																			<td colSpan={7}>
																				<table className='table table-hover table-bordered border-warning'>
																					<thead
																						className={
																							'table-dark border-warning'
																						}>
																						<tr>
																							<th>
																								Item
																							</th>
																							<th>
																								Unit
																								Price
																							</th>

																							<th>
																								Quantity
																							</th>
																							<th>
																								Total
																								Price
																							</th>
																						</tr>
																					</thead>
																					<tbody>
																						{order.orders.map(
																							(
																								data: any,
																								dataIndex: any,
																							) => (
																								<tr
																									key={
																										dataIndex
																									}>
																									<td>
																										{
																											data.category
																										}{' '}
																										{
																											data.model
																										}{' '}
																										{
																											data.brand
																										}
																									</td>
																									<td>
																										{
																											data.sellingPrice
																										}
																									</td>

																									<td>
																										{
																											data.quantity
																										}
																									</td>
																									<td>
																										{data.sellingPrice *
																											data.quantity}
																										.00
																									</td>
																								</tr>
																							),
																						)}
																					</tbody>
																				</table>
																			</td>
																		</tr>
																	)}
																</React.Fragment>
															))}
													</tbody>
												</table>
											)}
										</CardBody>
									</Card>
								</div>
							</div>
						</Page>
					</>
				)}
			</PageWrapper>
		</>
	);
};

export default Index;
