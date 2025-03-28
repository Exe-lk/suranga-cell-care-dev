import React, { useEffect, useState } from 'react';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../components/bootstrap/Card';
import Chart, { IChartOptions } from '../components/extras/Chart';
import { useGetStockInOutsQuery } from '../redux/slices/stockInOutAcceApiSlice';
import moment from 'moment';

const LineWithLabel = () => {
	const { data: stocksData, isLoading: isstocksLoading } = useGetStockInOutsQuery(undefined);
	const [state, setState] = useState<IChartOptions>({
		series: [
			{
				name: 'Stock Out',
				data: Array(12).fill(0),
			},
			{
				name: 'Stock In',
				data: Array(12).fill(0),
			},
		],
		options: {
			chart: {
				height: 350,
				type: 'line',
				dropShadow: {
					enabled: true,
					color: '#000',
					top: 18,
					left: 7,
					blur: 10,
					opacity: 0.2,
				},
				toolbar: {
					show: false,
				},
			},
			tooltip: {
				theme: 'dark',
			},
			dataLabels: {
				enabled: true,
			},
			stroke: {
				curve: 'smooth',
			},
			title: {
				text: 'Stock In & Stock Out',
				align: 'left',
			},
			grid: {
				borderColor: '#e7e7e7',
				row: {
					colors: ['#f3f3f3', 'transparent'],
					opacity: 0.5,
				},
			},
			markers: {
				size: 1,
			},
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
				title: {
					text: 'Month',
				},
			},
			yaxis: {
				title: {
					text: 'Stock Count',
				},
				min: 0,
			},
			legend: {
				position: 'top',
				horizontalAlign: 'right',
				floating: true,
				offsetY: -25,
				offsetX: -5,
			},
		},
	});
	const groupByMonth = (data: { date: string; stock: string }[]) => {
		const monthlyData = Array(12).fill(0);

		data.forEach((item) => {
			const month = moment(item.date).month();
			monthlyData[month] += 1;
		});

		return monthlyData;
	};

	useEffect(() => {
		if (!isstocksLoading && stocksData) {
			const stockInData = stocksData.filter(
				(item: { date: string; stock: string }) => item.stock === 'stockIn',
			);
			const stockOutData = stocksData.filter(
				(item: { date: string; stock: string }) => item.stock === 'stockOut',
			);
			const stockInMonthly = groupByMonth(stockInData);
			const stockOutMonthly = groupByMonth(stockOutData);
			setState((prevState) => ({
				...prevState,
				series: [
					{
						name: 'Stock Out',
						data: stockOutMonthly,
					},
					{
						name: 'Stock In',
						data: stockInMonthly,
					},
				],
			}));
		}
	}, [stocksData, isstocksLoading]);

	return (
		<div className='col-lg-6'>
			<Card stretch>
				<CardHeader>
					<CardLabel icon='ShowChart' iconColor='warning'>
						<CardTitle>
							Stock In & Stock Out <small>analytics</small>
						</CardTitle>
						<CardSubTitle>Monthly Stock Chart</CardSubTitle>
					</CardLabel>
				</CardHeader>
				<CardBody>
					{!isstocksLoading ? (
						<Chart
							series={state.series}
							options={state.options}
							type={state.options.chart?.type}
							height={state.options.chart?.height}
						/>
					) : (
						<p>Loading chart...</p>
					)}
				</CardBody>
			</Card>
		</div>
	);
};

export default LineWithLabel;
