import React, { useState, useEffect } from 'react';

const initialItem = { productName: '', hsnCode: '', quantity: '', unit: '', taxableValue: '', taxRate: '' };

function EWayBillForm() {
    const [transactionType, setTransactionType] = useState('Outward');
    const [document, setDocument] = useState({ type: '', number: '', date: '' });
    const [consignor, setConsignor] = useState({ name: '', gstin: '', address: '', state: '' });
    const [consignee, setConsignee] = useState({ name: '', gstin: '', address: '', state: '' });
    const [items, setItems] = useState([{ ...initialItem }]);
    const [transport, setTransport] = useState({ mode: '', transporterId: '', vehicleNo: '', distance: '' });
    const [showModal, setShowModal] = useState(false);
    const [bills, setBills] = useState([]);

    useEffect(() => {
        const storedBills = JSON.parse(localStorage.getItem('invoices')) || [];
        setBills(storedBills);
    }, []);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addItem = () => setItems([...items, { ...initialItem }]);
    const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

    const handleSubmit = (e) => {
        e.preventDefault();
        const ewayBillData = {
            transactionType,
            document,
            consignor,
            consignee,
            items,
            transport,
        };
        console.log('e-Way Bill Data:', ewayBillData);
        alert('e-Way Bill data logged to console.');
    };

    const handleBillSelect = (bill) => {
        setDocument({ type: bill.category, number: bill.docnumber, date: bill.docdate });
        setConsignor({ name: 'Your Company', gstin: '', address: '', state: '' });
        setConsignee({ name: bill.customer, gstin: '', address: bill.location, state: '' });
        const convertedItems = bill.items.map(i => ({
            productName: i.matdesc,
            hsnCode: '',
            quantity: i.matqty,
            unit: i.unit,
            taxableValue: i.price * i.matqty,
            taxRate: 18,
        }));
        setItems(convertedItems);
        setShowModal(false);
    };

    return (
        <div className="content">
            <h3 className="mb-4">e-Way Bill Entry</h3>
            <button className="btn btn-outline-primary mb-3" onClick={() => setShowModal(true)}>
                Search Billing
            </button>

            <form onSubmit={handleSubmit}>

                {/* Transaction Type */}
                <div className="mb-3 row">
                    <label className="col-sm-3 col-form-label">Transaction Type</label>
                    <div className="col-sm-9 d-flex align-items-center">
                        <div className="form-check me-3">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="transactionType"
                                id="outward"
                                checked={transactionType === 'Outward'}
                                onChange={() => setTransactionType('Outward')}
                            />
                            <label className="form-check-label" htmlFor="outward">
                                Outward
                            </label>
                        </div>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="transactionType"
                                id="inward"
                                checked={transactionType === 'Inward'}
                                onChange={() => setTransactionType('Inward')}
                            />
                            <label className="form-check-label" htmlFor="inward">
                                Inward
                            </label>
                        </div>
                    </div>
                </div>

                {/* Document Details */}
                <h5>Document Details</h5>
                <div className="row">
                    <div className="col-xl-3 mb-3">
                        <label htmlFor="documentType" className="col-sm-3 col-form-label">Document Type</label>

                        <input
                            type="text"
                            className="form-control"
                            id="documentType"
                            placeholder="Invoice, Bill of Supply, etc."
                            value={document.type}
                            onChange={e => setDocument({ ...document, type: e.target.value })}
                            required
                        />

                    </div>
                    <div className="col-xl-3 mb-3">
                        <label htmlFor="documentNumber" className="col-sm-3 col-form-label">Document Number</label>

                        <input
                            type="text"
                            className="form-control"
                            id="documentNumber"
                            value={document.number}
                            onChange={e => setDocument({ ...document, number: e.target.value })}
                            required
                        />

                    </div>
                    <div className="col-xl-3 mb-3">
                        <label htmlFor="documentDate" className="col-sm-3 col-form-label">Document Date</label>

                        <input
                            type="date"
                            className="form-control"
                            id="documentDate"
                            value={document.date}
                            onChange={e => setDocument({ ...document, date: e.target.value })}
                            required
                        />

                    </div>
                </div>

                {/* Consignor Details */}
                <div className="row gap-2">
                    <div className="col-xl-5">
                        <h5>Consignor (From)</h5>
                        <div className="mb-3 row">
                            <label htmlFor="consignorName" className="col-sm-3 col-form-label">Name</label>

                            <input
                                type="text"
                                className="form-control"
                                id="consignorName"
                                value={consignor.name}
                                onChange={e => setConsignor({ ...consignor, name: e.target.value })}
                                required
                            />

                        </div>
                        <div className="mb-3 row">
                            <label htmlFor="consignorGSTIN" className="col-sm-3 col-form-label">GSTIN</label>

                            <input
                                type="text"
                                className="form-control"
                                id="consignorGSTIN"
                                placeholder="15-character GSTIN"
                                maxLength={15}
                                value={consignor.gstin}
                                onChange={e => setConsignor({ ...consignor, gstin: e.target.value })}
                                required
                            />

                        </div>
                        <div className="mb-3 row">
                            <label htmlFor="consignorAddress" className="col-sm-3 col-form-label">Address</label>

                            <input
                                type="text"
                                className="form-control"
                                id="consignorAddress"
                                value={consignor.address}
                                onChange={e => setConsignor({ ...consignor, address: e.target.value })}
                                required
                            />

                        </div>
                        <div className="mb-4 row">
                            <label htmlFor="consignorState" className="col-sm-3 col-form-label">State</label>

                            <input
                                type="text"
                                className="form-control"
                                id="consignorState"
                                placeholder="State name or code"
                                value={consignor.state}
                                onChange={e => setConsignor({ ...consignor, state: e.target.value })}
                                required
                            />

                        </div>
                    </div>
                    <div className="col-xl-5">
                        {/* Consignee Details */}
                        <h5>Consignee (To)</h5>
                        <div className="mb-3 row">
                            <label htmlFor="consigneeName" className="col-sm-3 col-form-label">Name</label>

                            <input
                                type="text"
                                className="form-control"
                                id="consigneeName"
                                value={consignee.name}
                                onChange={e => setConsignee({ ...consignee, name: e.target.value })}
                                required
                            />

                        </div>
                        <div className="mb-3 row">
                            <label htmlFor="consigneeGSTIN" className="col-sm-3 col-form-label">GSTIN</label>

                            <input
                                type="text"
                                className="form-control"
                                id="consigneeGSTIN"
                                placeholder="15-character GSTIN"
                                maxLength={15}
                                value={consignee.gstin}
                                onChange={e => setConsignee({ ...consignee, gstin: e.target.value })}
                                required
                            />

                        </div>
                        <div className="mb-3 row">
                            <label htmlFor="consigneeAddress" className="col-sm-3 col-form-label">Address</label>

                            <input
                                type="text"
                                className="form-control"
                                id="consigneeAddress"
                                value={consignee.address}
                                onChange={e => setConsignee({ ...consignee, address: e.target.value })}
                                required
                            />

                        </div>
                        <div className="mb-4 row">
                            <label htmlFor="consigneeState" className="col-sm-3 col-form-label">State</label>

                            <input
                                type="text"
                                className="form-control"
                                id="consigneeState"
                                placeholder="State name or code"
                                value={consignee.state}
                                onChange={e => setConsignee({ ...consignee, state: e.target.value })}
                                required
                            />

                        </div>
                    </div>
                </div>
                {/* Item Details */}
                <h5>Item Details</h5>
                <table className="table table-bordered table-hover table-sm mb-3">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Product Name</th>
                            <th>HSN Code</th>
                            <th>Quantity</th>
                            <th>Unit</th>
                            <th>Taxable Value</th>
                            <th>Tax Rate (%)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={item.productName}
                                        onChange={e => handleItemChange(idx, 'productName', e.target.value)}
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={item.hsnCode}
                                        onChange={e => handleItemChange(idx, 'hsnCode', e.target.value)}
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        min="0"
                                        className="form-control"
                                        value={item.quantity}
                                        onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={item.unit}
                                        onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        min="0"
                                        className="form-control"
                                        value={item.taxableValue}
                                        onChange={e => handleItemChange(idx, 'taxableValue', e.target.value)}
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="form-control"
                                        value={item.taxRate}
                                        onChange={e => handleItemChange(idx, 'taxRate', e.target.value)}
                                        required
                                    />
                                </td>
                                <td>
                                    {items.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => removeItem(idx)}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button type="button" className="btn btn-secondary mb-4" onClick={addItem}>
                    Add Item
                </button>

                {/* Transport Details */}
                <h5>Transport Details</h5>
                <div className="mb-3 row">
                    <label htmlFor="transportMode" className="col-sm-3 col-form-label">Mode of Transport</label>
                    <div className="col-sm-9">
                        <select
                            id="transportMode"
                            className="form-select"
                            value={transport.mode}
                            onChange={e => setTransport({ ...transport, mode: e.target.value })}
                            required
                        >
                            <option value="">Select mode</option>
                            <option value="Road">Road</option>
                            <option value="Rail">Rail</option>
                            <option value="Air">Air</option>
                            <option value="Ship">Ship</option>
                        </select>
                    </div>
                </div>
                <div className="mb-3 row">
                    <label htmlFor="transporterId" className="col-sm-3 col-form-label">Transporter ID / Vehicle No.</label>
                    <div className="col-sm-9">
                        <input
                            type="text"
                            id="transporterId"
                            className="form-control"
                            placeholder="Transporter ID or Vehicle Number"
                            value={transport.transporterId}
                            onChange={e => setTransport({ ...transport, transporterId: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <div className="mb-4 row">
                    <label htmlFor="distance" className="col-sm-3 col-form-label">Distance (km)</label>
                    <div className="col-sm-9">
                        <input
                            type="number"
                            min="0"
                            id="distance"
                            className="form-control"
                            value={transport.distance}
                            onChange={e => setTransport({ ...transport, distance: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary mt-4">
                    Generate e-Way Bill
                </button>
            </form>

            {showModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Select Billing Entry</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Doc No</th>
                                                <th>Customer</th>
                                                <th>Location</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bills.map((bill, idx) => (
                                                <tr key={idx}>
                                                    <td>{bill.docnumber}</td>
                                                    <td>{bill.customer}</td>
                                                    <td>{bill.location}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => handleBillSelect(bill)}
                                                        >
                                                            Select
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default EWayBillForm;

