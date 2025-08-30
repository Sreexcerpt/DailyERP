import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

const DataImportModal = ({
    show,
    onClose,
    onImport,
    masterDataType,
    templateFields = [],
    apiEndpoint
}) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileData, setFileData] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [validationErrors, setValidationErrors] = useState([]);
    const [previewData, setPreviewData] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [importResults, setImportResults] = useState(null);
    const fileInputRef = useRef(null);
    const companyId = localStorage.getItem('selectedCompanyId');
    const financialYear = localStorage.getItem('selectedFinancialYear');

    // Updated with reference-friendly field names that match the enhanced backend
    const masterDataTemplates = {
        'material': {
            name: 'Material Master',
            fields: [
                'materialId', 'categoryName', 'description', 'baseUnit', 'orderUnit',
                'conversionValue', 'dimension', 'hsn', 'mpn',
                'minstock', 'safetyStock', 'maxstock', 'pdt',
                'materialgroup', 'location'
            ],
            sampleData: {
                materialId: 'MAT001', // User provides this
                categoryName: 'Raw Materials', // User-friendly category name, not ObjectId
                description: 'Sample Raw Material Description',
                baseUnit: 'KG',
                orderUnit: 'KG',
                conversionValue: 1,
                dimension: '10x10x10',
                hsn: '1234567890',
                mpn: 'MPN001',
                minstock: 10,
                safetyStock: 5,
                maxstock: 100,
                pdt: 7,
                materialgroup: 'RAW_MATERIAL',
                location: 'WH01'
            }
        },
        'customer': {
            name: 'Customer Master',
            fields: [
                'cnNo', 'categoryName', 'name1', 'name2', 'search', 'address1', 'address2',
                'extraAddresses', 'city', 'pincode', 'region', 'country',
                'contactNo', 'name', 'email', 'isDeleted', 'isBlocked'
            ],
            sampleData: {
                cnNo: 'CUST000001', // User provides customer number
                categoryName: 'Retail Customers', // User-friendly category name
                name1: 'Sample Customer Pvt Ltd',
                name2: 'Sample Customer',
                search: 'SAMPLE_CUSTOMER',
                address1: '123, Business Street',
                address2: 'Near Business Park',
                extraAddresses: 'Alternative Address 1, Alternative Address 2',
                city: 'Mumbai',
                pincode: '400001',
                region: 'Maharashtra',
                country: 'India',
                contactNo: '9876543210',
                name: 'Contact Person Name',
                email: 'customer@example.com',
                isDeleted: false,
                isBlocked: false
            }
        },
        'vendor': {
            name: 'Vendor Master',
            fields: [
                'vnNo', 'categoryName', 'name1', 'name2', 'search', 'address1', 'address2',
                'extraAddresses', 'city', 'pincode', 'region', 'country',
                'contactNo', 'contactname', 'email', 'isDeleted', 'isBlocked'
            ],
            sampleData: {
                vnNo: 'VEND000001', // User provides vendor number
                categoryName: 'Raw Material Suppliers', // User-friendly category name
                name1: 'Sample Vendor Pvt Ltd',
                name2: 'Sample Vendor',
                search: 'SAMPLE_VENDOR',
                address1: '456, Supplier Avenue',
                address2: 'Industrial Area',
                extraAddresses: 'Warehouse Address 1, Backup Address 2',
                city: 'Delhi',
                pincode: '110001',
                region: 'Delhi',
                country: 'India',
                contactNo: '9876543210',
                contactname: 'Vendor Contact Person',
                email: 'vendor@example.com',
                isDeleted: false,
                isBlocked: false
            }
        },
        'customerPriceList': {
            name: 'Customer Price List',
            fields: [
                'categoryName', 'customerCode', 'materialCode', 'unit', 'bum',
                'orderUnit', 'salesGroup', 'taxCode', 'tandc'
            ],
            sampleData: {
                categoryName: 'Retail Customers', // Customer category name
                customerCode: 'CUST000001', // Customer code/number instead of ObjectId
                materialCode: 'MAT001', // Material code instead of ObjectId
                unit: 'KG',
                bum: 250.75,
                orderUnit: 'BOX',
                salesGroup: 'RETAIL',
                taxCode: 'GST1', // Tax code instead of ObjectId (optional)
                tandc: 'Payment terms: 30 days net. Delivery: FOB warehouse.'
            }
        },
        'vendorPriceList': {
            name: 'Vendor Price List',
            fields: [
                'categoryName', 'vendorCode', 'materialCode', 'unit', 'bum',
                'orderUnit', 'buyer', 'taxCode'
            ],
            sampleData: {
                categoryName: 'Raw Material Suppliers', // Vendor category name
                vendorCode: 'VEND000001', // Vendor code/number instead of ObjectId
                materialCode: 'MAT001', // Material code instead of ObjectId
                unit: 'KG',
                bum: 150.50,
                orderUnit: 100,
                buyer: 'John Doe',
                taxCode: 'GST1' // Tax code instead of ObjectId (optional)
            }
        },
        'tax': {
            name: 'Tax Master',
            fields: [
                'taxCode', 'taxName', 'cgst', 'sgst', 'igst'
            ],
            sampleData: {
                taxCode: 'GST1', // Max 4 characters
                taxName: 'GST Standard Rate 18%', // Max 25 characters
                cgst: '9', // Max 2 characters
                sgst: '9', // Max 2 characters
                igst: '18' // Max 2 characters
            }
        },
        'location': {
            name: 'Location Master',
            fields: [
                'name', 'address', 'city', 'state', 'country',
                'postalCode', 'contactPerson', 'contactNumber'
            ],
            sampleData: {
                name: 'Main Warehouse', // Required field
                address: '123, Industrial Area, Sector 5',
                city: 'Bangalore',
                state: 'Karnataka',
                country: 'India',
                postalCode: '560001',
                contactPerson: 'Warehouse Manager',
                contactNumber: '+91-9876543210'
            }
        },
        'generalCondition': {
            name: 'General Condition Master',
            fields: [
                'name', 'description', 'isDeleted', 'isBlocked'
            ],
            sampleData: {
                name: 'Standard Terms and Conditions',
                description: 'Default terms and conditions applicable to all transactions. Payment due within 30 days. Quality complaints must be reported within 48 hours.',
                isDeleted: false,
                isBlocked: false
            }
        },
        'process': {
            name: 'Process Master',
            fields: [
                'processId', 'processDescription', 'isDeleted', 'isBlocked'
            ],
            sampleData: {
                processId: 'PROC001',
                processDescription: 'Standard manufacturing process for raw material conversion. Includes quality checks at each stage.',
                isDeleted: false,
                isBlocked: false
            }
        }
    };

    const getCurrentTemplate = () => {
        return masterDataTemplates[masterDataType] || masterDataTemplates['material'];
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const allowedTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/json'
        ];

        if (!allowedTypes.includes(file.type)) {
            alert('Please select a valid file format (CSV, Excel, or JSON)');
            return;
        }

        setSelectedFile(file);
        setValidationErrors([]);
        setImportResults(null);
        parseFile(file);
    };

    const parseFile = async (file) => {
        setIsProcessing(true);
        setUploadProgress(10);

        try {
            if (file.type === 'application/json') {
                const text = await file.text();
                const jsonData = JSON.parse(text);
                setFileData(Array.isArray(jsonData) ? jsonData : [jsonData]);
            } else if (file.type === 'text/csv') {
                const text = await file.text();
                const lines = text.split('\n');
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                const data = lines.slice(1).filter(line => line.trim()).map(line => {
                    // Handle CSV parsing with quoted values
                    const values = [];
                    let current = '';
                    let inQuotes = false;

                    for (let i = 0; i < line.length; i++) {
                        const char = line[i];
                        if (char === '"' && (i === 0 || line[i - 1] === ',')) {
                            inQuotes = true;
                        } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i + 1] === ',')) {
                            inQuotes = false;
                        } else if (char === ',' && !inQuotes) {
                            values.push(current.trim());
                            current = '';
                        } else {
                            current += char;
                        }
                    }
                    values.push(current.trim());

                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = values[index] || '';
                    });
                    return obj;
                });
                setFileData(data);
            } else {
                const buffer = await file.arrayBuffer();
                const workbook = XLSX.read(buffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(worksheet);
                setFileData(data);
            }

            setUploadProgress(50);
            validateData();
        } catch (error) {
            console.error('Error parsing file:', error);
            setValidationErrors([{ row: 0, error: 'Failed to parse file: ' + error.message }]);
        } finally {
            setIsProcessing(false);
            setUploadProgress(100);
        }
    };

    const validateData = () => {
        const template = getCurrentTemplate();
        const errors = [];
        const preview = fileData.slice(0, 5);

        fileData.forEach((row, index) => {
            // Check required fields based on your actual backend schema
            // Update the validateData function's requiredFields object:
            const requiredFields = {
                material: ['materialId', 'categoryName', 'description', 'baseUnit', 'orderUnit'],
                customer: ['cnNo', 'categoryName', 'name1', 'search', 'address1', 'contactNo', 'region', 'country'], // Added cnNo as required
                vendor: ['vnNo', 'categoryName', 'name1', 'search', 'address1', 'contactNo', 'region', 'country'], // Added vnNo as required
                vendorPriceList: ['categoryName', 'vendorCode', 'materialCode', 'unit', 'bum', 'orderUnit'],
                customerPriceList: ['categoryName', 'customerCode', 'materialCode', 'unit', 'bum', 'orderUnit', 'salesGroup'],
                tax: ['taxCode', 'taxName', 'cgst', 'sgst', 'igst'],
                location: ['name'],
                generalCondition: [],
                process: []
            };

            const required = requiredFields[masterDataType] || [];

            required.forEach(field => {
                if (!row[field] || row[field].toString().trim() === '') {
                    errors.push({
                        row: index + 1,
                        field,
                        error: `${field} is required`
                    });
                }
            });

            // Validate field lengths for tax
            if (masterDataType === 'tax') {
                if (row.taxCode && row.taxCode.length > 4) {
                    errors.push({
                        row: index + 1,
                        field: 'taxCode',
                        error: 'taxCode must be 4 characters or less'
                    });
                }
                if (row.taxName && row.taxName.length > 25) {
                    errors.push({
                        row: index + 1,
                        field: 'taxName',
                        error: 'taxName must be 25 characters or less'
                    });
                }
                if (row.cgst && row.cgst.length > 2) {
                    errors.push({
                        row: index + 1,
                        field: 'cgst',
                        error: 'cgst must be 2 characters or less'
                    });
                }
                if (row.sgst && row.sgst.length > 2) {
                    errors.push({
                        row: index + 1,
                        field: 'sgst',
                        error: 'sgst must be 2 characters or less'
                    });
                }
                if (row.igst && row.igst.length > 2) {
                    errors.push({
                        row: index + 1,
                        field: 'igst',
                        error: 'igst must be 2 characters or less'
                    });
                }
            }
        });

        setValidationErrors(errors);
        setPreviewData(preview);
    };

    const downloadTemplate = (format) => {
        const template = getCurrentTemplate();
        const sampleData = [template.sampleData];

        if (format === 'csv') {
            const csv = [
                template.fields.join(','),
                template.fields.map(field => {
                    const value = template.sampleData[field] || '';
                    // Add quotes if value contains comma
                    return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
                }).join(',')
            ].join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${template.name.replace(/\s+/g, '_')}_Template.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } else if (format === 'excel') {
            const ws = XLSX.utils.json_to_sheet(sampleData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Template');
            XLSX.writeFile(wb, `${template.name.replace(/\s+/g, '_')}_Template.xlsx`);
        } else if (format === 'json') {
            const json = JSON.stringify(sampleData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${template.name.replace(/\s+/g, '_')}_Template.json`;
            a.click();
            window.URL.revokeObjectURL(url);
        }
    };

    const handleImport = async () => {
        if (validationErrors.length > 0) {
            alert('Please fix validation errors before importing');
            return;
        }

        setIsProcessing(true);
        try {
            const companyId = localStorage.getItem('selectedCompanyId');
            const financialYear = localStorage.getItem('financialYear');

            // Fixed URL - use master-data route
            const response = await fetch(`http://localhost:8080/api/master-data/${masterDataType}/import`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: fileData,
                    companyId,
                    financialYear
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setImportResults(result);
                if (onImport) {
                    onImport(result);
                }
            } else {
                alert('Import failed: ' + result.message);
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Import failed: ' + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const resetModal = () => {
        setSelectedFile(null);
        setFileData([]);
        setValidationErrors([]);
        setPreviewData([]);
        setShowPreview(false);
        setImportResults(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    if (!show) return null;

    const template = getCurrentTemplate();

    return (
        <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal show d-block" tabIndex="-1">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">
                                <i className="fas fa-upload me-2"></i>
                                Import {template.name}
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={handleClose}
                            ></button>
                        </div>

                        <div className="modal-body">
                            {!importResults ? (
                                <>
                                    {/* Template Download Section */}
                                    <div className="card mb-3">
                                        <div className="card-header">
                                            <h6 className="mb-0">
                                                <i className="fas fa-download me-2"></i>
                                                Download Template
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <p className="text-muted">
                                                Download the template in your preferred format and fill in your data:
                                            </p>
                                            <div className="d-flex gap-2 flex-wrap">
                                                <button
                                                    className="btn btn-outline-success btn-sm"
                                                    onClick={() => downloadTemplate('csv')}
                                                >
                                                    <i className="fas fa-file-csv me-1"></i>CSV Template
                                                </button>
                                                <button
                                                    className="btn btn-outline-info btn-sm"
                                                    onClick={() => downloadTemplate('excel')}
                                                >
                                                    <i className="fas fa-file-excel me-1"></i>Excel Template
                                                </button>
                                                <button
                                                    className="btn btn-outline-warning btn-sm"
                                                    onClick={() => downloadTemplate('json')}
                                                >
                                                    <i className="fas fa-file-code me-1"></i>JSON Template
                                                </button>
                                            </div>

                                            {/* Field Information */}
                                            <div className="mt-3">
                                                <small className="text-muted">
                                                    <strong>Template Fields:</strong> {template.fields.join(', ')}
                                                </small>
                                            </div>
                                        </div>
                                    </div>

                                    {/* File Upload Section */}
                                    <div className="card mb-3">
                                        <div className="card-header">
                                            <h6 className="mb-0">
                                                <i className="fas fa-upload me-2"></i>
                                                Upload File
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="mb-3 col-xl-6">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    className="form-control form-control-sm"
                                                    accept=".csv,.xlsx,.xls,.json"
                                                    onChange={handleFileSelect}
                                                />
                                                <div className="form-text">
                                                    Supported formats: CSV, Excel (.xlsx, .xls), JSON
                                                </div>
                                            </div>

                                            {uploadProgress > 0 && uploadProgress < 100 && (
                                                <div className="progress mb-3">
                                                    <div
                                                        className="progress-bar"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    >
                                                        {uploadProgress}%
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Validation Errors */}
                                    {validationErrors.length > 0 && (
                                        <div className="card mb-3">
                                            <div className="card-header bg-danger text-white">
                                                <h6 className="mb-0">
                                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                                    Validation Errors ({validationErrors.length})
                                                </h6>
                                            </div>
                                            <div className="card-body">
                                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                    {validationErrors.map((error, index) => (
                                                        <div key={index} className="alert alert-danger alert-sm mb-1">
                                                            <small>
                                                                Row {error.row}: {error.field && `${error.field} - `}{error.error}
                                                            </small>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Preview Section */}
                                    {previewData.length > 0 && (
                                        <div className="card mb-3">
                                            <div className="card-header">
                                                <h6 className="mb-0">
                                                    <i className="fas fa-eye me-2"></i>
                                                    Preview (First 5 records)
                                                </h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="table-responsive">
                                                    <table className="table table-sm table-bordered">
                                                        <thead className="table-light">
                                                            <tr>
                                                                {template.fields.map(field => (
                                                                    <th key={field} style={{ minWidth: '120px' }}>{field}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {previewData.map((row, index) => (
                                                                <tr key={index}>
                                                                    {template.fields.map(field => (
                                                                        <td key={field} style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                            {row[field] !== undefined && row[field] !== null ? row[field].toString() : '-'}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!importResults && fileData.length > 0 && (
                                        <div className="d-flex justify-content-end">
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={handleImport}
                                                disabled={isProcessing || validationErrors.length > 0}
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <i className="fas fa-spinner fa-spin me-1"></i>Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-upload me-1"></i>Import Data ({fileData.length} records)
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* Import Results */
                                <div className="card">
                                    <div className="card-header bg-success text-white">
                                        <h6 className="mb-0">
                                            <i className="fas fa-check-circle me-2"></i>
                                            Import Complete
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="text-center">
                                                    <h3 className="text-success">{importResults.results?.imported || 0}</h3>
                                                    <p className="text-muted">Records Imported</p>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="text-center">
                                                    <h3 className="text-warning">{importResults.results?.updated || 0}</h3>
                                                    <p className="text-muted">Records Updated</p>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="text-center">
                                                    <h3 className="text-danger">{importResults.results?.failed || 0}</h3>
                                                    <p className="text-muted">Records Failed</p>
                                                </div>
                                            </div>
                                        </div>

                                        {importResults.results?.errors && importResults.results.errors.length > 0 && (
                                            <div className="mt-3">
                                                <h6>Error Details:</h6>
                                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                    {importResults.results.errors.map((error, index) => (
                                                        <div key={index} className="alert alert-danger alert-sm mb-1">
                                                            <small>{error}</small>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-3 d-flex justify-content-end">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={handleClose}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DataImportModal;