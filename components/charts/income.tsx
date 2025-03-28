import React, { useEffect, useState } from 'react';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../../components/bootstrap/Card';
import Chart, { IChartOptions } from '../../components/extras/Chart';
import CommonStoryBtn from '../../common/partial/other/CommonStoryBtn';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';

const LineBasic = () => {
    const [monthlyData, setMonthlyData] = useState<
    { month: string; totalDiscount: number; totalAmount: number; totalNetValue: number; totalCost: number ; profit: number}[]
>([]);

const today = new Date();
const currentYear = today.getFullYear();

useEffect(() => {
    const fetchData = async () => {
        try {
            const dataCollection = collection(firestore, 'accessorybill');
            const querySnapshot = await getDocs(dataCollection);

            // Convert Firestore data into a usable array
            const firebaseData = querySnapshot.docs.map((doc) => ({
                ...doc.data(),
                cid: doc.id,
            }));

            // Initialize an object for monthly totals
            const monthlyTotals: Record<string, any> = {};

            // Process each order
            firebaseData.forEach((order: any) => {
                if (!order.date) return;

                const orderDate = new Date(order.date);
                const orderYear = orderDate.getFullYear();
                const orderMonth = orderDate.getMonth(); // 0 = Jan, 1 = Feb, ...

                // Only consider orders from the current year
                if (orderYear === currentYear) {
                    const monthName = new Intl.DateTimeFormat('en', { month: 'long' }).format(orderDate);

                    if (!monthlyTotals[orderMonth]) {
                        monthlyTotals[orderMonth] = {
                            month: monthName,
                            totalDiscount: 0,
                            totalAmount: 0,
                            totalNetValue: 0,
                            totalCost: 0,
                            profit: 0,
                        };
                    }

                   
                    monthlyTotals[orderMonth].totalNetValue += order.netValue || 0;

                    if (order.orders && Array.isArray(order.orders)) {
                        order.orders.forEach((item: any) => {
                            monthlyTotals[orderMonth].totalCost += item.cost || 0;
                        });
                    }
                    monthlyTotals[orderMonth].profit = monthlyTotals[orderMonth].totalNetValue - monthlyTotals[orderMonth].totalCost;
                }
            });

            // Convert object to array and sort by month
            const sortedMonthlyData = Object.values(monthlyTotals).sort(
                (a: any, b: any) => new Date(`${a.month} 1, ${currentYear}`).getMonth() - new Date(`${b.month} 1, ${currentYear}`).getMonth()
            );

            setMonthlyData(sortedMonthlyData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    fetchData();
}, []);
const [chartData, setChartData] = useState<IChartOptions>({
    series: [],
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
            text: 'Monthly Financial Data',
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
            categories: [],
            title: {
                text: 'Month',
            },
        },
        yaxis: {
            title: {
                text: 'Amount (LKR)',
            },
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

useEffect(() => {
    if (monthlyData.length > 0) {
        const months = monthlyData.map((data) => data.month);
        const totalNetValues = monthlyData.map((data) => data.totalNetValue);
        const totalCosts = monthlyData.map((data) => data.totalCost);
        const profits = monthlyData.map((data) => data.profit);

        setChartData({
            series: [
                { name: 'Total Net Value', data: totalNetValues },
                { name: 'Total Cost', data: totalCosts },
                { name: 'Profit', data: profits },
            ],
            options: {
                ...chartData.options,
                xaxis: { ...chartData.options.xaxis, categories: months },
            },
        });
    }
}, [monthlyData]);


	return (
		<div className='col-lg-6'>
            {/* <div>
			<h2>Monthly Sales Summary ({currentYear})</h2>
			<table border={1}>
				<thead>
					<tr>
						<th>Month</th>
						<th>Total Discount</th>
						<th>Total Amount</th>
						<th>Total Net Value</th>
						<th>Total Cost</th>
					</tr>
				</thead>
				<tbody>
					{monthlyData.map((data, index) => (
						<tr key={index}>
							<td>{data.month}</td>
							
							<td>{data.totalNetValue.toFixed(2)}</td>
							<td>{data.totalCost.toFixed(2)}</td>
                            <td>{data.profit.toFixed(2)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div> */}
			<Card stretch>
				<CardHeader>
					<CardLabel icon='ShowChart'>
						<CardTitle>
							monthly <small>line</small>
						</CardTitle>
						<CardSubTitle>Chart</CardSubTitle>
					</CardLabel>
					<CardActions>
						<CommonStoryBtn to='/story/extra-chart-line--line-basic' />
					</CardActions>
				</CardHeader>
				<CardBody>
                <Chart
    series={chartData.series}
    options={chartData.options}
    type="line"
    height={350}
/>
				</CardBody>
			</Card>
		</div>
	);
};

export default LineBasic;
