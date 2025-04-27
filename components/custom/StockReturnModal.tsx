import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import Swal from 'sweetalert2';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import {
	useAddStockInMutation,
	useUpdateSubStockInOutMutation,
} from '../../redux/slices/stockInOutDissApiSlice';
import { useGetItemDisByIdQuery } from '../../redux/slices/itemManagementDisApiSlice';
import { useGetItemDissQuery } from '../../redux/slices/itemManagementDisApiSlice';
import { useGetSuppliersQuery } from '../../redux/slices/supplierApiSlice';
import { useUpdateStockInOutMutation } from '../../redux/slices/stockInOutDissApiSlice';
import { useGetStockInOutsQuery } from '../../redux/slices/stockInOutDissApiSlice';
import Select from '../bootstrap/forms/Select';
import Checks, { ChecksGroup } from '../bootstrap/forms/Checks';
import { saveReturnData1, updateQuantity1 } from '../../service/returnAccesory';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';

interface StockAddModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
	quantity: any;
}

interface StockIn {
	barcode: number;
	cid: string;
	brand: string;
	model: string;
	category: string;
	quantity: string;
	date: string;
	suppName: string;
	code: string;
	cost: string;
	stock: string;
	boxNumber: string;
	description: string;
	status: boolean;
	printlable: number;
}

const StockAddModal: FC<StockAddModalProps> = ({ id, isOpen, setIsOpen, quantity }) => {
	const [stockIn, setStockIn] = useState<StockIn>({
		cid: '',
		brand: '',
		model: '',
		category: '',
		quantity: '',
		date: '',
		suppName: '',
		cost: '',
		code: '',
		stock: 'stockIn',
		boxNumber: '',
		description: '',
		status: true,
		barcode: 0,
		printlable: 0,
	});
	const { data: itemDiss } = useGetItemDissQuery(undefined);
	// const { data: StockInOuts } = useGetStockInOutsQuery(undefined);
	const { refetch } = useGetItemDissQuery(undefined);
	const [updateSubStockInOut] = useUpdateSubStockInOutMutation();
	const [condition, setCondition] = useState('');

	 const getStockInsById = async (subStockId: string) => {
		try {
		  const stockCollectionRef = collection(firestore, 'Stock');
		  const q = query(stockCollectionRef, where('barcode', '==', subStockId));
		  const querySnapshot = await getDocs(q);
		  const matchingStocks = [];
		  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	// 	  for (const stockDoc of querySnapshot.docs) {
	// 		const stockDocId = stockDoc.id;
			
	// 		const stockInfo: any = { id: stockDocId, ...stockDoc.data() };
			
	// 		// Get the specific subStock document by ID
	// 		const subStockDocRef = doc(firestore, 'Stock', subStockId, 'subStock', subStockId);
	// 		const subStockDoc = await getDoc(subStockDocRef);
	// 		console.log(subStockDoc.data());
	// 		if (subStockDoc.exists()) {
	// 		  // If the subStock with the specified ID exists in this stock document
	// 		  stockInfo.subStock = [{
	// 			id: subStockDoc.id,
	// 			...subStockDoc.data()
	// 		  }];
	// 		  matchingStocks.push(stockInfo);
	// 		}
	// 	  }
	//   console.log(matchingStocks);
	// 	  return matchingStocks;
		} catch (error) {
		  console.error('Error fetching stock with specific subStock ID:', error);
		  throw new Error(`Failed to fetch stock with subStock ID: ${subStockId}`);
		}
	  };

	const formik = useFormik({
		initialValues: {
			itemId: '',
			condition: '',
		},
		enableReinitialize: true,
		validate: (values) => {
			const errors: {
				itemId?: string;
				condition?: string;
			} = {};

			if (!values.itemId) {
				errors.itemId = 'Id is required';
			}
			if (!values.condition) {
				errors.condition = 'Id is required';
			}
			return errors;
		},
		onSubmit: async (value) => {
			try {
				const process = Swal.fire({
					title: 'Processing...',
					html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
					allowOutsideClick: false,
					showCancelButton: false,
					showConfirmButton: false,
				});
				try {
			

					const id = value.itemId?.toString().slice(0, 8) || 'defaultId';
					const subid = value.itemId.toString();

					const prefix1 = value.itemId?.toString().slice(0, 8);

					// const matchedItem = StockInOuts.find(
					// 	(item: {
					// 		id: string;
					// 	}) => item.id.startsWith(prefix1),
					// );
					console.log(subid);
					const matchedItem:any = await getStockInsById(id);
					console.log(matchedItem);
					if (matchedItem == undefined) {
						await Swal.fire({
							icon: 'error',
							title: 'Error',
							text: 'Failed to add the item. Please try again.',
						});
						return;
					}
					const now = new Date();
					const month = now.toLocaleString('default', { month: 'short' }); // e.g., "Feb"
					const day = now.getDate(); // e.g., 17
					const year = now.getFullYear(); // e.g., 2025

					const formattedDate = `${month} ${day} ${year}`;
					console.log(formattedDate); // "Feb 17 2025"
					const updatedItem = {
						condition,
						barcode: value.itemId,
						brand: matchedItem[0].brand,
						category: matchedItem[0].category,
						model: matchedItem[0].model,
						date: formattedDate,
					};

					const data = await saveReturnData1(updatedItem);

					if (condition === 'Good' && data) {
						const values = {
							status: false,
						};
						const prefix = value.itemId?.toString().slice(0, 4);
						const matchedItem = itemDiss.find(
							(item: { code: string; quantity: string }) =>
								item.code.startsWith(prefix),
						);
						if (matchedItem) {
							await updateQuantity1(matchedItem.id, Number(matchedItem.quantity) + 1);
						}
						await updateSubStockInOut({ id, subid, values }).unwrap();
					}
					refetch();
					await Swal.fire({
						icon: 'success',
						title: 'Stock In Created Successfully',
					});
					formik.resetForm();
					setIsOpen(false);
				} catch (error) {
					console.log(error);
					await Swal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Failed to add the item. Please try again.',
					});
				}
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				alert('An error occurred during the process. Please try again later.');
			}
		},
	});

	return (
		<Modal isOpen={isOpen} aria-hidden={!isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
			<ModalHeader
				setIsOpen={() => {
					setIsOpen(false);
					formik.resetForm();
				}}
				className='p-4'>
				<ModalTitle id=''>{'Return Stock'}</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='row g-4 mt-2'>
					<FormGroup id='itemId' label='Item Id' className='col-md-6'>
						<Input
							type='number'
							placeholder='Enter Item Id'
							value={formik.values.itemId}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							isValid={formik.isValid}
							isTouched={formik.touched.itemId}
							invalidFeedback={formik.errors.itemId}
							validFeedback='Looks good!'
						/>
					</FormGroup>
					<FormGroup id='condition' label='Condition' className='col-md-12'>
						<ChecksGroup
							isInline
							className='pt-2'
							isTouched={formik.touched.condition}
							invalidFeedback={formik.errors.condition}>
							<Checks
								id='Good'
								label='Good'
								name='Good'
								value='Good'
								onChange={(e: any) => {
									setCondition(e.target.value);
									formik.setFieldValue('condition', e.target.value);
								}}
								checked={condition == 'Good'}
							/>
							<Checks
								id='Bad'
								label='Bad'
								name='Bad'
								value='Bad'
								onChange={(e: any) => {
									setCondition(e.target.value),
										formik.setFieldValue('condition', e.target.value);
								}}
								checked={condition == 'Bad'}
							/>
						</ChecksGroup>
					</FormGroup>
				</div>
			</ModalBody>
			<ModalFooter className='px-4 pb-4'>
				<Button color='success' onClick={formik.handleSubmit}>
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
