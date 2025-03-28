import React, { useState, useEffect } from 'react';
import Header, { HeaderLeft, HeaderRight } from '../../../layout/Header/Header';
import Button from '../../../components/bootstrap/Button';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import CommonHeaderRight from './HeaderRight';

const MyDefaultHeader = ({
	onSaveDraft,
	onLoadDraft,
	startBill,
	count,
	setReturnstatus,
	returnstatus,
}: any) => {
	const [drafts, setDrafts] = useState([]);

	// Load drafts from localStorage
	useEffect(() => {
		const savedDrafts = JSON.parse(localStorage.getItem('drafts') || '[]');
		setDrafts(savedDrafts);
	}, [onSaveDraft]);

	// Handle dropdown selection
	const handleSelectDraft1 = (draft: any) => {
		onLoadDraft(draft);
	};
	const handleSelectDraft = (index: number) => {
		if (index >= 0 && index < drafts.length) {
			const selectedDraft = drafts[index];
			onLoadDraft(selectedDraft);
		} else {
		}
	};

	return (
		<Header>
			<HeaderLeft>
				<div className='row g-3'>
					<div className='col-auto '>
						{count >= 1 ? (
							<>
								<Button color='success' className='mt-3 me-3' onClick={startBill}>
									Cancel Bill
								</Button>
							</>
						) : (
							<></>
						)}
						{returnstatus ? (
							<Button
								color='warning'
								className='mt-3 '
								onClick={(e) => {
									setReturnstatus(false);
								}}>
								Bill
							</Button>
						) : (
							<Button
								color='warning'
								className='mt-3 '
								onClick={(e) => {
									setReturnstatus(true);
								}}>
								Return
							</Button>
						)}
					</div>
					<div className='col-auto  ms-auto'>
						<div className='row g-3'>
							<div className='col-auto '>
								<FormGroup id='amount' label='' className='col-12 mt-1'>
									<select
										placeholder='select draft'
										className='form-select mt-3'
										onChange={(e) => handleSelectDraft(Number(e.target.value))}>
										<option value=''>Drafts</option>
										{drafts.map((draft: any, index) => (
											<option key={index} value={index}>
												{draft.name}
											</option>
										))}
									</select>
								</FormGroup>
							</div>
							<div className='col-auto  justify-content-end'>
								<Button color='warning' className='mt-3 ' onClick={onSaveDraft}>
									Bill Later
								</Button>
							</div>
						</div>
					</div>
				</div>
				{/* <div>
					<div className='col-auto m-4'>
						<FormGroup id='amount' label='' className='col-12 mt-2'>
							<select
								placeholder='select draft'
								className='form-select mt-4'
								onChange={(e) => handleSelectDraft(Number(e.target.value))}>
								<option value=''>Drafts</option>
								{drafts.map((draft, index) => (
									<option key={index} value={index}>
										Draft {index + 1}
									</option>
								))}
							</select>
						</FormGroup>
					</div>
					<div className='col-auto mt-4 justify-content-end'>
						<Button color='warning' className='mt-4 ' onClick={onSaveDraft}>
							Bill Later
						</Button>
					</div>
					</div> */}
				{/* </div> */}
			</HeaderLeft>

			<CommonHeaderRight />
		</Header>
	);
};

export default MyDefaultHeader;
