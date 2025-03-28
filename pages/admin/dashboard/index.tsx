import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import PieBasic from '../../../components/top-product-chart';
import TypeAnalatisk from '../../../components/TypeAnalatisk';

const Index: NextPage = () => {
	return (
		<PageWrapper>
			<Page>
				<div className='flex-grow-1 text-right text-info'></div>
				<div className='row'>
					<PieBasic />
					<TypeAnalatisk />
				</div>
			</Page>
		</PageWrapper>
	);
};
export default Index;
