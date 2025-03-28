import React, { FC, ReactNode, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'next-i18next';
import classNames from 'classnames';
import { useTour } from '@reactour/tour';
import { useRouter } from 'next/router';
import Button, { IButtonProps } from '../../../components/bootstrap/Button';
import { HeaderRight } from '../../../layout/Header/Header';
import OffCanvas, {
	OffCanvasBody,
	OffCanvasHeader,
	OffCanvasTitle,
} from '../../../components/bootstrap/OffCanvas';
import Alert from '../../../components/bootstrap/Alert';
import Dropdown, {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from '../../../components/bootstrap/Dropdown';
import Icon from '../../../components/icon/Icon';
import ThemeContext from '../../../context/themeContext';
import LANG, { getLangWithKey, ILang } from '../../../lang';
import showNotification from '../../../components/extras/showNotification';
import useDarkMode from '../../../hooks/useDarkMode';
import Popovers from '../../../components/bootstrap/Popovers';
import Spinner from '../../../components/bootstrap/Spinner';
import useMounted from '../../../hooks/useMounted';
import Avatar from '../../../components/Avatar';
import UserImage2 from '../../../assets/img/wanna/wanna1.png';

import axios from 'axios';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';

interface ICommonHeaderRightProps {
	beforeChildren?: ReactNode;
	afterChildren?: ReactNode;
}

const CommonHeaderRight: FC<ICommonHeaderRightProps> = ({ beforeChildren, afterChildren }) => {
	const router = useRouter();
	const { darkModeStatus, setDarkModeStatus } = useDarkMode();
	const { fullScreenStatus, setFullScreenStatus } = useContext(ThemeContext);

	const styledBtn: IButtonProps = {
		color: darkModeStatus ? 'dark' : 'light',
		hoverShadow: 'default',
		isLight: !darkModeStatus,
		size: 'lg',
	};
	const [offcanvasStatus, setOffcanvasStatus] = useState(false);

	//get stock count

	return (
		<HeaderRight>
		
			<div className='row g-3'>
				{beforeChildren}

				{/* Dark Mode */}
				<div className='col-auto mt-4'>
					<Popovers trigger='hover' desc='Dark / Light mode'>
						<Button
							// eslint-disable-next-line react/jsx-props-no-spreading
							{...styledBtn}
							onClick={() => setDarkModeStatus(!darkModeStatus)}
							className='btn-only-icon'
							data-tour='dark-mode'>
							<Icon
								icon={darkModeStatus ? 'DarkMode' : 'LightMode'}
								color={darkModeStatus ? 'info' : 'warning'}
								className='btn-icon'
							/>
						</Button>
					</Popovers>
				</div>

				{/*	Full Screen */}
				<div className='col-auto mt-4'>
					<Popovers trigger='hover' desc='Fullscreen'>
						<Button
							// eslint-disable-next-line react/jsx-props-no-spreading
							{...styledBtn}
							icon={fullScreenStatus ? 'FullscreenExit' : 'Fullscreen'}
							onClick={() => setFullScreenStatus(!fullScreenStatus)}
							aria-label='Toggle dark mode'
						/>
					</Popovers>
				</div>
				<div className='col-auto mt-4'>
					<Button
						{...styledBtn}
						icon='Notifications'
						onClick={() => setOffcanvasStatus(true)}
						aria-label='Notifications'
					/>
				</div>

				{afterChildren}
			</div>
			<OffCanvas
				id='notificationCanvas'
				titleId='offcanvasExampleLabel'
				placement='end'
				isOpen={offcanvasStatus}
				setOpen={setOffcanvasStatus}>
				<OffCanvasHeader setOpen={setOffcanvasStatus}>
					<OffCanvasTitle id='offcanvasExampleLabel'>Notifications</OffCanvasTitle>
				</OffCanvasHeader>
				<OffCanvasBody>
					<Alert icon='Inventory2' isLight color='warning' className='flex-nowrap'>
						Pen Drives stock quantity is less than 05. Manage your stock.
					</Alert>
				</OffCanvasBody>
			</OffCanvas>
		
		</HeaderRight>
	);
};
CommonHeaderRight.propTypes = {
	beforeChildren: PropTypes.node,
	afterChildren: PropTypes.node,
};
CommonHeaderRight.defaultProps = {
	beforeChildren: null,
	afterChildren: null,
};

export default CommonHeaderRight;
