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
	const [orders, setOrders] = useState<any[]>([]);
	const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
	const [user, setUser] = useState<User[]>([]);
	const [expandedRow, setExpandedRow] = useState(null);
	const [searchTerm, setSearchTerm] = useState(''); // State for search term
	const invoiceRef: any = useRef();
	const [chunks, setChunks] = useState<any[]>([]);
	const [orderedItems, setOrderedItems] = useState<any>();
	const toggleRow = (index: any) => {
		setExpandedRow(expandedRow === index ? null : index);
	};
	useEffect(() => {
		const fetchReturnData = async () => {
		  try {
			const { data, error } = await supabase
			  .from('return')
			  .select('*');
	  
			if (error) throw error;
	  
			const formattedData = data.map(item => ({
			  ...item,
			  cid: item.id, // Mimic Firestore's doc.id
			}));
	  
			setOrders(formattedData);
		  } catch (error:any) {
			console.error('Error fetching return data:', error.message);
		  }
		};
	  
		fetchReturnData();
	  }, []);
	  
	  // 2️⃣ Fetch "user" table data
	  useEffect(() => {
		const fetchUserData = async () => {
		  try {
			const { data, error } = await supabase
			  .from('user')
			  .select('*');
	  
			if (error) throw error;
	  
			const formattedData = data.map(item => ({
			  ...item,
			  cid: item.id,
			}));
	  
			setUser(formattedData);
		  } catch (error:any) {
			console.error('Error fetching user data:', error.message);
		  }
		};
	  
		fetchUserData();
	  }, []);

	useEffect(() => {
		const filterOrdersByDate = () => {
			return orders.filter((order) => {
				const orderDate = new Date(order.date);
				const orderYear = orderDate.getFullYear();
				const orderMonth = orderDate.toLocaleString('default', { month: 'short' });
				const formattedSearchDate = new Date(searchDate).toDateString();

				console.log(`Order Date: ${order.date}, Year: ${orderYear}, Month: ${orderMonth}`);
				console.log(
					`Search Year: ${searchyear}, Search Month: ${searchmonth}, Search Date: ${searchDate}`,
				);

				if (searchDate && new Date(order.date).toDateString() !== formattedSearchDate) {
					return false;
				}
				if (searchmonth && searchmonth !== orderMonth) {
					return false;
				}
				// if (searchyear && searchyear !== orderYear) {
				// 	return false;
				// }
				return true;
			});
		};

		setFilteredOrders(filterOrdersByDate());
	}, [orders, searchyear, searchmonth, searchDate]);

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
									<table className='table table-hover table-bordered border-primary'>
										<thead className={'table-dark border-primary'}>
											<tr>
												<th>Return Id </th>
												<th>Date</th>
												<th>Bill Number</th>
												<th>Item</th>
												<th>Return Type</th>
												<th>Condition</th>
												<th>Sold Price</th>
												<th>Supplier</th>
												<th>Date Sold</th>
												<th>Customet Name</th>
												<th>Contact Number</th>
												<td></td>
											</tr>
										</thead>
										<tbody>
											{filteredOrders

												.filter((val) => {
													if (searchTerm === '') {
														return val;
													} else if (
														val.id.toString().includes(searchTerm)
													) {
														return val;
													}
												})
												.sort((a: any, b: any) => b.id - a.id)
												.map((order: any, index) => (
													<React.Fragment key={index}>
														<tr style={{ cursor: 'pointer' }}>
															<td>{order.cid}</td>
															<td onClick={() => toggleRow(index)}>
																{order.date}
															</td>
															<td onClick={() => toggleRow(index)}>
																{order.Bill_number}
															</td>
															<td onClick={() => toggleRow(index)}>
																{order.item}
															</td>
															<td onClick={() => toggleRow(index)}>
																{order.returnType}
															</td>
															<td onClick={() => toggleRow(index)}>
																{order.condition}
															</td>
															<td onClick={() => toggleRow(index)}>
																{order.sold_price}
															</td>
															<td>{order.Supplier}</td>
															<td>{order.date_sold}</td>
															<td>{order.name}</td>
															<td>{order.contact}</td>
														</tr>
													</React.Fragment>
												))}
										</tbody>
									</table>
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
