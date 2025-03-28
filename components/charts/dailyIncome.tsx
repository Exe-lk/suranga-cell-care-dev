import React, { useEffect, useState } from 'react';
import Card, { CardActions, CardBody, CardHeader, CardLabel, CardSubTitle, CardTitle } from '../../components/bootstrap/Card';
import Chart, { IChartOptions } from '../../components/extras/Chart';
import CommonStoryBtn from '../../common/partial/other/CommonStoryBtn';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';

const DailyFinancialChart = () => {
    const [dailyData, setDailyData] = useState<
        { day: string; totalNetValue: number; totalCost: number; profit: number }[]
    >([]);

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dataCollection = collection(firestore, 'accessorybill');
                const querySnapshot = await getDocs(dataCollection);
                const firebaseData = querySnapshot.docs.map((doc) => ({
                    ...doc.data(),
                    cid: doc.id,
                }));

                const dailyTotals: Record<string, any> = {};

                firebaseData.forEach((order: any) => {
                    if (!order.date) return;
                    
                    const orderDate = new Date(order.date);
                    const orderYear = orderDate.getFullYear();
                    const orderMonth = orderDate.getMonth();
                    const orderDay = orderDate.getDate();

                    if (orderYear === currentYear && orderMonth === currentMonth) {
                        if (!dailyTotals[orderDay]) {
                            dailyTotals[orderDay] = {
                                day: `${orderDay}`,
                                totalNetValue: 0,
                                totalCost: 0,
                                profit: 0,
                            };
                        }
                        
                        dailyTotals[orderDay].totalNetValue += order.netValue || 0;
                        
                        if (order.orders && Array.isArray(order.orders)) {
                            order.orders.forEach((item: any) => {
                                dailyTotals[orderDay].totalCost += item.cost || 0;
                            });
                        }
                        dailyTotals[orderDay].profit = dailyTotals[orderDay].totalNetValue - dailyTotals[orderDay].totalCost;
                    }
                });
                
                const sortedDailyData = Object.values(dailyTotals).sort(
                    (a: any, b: any) => Number(a.day) - Number(b.day)
                );
                
                setDailyData(sortedDailyData);
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
                toolbar: { show: false },
            },
            tooltip: { theme: 'dark' },
            dataLabels: { enabled: true },
            stroke: { curve: 'smooth' },
            title: { text: 'Daily Financial Data', align: 'left' },
            grid: {
                borderColor: '#e7e7e7',
                row: { colors: ['#f3f3f3', 'transparent'], opacity: 0.5 },
            },
            markers: { size: 1 },
            xaxis: { categories: [], title: { text: 'Day' } },
            yaxis: { title: { text: 'Amount (LKR)' } },
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
        if (dailyData.length > 0) {
            const days = dailyData.map((data) => data.day);
            const totalNetValues = dailyData.map((data) => data.totalNetValue);
            const totalCosts = dailyData.map((data) => data.totalCost);
            const profits = dailyData.map((data) => data.profit);

            setChartData({
                series: [
                    { name: 'Total Net Value', data: totalNetValues },
                    { name: 'Total Cost', data: totalCosts },
                    { name: 'Profit', data: profits },
                ],
                options: {
                    ...chartData.options,
                    xaxis: { ...chartData.options.xaxis, categories: days },
                },
            });
        }
    }, [dailyData]);

    return (
        <div className='col-lg-6'>
            <Card stretch>
                <CardHeader>
                    <CardLabel icon='ShowChart'>
                        <CardTitle>
                           daily chart <small>line</small>
                        </CardTitle>
                        <CardSubTitle>Daily Chart</CardSubTitle>
                    </CardLabel>
                    <CardActions>
                        <CommonStoryBtn to='/story/extra-chart-line--daily-financial' />
                    </CardActions>
                </CardHeader>
                <CardBody>
                    <Chart series={chartData.series} options={chartData.options} type='line' height={350} />
                </CardBody>
            </Card>
        </div>
    );
};

export default DailyFinancialChart;
