import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import PieBasic from '../../../components/top-product-chart';
import TypeAnalatisk from '../../../components/TypeAnalatisk';
import TypeAnalatisk1 from '../../../components/bill';
import PolarBasic from '../../../components/PolarBasic';
import LineWithLabel1 from '../../../components/sock-monthly';
import PieBasic1 from '../../../components/QRAnalatisk';
import LineWithLabe2 from '../../../components/SalesAnalatisk';
const Index: NextPage = () => {
	return (
		<PageWrapper>
			<Page>
				<div className='flex-grow-1 text-right text-info'>Hi Viewer</div>
				<div className='row'>
					<PieBasic />
					<TypeAnalatisk />
					<TypeAnalatisk1 />
					<PolarBasic />
					<LineWithLabel1 />
					<PieBasic1 />
					<LineWithLabe2 />
				</div>
			</Page>
		</PageWrapper>
	);
};

export default Index;
