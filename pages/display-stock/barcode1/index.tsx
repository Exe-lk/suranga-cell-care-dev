import React, { useEffect, useRef, useState } from 'react';
import type { NextPage } from 'next';
import useDarkMode from '../../../hooks/useDarkMode';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import Card, { CardBody, CardTitle } from '../../../components/bootstrap/Card';
import Barcode from 'react-barcode';
import Swal from 'sweetalert2';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import { useGetStockInOutsQuery } from '../../../redux/slices/stockInOutDissApiSlice';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import ReactDOM from 'react-dom';


const Index: NextPage = () => {
	const animatedComponents = makeAnimated();
	const { data: StockInOuts, error, isLoading, refetch } = useGetStockInOutsQuery(undefined);
	const [searchTerm, setSearchTerm] = useState('');
	const [startDate, setStartDate] = useState<string>('');
	const [endDate, setEndDate] = useState<string>('');
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const [isBrowserPrintLoaded, setIsBrowserPrintLoaded] = useState(false);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(PER_COUNT['10000']);
	const [selectedDevice, setSelectedDevice] = useState<any>(null);
	const [devices, setDevices] = useState<any>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const [selectedBarcodes, setSelectedBarcodes] = useState<any[]>([]);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, [StockInOuts]);

	const filteredTransactions = StockInOuts?.filter((trans: any) => {
		const transactionDate = new Date(trans.date);
		const start = startDate ? new Date(startDate) : null;
		const end = endDate ? new Date(endDate) : null;
		if (start && end) {
			return transactionDate >= start && transactionDate <= end;
		} else if (start) {
			return transactionDate >= start;
		} else if (end) {
			return transactionDate <= end;
		}
		return true;
	});

	useEffect(() => {
		if (typeof window !== 'undefined' && (window as any).BrowserPrint) {
			setIsBrowserPrintLoaded(true);
		} else {
			console.error('BrowserPrint SDK is not loaded');
		}
	}, []);

	useEffect(() => {
		const setup = () => {
			(window as any).BrowserPrint.getDefaultDevice(
				'printer',
				(device: any) => {
					setSelectedDevice(device);
					setDevices((prevDevices: any) => [...prevDevices, device]);
					(window as any).BrowserPrint.getLocalDevices(
						(deviceList: any) => {
							const newDevices = deviceList.filter(
								(dev: any) => dev.uid !== device.uid,
							);
							setDevices((prevDevices: any) => [...prevDevices, ...newDevices]);
							const zebraDevice = newDevices.find(
								(dev: any) => dev.manufacturer === 'Zebra Technologies',
							);
							if (zebraDevice) {
								setSelectedDevice(zebraDevice);
							}
						},
						() => {
							// alert('Error getting local devices');
						},
						'printer',
					);
				},
				(error: any) => {
					// alert(error);
				},
			);
		};
		if (isBrowserPrintLoaded) setup(); // Ensure BrowserPrint is loaded
	}, [isBrowserPrintLoaded]);

	const printLabels1 = (
		price: string,
		itemCode: string,
		barCodeNo: string,
		itemName: string,
		labelQuantity: number,
		printLabels: number,
		subStock:any[]
	) => {
		// if (!selectedDevice) {
		// 	// alert('Please select a printer device.');
		// 	Swal.fire('Error', 'Please select a printer device', 'error');
		// 	return;
		// }
		console.log(subStock)
		Swal.fire({
			title: 'Bar Code Print!',
			html: `
			  <div>
			<label>Enter Quantity:</label>
				<input type="number" id="quantityInput" class="swal2-input" placeholder="Quantity" value=${
					labelQuantity - printLabels
				}>
			  </div>
			`,
			showCancelButton: true,
			confirmButtonText: 'Print',
			preConfirm: () => {
				const quantity = (document.getElementById('quantityInput') as HTMLInputElement)
					.value;
				if (!quantity) {
					Swal.showValidationMessage('Please enter the quantity');
				} else if (Number(quantity) > labelQuantity - printLabels) {
					Swal.showValidationMessage('Please enter the proper value');
				} else {
					return quantity;
				}
			},
		}).then((result) => {
			if (result.isConfirmed) {
				labelQuantity = result.value;

				// Calculating label rows and the remaining labels for the last row
				let labelRawsQuantity = Math.floor(labelQuantity / 3);
				let lastRawLabelQuantity = labelQuantity % 3;

				let zplString = `
		CT~~CD,~CC^~CT~
		~JA
		^XA
		~TA000
		~JSN
		^LT-16
		^MNW
		^MTT
		^PON
		^PMN
		^LH0,0
		^JMA
		^PR6,6
		~SD15
		^JUS
		^LRN
		^CI27
		^PA0,1,1,0
		^XZ
		`;

				// Loop through full rows of 3 labels each
				for (let i = 0; i < labelRawsQuantity; i++) {
					zplString += `
			^XA
			^MMT
			^PW815
			^LL200
			^LS2
			^FT83,86^A0N,28,33^FH\^CI28^FDRs ${price}^FS^CI27
			^BY2,3,52^FT43,145^BCN,,N,N
			^FH\^FD>;${barCodeNo}^FS
			^FT43,58^A0N,20,20^FH\^CI28^FD${itemName}^FS^CI27
			^FT43,170^A0N,20,20^FH\^CI28^FDItem Code : ${itemCode}^FS^CI27
	
			^FT347,86^A0N,28,33^FH\^CI28^FDRs ${price}^FS^CI27
			^BY2,3,52^FT307,145^BCN,,N,N
			^FH\^FD>;${barCodeNo}^FS
			^FT307,58^A0N,20,20^FH\^CI28^FD${itemName}^FS^CI27
			^FT307,170^A0N,20,20^FH\^CI28^FDItem Code : ${itemCode}^FS^CI27
	
			^FT610,86^A0N,28,33^FH\^CI28^FDRs ${price}^FS^CI27
			^BY2,3,52^FT570,145^BCN,,N,N
			^FH\^FD>;${barCodeNo}^FS
			^FT570,58^A0N,20,20^FH\^CI28^FD${itemName}^FS^CI27
			^FT570,170^A0N,20,20^FH\^CI28^FDItem Code : ${itemCode}^FS^CI27
			^PQ1,0,1,Y
			^XZ
			`;
				}

				// Handle the remaining labels for the last row
				if (lastRawLabelQuantity > 0) {
					zplString += `^XA ^MMT ^PW815 ^LL200 ^LS2`;

					// First label in the last row
					zplString += `
			^FT83,86^A0N,28,33^FH\^CI28^FDRs ${price}^FS^CI27
			^BY2,3,52^FT43,145^BCN,,N,N
			^FH\^FD>;${barCodeNo}^FS
			^FT43,58^A0N,20,20^FH\^CI28^FD${itemName}^FS^CI27
			^FT43,170^A0N,20,20^FH\^CI28^FDItem Code : ${itemCode}^FS^CI27
			`;

					// Second label in the last row, if available
					if (lastRawLabelQuantity > 1) {
						zplString += `
				^FT347,86^A0N,28,33^FH\^CI28^FDRs ${price}^FS^CI27
				^BY2,3,52^FT307,145^BCN,,N,N
				^FH\^FD>;${barCodeNo}^FS
				^FT307,58^A0N,20,20^FH\^CI28^FD${itemName}^FS^CI27
				^FT307,170^A0N,20,20^FH\^CI28^FDItem Code : ${itemCode}^FS^CI27
				`;
					}

					// Third label in the last row, if available
					if (lastRawLabelQuantity > 2) {
						zplString += `
				^FT610,86^A0N,28,33^FH\^CI28^FDRs ${price}^FS^CI27
				^BY2,3,52^FT570,145^BCN,,N,N
				^FH\^FD>;${barCodeNo}^FS
				^FT570,58^A0N,20,20^FH\^CI28^FD${itemName}^FS^CI27
				^FT570,170^A0N,20,20^FH\^CI28^FDItem Code : ${itemCode}^FS^CI27
				`;
					}

					zplString += `^PQ1,0,1,Y ^XZ`;
				}

				// Send ZPL string to the selected device
				selectedDevice.send(zplString, undefined, errorCallback);
			}
		});
	};


	const printLabels = (
		price: string,
		itemCode: string,
		barCodeNo: string,
		itemName: string,
		labelQuantity: number,
		printLabels: number,
		subStock: any[]
	  ) => {
		
	  
		Swal.fire({
		  title: 'Bar Code Print!',
		  html: `
			<div>
			  <label style="display: block; margin-bottom: 5px;">Select Barcodes:</label>
			  <div id="select-container"></div>
			  
			</div>
		  `,
		  didOpen: () => {
			const container = document.getElementById('select-container');
			if (container) {
			  const dropdown = (
				<Select
				  closeMenuOnSelect={false}
				  components={animatedComponents}
				  isMulti
				  theme={(theme) => ({
					...theme,
					borderRadius: 4,
					colors: {
					  ...theme.colors,
					  primary25: '#4D69FA', // Hovered option background color
					  primary: '#ffffff', // Selected option text color
					  neutral0: '#212529', // Background color for the dropdown
					  neutral30: '#ddd', // Placeholder text color
					},
				  })}
				  onChange={(selected:any) => setSelectedBarcodes(selected)}
				  options={
					subStock.length > 0
					  ? subStock.map((item, index) => ({
						  value: item.barcode,
						  label: `${item.barcode}`,
						}))
					  : [{ value: '', label: 'No Data Available' }]
				  }
				/>
			  );
			  ReactDOM.render(dropdown, container);
			}
		  },
		  showCancelButton: true,
		  confirmButtonText: 'Print',
		  preConfirm: () => {
			const quantity = (document.getElementById('quantityInput') as HTMLInputElement).value;
	  
			if (!quantity) {
			  Swal.showValidationMessage('Please enter the quantity');
			  return false;
			} else if (Number(quantity) > labelQuantity - printLabels) {
			  Swal.showValidationMessage('Please enter the proper value');
			  return false;
			} else if (selectedBarcodes.length === 0) {
			  Swal.showValidationMessage('Please select at least one barcode');
			  return false;
			}
	  
			return { quantity, selectedBarcodes };
		  },
		}).then((result) => {
		  if (result.isConfirmed) {
			const { quantity, selectedBarcodes } = result.value;
	  
			console.log('Selected Barcodes:', selectedBarcodes.map((b: any) => b.value));
			console.log('Entered Quantity:', quantity);
	  
			// Use `selectedBarcodes` here to print the labels
			let zplString = `^XA\n`;
			selectedBarcodes.forEach((barcode: any) => {
			  zplString += `
				^FT83,86^A0N,28,33^FH\\^CI28^FDRs ${price}^FS^CI27
				^BY2,3,52^FT43,145^BCN,,N,N
				^FH\\^FD>;${barcode.value}^FS
				^FT43,58^A0N,20,20^FH\\^CI28^FD${itemName}^FS^CI27
				^FT43,170^A0N,20,20^FH\\^CI28^FDItem Code : ${itemCode}^FS^CI27
			  `;
			});
			zplString += `^XZ`;
	  
			console.log('Generated ZPL:', zplString);
			selectedDevice.send(zplString, undefined, errorCallback);
			// Replace `selectedDevice.send` with the actual call to send ZPL to the printer
			// selectedDevice.send(zplString, undefined, errorCallback);
		  }
		});
	  };







	// Error callback
	var errorCallback = function (errorMessage: any) {
		// alert('Error: ' + errorMessage);
	};

	return (
		<PageWrapper>
			<SubHeader>
				<SubHeaderLeft>
					<label
						className='border-0 bg-transparent cursor-pointer me-0'
						htmlFor='searchInput'>
						<Icon icon='Search' size='2x' color='primary' />
					</label>
					<Input
						id='searchInput'
						type='search'
						className='border-0 shadow-none bg-transparent'
						placeholder='Search...'
						onChange={(event: any) => setSearchTerm(event.target.value)}
						value={searchTerm}
						ref={inputRef}
					/>
				</SubHeaderLeft>
			</SubHeader>
			<Page>
				<div className='row h-100'>
					<div className='col-12'>
						<Card stretch>
							<CardTitle className='d-flex justify-content-between align-items-center m-4'>
								<div className='flex-grow-1 text-center text-info'>
									Barcode Print
								</div>
							</CardTitle>
							<CardBody isScrollable className='table-responsive'>
								<table className='table table-modern table-bordered border-primary table-hover'>
									<thead>
										<tr>
											<th>Date</th>
											<th>Item Code</th>
											<th>Item Name</th>
											<th>Quantity</th>
											<th>Print Lable</th>

											<th>
												Select Printer
												<br />
												<select
													id='selected_device'
													onChange={(e) =>
														setSelectedDevice(
															devices.find(
																(device: any) =>
																	device.uid === e.target.value,
															),
														)
													}>
													{devices.map((device: any, index: any) => (
														<option key={index} value={device.uid}>
															{device.manufacturer ||
																device.model ||
																device.uid}
														</option>
													))}
												</select>
											</th>
										</tr>
									</thead>
									<tbody>
										{isLoading && (
											<tr>
												<td>Loading...</td>
											</tr>
										)}
										{error && (
											<tr>
												<td>Error fetching stocks.</td>
											</tr>
										)}
										{filteredTransactions &&
											dataPagination(
												filteredTransactions,
												currentPage,
												perPage,
											)
												.filter(
													(StockInOut: any) => StockInOut.status === true,
												)
												.filter((brand: any) => {
													if (
														brand.barcode
															?.toString()
															.includes(searchTerm)
													) {
														return brand;
													}
												})
												.filter((brand: any) =>
													selectedUsers.length > 0
														? selectedUsers.includes(brand.stock)
														: true,
												)
												.filter(
													(stockInOut: any) =>
														stockInOut.stock === 'stockIn',
												)

												.map((brand: any) => (
													<tr key={brand.id}>
														<td>{brand.date}</td>
														<td>{brand.code}</td>
														<td>
															{brand.brand} {brand.category}{' '}
															{brand.model}
														</td>

														<td>{brand.quantity}</td>
														<td>{brand.printlable}</td>

														{/* <td>
															<Barcode
																value={brand.barcode}
																width={1}
																height={30}
																fontSize={16}
															/>
														</td> */}
														<td>
															<Button
																icon='Print'
																color='info'
																onClick={() =>
																	printLabels(
																		'--',
																		brand.code,
																		brand.barcode,
																		brand.brand +
																			' ' +
																			brand.model,
																		brand.quantity,
																		brand.printlable,
																		brand.subStock

																	)
																}>
																Print
															</Button>
														</td>
													</tr>
												))}
									</tbody>
								</table>
							</CardBody>
							<PaginationButtons
								data={filteredTransactions}
								label='parts'
								setCurrentPage={setCurrentPage}
								currentPage={currentPage}
								perPage={perPage}
								setPerPage={setPerPage}
							/>
						</Card>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default Index;
