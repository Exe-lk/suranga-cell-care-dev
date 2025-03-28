import React, { useContext, useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Brand from '../../../layout/Brand/Brand';
import Navigation from '../../../layout/Navigation/Navigation';
import { BillKeeperPagesMenu, logoutmenu } from '../../../menu';
import ThemeContext from '../../../context/themeContext';
import Aside, { AsideBody, AsideFoot, AsideHead } from '../../../layout/Aside/Aside';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import Icon from '../../../components/icon/Icon';
import { useTranslation } from 'react-i18next';


const DefaultAside = () => {
	const { asideStatus, setAsideStatus } = useContext(ThemeContext);
	const [isAuthorized, setIsAuthorized] = useState(false);
	const router = useRouter();
	const { t } = useTranslation(['common', 'menu']);
	useEffect(() => {
		const validateUser = async () => {
			const email = localStorage.getItem('userRole');
			const response = await fetch('/api/validateUser', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});

			await response.json();
			if (response.ok && email === 'bill keeper') {
				setIsAuthorized(true);
			} else {
				// router.push('/');
			}
		};

		validateUser();
	}, []);

	const handleLogout = async () => {
		try {
			const result = await Swal.fire({
				title: 'Are you sure?',
				// text: 'You will not be able to recover this user!',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, Log out',
			});
			if (result.isConfirmed) {
				try {
					localStorage.removeItem('userRole');

					router.push('/');
				} catch (error) {
					console.error('Error during handleUpload: ', error);
					alert('An error occurred during file upload. Please try again later.');
				}
			}
		} catch (error) {
			console.error('Error deleting document: ', error);
			Swal.fire('Error', 'Failed to Log out user.', 'error');
		}
	};
	return (
		<Aside>
			<AsideHead>
				<Brand asideStatus={asideStatus} setAsideStatus={setAsideStatus} />
			</AsideHead>
			<AsideBody>
				 {/* Navigation menu for 'My Pages' */}
				<Navigation menu={BillKeeperPagesMenu} id='aside-dashboard' />
				
			</AsideBody>
			<AsideFoot>
			<div aria-label='aside-bottom-user-menu-2' onClick={handleLogout}>
					<div className='navigation'>
						<div className='navigation-item cursor-pointer'>
							<span className='navigation-link navigation-link-pill'>
								<span className='navigation-link-info'>
									<Icon icon='Logout' className='navigation-icon' />
									<span className='navigation-text'>{t('Logout')}</span>
								</span>
							</span>
						</div>
					</div>
				</div>
			</AsideFoot>
		</Aside>
	);
};

// Static props for server-side translations
export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		// @ts-ignore
		...(await serverSideTranslations(locale, ['common', 'menu'])),
	},
});

export default DefaultAside;
