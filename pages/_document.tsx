import React from 'react';
import { Head, Html, Main, NextScript } from 'next/document';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const Document = () => {
	return (
		<Html>
			<Head>
				<meta name='robots' content='noindex, nofollow' />
			</Head>
			<script
				type='text/javascript'
				src='../browser-print/BrowserPrint-3.1.250.min.js'></script>
			<body className='modern-design subheader-enabled'>
				<Main />
				<div id='portal-root' />
				<div id='portal-notification' />
				<NextScript />
			</body>
		</Html>
	);
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		// @ts-ignore
		...(await serverSideTranslations(locale, ['translation', 'menu'])),
	},
});

export default Document;
