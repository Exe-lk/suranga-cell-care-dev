import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { userManagementApiSlice } from './slices/userManagementApiSlice';
import { userApiSlice } from './slices/userApiSlice';
import { brandApiSlice } from './slices/brandApiSlice';
import { brand1ApiSlice } from './slices/brand1ApiSlice';
import { categoryApiSlice } from './slices/categoryApiSlice';
import { category1ApiSlice } from './slices/category1ApiSlice';
import { modelApiSlice } from './slices/modelApiSlice';
import { model1ApiSlice } from './slices/model1ApiSlice';
import { stockKeeperApiSlice } from './slices/stockKeeperApiSlice';
import { dealerApiSlice } from './slices/delearApiSlice';
import { supplierApiSlice } from './slices/supplierApiSlice';
import { billApiSlice } from './slices/billApiSlice';
import { technicianApiSlice } from './slices/technicianManagementApiSlice';
import { ItemAcceApiSlice } from './slices/itemManagementAcceApiSlice';
import { stockInOutApiSlice } from './slices/stockInOutDissApiSlice';
import { ItemDisApiSlice } from './slices/itemManagementDisApiSlice';
import { stockInOutAcceApiSlice } from './slices/stockInOutAcceApiSlice';
import { repairedPhoneApiSlice } from './slices/repairedPhoneApiSlice';
import {billdisplayApiSlice} from './slices/displayService';
import { accessoryBillApiSlice } from './slices/accessoryBillApiSlice';
import { returnDisplayApiSlice } from './slices/returnDisplayApiSlice';

const store = configureStore({
	reducer: {
		[userManagementApiSlice.reducerPath]: userManagementApiSlice.reducer,
		[userApiSlice.reducerPath]: userApiSlice.reducer,
		[brandApiSlice.reducerPath]: brandApiSlice.reducer,
		[categoryApiSlice.reducerPath]: categoryApiSlice.reducer,
		[modelApiSlice.reducerPath]: modelApiSlice.reducer,
		[stockKeeperApiSlice.reducerPath]: stockKeeperApiSlice.reducer,
		[dealerApiSlice.reducerPath]: dealerApiSlice.reducer,
		[supplierApiSlice.reducerPath]: supplierApiSlice.reducer,
		[billApiSlice.reducerPath]: billApiSlice.reducer,
		[technicianApiSlice.reducerPath]: technicianApiSlice.reducer,
		[brand1ApiSlice.reducerPath]: brand1ApiSlice.reducer,
		[category1ApiSlice.reducerPath]: category1ApiSlice.reducer,
		[model1ApiSlice.reducerPath]: model1ApiSlice.reducer,
		[ItemAcceApiSlice.reducerPath]: ItemAcceApiSlice.reducer,
		[stockInOutApiSlice.reducerPath]: stockInOutApiSlice.reducer,
		[ItemDisApiSlice.reducerPath]: ItemDisApiSlice.reducer,
		[stockInOutAcceApiSlice.reducerPath]: stockInOutAcceApiSlice.reducer,
		[repairedPhoneApiSlice.reducerPath]: repairedPhoneApiSlice.reducer,
		[billdisplayApiSlice.reducerPath]: billdisplayApiSlice.reducer,
		[accessoryBillApiSlice.reducerPath]: accessoryBillApiSlice.reducer,
		[returnDisplayApiSlice.reducerPath]: returnDisplayApiSlice.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(
			userManagementApiSlice.middleware,
			userApiSlice.middleware,
			brandApiSlice.middleware,
			categoryApiSlice.middleware,
			modelApiSlice.middleware,
			stockKeeperApiSlice.middleware,
			dealerApiSlice.middleware,
			supplierApiSlice.middleware,
			billApiSlice.middleware,
			technicianApiSlice.middleware,
			brand1ApiSlice.middleware,
			category1ApiSlice.middleware,
			model1ApiSlice.middleware,
			ItemAcceApiSlice.middleware,
			stockInOutApiSlice.middleware,
			ItemDisApiSlice.middleware,
			stockInOutAcceApiSlice.middleware,
			repairedPhoneApiSlice.middleware,
			billdisplayApiSlice.middleware,
			accessoryBillApiSlice.middleware,
			returnDisplayApiSlice.middleware,
		),
});
setupListeners(store.dispatch);

export default store;
