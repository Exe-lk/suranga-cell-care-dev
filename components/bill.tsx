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
import { useGetBillsQuery } from '../redux/slices/billApiSlice';

const TypeAnalatisk = () => {
	const { data: bills, isLoading } = useGetBillsQuery(undefined);
	const [monthlyData, setMonthlyData] = useState<number[]>(Array(12).fill(0));
	const chartOptions: IChartOptions = {
		series: [
			{
				name: 'Bills',
				data: monthlyData,
			},
		],
		options: {
			chart: {
				type: 'bar',
				height: 350,
			},
			plotOptions: {
				bar: {
					horizontal: false,
					columnWidth: '55%',
				},
			},
			dataLabels: {
				enabled: false,
			},
			stroke: {
				show: true,
				width: 2,
				colors: ['transparent'],
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
			},
			yaxis: {
				title: {
					text: 'Number of Bills',
				},
				labels: {
					formatter: (val) => `${val}`,
				},
			},
			fill: {
				opacity: 1,
			},
			tooltip: {
				y: {
					formatter(val) {
						return `Bills: ${val}`;
					},
				},
			},
		},
	};

	useEffect(() => {
		if (bills) {
			const counts = Array(12).fill(0);
			bills.forEach((bill: { dateIn: string }) => {
				const date = new Date(bill.dateIn);
				const month = date.getMonth();
				counts[month] += 1;
			});
			setMonthlyData(counts);
		}
	}, [bills]);

	return (
		<div className='col-lg-6'>
			<Card stretch>
				<CardHeader>
					<CardLabel icon='BarChart'>
						<CardTitle>Bills Created</CardTitle>
						<CardSubTitle>Analytics</CardSubTitle>
					</CardLabel>
				</CardHeader>
				<CardBody>
					{isLoading ? (
						<p>Loading...</p>
					) : (
						<Chart
							series={chartOptions.series}
							options={chartOptions.options}
							type='bar'
							height={350}
						/>
					)}
				</CardBody>
			</Card>
		</div>
	);
};

export default TypeAnalatisk;
