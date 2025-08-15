import React, {  useEffect, useRef, useState, useCallback } from 'react';
import type { NextPage } from 'next';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import useDarkMode from '../../../hooks/useDarkMode';
import Page from '../../../layout/Page/Page';
import SubHeader, {
	SubHeaderLeft,
	SubHeaderRight,
} from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import Dropdown, { DropdownMenu, DropdownToggle } from '../../../components/bootstrap/Dropdown';
import Button from '../../../components/bootstrap/Button';
import Card, { CardBody, CardTitle } from '../../../components/bootstrap/Card';
import CategoryAddModal from '../../../components/custom/ReturnAddModal';
import CategoryDeleteModal from '../../../components/custom/Category1DeleteModal';
import CategoryEditModal from '../../../components/custom/ReturnEditModal';
import Swal from 'sweetalert2';
import { useGetCategories1Query , useUpdateCategory1Mutation} from '../../../redux/slices/category1ApiSlice';
import bill from '../../../assets/img/bill/WhatsApp_Image_2024-09-12_at_12.26.10_50606195-removebg-preview (1).png';
import { toPng, toSvg } from 'html-to-image';
import { DropdownItem } from '../../../components/bootstrap/Dropdown';
import jsPDF from 'jspdf'; 
import autoTable from 'jspdf-autotable';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import { useGetBrands1Query } from '../../../redux/slices/brand1ApiSlice';
import { supabase } from '../../../lib/supabase';

interface Category {
	cid: string;
	name: string;
	status: boolean;
}

const Index: NextPage = () => {
	const [searchTerm, setSearchTerm] = useState(''); 
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
	const [addModalStatus, setAddModalStatus] = useState<boolean>(false); 
	const [deleteModalStatus, setDeleteModalStatus] = useState<boolean>(false);
	const [editModalStatus, setEditModalStatus] = useState<boolean>(false); 
	const [id, setId] = useState<string>(''); 
	const { data: categories, error, isLoading, refetch } = useGetCategories1Query(debouncedSearchTerm);
	const [updateCategory] = useUpdateCategory1Mutation();
	const { data: brands } = useGetBrands1Query(undefined);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(PER_COUNT['10000']);
	const inputRef = useRef<HTMLInputElement>(null);
    const [stock, setStock] = useState<any[]>([]);
	useEffect(() => {
    const getdata = async () => {
        const { data, error } = await supabase
            .from('returnPhone')
            .select('*')
            
        if (error) {
            console.error(error);
            return [];
        }
        console.log(data);
        return data;
    };

    getdata().then((result) => setStock(result));
}, []);

	// Debounce search term to minimize API calls

	// Handle search input changes
	const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
		setSearchTerm(value);
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
						placeholder='Search return by name...'
						onChange={handleSearch}
						value={searchTerm}
						ref={inputRef}
					/>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button
						icon='AddCircleOutline'
						color='success'
						isLight
						onClick={() => setAddModalStatus(true)}>
						return
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page>
				<div className='row h-100'>
					<div className='col-12'>
						<Card stretch>
							<CardTitle className='d-flex justify-content-between align-items-center m-4'>
								<div className='flex-grow-1 text-center text-primary'>Manage Return</div>
								
							</CardTitle>
							<CardBody isScrollable className='table-responsive'>
								<table className='table table-bordered border-primary table-hover text-center'>
								<thead className={"table-dark border-primary"}>
										<tr>
											<th>Barcode</th>	
											<th>Item</th>
                                            <th>dealer</th>
                                            <th>Date in</th>
                                            <th>Send Date</th>
                                            <th></th>
										</tr>
									</thead>
									<tbody>
										{isLoading &&(
											<tr>
												<td>Loadning...</td>
											</tr>
										)}
										{
											error && (
												<tr>
													<td>Error fetching brands.</td>
												</tr>
											)
										}
										{
											stock &&
											dataPagination(stock, currentPage, perPage)
                                            .filter((model : any) => 
                                                searchTerm 
                                                ? model.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                model.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                model.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                model.barcode.toLowerCase().includes(searchTerm.toLowerCase()) 
                                                : true,
                                            )
												.map((stock:any, index: any) => (
													<tr key={index}>
														<td>{stock.barcode}</td>
                                                        <td>{stock.category} {stock.brand} {stock.model}</td>
														<td>{stock.dealer}</td>
                                                        <td>{stock.datein}</td>
                                                        <td>{stock.senddate}</td>
                                                        <td>
															<Button
																icon='Edit'
																color='primary'
																onClick={() => {
																	setEditModalStatus(true);
																	setId(stock.id);
																}}>
																Edit
															</Button>
															
														</td>
													</tr>
												))
										}
									</tbody>
								</table>
								<Button icon='Delete' className='mb-5'
								onClick={() => {
									refetch();
									setDeleteModalStatus(true)									
								}}>
								Recycle Bin</Button> 								
							</CardBody>
							<PaginationButtons
								data={categories}
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
			<CategoryAddModal setIsOpen={setAddModalStatus} isOpen={addModalStatus} id='' />
			<CategoryDeleteModal setIsOpen={setDeleteModalStatus} isOpen={deleteModalStatus} id='' refetchMainPage={refetch}/>
			<CategoryEditModal setIsOpen={setEditModalStatus} isOpen={editModalStatus} id={id} />
		</PageWrapper>
	);
};

export default Index;
