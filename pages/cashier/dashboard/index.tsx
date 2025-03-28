import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import LineWithLabel1 from '../../../components/lineAcces';
import PieBasic from '../../../components/QRAnalatisk';
import LineWithLabe2 from '../../../components/SalesAnalatisk';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import Card, { CardBody, CardLabel, CardTitle } from '../../../components/bootstrap/Card';
import classNames from 'classnames';
import useDarkMode from '../../../hooks/useDarkMode';
import Icon from '../../../components/icon/Icon';
import { priceFormat } from '../../../helpers/helpers';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Income from '../../../components/charts/income';
import Income1 from '../../../components/charts/dailyIncome';
import Income2 from '../../../components/charts/yearlyIncome';

interface Orders {
	id: string;
	cid: string;
	casheir: string;
	date: string;
	amount: string;
	netValue: number;
	time: string;
	orders: { category: string; price: number | string; name: string; quentity: any }[];
}
const Index: NextPage = () => {
	const [orders, setOrders] = useState<Orders[]>([]);
	const { darkModeStatus } = useDarkMode();
	const today = new Date();
	const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
		.toString()
		.padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
	const [date, setDate] = useState<string>(formattedDate);

	const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newDate = e.target.value; // Format: YYYY-MM-DD
		setDate(newDate);
		console.log(newDate);
	};

	const formattedForDisplay = (date: string) => {
		const [year, month, day] = date.split('-');
		return `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
	};
	useEffect(() => {
		const fetchData = async () => {
			try {
				const dataCollection = collection(firestore, 'accessorybill');
				const querySnapshot = await getDocs(dataCollection);

				// Get today's date in the format "MM/DD/YYYY"
				const today = new Date();
				const formattedToday = `${
					today.getMonth() + 1
				}/${today.getDate()}/${today.getFullYear()}`;

				// Filter data to include only today's values
				const date1 = formattedForDisplay(date);

				console.log(formattedToday);
				console.log(date1);
				const firebaseData: any = querySnapshot.docs
					.map((doc) => {
						const data = doc.data();
						return {
							...data,
							cid: doc.id,
						};
					})
					.filter((order: any) => order.date === formattedForDisplay(date));

				setOrders(firebaseData);
				console.log(firebaseData);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};
		fetchData();
	}, [date]);
	const totalNetValue = orders.reduce((total, order) => total + order.netValue, 0);

	const calculateTotals = (data: any) => {
		let totalDiscount = 0;
		let totalAmount = 0;
		let totalNetValue = 0;
		let totalCost = 0;

		data.forEach((item: any) => {
			totalDiscount += item.totalDiscount || 0;
			totalAmount += item.amount || 0;
			totalNetValue += item.netValue || 0;

			if (item.orders && Array.isArray(item.orders)) {
				item.orders.forEach((order: any) => {
					totalCost += order.cost || 0;
				});
			}
		});

		return {
			totalDiscount,
			totalAmount,
			totalNetValue,
			totalCost,
		};
	};

	const totals = calculateTotals(orders);
	return (
		<PageWrapper>
			<Page>
				
				<FormGroup id='date' label='Select Date' className='col-md-4'>
					<Input
						type='date'
						placeholder='Enter Date'
						value={date}
						onChange={handleDateChange}
						validFeedback='Looks good!'
						max={new Date().toISOString().split('T')[0]}
					/>
				</FormGroup>
				<div className='row mt-4'>
					<div className='col-xl-4'>
						<Card
							stretch
							className={classNames('transition-base rounded-4  text-dark', {
								'bg-l75-success bg-l50-success-hover': !darkModeStatus,
								'bg-lo75-success-hover bg-lo50-success': darkModeStatus,
							})}>
							<CardTitle className='pt-4 ps-4'>
								<Icon
									icon='MonetizationOn'
									size='3x'
									color='warning'
									className='me-2'
								/>
								Total Income
							</CardTitle>
							<CardBody isScrollable className='table-responsive ms-2'>
								<CardLabel>
									<p className='fs-2'>
										{totals.totalNetValue}.00 LKR
										<Icon
											icon='TrendingUp'
											size='6x'
											color='success'
											className='me-2'
										/>
									</p>
								</CardLabel>
							</CardBody>
						</Card>
					</div>
					<div className='col-xl-4'>
						<Card
							stretch
							className={classNames('transition-base rounded-4  text-dark', {
								'bg-l75-secondary bg-l50-secondary-hover': !darkModeStatus,
								'bg-lo75-secondary-hover bg-lo50-secondary': darkModeStatus,
							})}>
							<CardTitle className='pt-4 ps-4'>
								<Icon icon='AttachMoney' size='3x' color='info' className='me-2' />
								Total Cost
							</CardTitle>
							<CardBody isScrollable className='table-responsive ms-2'>
								<CardLabel>
									<p className='fs-1'>
										{totals.totalCost}.00 LKR
										<Icon
											icon={'ArrowCircleDown'}
											size='4x'
											color={'secondary'}
											className='ms-5'
										/>
									</p>
								</CardLabel>
							</CardBody>
						</Card>
					</div>
					<div className='col-xl-4'>
						<Card
							stretch
							className={classNames('transition-base rounded-4  text-dark', {
								'bg-l75-primary bg-l50-primary-hover': !darkModeStatus,
								'bg-lo75-primary-hover bg-lo50-primary': darkModeStatus,
							})}>
							<CardTitle className='pt-4 ps-4'>
								<Icon icon='Money' size='3x' color='info' className='me-2' />
								Total Profit
							</CardTitle>
							<CardBody isScrollable className='table-responsive ms-2'>
								<CardLabel>
									<p className='fs-2'>
										{totals.totalNetValue - totals.totalCost}.00 LKR
										<Icon
											icon='ArrowCircleUp'
											size='4x'
											color='primary'
											className='ms-5'
										/>
									</p>
								</CardLabel>
							</CardBody>
						</Card>
					</div>
				</div>
				<div className='row'>
					<Income />
					<Income1 />
					<Income2 />
				
				</div>

				{/* <div>
					<h1>Totals</h1>
					<p>Total Discount: {totals.totalDiscount}</p>
					<p>Total Amount: {totals.totalAmount}</p>
					<p>Total Net Value: {totals.totalNetValue}</p>
					<p>Total Cost: {totals.totalCost}</p>
				</div> */}
			</Page>
		</PageWrapper>
	);
};
export default Index;
