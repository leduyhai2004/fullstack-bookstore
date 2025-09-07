import { Modal, notification, Table } from "antd";
import React from 'react';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { message, Upload } from 'antd';
import ExcelJS from 'exceljs';
import { createListUserAPI } from "../../../services/api";

interface IProps {
    openModelImport: boolean;
    setOpenModelImport: (open: boolean) => void;
    refreshTable: () => void;
}

interface IDataImport {
    fullName: string;
    email: string;
    phone: string;
}

const { Dragger } = Upload;

const ImportUser = (props: IProps) => {
    const { openModelImport, setOpenModelImport, refreshTable } = props;
    
    
    const [dataImport, setDataImport] = React.useState<IDataImport[]>([]);
    const [isSubmit, setIsSubmit] = React.useState<boolean>(false);

    const handleImport = async () => {
        setIsSubmit(true);
        const dataSubmit = dataImport.map(item => ({
            ...item,
            password: '123456' // Default password
        }));

            const response = await createListUserAPI(dataSubmit);
            if (response.data) {
                notification.success({
                    message: 'Import Result',
                    description: `Successfully imported ${response.data?.countSuccess} users. Failed to import ${response.data?.countFail} users.`,
                    duration: 5,
                });
            }
            setIsSubmit(false);
            setOpenModelImport(false);
            setDataImport([]);
            refreshTable();
    }

    const uploadProps: UploadProps = {
        name: 'file',
        multiple: false,
        maxCount: 1,
        accept: ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel",
        action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',

        customRequest({ file, onSuccess }) {
            setTimeout(() => {
                if (onSuccess) onSuccess("ok");
            }, 0);
        },

        async onChange(info) {
            const { status } = info.file;
            
            if (status === 'done') {
                try {
                    const file = info.fileList[0].originFileObj!;
                    console.log('Processing file:', file.name);

                    // Load file to buffer
                    const workBook = new ExcelJS.Workbook();
                    const arrayBuffer = await file.arrayBuffer();
                    await workBook.xlsx.load(arrayBuffer);

                    // Convert file to json
                    let jsonData: IDataImport[] = [];
                    
                    // Lấy worksheet đầu tiên
                    const worksheet = workBook.worksheets[0];
                    
                    if (worksheet) {
                        // Đọc header row (dòng đầu tiên)
                        const headerRow = worksheet.getRow(1);
                        const headers: string[] = [];
                        
                        headerRow.eachCell((cell, colNumber) => {
                            headers[colNumber] = cell.value?.toString() || '';
                        });

                        console.log('Headers found:', headers);

                        // Đọc data từ dòng 2 trở đi
                        worksheet.eachRow((row, rowNumber) => {
                            if (rowNumber === 1) return; // Skip header row
                            
                            const rowData: any = {};
                            let hasData = false;

                            row.eachCell((cell, colNumber) => {
                                if (headers[colNumber]) {
                                    const cellValue = cell.value?.toString() || '';
                                    rowData[headers[colNumber]] = cellValue;
                                    if (cellValue.trim()) hasData = true;
                                }
                            });

                            // Chỉ thêm row nếu có data
                            if (hasData) {
                                // Map theo format cần thiết
                                const mappedData: IDataImport = {
                                    fullName: rowData['fullName'] || rowData['Full Name'] || rowData['Name'] || '',
                                    email: rowData['email'] || rowData['Email'] || '',
                                    phone: rowData['phone'] || rowData['Phone'] || ''
                                };
                                jsonData.push(mappedData);
                            }
                        });
                    }

                    console.log('Parsed data:', jsonData);
                    setDataImport(jsonData);
                    message.success(`${info.file.name} file uploaded successfully. Found ${jsonData.length} records.`);
                    
                } catch (error) {
                    console.error('Error processing file:', error);
                    message.error('Error processing the Excel file');
                }
            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },

        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };

    return (
        <>
            <Modal
                title="Import Users"
                open={openModelImport}
                onOk={() => {
                    handleImport();
                }}
                onCancel={() => {
                    setOpenModelImport(false);
                    setDataImport([]);
                }}
                maskClosable={false}
                width={800}
            >
                <Dragger {...uploadProps}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    <p className="ant-upload-hint">
                        Support for Excel files (.xlsx, .xls).
                        download file sample here
                        <a href="/01-react-vite-starter-master/src/assets/[React Test Fresher TS] - Data Users.xlsx" download="sample.xlsx" id="download">
                            Download Sample File
                        </a>

                    </p>
                </Dragger>  

                {dataImport.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                        <h4>Preview Data ({dataImport.length} records):</h4>
                        <Table 
                            dataSource={dataImport} 
                            rowKey={(record, index) => index?.toString() || '0'}
                            pagination={{ pageSize: 5 }}
                            columns={[
                                {
                                    title: 'Full Name',
                                    dataIndex: 'fullName',
                                    key: 'fullName',
                                },
                                {
                                    title: 'Phone',
                                    dataIndex: 'phone',
                                    key: 'phone',
                                },
                                {
                                    title: 'Email',
                                    dataIndex: 'email',
                                    key: 'email',
                                },
                            ]} 
                        />
                    </div>
                )}
            </Modal>
        </>
    );
};

export default ImportUser;