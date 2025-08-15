import React, { FC, useRef } from 'react';
import Card, { CardBody } from './bootstrap/Card';
import Button from './bootstrap/Button';
import Swal from 'sweetalert2';

interface RepairedPhoneBillProps {
	data: any;
	isOpen: boolean;
	setIsOpen(...args: unknown[]): unknown;
}

const RepairedPhoneBill: FC<RepairedPhoneBillProps> = ({ data, isOpen, setIsOpen }) => {
	const invoiceRef = useRef<HTMLDivElement>(null);
	const currentDate = new Date().toLocaleDateString('en-CA');
	const currentTime = new Date().toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
	});

	const handlePrint = async () => {
		try {
			const result = await Swal.fire({
				title: 'Are you sure?',
				text: 'Print this repair bill?',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, Print Bill!',
			});

			if (result.isConfirmed) {
				const printContent = invoiceRef.current?.innerHTML;

				if (printContent) {
					const printWindow = window.open('', '_blank');
					if (printWindow) {
						printWindow.document.write(`
							<html>
								<head>
									<title>Repair Bill - ${data.billNumber}</title>
									<style>
										body { 
											margin: 0; 
											padding: 0; 
											font-family: Arial, sans-serif; 
											background: white;
											color: #2563eb !important;
										}
										* { 
											color: #2563eb !important; 
											box-sizing: border-box;
										}
										.bill-container {
											width: 105mm;
											height: 148mm;
											background: #fff;
											margin: 0;
											padding: 3mm;
											border: 1px solid #2563eb;
											font-size: 8px;
											line-height: 1.1;
											overflow: hidden;
										}
										.header {
											text-align: center;
											margin-bottom: 2mm;
											border-bottom: 1px solid #2563eb;
											padding-bottom: 1mm;
										}
										.company-name {
											font-size: 14px;
											font-weight: bold;
											margin-bottom: 0.5mm;
											color: #2563eb !important;
										}
										.company-details {
											font-size: 7px;
											line-height: 1.1;
											color: #2563eb !important;
										}
										.services-box {
											border: 1px solid #2563eb;
											padding: 1.5mm;
											margin: 1.5mm 0;
											border-radius: 1px;
										}
										.services-list {
											font-size: 6px;
											line-height: 1.1;
											color: #2563eb !important;
										}
										.invoice-info {
											display: flex;
											justify-content: space-between;
											margin: 1.5mm 0;
											font-size: 7px;
										}
										.invoice-left {
											flex: 1;
										}
										.invoice-right {
											text-align: right;
											font-weight: bold;
										}
										.customer-info {
											margin: 1.5mm 0;
											padding: 1.5mm;
											border: 1px solid #2563eb;
											font-size: 7px;
										}
										.items-section {
											border: 1px solid #2563eb;
											margin: 1.5mm 0;
										}
										.items-header {
											background-color: #f0f8ff;
											padding: 1mm;
											border-bottom: 1px solid #2563eb;
											display: grid;
											grid-template-columns: 12mm 35mm 12mm 18mm 18mm;
											font-size: 6px;
											font-weight: bold;
											text-align: center;
										}
										.items-row {
											padding: 1mm;
											border-bottom: 1px solid #2563eb;
											display: grid;
											grid-template-columns: 12mm 35mm 12mm 18mm 18mm;
											font-size: 6px;
											min-height: 6mm;
											align-items: center;
										}
										.items-row:last-child {
											border-bottom: none;
										}
										.item-code {
											text-align: center;
										}
										.item-description {
											text-align: left;
											padding-left: 0.5mm;
										}
										.item-quantity,
										.item-price,
										.item-amount {
											text-align: right;
											padding-right: 0.5mm;
										}
										.totals-box {
											border: 1px solid #2563eb;
											margin: 1.5mm 0;
											padding: 1.5mm;
											float: right;
											width: 45mm;
										}
										.totals-row {
											display: flex;
											justify-content: space-between;
											margin: 0.5mm 0;
											font-size: 7px;
										}
										.total-main {
											font-weight: bold;
											background-color: #f0f8ff;
											padding: 1mm;
											border: 1px solid #2563eb;
											margin: 0.5mm 0;
											font-size: 8px;
										}
										.signatures {
											margin-top: 4mm;
											border-top: 1px solid #2563eb;
											padding-top: 2mm;
											display: flex;
											justify-content: space-between;
											font-size: 6px;
											clear: both;
										}
										.signature-box {
											text-align: center;
											width: 35mm;
										}
										.signature-line {
											border-top: 1px solid #2563eb;
											margin-top: 6mm;
											padding-top: 0.5mm;
										}
										.brands {
											text-align: center;
											margin-top: 2mm;
											font-size: 6px;
											font-weight: bold;
											border-top: 1px solid #2563eb;
											padding-top: 1mm;
										}
										.system-info {
											text-align: center;
											font-size: 5px;
											margin-top: 1mm;
											color: #666 !important;
										}
										@media print {
											body { margin: 0; padding: 0; }
											.bill-container { border: none; margin: 0; padding: 3mm; }
										}
									</style>
								</head>
								<body>
									${printContent}
								</body>
							</html>
						`);
						printWindow.document.close();
						printWindow.print();
						printWindow.close();
					}
				}

				Swal.fire({
					title: 'Success',
					text: 'Bill printed successfully.',
					icon: 'success',
					showConfirmButton: false,
					timer: 1500,
				});
			}
		} catch (error) {
			console.error('Error printing bill:', error);
			Swal.fire('Error', 'An error occurred while printing the bill.', 'error');
		}
	};

	if (!isOpen) return null;

	return (
		<div className='row'>
			<div className='col-12'>
				<Card stretch className='mt-4' style={{ height: '90vh' }}>
					<CardBody>
						<div className='d-flex justify-content-between align-items-center mb-3'>
							<Button
								icon='ArrowBack'
								color='secondary'
								onClick={() => setIsOpen(false)}>
								Back
							</Button>
							<Button
								icon='Print'
								color='primary'
								onClick={handlePrint}>
								Print Bill
							</Button>
						</div>
						
						<div 
							ref={invoiceRef}
							style={{ 
								backgroundColor: 'white',
								width: '100%',
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								padding: '5px',
								height: 'calc(90vh - 120px)',
								overflow: 'hidden'
							}}>
							<div className='bill-container' style={{
								width: '105mm',
								height: '148mm',
								background: '#fff',
								margin: '0',
								padding: '3mm',
								border: '1px solid #2563eb',
								color: '#2563eb',
								fontSize: '8px',
								lineHeight: '1.1',
								overflow: 'hidden',
								display: 'flex',
								flexDirection: 'column'
							}}>
								{/* Header */}
								<div className='header' style={{
									textAlign: 'center',
									marginBottom: '2mm',
									borderBottom: '1px solid #2563eb',
									paddingBottom: '1mm'
								}}>
									<div className='company-name' style={{
										fontSize: '14px',
										fontWeight: 'bold',
										marginBottom: '0.5mm',
										color: '#2563eb'
									}}>
										suranga
									</div>
									<div style={{ 
										fontSize: '12px', 
										fontWeight: 'bold',
										color: '#2563eb',
										marginBottom: '0.5mm'
									}}>
										Cell Care
									</div>
									<div className='company-details' style={{
										fontSize: '7px',
										lineHeight: '1.1',
										color: '#2563eb'
									}}>
										No. 524/1A, Kandy Road, Kadawatha. Tel: 0112-926030 / 071 9111144
									</div>
								</div>

								{/* Services Box */}
								<div className='services-box' style={{
									border: '1px solid #2563eb',
									padding: '1.5mm',
									margin: '1.5mm 0',
									borderRadius: '1px'
								}}>
									<div className='services-list' style={{
										fontSize: '6px',
										lineHeight: '1.1',
										color: '#2563eb'
									}}>
										<div>• Mobile Phone Sales & Repairs</div>
										<div>• Phone Accessories, Phone Housing, Head Phone</div>
										<div>• Phone Covers Software, Hardware,</div>
										<div>• Systems & Phone Lock Opening</div>
										<div>• Any Mobile Connection</div>
										<div>• Mobile phone Agent</div>
									</div>
								</div>

								{/* Invoice Info */}
								<div className='invoice-info' style={{
									display: 'flex',
									justifyContent: 'space-between',
									margin: '1.5mm 0',
									fontSize: '7px'
								}}>
									<div className='invoice-left' style={{ flex: 1 }}>
										<div style={{ marginBottom: '0.5mm', color: '#2563eb' }}>
											<strong>INVOICE NO.</strong>
										</div>
										<div style={{ marginBottom: '0.5mm', color: '#2563eb' }}>
											Date: {data.dateIn || currentDate}
										</div>
										<div style={{ marginBottom: '0.5mm', color: '#2563eb' }}>
											P.O.No: {data.CustomerMobileNum || data.phoneDetail}
										</div>
										<div style={{ marginBottom: '0.5mm', color: '#2563eb' }}>
											Sales Terms: Cash
										</div>
										<div style={{ color: '#2563eb' }}>
											VAT No: ________________
										</div>
									</div>
									<div className='invoice-right' style={{ 
										textAlign: 'right',
										fontWeight: 'bold'
									}}>
										<div style={{ 
											fontSize: '10px', 
											fontWeight: 'bold', 
											color: '#2563eb'
										}}>
											{data.billNumber}
										</div>
									</div>
								</div>

								{/* Customer Info */}
								<div className='customer-info' style={{ 
									margin: '1.5mm 0', 
									padding: '1.5mm',
									border: '1px solid #2563eb',
									fontSize: '7px',
									color: '#2563eb'
								}}>
									<strong>M/s. Mrs. & Mrs:</strong> {data.CustomerName}
								</div>

								{/* Items Table */}
								<div className='items-section' style={{
									border: '1px solid #2563eb',
									margin: '1.5mm 0',
									flex: 1
								}}>
									<div className='items-header' style={{
										backgroundColor: '#f0f8ff',
										padding: '1mm',
										borderBottom: '1px solid #2563eb',
										display: 'grid',
										gridTemplateColumns: '12mm 35mm 12mm 18mm 18mm',
										fontSize: '6px',
										fontWeight: 'bold',
										textAlign: 'center'
									}}>
										<div>CODE</div>
										<div>DESCRIPTION</div>
										<div>QUANTITY</div>
										<div>UNIT PRICE</div>
										<div>AMOUNT</div>
									</div>
									
									{/* Repair Service Row */}
									<div className='items-row' style={{
										padding: '1mm',
										borderBottom: '1px solid #2563eb',
										display: 'grid',
										gridTemplateColumns: '12mm 35mm 12mm 18mm 18mm',
										fontSize: '6px',
										minHeight: '6mm',
										alignItems: 'center'
									}}>
										<div className='item-code' style={{ textAlign: 'center' }}>01</div>
										<div className='item-description' style={{ 
											textAlign: 'left',
											paddingLeft: '0.5mm'
										}}>
											{data.phoneModel}<br/>
											Repair: {data.repairType}
										</div>
										<div className='item-quantity' style={{ 
											textAlign: 'right',
											paddingRight: '0.5mm'
										}}>1</div>
										<div className='item-price' style={{ 
											textAlign: 'right',
											paddingRight: '0.5mm'
										}}>
											{Number(data.repairCost || 0).toFixed(0)}
										</div>
										<div className='item-amount' style={{ 
											textAlign: 'right',
											paddingRight: '0.5mm'
										}}>
											{Number(data.repairCost || 0).toFixed(0)}
										</div>
									</div>
									
									{/* Component Cost Row - Always show */}
									<div className='items-row' style={{
										padding: '1mm',
										borderBottom: '1px solid #2563eb',
										display: 'grid',
										gridTemplateColumns: '12mm 35mm 12mm 18mm 18mm',
										fontSize: '6px',
										minHeight: '6mm',
										alignItems: 'center'
									}}>
										<div className='item-code' style={{ textAlign: 'center' }}>02</div>
										<div className='item-description' style={{ 
											textAlign: 'left',
											paddingLeft: '0.5mm'
										}}>
											Components/Parts Cost
										</div>
										<div className='item-quantity' style={{ 
											textAlign: 'right',
											paddingRight: '0.5mm'
										}}>1</div>
										<div className='item-price' style={{ 
											textAlign: 'right',
											paddingRight: '0.5mm'
										}}>
											{Number(data.componentCost || 0).toFixed(0)}
										</div>
										<div className='item-amount' style={{ 
											textAlign: 'right',
											paddingRight: '0.5mm'
										}}>
											{Number(data.componentCost || 0).toFixed(0)}
										</div>
									</div>
									
									{/* Empty row */}
									<div className='items-row' style={{
										padding: '1mm',
										display: 'grid',
										gridTemplateColumns: '12mm 35mm 12mm 18mm 18mm',
										fontSize: '6px',
										minHeight: '6mm',
										alignItems: 'center'
									}}>
										<div>&nbsp;</div>
										<div>&nbsp;</div>
										<div>&nbsp;</div>
										<div>&nbsp;</div>
										<div>&nbsp;</div>
									</div>
								</div>

								{/* Totals */}
								<div className='totals-box' style={{
									border: '1px solid #2563eb',
									margin: '1.5mm 0',
									padding: '1.5mm',
									float: 'right',
									width: '45mm'
								}}>
									<div className='totals-row' style={{
										display: 'flex',
										justifyContent: 'space-between',
										margin: '0.5mm 0',
										fontSize: '7px'
									}}>
										<span>Repair Cost</span>
										<span>{Number(data.repairCost || 0).toFixed(0)}</span>
									</div>
									<div className='totals-row' style={{
										display: 'flex',
										justifyContent: 'space-between',
										margin: '0.5mm 0',
										fontSize: '7px'
									}}>
										<span>Component Cost</span>
										<span>{Number(data.componentCost || 0).toFixed(0)}</span>
									</div>
									<div className='totals-row' style={{
										display: 'flex',
										justifyContent: 'space-between',
										margin: '0.5mm 0',
										fontSize: '7px',
										borderTop: '1px solid #2563eb',
										paddingTop: '0.5mm'
									}}>
										<span><strong>Sub Total</strong></span>
										<span><strong>{Number((Number(data.repairCost || 0) + Number(data.componentCost || 0))).toFixed(0)}</strong></span>
									</div>
									<div className='totals-row' style={{
										display: 'flex',
										justifyContent: 'space-between',
										margin: '0.5mm 0',
										fontSize: '7px'
									}}>
										<span><strong>VAT</strong></span>
										<span>___</span>
									</div>
									<div className='total-main' style={{
										fontWeight: 'bold',
										backgroundColor: '#f0f8ff',
										padding: '1mm',
										border: '1px solid #2563eb',
										margin: '0.5mm 0',
										display: 'flex',
										justifyContent: 'space-between',
										fontSize: '8px'
									}}>
										<span><strong>Total</strong></span>
										<span><strong>{Number(data.totalCost || data.cost || (Number(data.componentCost || 0) + Number(data.repairCost || 0))).toFixed(0)} /-</strong></span>
									</div>
									<div className='totals-row' style={{
										display: 'flex',
										justifyContent: 'space-between',
										margin: '0.5mm 0',
										fontSize: '7px'
									}}>
										<span><strong>Advance</strong></span>
										<span>___</span>
									</div>
									<div className='totals-row' style={{
										display: 'flex',
										justifyContent: 'space-between',
										margin: '0.5mm 0',
										fontSize: '7px'
									}}>
										<span><strong>Balance</strong></span>
										<span>{Number(data.totalCost || data.cost || (Number(data.componentCost || 0) + Number(data.repairCost || 0))).toFixed(0)} /-</span>
									</div>
								</div>

								{/* Signatures */}
								<div className='signatures' style={{
									marginTop: '4mm',
									borderTop: '1px solid #2563eb',
									paddingTop: '2mm',
									display: 'flex',
									justifyContent: 'space-between',
									fontSize: '6px',
									clear: 'both'
								}}>
									<div className='signature-box' style={{
										textAlign: 'center',
										width: '35mm'
									}}>
										<div className='signature-line' style={{
											borderTop: '1px solid #2563eb',
											marginTop: '6mm',
											paddingTop: '0.5mm',
											color: '#2563eb'
										}}>
											Customer Signature
										</div>
									</div>
									<div className='signature-box' style={{
										textAlign: 'center',
										width: '35mm'
									}}>
										<div className='signature-line' style={{
											borderTop: '1px solid #2563eb',
											marginTop: '6mm',
											paddingTop: '0.5mm',
											color: '#2563eb'
										}}>
											Authorized Signature
										</div>
									</div>
								</div>

								{/* Brands */}
								<div className='brands' style={{
									textAlign: 'center',
									marginTop: '2mm',
									fontSize: '6px',
									fontWeight: 'bold',
									borderTop: '1px solid #2563eb',
									paddingTop: '1mm',
									color: '#2563eb'
								}}>
									OPPO • Apple • HUAWEI • SAMSUNG • HTC • Microsoft
								</div>

								{/* System Info */}
								<div className='system-info' style={{
									textAlign: 'center',
									fontSize: '5px',
									marginTop: '1mm',
									color: '#666'
								}}>
									System by EXE.LK +94 70 332 9900 | Printed: {currentDate} {currentTime}
								</div>
							</div>
						</div>
					</CardBody>
				</Card>
			</div>
		</div>
	);
};

export default RepairedPhoneBill; 