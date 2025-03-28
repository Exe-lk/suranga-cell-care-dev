import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import Swal from 'sweetalert2';
import FormGroup from '../bootstrap/forms/FormGroup';
import Input from '../bootstrap/forms/Input';
import Button from '../bootstrap/Button';
import { useAddStockInMutation } from '../../redux/slices/stockInOutDissApiSlice';
import { useGetItemDisByIdQuery } from '../../redux/slices/itemManagementDisApiSlice';

// Define the props for the StockAddModal component
interface StockAddModalProps {
  id: string;
  isOpen: boolean;
  setIsOpen(...args: unknown[]): unknown;
}

interface StockIn {
  cid: string;
  brand: string;
  model: string;
  category: string;
  quantity: string;
  date: string;
  suppName: string;
  stock: string;
  status: boolean;
}

// StockAddModal component definition
const StockAddModal: FC<StockAddModalProps> = ({ id, isOpen, setIsOpen }) => {
  const [stockIn, setStockIn] = useState<StockIn>({
    cid: '',
    brand: '',
    model: '',
    category: '',
    quantity: '',
    date: '',
    suppName: '',
    stock: 'stockIn',
    status: true,
  });

  const { data: stockInData, isSuccess } = useGetItemDisByIdQuery(id);
  const [addstockIn, { isLoading }] = useAddStockInMutation();

  useEffect(() => {
    if (isSuccess && stockInData) {
      setStockIn(stockInData);
    }
  }, [isSuccess, stockInData]);

  // Initialize formik for form management
  const formik = useFormik({
    initialValues: {
      brand: stockIn.brand,
      model: stockIn.model,
      category: stockIn.category,
      quantity: '',
      date: '',
      suppName: '',
      stock: 'stockIn',
      status: true,
    },
    enableReinitialize: true, // Ensure formik values are updated when stockIn changes
    validate: (values) => {
      const errors: {
        quantity?: string;
        date?: string;
        suppName?: string;
      } = {};
      if (!values.quantity) {
        errors.quantity = 'Quantity is required';
      }
      if (!values.date) {
        errors.date = 'Date In is required';
      }
      if (!values.suppName) {
        errors.suppName = 'Supplier Name is required';
      }
      return errors;
    },
    onSubmit: async (values) => {
      try {
        // Show a processing modal
        const process = Swal.fire({
          title: 'Processing...',
          html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
          allowOutsideClick: false,
          showCancelButton: false,
          showConfirmButton: false,
        });

        try {
          // Pass all values, including the read-only fields
          const response: any = await addstockIn(values).unwrap();
          console.log(response);

          // Success feedback
          await Swal.fire({
            icon: 'success',
            title: 'Stock In Created Successfully',
          });
          setIsOpen(false); // Close the modal after successful addition
        } catch (error) {
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
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} size='xl' titleId={id}>
      <ModalHeader setIsOpen={setIsOpen} className='p-4'>
        <ModalTitle id="">{'New Stock'}</ModalTitle>
      </ModalHeader>
      <ModalBody className='px-4'>
        <div className='row g-4'>

          <FormGroup id='brand' label='Brand' className='col-md-6'>
            <Input
              type='text'
              value={formik.values.brand}
              readOnly
              isValid={formik.isValid}
              isTouched={formik.touched.brand}
            />
          </FormGroup>

          {/* Model Field - Read-Only */}
          <FormGroup id='model' label='Model' className='col-md-6'>
            <Input
              type='text'
              value={formik.values.model}
              readOnly
              isValid={formik.isValid}
              isTouched={formik.touched.model}
            />
          </FormGroup>

          {/* Category Field - Read-Only */}
          <FormGroup id='category' label='Category' className='col-md-6'>
            <Input
              type='text'
              value={formik.values.category}
              readOnly
              isValid={formik.isValid}
              isTouched={formik.touched.category}
            />
          </FormGroup>

          {/* Quantity Field */}
          <FormGroup id='quantity' label='Quantity' className='col-md-6'>
            <Input
              type='number'
              placeholder='Enter Quantity'
              value={formik.values.quantity}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isValid={formik.isValid}
              isTouched={formik.touched.quantity}
              invalidFeedback={formik.errors.quantity}
              validFeedback='Looks good!'
            />
          </FormGroup>

          {/* Date In Field */}
          <FormGroup id='date' label='Date In' className='col-md-6'>
            <Input
              type='date'
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

          {/* Supplier Name Field */}
          <FormGroup id='suppName' label='Supplier Name' className='col-md-6'>
            <Input
              type='text'
              placeholder='Enter Supplier Name'
              value={formik.values.suppName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isValid={formik.isValid}
              isTouched={formik.touched.suppName}
              invalidFeedback={formik.errors.suppName}
              validFeedback='Looks good!'
            />
          </FormGroup>
        </div>
      </ModalBody>
      <ModalFooter className='px-4 pb-4'>
        <Button color='info' onClick={formik.handleSubmit} >
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// Prop types definition for StockAddModal component
StockAddModal.propTypes = {
  id: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};

export default StockAddModal;
