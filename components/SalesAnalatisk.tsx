import React, { useState, useEffect } from 'react';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
} from '../components/bootstrap/Card';
import Chart, { IChartOptions } from '../components/extras/Chart';
import { useGetItemAccesQuery } from '../redux/slices/itemManagementAcceApiSlice';

const PieBasic = () => {
	const { data: items, isLoading } = useGetItemAccesQuery(undefined);
	const [chartData, setChartData] = useState<IChartOptions>({
		series: [0, 0],
		options: {
			chart: {
				width: 380,
				type: 'pie',
			},
			labels: ['Mobile', 'Accessory'],
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
	const [totalCount, setTotalCount] = useState(0);

	useEffect(() => {
		if (items && !isLoading) {
			const mobileCount = items.filter((item: any) => item.type === 'Mobile').length;
			const accessoryCount = items.filter((item: any) => item.type === 'Accessory').length;
			const total = mobileCount + accessoryCount;
			setChartData((prevState) => ({
				...prevState,
				series: [mobileCount, accessoryCount],
			}));
			setTotalCount(total);
		}
	}, [items, isLoading]);

	return (
		<div className='col-lg-6'>
			<Card stretch>
				<CardHeader>
					<CardLabel icon='PieChart'>
						<CardTitle>
							Type <small>analytics</small>
						</CardTitle>
					</CardLabel>
				</CardHeader>
				<CardBody>
					{isLoading ? (
						<p>Loading...</p>
					) : (
						<>
							<Chart
								series={chartData.series}
								options={chartData.options}
								type={chartData.options.chart?.type}
								width={chartData.options.chart?.width}
							/>
							<p>Total Items: {totalCount}</p>
						</>
					)}
				</CardBody>
			</Card>
		</div>
	);
};

export default PieBasic;
