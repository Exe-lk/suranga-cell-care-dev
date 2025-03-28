import React from 'react';
import {
	componentPagesMenu,
	dashboardPagesMenu,
	demoPagesMenu,
	pageLayoutTypesPagesMenu,
} from '../menu';
import AdminHeader from '../pages/_layout/_headers/AdminHeader';
import CasierHeader from '../pages/_layout/_headers/CashierHeader';
import path from 'path';


const headers = [
	

	{
		path: `/bill-keeper/*`,
		element: <AdminHeader />,
	},
	{
		path: `/admin/*`,
		element: <AdminHeader />,
	},
	{
		path: `/cashier/*`,
		element: <CasierHeader />,

	},
	{
		path: `/display-stock/*`,
		element: <AdminHeader />,
	},
	{
		path: `/accessory-stock/*`,
		element: <AdminHeader />,
	},
	{
		path: `/viewer/*`,
		element: <AdminHeader />,
	},
	{
		path: `/repairSales/*`,
		element: <AdminHeader />,
	},

];

export default headers;
