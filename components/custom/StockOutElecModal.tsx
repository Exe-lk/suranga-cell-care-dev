import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import {
	useAddStockOutMutation,
	useGetSubStockInOutsQuery,
} from '../../redux/slices/stockInOutDissApiSlice';
import { useGetStockInOutsQuery } from '../../redux/slices/stockInOutDissApiSlice';
import { useGetItemDisByIdQuery } from '../../redux/slices/itemManagementDisApiSlice';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import Swal from 'sweetalert2';
import Checks, { ChecksGroup } from '../bootstrap/forms/Checks';
import { useGetTechniciansQuery } from '../../redux/slices/technicianManagementApiSlice';
import {
	useUpdateStockInOutMutation,
	useUpdateSubStockInOutMutation,
} from '../../redux/slices/stockInOutDissApiSlice';
import { useGetItemDissQuery } from '../../redux/slices/itemManagementDisApiSlice';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { default as BootstrapSelect } from '../bootstrap/forms/Select';
import Option, { Options } from '../bootstrap/Option';
import { arrayUnion, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import { supabase } from '../../lib/supabase';
interface StockAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
	quantity: any;
}

const formatTimestamp = (seconds: number, nanoseconds: number): string => {
	const date = new Date(seconds * 1000);
	const formattedDate = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		hour12: true,
		timeZoneName: 'short',
	}).format(date);
	return formattedDate;
};

interface StockOut {
	cid: string;
	model: string;
	brand: string;
	category: string;
	quantity: string;
	date: string;
	description: string;
	technicianNum: string;
	dateIn: string;
	cost: string;
	code: string;
	sellingPrice: string;
	branchNum: string;
	sellerName: string;
	stock: string;
	status: boolean;
}

const StockAddModal: FC<StockAddModalProps> = ({ id, isOpen, setIsOpen, quantity }) => {
	const [selectedOption, setSelectedOption] = useState<'Technician' | 'Return' | 'Branch' | ''>(
		'',
	);
	const [stockOut, setStockOut] = useState<StockOut>({
		cid: '',
		model: '',
		brand: '',
		category: '',
		quantity: '',
		date: '',
		description: '',
		technicianNum: '',
		dateIn: '',
		cost: '',
		sellingPrice: '',
		branchNum: '',
		sellerName: '',
		code: '',
		stock: 'stockOut',
		status: true,
	});
	const [selectedCost, setSelectedCost] = useState<string | null>(null);
	const [selecteditems, setSelecteditems] = useState<any>([]);
	const {
		data: technicians,
		isLoading: techniciansLoading,
		isError: techniciansError,
	} = useGetTechniciansQuery(undefined);
	const { data: stockInData } = useGetStockInOutsQuery(undefined);
	// const { data: substockInData } = useGetSubStockInOutsQuery(undefined);
	const [substockInData, setSubstockInData] = useState<any>([]);
	const [addstockOut] = useAddStockOutMutation();
	const { data: stockOutData, isSuccess } = useGetItemDisByIdQuery(id);
	const [updateStockInOut] = useUpdateStockInOutMutation();
	const [updateSubStockInOut] = useUpdateSubStockInOutMutation();
	const { refetch } = useGetItemDissQuery(undefined);
	const animatedComponents = makeAnimated();
	const [StockInOuts, setStockInOuts] = useState<string[]>([]);

	// const getsubstock = async () => {
	// 	const q = query(
	// 		collection(firestore, 'Stock'),
	// 		where('status', '==', true),
	// 		where('stock', '==', 'stockIn'),
	// 		where('barcodePrefix', '==', stockOutData?.code),
	// 	);

	// 	const querySnapshot = await getDocs(q);
	// 	const firebaseData = await querySnapshot.docs.map((doc) => {
	// 		const data = doc.data() as any;
	// 		return {
	// 			...data,
	// 			id: doc.id,
	// 			subStock: [{}],
	// 		};
	// 	});

	// 	let allSubStockData: any[] = [];
	// 	for (const stockDoc of firebaseData) {
	// 		const stockDocId = stockDoc.id;
	// 		const subStockCollectionRef = collection(firestore, 'Stock', stockDocId, 'subStock');
	// 		const subStockSnapshot = await getDocs(subStockCollectionRef);
	// 		const subStockData = subStockSnapshot.docs.map((subDoc) => ({
	// 			id: subDoc.id,
	// 			parentStockId: stockDocId,
	// 			...subDoc.data(),
	// 		}));
	// 		allSubStockData = allSubStockData.concat(subStockData);
	// 	}
	// 	setSubstockInData(allSubStockData);
	// };
 // adjust path if needed

	const getsubstock = async () => {
		try {
			console.log(stockOutData)
			// Step 1: Fetch matching stocks
			const { data: stocks, error: stockError } = await supabase
				.from('Stock')
				.select('barcode') // we only need id
				.eq('stock', 'stockIn')
				.eq('barcodePrefix', stockOutData?.code);
	
			if (stockError) {
				throw stockError;
			}
			console.log(stocks)
			if (!stocks || stocks.length === 0) {
				setSubstockInData([]);
				return;
			}

			// Step 2: Fetch substock for all matched stocks
			const stockIds = stocks.map((stock) => stock.barcode);
	console.log(stockIds)
			const { data: subStocks, error: subStockError } = await supabase
				.from('subStock')
				.select('*')
				.in('stock_id', stockIds);
	
			if (subStockError) {
				throw subStockError;
			}
console.log(subStocks)
			setSubstockInData(subStocks || []);
		} catch (error) {
			console.error('Error fetching substock data:', error);
		}
	};
	
	const stockInQuantity = quantity;
	const closeModal = () => {
		setIsOpen(false);
		formik.resetForm();
		setSelectedOption('');
		setSelecteditems([]);
		setSelectedCost(null);
	};

	const formik = useFormik({
		initialValues: {
			brand: stockOut.brand,
			model: stockOut.model,
			category: stockOut.category,
			quantity: '',
			date: '',
			description: '',
			technicianNum: '',
			dateIn: '',
			cost: '',
			// sellingPrice: '',
			branchNum: '',
			sellerName: '',
			stock: 'stockOut',
			status: true,
			substockInData: '',
			sellectedItem: '',
			billNumber: '',
			code: stockOut.code,
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: any = {};
			if (!values.date) {
				errors.date = 'Date Out is required.';
			}

			if (!values.description) {
				errors.description = 'Description is required.';
			}
			if (selectedOption === 'Technician' && !values.technicianNum) {
				errors.technicianNum = 'Technician Number is required for this option.';
			}
			// if (selectedOption === 'Technician' && !values.billNumber) {
			// 	errors.billNumber = 'Technician Number is required for this option.';
			// }

			if (selectedOption === 'Return' && !values.sellerName) {
				errors.sellerName = 'Supplier Name is required for this option.';
			}

			if (
				selectedOption === 'Branch' &&
				(!values.branchNum || isNaN(Number(values.branchNum)))
			) {
				errors.branchNum = 'Branch Number must be a valid number for this option.';
			}

			return errors;
		},
		onSubmit: async (values) => {
			try {
				Swal.fire({
					title: 'Processing...',
					html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
					allowOutsideClick: false,
					showCancelButton: false,
					showConfirmButton: false,
				});
				await refetch();
				values.quantity = selecteditems.length;
				values.sellectedItem = selecteditems;
				
				// Ensure the code field is set properly from stockOutData
				if (stockOutData?.code) {
					values.code = stockOutData.code;
				}
				
				const stockOutQuantity = values.quantity ? parseInt(values.quantity) : 0;
				if (isNaN(stockInQuantity) || isNaN(stockOutQuantity)) {
					Swal.fire({
						icon: 'error',
						title: 'Invalid Quantity',
						text: 'Quantity must be a valid number.',
					});
					return;
				}
				const updatedQuantity = stockInQuantity - stockOutQuantity;
				if (updatedQuantity <= -1) {
					Swal.fire({
						icon: 'error',
						title: 'Insufficient Stock',
						text: 'The stock out quantity exceeds available stock.',
					});
					return;
				}

				await addstockOut(values).unwrap();
				
				await updateStockInOut({ id, quantity: updatedQuantity }).unwrap();
				selecteditems.map(async (val: any) => {
					console.log(val)
					const id = val.value.split('-')[0];
					const subid = val.label;
					const values = {
						status: true,
					};

					await updateSubStockInOut({ id, subid, values }).unwrap();
				
				});

				// if(values.billNumber!=""){
				// 	const data = {
				// 		stock: {
				// 		  item: selecteditems,
				// 		  stockid: id,
				// 		  category: values.category,
				// 		  model: values.model,
				// 		  brand: values.brand,
				// 		  quantity:values.quantity
				// 		}
				// 	  };
					  
				// 	  const billRef = doc(firestore, 'bill', values.billNumber);
					  
				// 	  // Use arrayUnion to add the new stock object to the 'stock' array in Firestore
				// 	  await updateDoc(billRef, {
				// 		stock: arrayUnion(data.stock)
				// 	  });
				// }
				
				refetch();
				await Swal.fire({ icon: 'success', title: 'Stock Out Created Successfully' });
				// formik.resetForm();
				// setIsOpen(false);

				closeModal();
			} catch (error) {
				await Swal.fire({
					icon: 'error',
					title: 'Error',
					text: 'Failed to process the stock. Please try again.',
				});
			}
		},
	});

	const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSelectedOption(e.target.value as 'Technician' | 'Return' | 'Branch');
	};

	const formatMobileNumber = (value: string) => {
		let sanitized = value.replace(/\D/g, '');
		if (!sanitized.startsWith('0')) sanitized = '0' + sanitized;
		return sanitized.slice(0, 10);
	};

	useEffect(() => {
		if (isSuccess && stockOutData) {
			setStockOut(stockOutData);
		}
	}, [isSuccess, stockOutData]);

	function onSelectMachineModel(e: any) {
		setSelecteditems(e);
		formik.values.quantity = selecteditems.length;
	}

	return (
		<Modal isOpen={isOpen} aria-hidden={!isOpen} setIsOpen={closeModal} size='xl' titleId={id}>
			<ModalHeader setIsOpen={closeModal} className='p-4'>
				<ModalTitle id=''>{'Stock Out'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='model' label='Model' className='col-md-6'>
						<Input type='text' value={formik.values.model} readOnly />
					</FormGroup>
					<FormGroup id='brand' label='Brand' className='col-md-6'>
						<Input type='text' value={formik.values.brand} readOnly />
					</FormGroup>
					<FormGroup id='category' label='Category' className='col-md-6'>
						<Input type='text' value={formik.values.category} readOnly />
					</FormGroup>
					<FormGroup id='quantity' label='Quantity' className='col-md-6'>
						<Input
							type='number'
							placeholder='Enter Quantity'
							value={selecteditems?.length}
							// value={formik.values.quantity}
							disabled
							// onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							name='quantity'
							isValid={!!formik.errors.quantity && formik.touched.quantity}
						/>
					</FormGroup>
					<FormGroup
						id='substockInData'
						label='Select items'
						onClick={getsubstock}
						className='col-md-6'>
						<br />

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
									primary: 'white', // Selected option color
									neutral0: '#212529', // Background color for the dropdown (dark background)
									neutral5: '#343A40', // Border color (dark theme)
									neutral10: '#343A40', // Focused border color
									neutral20: '#666', // Placeholder color
									neutral30: '#ddd', // Text color for normal state
									neutral50: '#fff', // Text color for hovered options
									neutral80: '#fff', // Text color for selected options
								},
							})}
							onChange={(e) => onSelectMachineModel(e)}
							options={
								substockInData
									? substockInData
											.filter(
												(item: any) =>
													item.barcode?.startsWith(stockOut.code),
											)
											.filter((item: any) => item.status == false)
											.map((item: any, index: any) => ({
												value: `${item.id}-${index}`,
												label: item.barcode,
											}))
									: [{ value: '', label: 'No Data' }]
							}
						/>
					</FormGroup>

					<FormGroup id='date' label='Date Out' className='col-md-6'>
						<Input
							type='date'
							placeholder='Enter Date'
							value={formik.values.date}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							name='date'
							isValid={!!formik.errors.date && formik.touched.date}
							max={new Date().toISOString().split('T')[0]}
						/>
					</FormGroup>

					<FormGroup id='description' label='Description' className='col-md-6'>
						<Input
							type='text'
							placeholder='Enter Description'
							value={formik.values.description}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							name='description'
							isValid={!!formik.errors.description && formik.touched.description}
						/>
					</FormGroup>

					<FormGroup id='StockOutSelect' className='col-md-12'>
						<ChecksGroup isInline>
							<Checks
								type='radio'
								id='technician'
								label='Technician'
								name='stockOutType'
								value='Technician'
								onChange={handleOptionChange}
								checked={selectedOption}
							/>
							<Checks
								type='radio'
								id='return'
								label='Return'
								name='stockOutType'
								value='Return'
								onChange={handleOptionChange}
								checked={selectedOption}
							/>
							<Checks
								type='radio'
								id='branch'
								label='Branch'
								name='stockOutType'
								value='Branch'
								onChange={handleOptionChange}
								checked={selectedOption}
							/>
						</ChecksGroup>
					</FormGroup>

					{selectedOption === 'Technician' && (
						<>
							{' '}
							<FormGroup
								id='technicianNum'
								label='Technician Number'
								className='col-md-6'>
								<BootstrapSelect
									id='technicianNum'
									name='technicianNum'
									ariaLabel='technicianNum'
									onChange={formik.handleChange}
									value={formik.values.technicianNum}
									onBlur={formik.handleBlur}
									className={`form-control ${
										formik.touched.technicianNum && formik.errors.technicianNum
											? 'is-invalid'
											: ''
									}`}>
									<option value=''>Select a technician number</option>
									{techniciansLoading && <option>Loading technicians...</option>}
									{techniciansError && (
										<option>Error fetching technicians</option>
									)}
									{technicians?.map(
										(technicianNum: { id: string; technicianNum: string }) => (
											<option
												key={technicianNum.id}
												value={technicianNum.technicianNum}>
												{' '}
												{technicianNum.technicianNum}
											</option>
										),
									)}
								</BootstrapSelect>
								{formik.touched.category && formik.errors.category ? (
									<div className='invalid-feedback'>{formik.errors.category}</div>
								) : (
									<></>
								)}
							</FormGroup>
							{/* <FormGroup id='billNumber' label='Bill Number' className='col-md-6'>
								<Input
									type='text'
									placeholder='Enter Bill Number'
									value={formik.values.billNumber}
									onChange={formik.handleChange}
									name='billNumber'
									isValid={
										!!formik.errors.billNumber && formik.touched.billNumber
									}
								/>
							</FormGroup> */}
						</>
					)}
					{selectedOption === 'Return' && (
						<FormGroup id='sellerName' label='Supplier Name' className='col-md-6'>
							<Input
								type='text'
								placeholder='Enter supplier Name'
								value={formik.values.sellerName}
								onChange={formik.handleChange}
								name='sellerName'
								isValid={!!formik.errors.sellerName && formik.touched.sellerName}
							/>
						</FormGroup>
					)}
					{selectedOption === 'Branch' && (
						<FormGroup id='branchNum' label='Branch Number' className='col-md-6'>
							<Input
								type='number'
								placeholder='Enter Branch Number'
								value={formik.values.branchNum}
								onChange={formik.handleChange}
								name='branchNum'
								isValid={!!formik.errors.branchNum && formik.touched.branchNum}
							/>
						</FormGroup>
					)}
				</div>
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				<Button color='success' onClick={formik.handleSubmit}>
					Stock Out
				</Button>
			</ModalFooter>
		</Modal>
	);
};
StockAddModal.propTypes = {
	id: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
};

export default StockAddModal;
