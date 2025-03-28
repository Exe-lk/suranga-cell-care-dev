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
import { useGetCategoriesQuery } from '../redux/slices/categoryApiSlice';
import { useGetCategories1Query } from '../redux/slices/category1ApiSlice';

const PieBasic = () => {
	const { data: categoriesData, isLoading: isCategoriesLoading } =
		useGetCategoriesQuery(undefined);
	const { data: categories1Data, isLoading: isCategories1Loading } =
		useGetCategories1Query(undefined);
	const [state, setState] = useState<IChartOptions>({
		series: [0, 0],
		options: {
			chart: {
				width: 380,
				type: 'pie',
			},
			labels: ['Accessory', 'Displays'],
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
		if (!isCategoriesLoading && !isCategories1Loading && categoriesData && categories1Data) {
			const accessoryCount = categories1Data.length;
			const displaysCount = categoriesData.length;
			const totalCount = accessoryCount + displaysCount;
			const accessoryPercentage = ((accessoryCount / totalCount) * 100).toFixed(2);
			const displaysPercentage = ((displaysCount / totalCount) * 100).toFixed(2);
			setState((prevState) => ({
				...prevState,
				series: [parseFloat(accessoryPercentage), parseFloat(displaysPercentage)],
			}));
		}
	}, [categoriesData, categories1Data, isCategoriesLoading, isCategories1Loading]);

	return (
		<div className='col-lg-6'>
			<Card stretch>
				<CardHeader>
					<CardLabel icon='PieChart'>
						<CardTitle>
							Stock Type <small>analytics</small>
						</CardTitle>
					</CardLabel>
				</CardHeader>
				<CardBody>
					{!isCategoriesLoading && !isCategories1Loading ? (
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
