import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import PieBasic from '../../../components/displayChart';
import LineWithLabel1 from '../../../components/sock-monthly';
import TypeAnalatisk from '../../../components/Technicians';

const Index: NextPage = () => {
	return (
		<PageWrapper>
			<Page>
				<div className='flex-grow-1 text-right text-info'>Welcome to Display Stock</div>
				<div className='row'>
					<PieBasic />
					<LineWithLabel1 />
					<TypeAnalatisk />
				</div>
			</Page>
		</PageWrapper>
	);
};

export default Index;
