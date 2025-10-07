import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import LineWithLabel1 from '../../../components/lineAcces';
import PieBasic from '../../../components/QRAnalatisk';
import LineWithLabe2 from '../../../components/SalesAnalatisk';
import Bestsells from '../../../components/charts/bestSelles';
import BestCategory from '../../../components/charts/bestCategory';
import LestCategory from '../../../components/charts/leastCategory';
import Lestbrand from '../../../components/charts/lestBrand';
import Bestbrand from '../../../components/charts/bestBrand';
import Category from '../../../components/charts/stockLevelCategory';


const Index: NextPage = () => {
	return (
		<PageWrapper>
			<Page>
				<div className='flex-grow-1 text-right text-info'>Welcome to Accessory Stock</div>
				<div className='row'>
					<Bestsells />
					<BestCategory/>
					{/* <LestCategory/>
					<Bestbrand/>
					<Lestbrand/> */}
					<Category/>
					{/* <LineWithLabel1 />
					<PieBasic />
					<LineWithLabe2 /> */}
				</div>
			</Page>
		</PageWrapper>
	);
};
export default Index;
