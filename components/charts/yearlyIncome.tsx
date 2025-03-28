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
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';

const YearlyFinancialChart = () => {
    const [yearlyData, setYearlyData] = useState<
        { year: number; totalNetValue: number; totalCost: number; profit: number }[]
    >([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dataCollection = collection(firestore, 'accessorybill');
                const querySnapshot = await getDocs(dataCollection);
                const firebaseData = querySnapshot.docs.map((doc) => ({
                    ...doc.data(),
                    cid: doc.id,
                }));

                const yearlyTotals: Record<number, any> = {};

                firebaseData.forEach((order: any) => {
                    if (!order.date) return;
                    const orderDate = new Date(order.date);
                    const orderYear = orderDate.getFullYear();

                    if (!yearlyTotals[orderYear]) {
                        yearlyTotals[orderYear] = {
                            year: orderYear,
                            totalNetValue: 0,
                            totalCost: 0,
                            profit: 0,
                        };
                    }
                    yearlyTotals[orderYear].totalNetValue += order.netValue || 0;
                    if (order.orders && Array.isArray(order.orders)) {
                        order.orders.forEach((item: any) => {
                            yearlyTotals[orderYear].totalCost += item.cost || 0;
                        });
                    }
                    yearlyTotals[orderYear].profit = yearlyTotals[orderYear].totalNetValue - yearlyTotals[orderYear].totalCost;
                });

                const sortedYearlyData = Object.values(yearlyTotals).sort((a: any, b: any) => a.year - b.year);
                setYearlyData(sortedYearlyData);
            } catch (error) {
                console.error('Error fetching yearly data:', error);
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
                text: 'Yearly Financial Data',
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
                    text: 'Year',
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
        if (yearlyData.length > 0) {
            const years = yearlyData.map((data) => data.year.toString());
            const totalNetValues = yearlyData.map((data) => data.totalNetValue);
            const totalCosts = yearlyData.map((data) => data.totalCost);
            const profits = yearlyData.map((data) => data.profit);

            setChartData({
                series: [
                    { name: 'Total Net Value', data: totalNetValues },
                    { name: 'Total Cost', data: totalCosts },
                    { name: 'Profit', data: profits },
                ],
                options: {
                    ...chartData.options,
                    xaxis: { ...chartData.options.xaxis, categories: years },
                },
            });
        }
    }, [yearlyData]);

    return (
        <div className='col-lg-6'>
            <Card stretch>
                <CardHeader>
                    <CardLabel icon='ShowChart'>
                        <CardTitle>
                            type <small>line</small>
                        </CardTitle>
                        <CardSubTitle>Chart</CardSubTitle>
                    </CardLabel>
                </CardHeader>
                <CardBody>
                    <Chart series={chartData.series} options={chartData.options} type='line' height={350} />
                </CardBody>
            </Card>
        </div>
    );
};

export default YearlyFinancialChart;
