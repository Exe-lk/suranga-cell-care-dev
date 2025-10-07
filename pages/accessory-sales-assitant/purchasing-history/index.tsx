import React, { useEffect, useRef, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
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
import Swal from 'sweetalert2';
import { supabase } from '../../../lib/supabase';

interface Orders {
	id: string;
	cid: string;
	casheir: string;
	date: string;
	amount: string;
	time: string;
	name?: string;
	contact?: string;
	netValue?: number;
	totalDiscount?: number;
	orders: { category: string; price: number | string; name: string; quentity: any }[];
}
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

const Index: React.FC = () => {
	const [searchyear, setSearchyear] = useState<number>(new Date().getFullYear());
	const [searchmonth, setSearchmonth] = useState<string>('');
	const [searchDate, setSearchDate] = useState<string>('');
	const [orders, setOrders] = useState<Orders[]>([]);
	const [filteredOrders, setFilteredOrders] = useState<Orders[]>([]);
	const [user, setUser] = useState<User[]>([]);
	const [expandedRow, setExpandedRow] = useState(null);
	const [searchTerm, setSearchTerm] = useState(''); // State for search term
	const invoiceRef: any = useRef();
	const [chunks, setChunks] = useState<any[]>([]);
	const [orderedItems, setOrderedItems] = useState<any>();
	const toggleRow = (index: any) => {
		setExpandedRow(expandedRow === index ? null : index);
	};

	// Helper function to convert month name to number
	const getMonthNumber = (monthName: string): number => {
		const months = {
			'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
			'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
		};
		return months[monthName as keyof typeof months] || 0;
	};
	useEffect(() => {
		const fetchData = async () => {
			try {
				let query = supabase.from('accessorybill').select('*');

				// If a specific date is selected, filter by that date
				if (searchDate) {
					query = query.eq('date', searchDate);
				}
				// If only month is selected (without specific date), filter by year-month
				else if (searchmonth && searchyear) {
					const startOfMonth = new Date(searchyear, getMonthNumber(searchmonth), 1).toISOString().split('T')[0];
					const endOfMonth = new Date(searchyear, getMonthNumber(searchmonth) + 1, 0).toISOString().split('T')[0];
					query = query.gte('date', startOfMonth).lte('date', endOfMonth);
				}
				// If only year is selected, filter by year
				else if (searchyear && searchyear !== new Date().getFullYear()) {
					const startOfYear = `${searchyear}-01-01`;
					const endOfYear = `${searchyear}-12-31`;
					query = query.gte('date', startOfYear).lte('date', endOfYear);
				}

				const { data, error }: any = await query.order('id', { ascending: false });

				if (error) throw error;

				setOrders(data);
				setFilteredOrders(data); // Set filtered orders directly since filtering is done at DB level
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};

		fetchData();
	}, [searchDate, searchmonth, searchyear]); // Re-fetch when date filters change

		useEffect(() => {
			const fetchData = async () => {
				try {
					const { data, error }: any = await supabase.from('user').select('*');
	
					if (error) throw error;
	
					setUser(data);
					// console.log(data);
				} catch (error) {
					console.error('Error fetching data:', error);
				}
			};
	
			fetchData();
		}, []);

	// Since we're now filtering at the database level, we don't need client-side filtering
	// The filteredOrders will be set directly from the database query results

	const getCashierName = (email: string) => {
		const user1 = user.find((user: { email: string }) => user.email === email);
		return user1 ? user1.name : 'Unknown';
	};
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

			orders.forEach((order) => {
				// Add the main order row
				csvRows.push([
					order.date,
					order.time,
					order.time,
					getCashierName(order.casheir),
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
	const chunkItems = (array: any[], chunkSize: number) => {
		const chunks = [];
		for (let i = 0; i < array.length; i += chunkSize) {
			chunks.push(array.slice(i, i + chunkSize));
		}

		return chunks;
	};

	const handleprint = async (order: any) => {
		const chunks = chunkItems(order.orders, 5);
		await setChunks(chunks);
		await setOrderedItems(order);
		console.log(order);
		const printContent: any = invoiceRef.current.innerHTML;

		// Temporarily hide other content on the page
		const originalContent = document.body.innerHTML;
		document.body.innerHTML = printContent;

		// Trigger the print dialog
		window.print();

		// Restore the original content after printing
		document.body.innerHTML = originalContent;

		Swal.fire({
			title: 'Success',
			text: 'Bill has been added successfully.',
			icon: 'success',
			showConfirmButton: false,
			timer: 1000,
		});
		window.location.reload();
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
							placeholder='Search...'
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
										Select date :
										<input
											type='date'
											onChange={(e: any) => setSearchDate(e.target.value)}
											value={searchDate}
											className='px-3 py-2 ms-4 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
										/>
									</div>
									<div className='flex-grow-1 text-center text-primary'>
										Purchasing History
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
									<table className='table table-hover table-bordered border-primary'>
										<thead className={'table-dark border-primary'}>
											<tr>
												<th>Date</th>
												<th>Time</th>

												<th>Cashier</th>
												<th>Customer </th>
												<th>Contact Number</th>
												<th>Bill No</th>
												<th>Discount</th>
												<th>Sub Total (LKR)</th>
												<td></td>
											</tr>
										</thead>
										<tbody>
											{filteredOrders
												.filter((val) => {
													if (searchTerm === '') {
														return val;
													}
													
													const searchLower = searchTerm.toLowerCase();
													
													// Search in bill ID
													if (val.id.toString().toLowerCase().includes(searchLower)) {
														return true;
													}
													
													// Search in customer name
													if (val.name && val.name.toString().toLowerCase().includes(searchLower)) {
														return true;
													}
													
													// Search in contact number
													if (val.contact && val.contact.toString().toLowerCase().includes(searchLower)) {
														return true;
													}
													
													// Search in cashier name
													const cashierName = getCashierName(val.casheir);
													if (cashierName && cashierName.toLowerCase().includes(searchLower)) {
														return true;
													}
													
													// Search in order items
													if (val.orders && val.orders.some((data: any) =>
														[
															data.category,
															data.model,
															data.brand,
														].some((field) =>
															field && 
															field.toString().toLowerCase().includes(searchLower),
														),
													)) {
														return true;
													}
													
													return false;
												})
												.sort((a: any, b: any) => b.id - a.id)
												.map((order: any, index) => (
													<React.Fragment key={index}>
														<tr style={{ cursor: 'pointer' }}>
															<td onClick={() => toggleRow(index)}>
																{order.date}
															</td>
															<td onClick={() => toggleRow(index)}>
																{order.time}
															</td>
															<td onClick={() => toggleRow(index)}>
																{getCashierName(order.casheir)}
															</td>
															<td onClick={() => toggleRow(index)}>
																{order.name}
															</td>
															<td onClick={() => toggleRow(index)}>
																{order.contact}
															</td>
															<td onClick={() => toggleRow(index)}>
																{order.id}
															</td>

															<td style={{ textAlign: 'right' }}>
																{new Intl.NumberFormat(
																	'en-US',
																).format(
																	Number(order.totalDiscount),
																)}
															</td>
															<td style={{ textAlign: 'right' }}>
																{new Intl.NumberFormat(
																	'en-US',
																).format(Number(order.netValue))}
															</td>
															<td>
																<Button
																	icon='Print'
																	color='success'
																	onClick={() => {
																		handleprint(order);
																	}}>
																	Print
																</Button>
															</td>
														</tr>
														{expandedRow === index && (
															<tr>
																<td colSpan={6}>
																	<table className='table table-hover table-bordered border-warning'>
																		<thead
																			className={
																				'table-dark border-warning'
																			}>
																			<tr>
																				<th>Item</th>
																				<th>Unit Price</th>
																				<th>Discount</th>
																				<th>Quantity</th>

																				<th>Amount</th>
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

																						<td
																							style={{
																								textAlign:
																									'right',
																							}}>
																							{new Intl.NumberFormat(
																								'en-US',
																							).format(
																								Number(
																									data.sellingPrice,
																								),
																							)}
																						</td>
																						<td
																							style={{
																								textAlign:
																									'right',
																							}}>
																							{new Intl.NumberFormat(
																								'en-US',
																							).format(
																								Number(
																									data.discount /
																										data.quantity,
																								),
																							)}
																						</td>
																						<td>
																							{
																								data.quantity
																							}
																						</td>

																						<td
																							style={{
																								textAlign:
																									'right',
																							}}>
																							{new Intl.NumberFormat(
																								'en-US',
																							).format(
																								Number(
																									data.sellingPrice *
																										data.quantity -
																										data.discount,
																								),
																							)}
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
								</CardBody>
							</Card>
						</div>
					</div>

					<div>
						<Card stretch className='mt-4' style={{ height: '80vh' }} hidden>
							<CardBody isScrollable>
								<div
									className='ms-4 ps-3'
									ref={invoiceRef}
									id='invoice'
									style={{
										display: 'flex',
										color: 'black',
									}}>
									<div>
										{chunks.map((chunk, chunkIndex) => (
											<div
												key={chunkIndex}
												style={{
													width: '130mm',
													height: '130mm',
													background: '#fff',
													border: '1px dashed #ccc',
													padding: '20px',
													fontFamily: 'Arial, sans-serif',
													fontSize: '12px',
													position: 'relative', // Enables absolute positioning inside
												}}>
												{/* Header */}
												<div className='text-left '>
													<h1
														style={{
															fontSize: '29px',
															fontFamily: 'initial',
															color: 'black',
														}}>
														Suranga Cell Care
													</h1>
													<p
														style={{
															marginBottom: '2px',
															color: 'black',
														}}>
														No. 524/1A, Kandy Road, Kadawatha.
													</p>
													<p
														style={{
															marginBottom: '0',
															color: 'black',
														}}>
														Tel: +94 11 292 60 30 | Mobile: +94 76 401
														77 28
													</p>
												</div>
												{/* <hr style={{ margin: '0 0 5px 0 ' ,color:"black"}} /> */}
												<span
													style={{
														marginBottom: '1px',
														display: 'block',
														borderTop: '1px solid black',
														color: 'black',
													}}></span>
												{/* Invoice Details */}
												<table
													className='table table-borderless'
													style={{
														marginBottom: '5px',
														lineHeight: '1.2',
													}}>
													<tbody style={{ color: 'black' }}>
														<tr>
															<td
																style={{
																	width: '50%',
																	color: 'black',
																	padding: '2px 0 0 ',
																}}>
																Invoice No : {orderedItems?.id}
															</td>
															<td
																style={{
																	color: 'black',
																	padding: '2px 0',
																}}>
																Invoice Date : {orderedItems?.date}
															</td>
														</tr>
														<tr>
															<td
																style={{
																	color: 'black',
																	padding: '2px 0',
																}}>
																Name:{orderedItems?.name || ' --'}
															</td>
															<td
																style={{
																	color: 'black',
																	padding: '2px 0',
																}}>
																Invoiced Time : {orderedItems?.time}
															</td>
														</tr>
													</tbody>
												</table>
												<span
													style={{
														marginBottom: '3px',
														display: 'block',
														borderTop: '1px solid black',
														color: 'black',
													}}></span>
												<p
													style={{
														marginBottom: '0',
														lineHeight: '1.2',
														fontSize: '12px',
														color: 'black',
													}}>
													Description
													&nbsp;&emsp;&nbsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&emsp;&emsp;&emsp;&emsp;&emsp;
													Price &nbsp;&emsp;&emsp;&emsp; Qty
													&nbsp;&emsp;&emsp; Amount
												</p>
												<span
													style={{
														marginTop: '3px',
														display: 'block',
														borderTop: '1px solid black',
														color: 'black',
													}}></span>
												{chunk.map(
													(
														{
															category,
															model,
															brand,
															quantity,
															sellingPrice,
															warranty,
															storage,
															imi,
														}: any,
														index: number,
													) => (
														<table
															key={index}
															style={{
																color: 'black',
																width: '110mm',
																borderCollapse: 'collapse',
																fontSize: '12px',
															}}>
															<tbody>
																<tr>
																	<td
																		style={{
																			color: 'black',
																			width: '52%',
																			padding: '5px',
																		}}>
																		{index + 1}. {brand} {model}{' '}
																		{category} {storage} {imi}
																		<label
																			style={{
																				fontSize: '10px',
																			}}>
																			({warranty})
																		</label>
																	</td>
																	<td
																		style={{
																			color: 'black',
																			width: '20%',
																			textAlign: 'right',
																			padding: '5px',
																			paddingRight: '20px',
																		}}>
																		{sellingPrice.toFixed(2)}
																	</td>
																	<td
																		style={{
																			color: 'black',
																			width: '8%',
																			textAlign: 'right',
																			padding: '5px',
																		}}>
																		{quantity}
																	</td>
																	<td
																		style={{
																			color: 'black',
																			width: '20%',
																			textAlign: 'right',
																			padding: '5px',
																		}}>
																		{(
																			sellingPrice * quantity
																		).toFixed(2)}
																	</td>
																</tr>
															</tbody>
														</table>
													),
												)}
												<div
													style={{
														position: 'absolute',
														top: '100mm',
														left: '0',
														width: '100%',
														padding: '0 20px',
													}}>
													<span
														className='position-absolute  start-55'
														style={{
															marginTop: '0px',
															display: 'block',
															width: 190,
															borderTop: '1px solid black',
															color: 'black',
														}}></span>
													<div
														className='position-relative me-4'
														style={{ color: 'black' }}>
														<div className='position-absolute start-60'>
															Total
														</div>
														<div className='position-absolute top-0 end-5'>
															{orderedItems?.amout}.00
														</div>
													</div>
													<br />
													<span
														className='position-absolute  start-55'
														style={{
															marginTop: '0px',
															display: 'block',
															width: 190,
															borderTop: '1px solid black',
															color: 'black',
														}}></span>
													<div
														className='position-relative me-4'
														style={{ color: 'black' }}>
														<div className='position-absolute top-0 start-60'>
															Discount
														</div>
														<div className='position-absolute top-0 end-5'>
															{orderedItems?.totalDiscount.toFixed(2)}
														</div>
													</div>
													<br />
													<span
														className='position-absolute  start-55'
														style={{
															marginTop: '0px',
															display: 'block',
															width: 190,
															borderTop: '1px solid black',
															color: 'black',
														}}></span>
													<div
														className='position-relative me-4'
														style={{ color: 'black' }}>
														<div
															className='position-absolute top-0 start-60 fw-bold'
															style={{ fontSize: '14px' }}>
															SUB TOTAL
														</div>
														<div
															className='position-absolute top-0 end-5 fw-bold'
															style={{ fontSize: '14px' }}>
															{orderedItems?.netValue.toFixed(2)}
														</div>
													</div>
													<br />
													<span
														className='position-absolute  start-55'
														style={{
															marginTop: '0px',
															display: 'block',
															width: 190,
															borderTop: '1px solid black',
															color: 'black',
														}}></span>
													<div
														style={{
															textAlign: 'center',
															fontSize: '12px',
															color: 'black',
															marginTop: '3px',
														}}>
														...........................Thank You ...
														Come Again...........................
													</div>
													<div
														style={{
															textAlign: 'right',
															fontSize: '10px',
															color: 'black',
														}}>
														System by EXE.LK +94 70 332 9900
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							</CardBody>
						</Card>
					</div>
				</Page>
			</PageWrapper>
		</>
	);
};

export default Index;
