import React, { useEffect, useRef, useState } from 'react';
import type { NextPage } from 'next';
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
import Swal from 'sweetalert2';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import { supabase } from '../../../lib/supabase';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import Spinner from '../../../components/bootstrap/Spinner';

interface AccessoryBill {
	id: number;
	name: string;
	contact: string;
	date: string;
	time: string;
	amount: number;
	netValue: number;
	type: string;
	orders: any[];
	discount?: number;
	totalDiscount?: number;
}

const Index: NextPage = () => {
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(PER_COUNT['10']);
	const { darkModeStatus } = useDarkMode();
	const [mobileNumber, setMobileNumber] = useState('');
	const [searchResults, setSearchResults] = useState<AccessoryBill[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	// Normalize contact number for consistent comparison
	const normalizeContact = (contact: any): string => {
		if (!contact) return '';
		let contactStr = String(contact);
		if (contactStr.startsWith('0')) {
			contactStr = contactStr.substring(1);
		}
		contactStr = contactStr.replace(/[^0-9]/g, '');
		return contactStr;
	};

	const handleSearch = async () => {
		if (!mobileNumber || mobileNumber.trim() === '') {
			Swal.fire('Error', 'Please enter a mobile number', 'error');
			return;
		}

		// Validate contact number format
		const allowedPrefixes = ['70', '71', '72', '74', '75', '76', '77', '78', '79'];
		const contactStr = String(mobileNumber);
		const isValidPrefix = allowedPrefixes.some((prefix) => contactStr.startsWith(prefix));

		if (contactStr.length < 3) {
			Swal.fire('Error', 'Please enter at least 3 digits', 'error');
			return;
		}

		if (contactStr.length >= 3 && !isValidPrefix) {
			Swal.fire(
				'Invalid Contact Number',
				'Contact number must start with: 070, 071, 072, 074, 075, 076, 077, 078, or 079',
				'error',
			);
			return;
		}

		setIsLoading(true);
		setHasSearched(true);

		try {
			const normalizedInput = normalizeContact(mobileNumber);
			console.log('Searching for contact:', normalizedInput);

			// Search in accessorybill table
			const { data, error } = await supabase
				.from('accessorybill')
				.select('*')
				.order('id', { ascending: false });

			if (error) throw error;

			// Filter results by contact number (handle various formats)
			const filteredResults = data?.filter((bill: any) => {
				const billContact = normalizeContact(bill.contact);
				return (
					billContact === normalizedInput ||
					billContact.includes(normalizedInput) ||
					billContact.endsWith(normalizedInput)
				);
			});

			if (filteredResults && filteredResults.length > 0) {
				setSearchResults(filteredResults);
				Swal.fire({
					title: 'Success',
					text: `Found ${filteredResults.length} record(s)`,
					icon: 'success',
					timer: 1500,
					showConfirmButton: false,
				});
			} else {
				setSearchResults([]);
				Swal.fire('No Results', 'No bills found for this mobile number', 'info');
			}
		} catch (error: any) {
			console.error('Error searching bills:', error);
			Swal.fire('Error', 'Failed to search bills. Please try again.', 'error');
			setSearchResults([]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClear = () => {
		setMobileNumber('');
		setSearchResults([]);
		setHasSearched(false);
		setCurrentPage(1);
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	const handleViewDetails = (bill: AccessoryBill) => {
		const ordersList = bill.orders
			?.map(
				(order: any, index: number) =>
					`${index + 1}. ${order.category || ''} ${order.model || ''} ${order.brand || ''} - Qty: ${order.quantity || 0} - Price: LKR ${(order.sellingPrice * order.quantity).toFixed(2)}-Warranty: ${order.warranty || 'N/A'}`,
			)
			.join('<br>');

		Swal.fire({
			title: `Bill #${bill.id}`,
			html: `
				<div style="text-align: left;">
					<p><strong>Customer Name:</strong> ${bill.name || 'N/A'}</p>
					<p><strong>Contact:</strong> ${bill.contact}</p>
					<p><strong>Date:</strong> ${bill.date}</p>
					<p><strong>Time:</strong> ${bill.time}</p>
					<p><strong>Payment Type:</strong> ${bill.type || 'N/A'}</p>
					<hr>
					<p><strong>Items:</strong></p>
					<div style="max-height: 200px; overflow-y: auto; font-size: 0.9em;">
						${ordersList || 'No items'}
					</div>
					<hr>
					<p><strong>Total Amount:</strong> LKR ${(bill.amount || 0).toFixed(2)}</p>
					<p><strong>Discount:</strong> LKR ${(bill.totalDiscount || 0).toFixed(2)}</p>
					<p><strong>Net Value:</strong> LKR ${(bill.netValue || 0).toFixed(2)}</p>
				</div>
			`,
			width: 600,
			confirmButtonText: 'Close',
		});
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	};

	return (
		<PageWrapper>
			<SubHeader>
				<SubHeaderLeft>
					<span className='h4 mb-0 fw-bold'>Customer Bill Search</span>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button
						icon='Refresh'
						color='info'
						isLight
						onClick={handleClear}>
						Clear Search
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page>
				<div className='row h-100'>
					<div className='col-12'>
						{/* Search Card */}
						<Card className='mb-4'>
							<CardBody>
								<div className='row g-3 align-items-end'>
									<div className='col-md-8'>
										<FormGroup
											id='mobileNumber'
											label='Customer Mobile Number'
											className='mb-0'>
											<Input
												ref={inputRef}
												type='text'
												placeholder='Enter mobile number (without leading 0)...'
												value={mobileNumber}
												onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
													const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
													setMobileNumber(value);
												}}
												onKeyPress={handleKeyPress}
												size='lg'
											/>
											<small className='text-muted'>
												Enter mobile number without leading zero (e.g., 712345678)
											</small>
										</FormGroup>
									</div>
									<div className='col-md-4'>
										<Button
											color='primary'
											size='lg'
											className='w-100'
											icon='Search'
											onClick={handleSearch}
											isDisable={isLoading}>
											{isLoading ? (
												<>
													<Spinner isSmall inButton />
													Searching...
												</>
											) : (
												'Search'
											)}
										</Button>
									</div>
								</div>
							</CardBody>
						</Card>

						{/* Results Card */}
						{hasSearched && (
							<Card stretch>
								<CardTitle className='d-flex justify-content-between align-items-center m-4'>
									<div className='flex-grow-1 text-center text-primary'>
										Search Results
										{searchResults.length > 0 && (
											<span className='badge bg-primary ms-2'>
												{searchResults.length} Bill(s) Found
											</span>
										)}
									</div>
								</CardTitle>
								<CardBody isScrollable className='table-responsive'>
									{isLoading ? (
										<div className='text-center py-5'>
											<Spinner size='3rem' />
											<p className='mt-3'>Searching bills...</p>
										</div>
									) : searchResults.length > 0 ? (
										<>
											<table className='table table-bordered border-primary table-hover'>
												<thead className='table-dark border-primary'>
													<tr>
														<th>Bill ID</th>
														<th>Customer Name</th>
														<th>Contact</th>
														<th>Date</th>
														<th>Time</th>
														<th>Payment Type</th>
														<th className='text-end'>Net Value (LKR)</th>
														<th className='text-center'>Actions</th>
													</tr>
												</thead>
												<tbody>
													{dataPagination(searchResults, currentPage, perPage).map(
														(bill: AccessoryBill, index: number) => (
															<tr key={index}>
																<td>{bill.id}</td>
																<td>{bill.name || 'N/A'}</td>
																<td>0{bill.contact}</td>
																<td>{bill.date}</td>
																<td>{bill.time}</td>
																<td>
																	<span
																		className={`badge bg-${bill.type === 'cash' ? 'success' : 'info'}`}>
																		{bill.type || 'N/A'}
																	</span>
																</td>
																<td className='text-end'>
																	{(bill.netValue || 0).toFixed(2)}
																</td>
																<td className='text-center'>
																	<Button
																		icon='Visibility'
																		color='primary'
																		size='sm'
																		onClick={() => handleViewDetails(bill)}>
																		View Details
																	</Button>
																</td>
															</tr>
														),
													)}
												</tbody>
											</table>
											<PaginationButtons
												data={searchResults}
												label='bills'
												setCurrentPage={setCurrentPage}
												currentPage={currentPage}
												perPage={perPage}
												setPerPage={setPerPage}
											/>
										</>
									) : (
										<div className='text-center py-5'>
											<Icon icon='SearchOff' size='5x' color='secondary' />
											<h4 className='mt-3 text-muted'>No bills found</h4>
											<p className='text-muted'>
												No bills found for mobile number: 0{mobileNumber}
											</p>
										</div>
									)}
								</CardBody>
							</Card>
						)}

						{/* Initial State */}
						{!hasSearched && (
							<Card stretch>
								<CardBody>
									<div className='text-center py-5'>
										<Icon icon='PersonSearch' size='5x' color='primary' />
										<h4 className='mt-4'>Search Customer Bills</h4>
										<p className='text-muted'>
											Enter a customer mobile number above to search for their bills
										</p>
									</div>
								</CardBody>
							</Card>
						)}
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default Index;

