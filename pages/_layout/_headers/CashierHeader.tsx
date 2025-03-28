import React, { useState, useEffect } from 'react';
import Header, { HeaderLeft, HeaderRight } from '../../../layout/Header/Header';
import Button from '../../../components/bootstrap/Button';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import CommonHeaderRight from './HeaderRight';

const MyDefaultHeader = ({ onSaveDraft, onLoadDraft, startBill,count }: any) => {
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
				<></>

			</HeaderLeft>

			<CommonHeaderRight />
		</Header>
	);
};

export default MyDefaultHeader;
