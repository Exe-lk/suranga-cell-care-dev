import React, { useState } from 'react';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../components/bootstrap/Card';
import Chart, { IChartOptions } from '../components/extras/Chart';
import CommonStoryBtn from '../common/partial/other/CommonStoryBtn';

const PieBasic = () => {
	const [state] = useState<IChartOptions>({
		series: [44, 55],
		options: {
			chart: {
				width: 380,
				type: 'pie',
			},
			labels: [' Successful', 'Failed'],
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

	return (
		<div className='col-lg-6'>
			<Card stretch>
				<CardHeader>
					<CardLabel icon='PieChart'>
						<CardTitle>
							Successful vs Failed barcode scans.<small>analytics</small>
						</CardTitle>
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

export default PieBasic;
