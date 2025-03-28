import React, { useState, useEffect } from 'react';
import Header, { HeaderLeft, HeaderRight } from '../../../layout/Header/Header';
import Button from '../../../components/bootstrap/Button';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import CommonHeaderRight from './CommonHeaderRight';

const MyDefaultHeader = ({ onSaveDraft, onLoadDraft }: any) => {
	const [drafts1, setDrafts] = useState([]);

	// Load drafts from localStorage
	useEffect(() => {
		const savedDrafts = JSON.parse(localStorage.getItem('drafts1') || '[]');
		setDrafts(savedDrafts);
	}, [onSaveDraft]);

	// Handle dropdown selection
	const handleSelectDraft1 = (draft: any) => {
		onLoadDraft(draft);
	};
	const handleSelectDraft = (index: number) => {
		if (index >= 0 && index < drafts1.length) {
			const selectedDraft = drafts1[index];
			onLoadDraft(selectedDraft);

			// Swal.fire('Success', 'Draft loaded successfully.', 'success');
		} else {
			// Swal.fire('Error', 'Invalid draft selected.', 'error');
		}
	};

	return (
		<Header>
			<HeaderLeft>
			<div className='row g-3 justify-content-end'>
					<div className='col-auto m-4'>
						<FormGroup id='amount' label='' className='col-12 mt-2'>
							<select
								placeholder='select draft'
								className='form-select mt-4'
								onChange={(e) => handleSelectDraft(Number(e.target.value))}>
								<option value=''>Select Draft</option>
								{drafts1.map((draft, index) => (
									<option key={index} value={index}>
										Draft {index + 1}
									</option>
								))}
							</select>
						</FormGroup>
					</div>
					<div className='col-auto mt-4'>
						<Button color='warning' className='mt-4 ' onClick={onSaveDraft}>
							Save as Draft
						</Button>
					</div>
				</div>
			</HeaderLeft>
			<HeaderRight>
				<CommonHeaderRight />
			</HeaderRight>
		</Header>
	);
};

export default MyDefaultHeader;
