import React, { useState, useEffect } from 'react';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from './bootstrap/Card';
import Chart, { IChartOptions } from './extras/Chart';
import { useGetBrandsQuery } from '../redux/slices/brandApiSlice';
import { useGetBrands1Query } from '../redux/slices/brand1ApiSlice';
import { useGetCategoriesQuery } from '../redux/slices/categoryApiSlice';
import { useGetCategories1Query } from '../redux/slices/category1ApiSlice';
import { useGetModelsQuery } from '../redux/slices/modelApiSlice';
import { useGetModels1Query } from '../redux/slices/model1ApiSlice';

const getMonthFromTimestamp = (timestamp: { seconds: number } | undefined) => {
	// Return current month if timestamp is undefined
	if (!timestamp || typeof timestamp.seconds !== 'number') {
		return new Date().getMonth();
	}
	const date = new Date(timestamp.seconds * 1000);
	return date.getMonth();
};

const countByMonth = (data: { timestamp?: { seconds: number } }[] | undefined) => {
	const monthsCount = Array(12).fill(0);
	if (data && Array.isArray(data)) {
		data.forEach((item) => {
			if (item && item.timestamp) {
				const month = getMonthFromTimestamp(item.timestamp);
				monthsCount[month] += 1;
			}
		});
	}
	return monthsCount;
};

const TypeAnalatisk = () => {
	const { data: brands } = useGetBrandsQuery(undefined);
	const { data: brands1 } = useGetBrands1Query(undefined);
	const { data: categories } = useGetCategoriesQuery(undefined);
	const { data: categories1 } = useGetCategories1Query(undefined);
	const { data: models } = useGetModelsQuery(undefined);
	const { data: models1 } = useGetModels1Query(undefined);
	const [columnBasic1, setColumnBasic1] = useState<IChartOptions>({
		series: [
			{ name: 'Model', data: [] },
			{ name: 'Category', data: [] },
			{ name: 'Brand', data: [] },
		],
		options: {
			chart: { type: 'bar', height: 350 },
			plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
			dataLabels: { enabled: false },
			stroke: { show: true, width: 2, colors: ['transparent'] },
			xaxis: {
				categories: [
					'Jan',
					'Feb',
					'Mar',
					'Apr',
					'May',
					'Jun',
					'Jul',
					'Aug',
					'Sep',
					'Oct',
					'Nov',
					'Dec',
				],
			},
			yaxis: { title: { text: ' (Quantity)' } },
			fill: { opacity: 1 },
			tooltip: {
				y: {
					formatter(val) {
						return ` ${val} Quantity`;
					},
				},
			},
		},
	});

	useEffect(() => {
		if (brands && brands1 && categories && categories1 && models && models1) {
			const categoryTotals = countByMonth(categories).map(
				(val, index) => val + countByMonth(categories1)[index],
			);
			const brandTotals = countByMonth(brands).map(
				(val, index) => val + countByMonth(brands1)[index],
			);
			const modelTotals = countByMonth(models).map(
				(val, index) => val + countByMonth(models1)[index],
			);
			setColumnBasic1({
				series: [
					{ name: 'Model', data: modelTotals },
					{ name: 'Category', data: categoryTotals },
					{ name: 'Brand', data: brandTotals },
				],
				options: { ...columnBasic1.options },
			});
		}
	}, [brands, brands1, categories, categories1, models, models1]);

	return (
		<div className='col-lg-6'>
			<Card stretch>
				<CardHeader>
					<CardLabel icon='BarChart'>
						<CardTitle>Model Category & Brand</CardTitle>
						<CardSubTitle>Analytics</CardSubTitle>
					</CardLabel>
				</CardHeader>
				<CardBody>
					<Chart
						series={columnBasic1.series}
						options={columnBasic1.options}
						type='bar'
						height={350}
					/>
				</CardBody>
			</Card>
		</div>
	);
};

export default TypeAnalatisk;
