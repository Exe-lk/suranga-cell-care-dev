import React from 'react';
import dynamic from 'next/dynamic';
import { demoPagesMenu, pageLayoutTypesPagesMenu } from '../menu';


const AdminAside = dynamic(() => import('../pages/_layout/_asides/AdminAside'));
const StockeAside = dynamic(() => import('../pages/_layout/_asides/StockAccAside'));
const StockeEleAside = dynamic(() => import('../pages/_layout/_asides/StockEleAsider'));
const BillKeeperAside = dynamic(() => import('../pages/_layout/_asides/BillKeeperAsider'));
const ViewAside = dynamic(() => import('../pages/_layout/_asides/ViewAside'));
const CashierAsider = dynamic(() => import('../pages/_layout/_asides/CashierAsider'));
const RepairSalesAside = dynamic(() => import('../pages/_layout/_asides/RepairSalesAside'));
const AccesoryAsider = dynamic(() => import('../pages/_layout/_asides/AccesoryAsider'));


const asides = [
	{ path: demoPagesMenu.login.path, element: null, exact: true },
	{ path: demoPagesMenu.signUp.path, element: null, exact: true },
	{ path: pageLayoutTypesPagesMenu.blank.path, element: null, exact: true },
	{ path: '/admin/*', element: <AdminAside/>, exact: true },
	{ path: '/accessory-stock/*', element: <StockeAside/>, exact: true },
	{ path: '/bill-keeper/*', element: <BillKeeperAside/>, exact: true },
	{ path: '/display-stock/*', element: <StockeEleAside/>, exact: true },
	{ path: '/viewer/*', element: <ViewAside/>, exact: true },
	{ path : '/repairSales/*', element: <RepairSalesAside/>, exact: true },
	{ path: '/cashier/*', element: <CashierAsider/>, exact: true },
	{path: '/accessory-sales-assitant/*', element: <AccesoryAsider/>, exact: true},

];

export default asides;
