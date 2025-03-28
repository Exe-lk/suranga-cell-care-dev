import React, { useEffect, useState } from 'react';
import Chart, { IChartOptions } from '../../components/extras/Chart';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';

const CategoryQuantityBarChart = () => {
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
				const dataCollection = collection(firestore, 'ItemManagementAcce');
				const querySnapshot = await getDocs(dataCollection);
				const firebaseData = querySnapshot.docs.map((doc) => doc.data());

				const categoryTotals: any = {};

				firebaseData.forEach((item) => {
					if (item.category && typeof item.quantity === 'number') {
						if (!categoryTotals[item.category]) {
							categoryTotals[item.category] = 0;
						}
						categoryTotals[item.category] += item.quantity;
					}
				});

				const sortedCategories = Object.entries(categoryTotals)
					.sort((a: any, b: any) => b[1] - a[1]) // Sort by quantity descending
					.slice(0, 10); // Get top 10 categories

				const categories = sortedCategories.map(([category]) => category);
				const quantities: any = sortedCategories.map(([, quantity]) => quantity);
				console.log(categories);
				console.log(quantities);
				setChartOptions((prev) => ({
					...prev,
					series: [{ name: 'Quantity Sold', data: quantities }],
					options: {
						...prev.options,
						xaxis: { ...prev.options.xaxis, categories: categories },
					},
				}));
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};

		fetchData();
	}, []);

	return (
		<div className='col-lg-6'>
			<Chart
				series={chartOptions.series}
				options={chartOptions.options}
				type='bar'
				height={350}
			/>
		</div>
	);
};

export default CategoryQuantityBarChart;
