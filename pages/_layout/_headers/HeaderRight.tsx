import React, { FC, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Button, { IButtonProps } from '../../../components/bootstrap/Button';
import { HeaderRight } from '../../../layout/Header/Header';
import OffCanvas, {
	OffCanvasBody,
	OffCanvasHeader,
	OffCanvasTitle,
} from '../../../components/bootstrap/OffCanvas';
import Alert from '../../../components/bootstrap/Alert';
import Icon from '../../../components/icon/Icon';
import ThemeContext from '../../../context/themeContext';
import useDarkMode from '../../../hooks/useDarkMode';
import Popovers from '../../../components/bootstrap/Popovers';
import $ from 'jquery';
import Swal from 'sweetalert2';
import Card, { CardBody } from '../../../components/bootstrap/Card';

interface ICommonHeaderRightProps {
	beforeChildren?: ReactNode;
	afterChildren?: ReactNode;
}

const CommonHeaderRight: FC<ICommonHeaderRightProps> = ({ beforeChildren, afterChildren }) => {
	const router = useRouter();
	const { darkModeStatus, setDarkModeStatus } = useDarkMode();
	const { fullScreenStatus, setFullScreenStatus } = useContext(ThemeContext);
	const invoiceRef: any = useRef();
	const currentTime = new Date().toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
	});
	const styledBtn: IButtonProps = {
		color: darkModeStatus ? 'dark' : 'light',
		hoverShadow: 'default',
		isLight: !darkModeStatus,
		size: 'lg',
	};
	useEffect(() => {
		const script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/qz-tray@2.2.4/qz-tray.min.js';
		script.async = true;

		script.onload = () => {
			console.log('QZ Tray script loaded.');
			setIsQzReady(true);
		};

		script.onerror = () => {
			console.error('Failed to load QZ Tray script.');
		};

		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, []);
	const [offcanvasStatus, setOffcanvasStatus] = useState(false);
	const [isQzReady, setIsQzReady] = useState(false);
	// const printbill = async () => {
	// 	try {
	// 		const result = await Swal.fire({
	// 			title: 'Are you sure?',
	// 			// text: 'You will not be able to recover this status!',
	// 			icon: 'warning',
	// 			showCancelButton: true,
	// 			confirmButtonColor: '#3085d6',
	// 			cancelButtonColor: '#d33',
	// 			confirmButtonText: 'Yes,test Print!',
	// 		});

	// 		if (result.isConfirmed) {
	// 			const currentDate = new Date();
	// 			const formattedDate = currentDate.toLocaleDateString();
	// 			if (!isQzReady || typeof window.qz === 'undefined') {
	// 				console.error('QZ Tray is not ready.');
	// 				alert('QZ Tray is not loaded yet. Please try again later.');
	// 				return;
	// 			}
	// 			try {
	// 				if (!window.qz.websocket.isActive()) {
	// 					await window.qz.websocket.connect();
	// 				}
	// 				// const config = window.qz.configs.create('EPSON TM-U220 Receipt');
	// 				const config = window.qz.configs.create('EPSON LQ-310 ESC/P2');
	// 				const data = [
	// 					'\x1B\x40', // Initialize printer
	// 					'\x1B\x61\x01', // Center alignment
	// 					'\x1D\x21\x11', // Double width and height
	// 					'\x1B\x45\x01', // Bold on
	// 					'Suranga Cell Care\n', // Store name
	// 					'\x1B\x45\x00', // Bold off
	// 					'\x1D\x21\x00', // Normal text size
	// 					'\x1B\x4D\x00', // Font A
	// 					'No. 524/1/A, Kandy Road, Kadawatha\n',
	// 					'Tel: 011 292 6030, Mobile: 071 911 1144\n\n',

	// 					'\x1B\x61\x00', // Left alignment
	// 					`Invoice No   : 111506\n`,
	// 					`Invoice Date : ${formattedDate}\n`,
	// 					`Time         : ${currentTime}\n`,
	// 					'------------------------------------------\n',
	// 					'Description            Qty   Price   Amount\n',
	// 					'------------------------------------------\n',

	// 					// Item details (use dynamic data here)
	// 					'Tempered Glass         1     500.00  500.00\n',
	// 					'Back Cover             1     600.00  600.00\n',

	// 					'------------------------------------------\n',
	// 					'\x1B\x61\x02', // Right alignment
	// 					'Total: Rs 1100.00\n',
	// 					'\x1B\x61\x00', // Left alignment
	// 					'------------------------------------------\n',
	// 					'\x1B\x61\x01', // Center alignment
	// 					'Thank You! Come Again!\n',
	// 					'\x1B\x45\x00', // Bold off
	// 					'------------------------------------------\n',
	// 					'\x1D\x56\x41' // Cut paper
	// 				];
	// 				await window.qz.print(config, data);
	// 			} catch (error) {
	// 				console.error('Printing failed', error);
	// 			}
	// 		}
	// 	} catch (error) {
	// 		console.error('Error during handleUpload: ', error);
	// 		alert('An error occurred. Please try again later.');
	// 	}
	// };
	const printbill = async () => {
		const printContent: any = invoiceRef.current.innerHTML;

		// Temporarily hide other content on the page
		const originalContent = document.body.innerHTML;
		document.body.innerHTML = printContent;

		// Trigger the print dialog
		window.print();

		// Restore the original content after printing
		document.body.innerHTML = originalContent;

		// Swal.fire({
		// 	title: 'Success',
		// 	text: 'Bill has been added successfully.',
		// 	icon: 'success',
		// 	showConfirmButton: false,
		// 	timer: 1000,
		// });
		window.location.reload();
	};

	const printbill1 = async () => {
		try {
			const result = await Swal.fire({
				title: 'Are you sure?',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, Print!',
			});

			if (result.isConfirmed) {
				const currentDate = new Date();
				const formattedDate = currentDate.toLocaleDateString();
				const currentTime = currentDate.toLocaleTimeString();

				if (!isQzReady || typeof window.qz === 'undefined') {
					console.error('QZ Tray is not ready.');
					alert('QZ Tray is not loaded yet. Please try again later.');
					return;
				}

				try {
					if (!window.qz.websocket.isActive()) {
						await window.qz.websocket.connect();
					}

					const config = window.qz.configs.create('EPSON LQ-310 ESC/P2');
					var opts = getUpdatedOptions(true);

					const printData: any = [
						{
							type: 'pixel',
							format: 'html',
							flavor: 'plain',
							data:
								'<div' +
								'style={{' +
								'display: "flex",' +
								'justifyContent: "center",' +
								'backgroundColor: "#fff",' +
								'color: "black",' +
								'}}>' +
								'<div' +
								'style={{' +
								'width: "140mm",' +
								'height: "140mm",' +
								'background: "#fff",' +
								'border: "1px dashed #ccc",' +
								'padding: "20px",' +
								'fontFamily: "Arial, sans-serif",' +
								'fontSize: "14px",' +
								'}}>' +
								'<div className="text-center mb-3">' +
								'<h1 style={{ fontSize: "18px", marginBottom: "5px" }}>' +
								'Suranga Cell Care' +
								'</h1>' +
								'<p style={{ marginBottom: "2px" }}>' +
								'No. 524/1A, Kandy Road, Kadawatha.' +
								'</p>' +
								'<p style={{ marginBottom: "0" }}>' +
								'Tel: +94 11 292 60 30 | Mobile: +94 719 111 144' +
								'</p>' +
								'</div>' +
								'<hr />' +
								'<table' +
								'className="table table-borderless"style={{' +
								'marginBottom: "5px",' +
								'lineHeight: "1.2", ' +
								'}}>' +
								'<tbody style={{ color: "black" }}>' +
								'<tr>' +
								'<td' +
								'style={{' +
								'width: "50%",' +
								'color: "black",' +
								'padding: "2px 0",' +
								'}}>' +
								'Invoice No : 111506' +
								'</td>' +
								'<td style={{ color: "black", padding: "2px 0" }}>' +
								'Invoice Date : 2025-01-08' +
								'</td>' +
								'</tr>' +
								'<tr>' +
								'<td' +
								'style={{' +
								'color: "black",' +
								'padding: "2px 0",' +
								'}}></td>' +
								'<td style={{ color: "black", padding: "2px 0" }}>' +
								'Invoiced Time : 2:36 PM' +
								'</td>' +
								'</tr>' +
								'</tbody>' +
								'</table>' +
								'<hr style={{ margin: "5px 0" }} />' +
								'<p' +
								'style={{' +
								'marginBottom: "0",' +
								'lineHeight: "1.2", ' +
								'fontSize: "14px", ' +
								'}}>' +
								'Description' +
								'&nbsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&emsp;&emsp;&emsp;&emsp;' +
								'Price &nbsp;&emsp;&emsp;&emsp;&emsp; Qty' +
								'&nbsp;&emsp;&emsp;&emsp;&emsp; Amount' +
								'</p>' +
								'<hr style={{ margin: "5px 0" }} />' +
								'</div>' +
								'</div>',
							options: opts,
						},
					];

					qz.print(config, printData);
				} catch (error) {
					console.error('Printing failed', error);
				}
			}
		} catch (error) {
			console.error('Error during printbill: ', error);
			alert('An error occurred. Please try again later.');
		}
	};

	function getUpdatedOptions(onlyPixel: any) {
		if (onlyPixel) {
			return {
				pageWidth: $('#pPxlWidth').val(),
				pageHeight: $('#pPxlHeight').val(),
				pageRanges: $('#pPxlRange').val(),
				ignoreTransparency: $('#pPxlTransparent').prop('checked'),
				altFontRendering: $('#pPxlAltFontRendering').prop('checked'),
			};
		} else {
			return {
				language: $("input[name='pLanguage']:checked").val(),
				x: $('#pX').val(),
				y: $('#pY').val(),
				dotDensity: $('#pDotDensity').val(),
				xmlTag: $('#pXml').val(),
				pageWidth: $('#pRawWidth').val(),
				pageHeight: $('#pRawHeight').val(),
			};
		}
	}

	return (
		<HeaderRight>
			<div className='row g-3'>
				{beforeChildren}
				<div className='col-auto mt-4'>
					<Popovers trigger='hover' desc='Test Print'>
						<Button
							// eslint-disable-next-line react/jsx-props-no-spreading
							{...styledBtn}
							onClick={() => printbill()}
							className='btn-only-icon'
							data-tour='Test Print'>
							<Icon icon={'Print'} color={'primary'} className='btn-icon' />
						</Button>
					</Popovers>
				</div>
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
			
						<Card stretch className='mt-4' style={{ height: '80vh' }} hidden>
							<CardBody isScrollable>
								<div
									className='ms-4 ps-3'
									ref={invoiceRef}
									id='invoice'
									style={{
										display: 'flex',
										color: 'black',
									}}>
									<div>
										
											<div
												key={1}
												style={{
													width: '130mm',
													height: '130mm',
													background: '#fff',
													border: '1px dashed #ccc',
													padding: '20px',
													fontFamily: 'Arial, sans-serif',
													fontSize: '12px',
													position: 'relative', // Enables absolute positioning inside
												}}>
												{/* Header */}
												<div className='text-left '>
													<h1
														style={{
															fontSize: '29px',
															fontFamily: 'initial',
															color: 'black',
														}}>
														Suranga Cell Care
													</h1>
													<p
														style={{
															marginBottom: '2px',
															color: 'black',
														}}>
														No. 524/1A, Kandy Road, Kadawatha.
													</p>
													<p
														style={{
															marginBottom: '0',
															color: 'black',
														}}>
														Tel: +94 11 292 60 30 | Mobile: +94 76 401
														77 28
													</p>
												</div>
												{/* <hr style={{ margin: '0 0 5px 0 ' ,color:"black"}} /> */}
												<span
													style={{
														marginBottom: '1px',
														display: 'block',
														borderTop: '1px solid black',
														color: 'black',
													}}></span>
												{/* Invoice Details */}
												<table
													className='table table-borderless'
													style={{
														marginBottom: '5px',
														lineHeight: '1.2',
													}}>
													<tbody style={{ color: 'black' }}>
														<tr>
															<td
																style={{
																	width: '50%',
																	color: 'black',
																	padding: '2px 0 0 ',
																}}>
																Invoice No : 23
															</td>
															<td
																style={{
																	color: 'black',
																	padding: '2px 0',
																}}>
																Invoice Date :2025/06/1
															</td>
														</tr>
														<tr>
															<td
																style={{
																	color: 'black',
																	padding: '2px 0',
																}}>
																Name:{ ' --'}
															</td>
															<td
																style={{
																	color: 'black',
																	padding: '2px 0',
																}}>
																Invoiced Time : {"06:00"}
															</td>
														</tr>
													</tbody>
												</table>
												<span
													style={{
														marginBottom: '3px',
														display: 'block',
														borderTop: '1px solid black',
														color: 'black',
													}}></span>
												<p
													style={{
														marginBottom: '0',
														lineHeight: '1.2',
														fontSize: '12px',
														color: 'black',
													}}>
													Description
													&nbsp;&emsp;&nbsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&emsp;&emsp;&emsp;&emsp;&emsp;
													Price &nbsp;&emsp;&emsp;&emsp; Qty
													&nbsp;&emsp;&emsp; Amount
												</p>
												<span
													style={{
														marginTop: '3px',
														display: 'block',
														borderTop: '1px solid black',
														color: 'black',
													}}></span>
												
														<table
															key={1}
															style={{
																color: 'black',
																width: '110mm',
																borderCollapse: 'collapse',
																fontSize: '12px',
															}}>
															<tbody>
																<tr>
																	<td
																		style={{
																			color: 'black',
																			width: '52%',
																			padding: '5px',
																		}}>
																		01 apple cable
																		<label
																			style={{
																				fontSize: '10px',
																			}}>
																			No warranty
																		</label>
																	</td>
																	<td
																		style={{
																			color: 'black',
																			width: '20%',
																			textAlign: 'right',
																			padding: '5px',
																			paddingRight: '20px',
																		}}>
																		{500.00}
																	</td>
																	<td
																		style={{
																			color: 'black',
																			width: '8%',
																			textAlign: 'right',
																			padding: '5px',
																		}}>
																		{5}
																	</td>
																	<td
																		style={{
																			color: 'black',
																			width: '20%',
																			textAlign: 'right',
																			padding: '5px',
																		}}>
																		{2500.00}
																	</td>
																</tr>
															</tbody>
														</table>
												
												<div
													style={{
														position: 'absolute',
														top: '100mm',
														left: '0',
														width: '100%',
														padding: '0 20px',
													}}>
													<span
														className='position-absolute  start-55'
														style={{
															marginTop: '0px',
															display: 'block',
															width: 190,
															borderTop: '1px solid black',
															color: 'black',
														}}></span>
													<div
														className='position-relative me-4'
														style={{ color: 'black' }}>
														<div className='position-absolute start-60'>
															Total
														</div>
														<div className='position-absolute top-0 end-5'>
															2500.00
														</div>
													</div>
													<br />
													<span
														className='position-absolute  start-55'
														style={{
															marginTop: '0px',
															display: 'block',
															width: 190,
															borderTop: '1px solid black',
															color: 'black',
														}}></span>
													<div
														className='position-relative me-4'
														style={{ color: 'black' }}>
														<div className='position-absolute top-0 start-60'>
															Discount
														</div>
														<div className='position-absolute top-0 end-5'>
															100.00
														</div>
													</div>
													<br />
													<span
														className='position-absolute  start-55'
														style={{
															marginTop: '0px',
															display: 'block',
															width: 190,
															borderTop: '1px solid black',
															color: 'black',
														}}></span>
													<div
														className='position-relative me-4'
														style={{ color: 'black' }}>
														<div
															className='position-absolute top-0 start-60 fw-bold'
															style={{ fontSize: '14px' }}>
															SUB TOTAL
														</div>
														<div
															className='position-absolute top-0 end-5 fw-bold'
															style={{ fontSize: '14px' }}>
															2400.00
														</div>
													</div>
													<br />
													<span
														className='position-absolute  start-55'
														style={{
															marginTop: '0px',
															display: 'block',
															width: 190,
															borderTop: '1px solid black',
															color: 'black',
														}}></span>
													<div
														style={{
															textAlign: 'center',
															fontSize: '12px',
															color: 'black',
															marginTop: '3px',
														}}>
														...........................Thank You ...
														Come Again...........................
													</div>
													<div
														style={{
															textAlign: 'right',
															fontSize: '10px',
															color: 'black',
														}}>
														System by EXE.LK +94 70 332 9900
													</div>
												</div>
											</div>
								
									</div>
								</div>
							</CardBody>
						</Card>
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
