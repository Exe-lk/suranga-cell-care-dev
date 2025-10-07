import React, { useEffect, useState } from 'react';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../../components/bootstrap/Card';
import Chart, { IChartOptions } from '../../components/extras/Chart';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import { supabase } from '../../lib/supabase';

const ColumnWithDataLabels = () => {
	const [topItems, setTopItems] = useState<string[]>([]);
	const [topqty, setQty] = useState<number[]>([]);
	const [chartOptions, setChartOptions] = useState<IChartOptions>({
		series: [{ name: 'Quantity Sold', data: [] }],
		options: {
			chart: { height: 350, type: 'bar' },
			plotOptions: {
				bar: {
					horizontal: true,
				},
			},
			dataLabels: {
				enabled: true,
				formatter: (val) => val.toString(),
				offsetY: -20,
				style: { fontSize: '12px', colors: ['#304758'] },
			},
			xaxis: { categories: [], position: 'top' },
			yaxis: { labels: { formatter: (val) => val.toString() } },
			title: { text: 'Top 10 Selling Category ', align: 'center', style: { color: '#444' } },
		},
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data: querySnapshot, error } = await supabase
				.from('accessorybill')
				.select('*');
			
				const firebaseData = querySnapshot?.map((doc) => ({
					...doc,
					cid: doc.id,
				}));

				// Extract orders and aggregate quantity for each product
				const productSalesMap = firebaseData?.flatMap((bill:any) => bill.orders).reduce(
					(acc, order) => {
						if (acc[order.cid]) {
							acc[order.cid].quantity += Number(order.quantity);
						} else {
							acc[order.cid] = {
								quantity: Number(order.quantity),
								brand: order.brand,
								category: order.category,
								model: order.model,
							};
						}
						return acc;
					},
					{} as Record<string, any>,
				);

				// Sort and get top 10 selling products
				const topSellingOrders = Object.values(productSalesMap)
					.sort((a:any, b:any) => a.brand - b.brand)
					.slice(0, 10);

				// Extract names and quantities
				const items = topSellingOrders.map((item:any) => ` ${item.brand}`);
				const quantities = topSellingOrders.map((item:any) => item.quantity);

				setTopItems(items);
				setQty(quantities);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};

		fetchData();
	}, []);

	// Update chart options when data changes
	useEffect(() => {
		setChartOptions((prev) => ({
			...prev,
			series: [{ name: 'Quantity Sold', data: topqty }],
			options: { ...prev.options, xaxis: { ...prev.options.xaxis, categories: topItems } },
		}));
	}, [topItems, topqty]);

	return (
		<div className='col-lg-6'>
			{/* <h2>Top 10 Items Sold This Month</h2>
			<ul>
				{topItems.map((item, index) => (
					<li key={index}>
						{index + 1}. {item} - Sold: {topqty[index]}
					</li>
				))}
			</ul> */}
			<Card stretch>
				<CardHeader>
					<CardLabel icon='BarChart'>
						<CardTitle>Top 10 Least Selling Brand</CardTitle>
						<CardSubTitle>Quantity Sold</CardSubTitle>
					</CardLabel>
				</CardHeader>
				<CardBody>
					<Chart series={chartOptions.series} options={chartOptions.options} type='bar' height={350} />
				</CardBody>
			</Card>
		</div>
	);
};

export default ColumnWithDataLabels;
