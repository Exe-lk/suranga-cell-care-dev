import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import TypeAnalatisk from '../../../components/bill';
import PolarBasic from '../../../components/PolarBasic';
const Index: NextPage = () => {
	return (
		<PageWrapper>
			<Page>
				<div className='row'>
					<TypeAnalatisk />
					<PolarBasic />
				</div>
			</Page>
		</PageWrapper>
	);
};
export default Index;
