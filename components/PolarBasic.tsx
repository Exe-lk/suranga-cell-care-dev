import React, { useEffect, useState } from 'react';
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

const PolarBasic = () => {
	const { data: bills } = useGetBillsQuery(undefined);
	const [state, setState] = useState<IChartOptions>({
		series: [],
		options: {
			chart: {
				type: 'polarArea',
			},
			stroke: {
				colors: ['#fff'],
			},
			fill: {
				opacity: 0.8,
			},
			labels: [],
			dataLabels: {
				enabled: false,
			},
			responsive: [
				{
					breakpoint: 480,
					options: {
						chart: {
							width: 200,
						},
						legend: {
							position: 'bottom',
						},
					},
				},
			],
		},
	});

	useEffect(() => {
		if (bills) {
			const statusCounts = {
				'Waiting': 0,
				'Ready to Repair': 0,
				'In Progress': 0,
				'Reject': 0,
				'Repair Completed': 0,
				'HandOver': 0,
			};
			bills.forEach((bill: { Status: keyof typeof statusCounts }) => {
				if (statusCounts[bill.Status] !== undefined) {
					statusCounts[bill.Status]++;
				}
			});
			setState({
				series: Object.values(statusCounts),
				options: {
					...state.options,
					labels: Object.keys(statusCounts),
				},
			});
		}
	}, [bills]);

	return (
		<div className='col-lg-6'>
			<Card stretch>
				<CardHeader>
					<CardLabel icon='TrackChanges'>
						<CardTitle>Status Distribution of Phone Repairs</CardTitle>
						<CardSubTitle>Polar Area Chart</CardSubTitle>
					</CardLabel>
				</CardHeader>
				<CardBody>
					<Chart
						series={state.series}
						options={state.options}
						type={state.options.chart?.type}
						width={state.options.chart?.width}
					/>
				</CardBody>
			</Card>
		</div>
	);
};

export default PolarBasic;
