import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import Swal from 'sweetalert2';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import { useAddStockInMutation } from '../../redux/slices/stockInOutAcceApiSlice';
import { useGetItemAcceByIdQuery } from '../../redux/slices/itemManagementAcceApiSlice';
import { useGetItemAccesQuery } from '../../redux/slices/itemManagementAcceApiSlice';
import { useUpdateStockInOutMutation } from '../../redux/slices/stockInOutAcceApiSlice';
import { useGetStockInOutsQuery } from '../../redux/slices/stockInOutAcceApiSlice';
import { useGetSuppliersQuery } from '../../redux/slices/supplierApiSlice';
import { useGetDealersQuery } from '../../redux/slices/delearApiSlice';
import { useUpdateItemAcceMutation } from '../../redux/slices/itemManagementAcceApiSlice';
import Select from '../bootstrap/forms/Select';
import { supabase } from '../../lib/supabase';

interface StockAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
	quantity: any;
	refetch: () => void;
}

interface StockIn {
	barcode: number;
	id: string;
	brand: string;
	model: string;
	category: string;
	type: string;
	quantity: string;
	date: string;
	storage: string;
	name: string;
	nic: string;
	mobile: string;
	mobileType: string;
	cost: string;
	code: string;
	stock: string;
	status: boolean;
	sellingPrice: Number;
	imi: string;
}

const StockAddModal: FC<StockAddModalProps> = ({ id, isOpen, setIsOpen, quantity, refetch }) => {
	const [stockIn, setStockIn] = useState<StockIn>({
		id: '',
		brand: '',
		model: '',
		category: '',
		type: '',
		quantity: '',
		date: '',
		storage: '',
		name: '',
		nic: '',
		mobile: '',
		mobileType: '',
		cost: '',
		code: '',
		stock: 'stockIn',
		status: true,
		sellingPrice: 0,
		barcode: 0,
		imi: '',
	});
	const {
		data: suppliers,
		isLoading: supplierLoading,
		isError,
	} = useGetSuppliersQuery(undefined);
	const { data: stockInData, isSuccess } = useGetItemAcceByIdQuery(id);
	const [addstockIn, { isLoading }] = useAddStockInMutation();
	const [updateStockInOut] = useUpdateStockInOutMutation();
	const [updateItemAcce] = useUpdateItemAcceMutation();
	const { data: stockInOuts } = useGetStockInOutsQuery(undefined);
	const [generatedCode, setGeneratedCode] = useState('');
	const [generatedbarcode, setGeneratedBarcode] = useState<any>();
	const [stockInCode, setStockInCode] = useState(''); // New state for 6-digit stock-in code
	const nowQuantity = quantity;
	const [imageurl, setImageurl] = useState<any>(null);
	const { data: dealers } = useGetDealersQuery(undefined);
	const { refetch: refetchItemData } = useGetItemAcceByIdQuery(id);

	// Function to generate 6-digit stock-in code sequentially
	const generateStockInCode = (existingStockInOuts: any[]) => {
		if (!existingStockInOuts || existingStockInOuts.length === 0) {
			return 100000; // Start from 100000 if no existing records
		}

		// Find the highest 6-digit code from existing stock-in records
		const existingCodes = existingStockInOuts
			.filter((item: any) => item.stock === 'stockIn' && item.code)
			.map((item: any) => {
				const code = item.code?.toString() || '';
				// Extract numeric part - handle both pure numbers and codes with prefixes
				const numericMatch = code.match(/\d+$/);
				return numericMatch ? parseInt(numericMatch[0], 10) : 0;
			})
			.filter((code: number) => code >= 100000 && code <= 999999); // Only consider 6-digit codes

		if (existingCodes.length === 0) {
			return 100000; // Start from 100000 if no valid 6-digit codes found
		}

		const maxCode = Math.max(...existingCodes);
		const nextCode = maxCode + 1;
		
		// Ensure it's a 6-digit number
		if (nextCode > 999999) {
			throw new Error('Maximum 6-digit code reached (999999)');
		}
		
		return nextCode;
	};

	useEffect(() => {
		console.log("=== BARCODE GENERATION DEBUG START ===");
		console.log("isSuccess:", isSuccess);
		console.log("stockInData:", stockInData);
		console.log("stockInData.code:", stockInData?.code);
		
		if (isSuccess && stockInData) {
			setStockIn(stockInData);
			// Use the item's existing code column value for item code
			setGeneratedCode(stockInData.code);
			// Generate a new sequential 6-digit code for stock-in
			const newStockInCode = generateStockInCode(stockInOuts || []);
			setStockInCode(newStockInCode.toString());
			console.log("Using item's code from database:", stockInData.code);
			console.log("Generated sequential 6-digit stock-in code:", newStockInCode);
		}
		
		console.log("=== BARCODE GENERATION DEBUG END ===");
	}, [isSuccess, stockInData, isOpen, stockInOuts]);

	const handleUploadimage = async () => {
		if (imageurl) {
			// Showing upload progress
			Swal.fire({
				title: 'Uploading NIC image...',
				html: 'Please wait while your image is being uploaded.<br><div class="spinner-border" role="status"></div>',
				allowOutsideClick: false,
				showCancelButton: false,
				showConfirmButton: false,
			});
			
			try {
				const pdfFile = imageurl;
				console.log("Uploading image:", pdfFile.name);
				
				// Generate unique filename with timestamp
				const fileName = `${pdfFile.name}_${Date.now()}`;
				const filePath = `nic/${fileName}`;
				
				// Upload to Supabase Storage
				const { data, error } = await supabase.storage
					.from('nics') // Using the 'nics' bucket
					.upload(filePath, pdfFile);

				if (error) {
					console.error("Upload error:", error.message);
					throw new Error(error.message);
				}

				// Get public URL
				const { data: urlData } = supabase.storage
					.from('nics')
					.getPublicUrl(filePath);

				const publicUrl = urlData.publicUrl;
				console.log('File uploaded successfully. URL:', publicUrl);
				return publicUrl;
				
			} catch (error: any) {
				console.error("Upload failed:", error.message);
				throw error;
			}
		} else {
			return '';
		}
	};
	const formik = useFormik({
		initialValues: {
			brand: stockIn.brand || '',
			model: stockIn.model || '',
			category: stockIn.category || '',
			type: stockIn.type || '',
			quantity: '',
			date: '',
			storage: '',
			ShopName: '',
			dealerName: '',
			mobile: '',
			mobileType: stockIn.mobileType || '',
			cost: '',
			name: '',
			nic: '',
			code: generatedCode,
			stock: 'stockIn',
			status: true,
			sellingPrice: 0,
			barcode: '',
			imi: '',
			cid: stockIn.id || '',
			suppName: '',
			description: '',
			DorC: '',
			NIC_Photo: '',
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: Record<string, string> = {};
			if (values.type === 'Accessory') {
				if (!values.quantity) {
					errors.quantity = 'Quantity is required';
				} else if (parseInt(values.quantity) <= 0) {
					errors.quantity = 'Quantity must be a positive number';
				}
			}
			if (!values.sellingPrice) {
				errors.sellingPrice = 'Selling Price is required';
			} else if (parseInt(values.sellingPrice.toString()) <= 0) {
				errors.sellingPrice = 'Selling Price must be a positive number';
			}
			if (!values.cost) {
				errors.cost = 'Cost is required';
			} else if (parseInt(values.cost) <= 0) {
				errors.cost = 'Cost must be a positive number';
			}
			// if (!values.suppName) {
			// 	errors.suppName = 'Cost is required';
			// }
			if (!values.date) {
				errors.date = 'Date In is required';
			}
			if (values.type === 'Mobile') {
				if (!values.storage) {
					errors.storage = 'Storage is required';
				}
				if (values.DorC === 'Deler') {
					// if (!values.ShopName) {
					// 	errors.ShopName = 'Name is required';
					// }
					if (!values.dealerName) {
						errors.dealerName = 'NIC is required';
					}
					if (!values.mobile) {
						errors.mobile = 'Mobile Number is required';
					} else if (values.mobile.length !== 10) {
						errors.mobile = 'Mobile number must be exactly 10 digits';
					}
				}
				if (values.DorC === 'Customer') {
					if (!values.nic) {
						errors.nic = 'Required';
					} else if (!/^\d{9}[Vv]$/.test(values.nic) && !/^\d{12}$/.test(values.nic)) {
						errors.nic = 'NIC must be 9 digits followed by "V" or 12 digits';
					}
					if (!values.name) {
						errors.name = 'NIC is required';
					}
					if (!values.mobile) {
						errors.mobile = 'Mobile Number is required';
					} else if (values.mobile.length !== 10) {
						errors.mobile = 'Mobile number must be exactly 10 digits';
					}
				}
			}
			if (values.type === 'Mobile' && !values.imi) errors.imi = 'Imi is required';
			if (!values.cost) {
				errors.cost = 'Cost is required';
			}
			return errors;
		},
		onSubmit: async (values) => {
			try {
				console.log("=== FORM SUBMISSION DEBUG START ===");
				console.log("Generated barcode value:", generatedbarcode);
				console.log("Form values barcode:", values.barcode);
				console.log("All form values:", values);
				
				// Show processing modal
				Swal.fire({
					title: 'Processing...',
					html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
					allowOutsideClick: false,
					showCancelButton: false,
					showConfirmButton: false,
				});
				
				// 1. Upload image if provided
				let url = '';
				try {
					if (imageurl) {
						console.log("Starting image upload");
						url = (await handleUploadimage()) as string;
						console.log("Image upload completed:", url);
					}
				} catch (uploadError) {
					console.error("Image upload failed:", uploadError);
					Swal.fire({
						icon: 'error',
						title: 'Image Upload Failed',
						text: `Could not upload the NIC image: ${uploadError}`,
					});
					return; // Stop the submission process
				}
				
				// 2. Prepare data for API - Use the 6-digit stock-in code and include item ID
				const submissionData = {
					...values,
					code: stockInCode, // Use the 6-digit stock-in code instead of item code
					barcode: `${generatedCode}${stockInCode}`, // Use 4-digit item code + 6-digit stock-in code
					NIC_Photo: url,
					cid: stockIn.id, // Pass the item ID so the backend can update the quantity
				};
				
				console.log("=== SUBMISSION WITH 6-DIGIT CODE ===");
				console.log("6-digit stock-in code:", stockInCode);
				console.log("Item's original code (4 digits):", generatedCode);
				console.log("Generated barcode (4+6 digits):", submissionData.barcode);
				console.log("Item ID for quantity update:", stockIn.id);
				
				try {
					// 3. Add the stock-in record - the backend will handle quantity update
					console.log("Sending to API:", submissionData);
					const response = await addstockIn(submissionData).unwrap();
					console.log("=== API RESPONSE ===");
					console.log("Stock in response:", response);
					
					console.log("=== FINAL BARCODE GENERATION ===");
					console.log("Stockin ID:", response);
					console.log("6-digit Stock-in Code:", stockInCode);
					console.log("Final barcode:", submissionData.barcode);
					
					// 4. Refresh data and show success
					await refetch();
					await refetchItemData(); // Ensure we get the latest item data
					await Swal.fire({
						icon: 'success',
						title: 'Stock In Added Successfully',
						text: `Barcode: ${submissionData.barcode}`,
					});
					formik.resetForm();
					setIsOpen(false);
					console.log("=== FORM SUBMISSION DEBUG END ===");
				} catch (apiError: any) {
					// Handle API errors
					console.error('=== API ERROR ===');
					console.error('Error during stock in API call:', apiError);
					console.error('API error details:', apiError.data);
					await Swal.fire({
						icon: 'error',
						title: 'Error',
						text: apiError.data?.error || 'Failed to add stock in. Please try again.',
					});
				}
			} catch (error) {
				// Handle any other errors
				console.error('=== UNEXPECTED ERROR ===');
				console.error('Unexpected error during stock in:', error);
				await Swal.fire({
					icon: 'error',
					title: 'Error',
					text: 'An unexpected error occurred. Please try again.',
				});
			}
		},
	});

	const formatMobileNumber = (value: string) => {
		let sanitized = value.replace(/\D/g, '');
		if (!sanitized.startsWith('0')) sanitized = '0' + sanitized;
		return sanitized.slice(0, 10);
	};

	return (
		<Modal isOpen={isOpen} aria-hidden={!isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader
				setIsOpen={() => {
					setIsOpen(false);
					formik.resetForm();
				}}
				className='p-4'>
				<ModalTitle id=''>{'Stock In'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4'>
					<FormGroup id='code' label='Stock-In Code (6 digits)' className='col-md-6'>
						<Input
							type='text'
							value={stockInCode || 'Generating...'}
							readOnly
							isValid={formik.isValid}
							isTouched={formik.touched.code}
						/>
					</FormGroup>
					<FormGroup id='itemCode' label='Item Code' className='col-md-6'>
						<Input
							type='text'
							value={generatedCode || 'Loading...'}
							readOnly
							isValid={formik.isValid}
							isTouched={formik.touched.code}
						/>
					</FormGroup>
					<FormGroup id='brand' label='Brand' className='col-md-6'>
						<Input
							type='text'
							value={formik.values.brand}
							readOnly
							isValid={formik.isValid}
							isTouched={formik.touched.brand}
						/>
					</FormGroup>
					<FormGroup id='model' label='Model' className='col-md-6'>
						<Input
							type='text'
							value={formik.values.model}
							readOnly
							isValid={formik.isValid}
							isTouched={formik.touched.model}
						/>
					</FormGroup>
					<FormGroup id='category' label='Category' className='col-md-6'>
						<Input
							type='text'
							value={formik.values.category}
							readOnly
							isValid={formik.isValid}
							isTouched={formik.touched.category}
						/>
					</FormGroup>
					<FormGroup id='type' label='Type' className='col-md-6'>
						<Input
							type='text'
							value={formik.values.type}
							readOnly
							isValid={formik.isValid}
							isTouched={formik.touched.type}
						/>
					</FormGroup>
					{formik.values.type === 'Mobile' && (
						<FormGroup id='mobileType' label='Mobile Type' className='col-md-6'>
							<Input
								type='text'
								value={formik.values.mobileType}
								readOnly
								isValid={formik.isValid}
								isTouched={formik.touched.mobileType}
							/>
						</FormGroup>
					)}
					{formik.values.mobileType === 'Used' && (
						<FormGroup id='DorC' label='Type' className='col-md-6'>
							<Select
								ariaLabel='Default select type'
								placeholder='Open this select type'
								onChange={formik.handleChange}
								value={formik.values.DorC}
								name='DorC'
								isValid={formik.isValid}
								isTouched={formik.touched.DorC}
								invalidFeedback={formik.errors.DorC}
								validFeedback='Looks good!'>
								<option value=''>Select the Type</option>
								<option value='Customer'>Customer</option>
								<option value='Deler'> dealer</option>
							</Select>
						</FormGroup>
					)}

					{formik.values.type === 'Mobile' && (
						<FormGroup id='imi' label='IMEI' className='col-md-6'>
							<Input
								type='text'
								onChange={formik.handleChange}
								value={formik.values.imi}
								name='imi'
								placeholder='Enter IMEI'
								isValid={formik.isValid}
								isTouched={formik.touched.imi}
								invalidFeedback={formik.errors.imi}
								validFeedback='Looks good!'
							/>
						</FormGroup>
					)}

					{formik.values.type === 'Mobile' && (
						<>
							<FormGroup id='storage' label='Storage' className='col-md-6'>
								<Input
									type='text'
									value={formik.values.storage}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									isValid={formik.isValid}
									isTouched={formik.touched.storage}
									invalidFeedback={formik.errors.storage}
									validFeedback='Looks good!'
								/>
							</FormGroup>

							{/* {formik.values.mobileType === 'Used' && (
								<>
									<FormGroup id='name' label='Name' className='col-md-6'>
										<Input
											type='text'
											value={formik.values.name}
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											isValid={formik.isValid}
											isTouched={formik.touched.name}
											invalidFeedback={formik.errors.name}
											validFeedback='Looks good!'
										/>
									</FormGroup>
									<FormGroup
										id='mobile'
										label='Mobile Number'
										className='col-md-6'>
										<Input
											type='text'
											value={formik.values.mobile}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
												const input = e.target.value.replace(/\D/g, '');
												formik.setFieldValue(
													'mobile',
													formatMobileNumber(input),
												);
											}}
											onBlur={formik.handleBlur}
											isValid={formik.isValid}
											isTouched={formik.touched.mobile}
											invalidFeedback={formik.errors.mobile}
											validFeedback='Looks good!'
										/>
									</FormGroup>
									<FormGroup id='nic' label='NIC' className='col-md-6'>
										<Input
											type='text'
											value={formik.values.nic}
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											isValid={formik.isValid}
											isTouched={formik.touched.nic}
											invalidFeedback={formik.errors.nic}
											validFeedback='Looks good!'
										/>
									</FormGroup>
								</>
							)} */}
						</>
					)}
					<FormGroup
						id='quantity'
						label='Quantity'
						className='col-md-6'>
						<Input
							type='number'
							value={formik.values.quantity}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.quantity}
							invalidFeedback={formik.errors.quantity}
							validFeedback='Looks good!'
							min={1}
						/>
					</FormGroup>

					<FormGroup id='date' label='Date In' className='col-md-6'>
						<Input
							type='date'
							max={new Date().toISOString().split('T')[0]}
							placeholder='Enter Date'
							value={formik.values.date}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.date}
							invalidFeedback={formik.errors.date}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='cost' label='Cost (LKR)' className='col-md-6'>
						<Input
							type='number'
							min={1}
							placeholder='Enter Cost'
							value={formik.values.cost}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							invalidFeedback={formik.errors.cost}
							isTouched={formik.touched.cost}
						/>
					</FormGroup>
					<FormGroup id='sellingPrice' label='Selling Price (LKR)' className='col-md-6'>
						<Input
							type='number'
							min={1}
							placeholder='Enter Selling Price'
							value={formik.values.sellingPrice}
							// onChange={formik.handleChange}
							onChange={(e: any) => {
								let value = e.target.value;
								if (value.length > 1 && value.startsWith('0')) {
									value = value.substring(1);
								}
								formik.setFieldValue('sellingPrice', value);
							}}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.sellingPrice}
							invalidFeedback={formik.errors.sellingPrice}
							validFeedback='Looks good!'
						/>
					</FormGroup>

					{formik.values.mobileType === 'Brand New' && (
						<FormGroup id='suppName' label='Supplier Name' className='col-md-6'>
							<Select
								id='suppName'
								name='suppName'
								ariaLabel='suppName'
								onChange={formik.handleChange}
								value={formik.values.suppName}
								onBlur={formik.handleBlur}
								className={`form-control ${
									formik.touched.suppName && formik.errors.suppName
										? 'is-invalid'
										: ''
								}`}>
								<option value=''>Select a Supp Name</option>
								{supplierLoading && <option>Loading Supp Name...</option>}
								{isError && <option>Error fetching Supp Names</option>}
								{suppliers?.map((suppName: { id: string; name: string }) => (
									<option key={suppName.id} value={suppName.name}>
										{suppName.name}
									</option>
								))}
							</Select>
							{formik.touched.category && formik.errors.category ? (
								<div className='invalid-feedback'>{formik.errors.category}</div>
							) : (
								<></>
							)}
						</FormGroup>
					)}

					<FormGroup id='description' label='Description' className='col-md-6'>
						<Input
							type='text'
							min={1}
							placeholder='Enter Decsription'
							value={formik.values.description}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.description}
							invalidFeedback={formik.errors.description}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					{formik.values.DorC === 'Customer' && (
						<>
							<FormGroup id='name' label='Customer Name' className='col-md-6'>
								<Input
									type='text'
									value={formik.values.name}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									isValid={formik.isValid}
									isTouched={formik.touched.name}
									invalidFeedback={formik.errors.name}
									validFeedback='Looks good!'
								/>
							</FormGroup>
							<FormGroup id='mobile' label='Mobile Number' className='col-md-6'>
								<Input
									type='text'
									value={formik.values.mobile}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
										const input = e.target.value.replace(/\D/g, '');
										formik.setFieldValue('mobile', formatMobileNumber(input));
									}}
									onBlur={formik.handleBlur}
									isValid={formik.isValid}
									isTouched={formik.touched.mobile}
									invalidFeedback={formik.errors.mobile}
									validFeedback='Looks good!'
								/>
							</FormGroup>
							<FormGroup id='nic' label='NIC' className='col-md-6'>
								<Input
									type='text'
									value={formik.values.nic}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									isValid={formik.isValid}
									isTouched={formik.touched.nic}
									invalidFeedback={formik.errors.nic}
									validFeedback='Looks good!'
								/>
							</FormGroup>
							<FormGroup label='NIC Photo' className='col-md-6'>
								<Input
									type='file'
									onChange={(e: any) => {
										setImageurl(e.target.files[0]);
										// Display the selected image
									}}
								/>
							</FormGroup>
						</>
					)}
					{formik.values.DorC === 'Deler' && (
						<>
							<FormGroup id='ShopName' label='Shop name' className='col-md-6'>
								<Input
									type='text'
									min={1}
									value={formik.values.ShopName}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									isValid={formik.isValid}
									isTouched={formik.touched.ShopName}
									invalidFeedback={formik.errors.ShopName}
									validFeedback='Looks good!'
								/>
							</FormGroup>
							<FormGroup id='dealerName' label='Dealer name' className='col-md-6'>
								<Input
									type='text'
									min={1}
									value={formik.values.dealerName}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									isValid={formik.isValid}
									isTouched={formik.touched.dealerName}
									invalidFeedback={formik.errors.dealerName}
									validFeedback='Looks good!'
								/>
							</FormGroup>
							<FormGroup id='mobile' label='Mobile Number' className='col-md-6'>
								<Input
									type='text'
									value={formik.values.mobile}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
										const input = e.target.value.replace(/\D/g, '');
										formik.setFieldValue('mobile', formatMobileNumber(input));
									}}
									onBlur={formik.handleBlur}
									isValid={formik.isValid}
									isTouched={formik.touched.mobile}
									invalidFeedback={formik.errors.mobile}
									validFeedback='Looks good!'
								/>
							</FormGroup>
						</>
					)}

					{formik.values.type === 'Accessory' && (
						<FormGroup id='suppName' label='Supplier Name' className='col-md-6'>
							<Select
								id='suppName'
								name='suppName'
								ariaLabel='suppName'
								onChange={formik.handleChange}
								value={formik.values.suppName}
								onBlur={formik.handleBlur}
								className={`form-control ${
									formik.touched.suppName && formik.errors.suppName
										? 'is-invalid'
										: ''
								}`}>
								<option value=''>Select a Supp Name</option>
								{supplierLoading && <option>Loading Supp Name...</option>}
								{isError && <option>Error fetching Supp Names</option>}
								{suppliers?.filter((val:any)=>{
									if(val.type=="Accessories"){
										return val
									}
								}).map((suppName: { id: string; name: string }) => (
									<option key={suppName.id} value={suppName.name}>
										{suppName.name}
									</option>
								))}
							</Select>
							{formik.touched.category && formik.errors.category ? (
								<div className='invalid-feedback'>{formik.errors.category}</div>
							) : (
								<></>
							)}
						</FormGroup>
					)}

					{formik.values.type === 'Accessory' && (
						<FormGroup id='dealerName' label='Dealer Name' className='col-md-6'>
							<Select
								id='dealerName'
								name='dealerName'
								ariaLabel='dealerName'
								onChange={formik.handleChange}
								value={formik.values.dealerName}
								onBlur={formik.handleBlur}
								className={`form-control ${
									formik.touched.dealerName && formik.errors.dealerName
										? 'is-invalid'
										: ''
								}`}>
								<option value=''>Select a Dealer</option>
								{dealers?.map((dealer: { id: string; name: string }) => (
									<option key={dealer.id} value={dealer.name}>
										{dealer.name}
									</option>
								))}
							</Select>
							{formik.touched.dealerName && formik.errors.dealerName ? (
								<div className='invalid-feedback'>{formik.errors.dealerName}</div>
							) : (
								<></>
							)}
						</FormGroup>
					)}
				</div>
			</ModalBody>
			<ModalFooter className='p-4'>
				<Button color='success' onClick={() => formik.handleSubmit()}>
					Stock In
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
