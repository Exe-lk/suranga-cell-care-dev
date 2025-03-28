import React, { useEffect, useState } from 'react';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../components/bootstrap/Card';
import Chart, { IChartOptions } from '../components/extras/Chart';
import { useGetStockInOutsQuery } from '../redux/slices/stockInOutDissApiSlice';

const PieBasic = () => {
	const { data: stocksData, isLoading: isstocksLoading } = useGetStockInOutsQuery(undefined);
	const [state, setState] = useState<IChartOptions>({
		series: [0, 0],
		options: {
			chart: {
				width: 380,
				type: 'pie',
			},
			labels: ['Stock In', 'Stock Out'],
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
		if (!isstocksLoading && stocksData) {
			const stockInData = stocksData.filter(
				(item: { stock: string }) => item.stock === 'stockIn',
			);
			const stockOutData = stocksData.filter(
				(item: { stock: string }) => item.stock === 'stockOut',
			);
			const stockInCount = stockInData.length || 0;
			const stockOutCount = stockOutData.length || 0;
			const totalCount = stockInCount + stockOutCount;
			if (totalCount > 0) {
				const stockInPercentage = ((stockInCount / totalCount) * 100).toFixed(2);
				const stockOutPercentage = ((stockOutCount / totalCount) * 100).toFixed(2);
				setState((prevState) => ({
					...prevState,
					series: [parseFloat(stockInPercentage), parseFloat(stockOutPercentage)],
				}));
			}
		}
	}, [stocksData, isstocksLoading]);

	return (
		<div className='col-lg-6'>
			<Card stretch>
				<CardHeader>
					<CardLabel icon='PieChart'>
						<CardTitle>
							Stock In/Out <small>analytics</small>
						</CardTitle>
					</CardLabel>
				</CardHeader>
				<CardBody>
					{!isstocksLoading ? (
						<Chart
							series={state.series}
							options={state.options}
							type={state.options.chart?.type}
							width={state.options.chart?.width}
						/>
					) : (
						<p>Loading chart...</p>
					)}
				</CardBody>
			</Card>
		</div>
	);
};

export default PieBasic;
