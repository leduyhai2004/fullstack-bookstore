import { CloudUploadOutlined, DeleteOutlined, EditOutlined, ExportOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';
import { useRef, useState } from 'react';
import { deleteUserAPI, getBookAPI, getUserAPI } from '../../../services/api';
import { dateRangeValidate } from '../../../services/helper';
import DetailUser from '../user/detail.user';
import CreateUser from '../user/create.user';
import ImportUser from '../data/import.user';
import { CSVLink } from 'react-csv';
import UpdateUser from '../user/update.user';
import { Table } from 'antd';
import { Value } from 'sass';
import CreateBook from './create.book';
import UpdateBook from './update.book';
import DetailBook from './detail.book';

/* eslint-disable @typescript-eslint/no-explicit-any */
type TSearch =  {
    mainText : string,
    author : string,
    price : number,
    createdAt : string,
    createdAtRange : string;
}



const TableBook = () => {
    const actionRef = useRef<ActionType>();
    const [meta, setMeta] = useState({
        current : 1,
        pageSize: 5,
        pages : 0,
        total : 0
    })

    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataViewDetail, setDataViewDetail] = useState<IBookTable | null>(null);

    const [openUpdateUser, setOpenUpdateUser] = useState<boolean>(false);
    const [dataUpdateUser, setDataUpdateUser] = useState<IBookTable | null>(null);

    const [openModelCreate, setOpenModelCreate] = useState<boolean>(false);

    const [openModelImport, setOpenModelImport] = useState<boolean>(false);

    const[currentDataTable, setCurrentDataTable] = useState<IBookTable[]>([]);

    const columns: ProColumns<IBookTable>[] = [
    {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 48,
    },
    {
        //make Id is <a></a> tag
        title: 'Id',
        dataIndex: '_id',
        hideInSearch: true,
        render(dom, entity) {
            return <a
             onClick={() => {
                setDataViewDetail(entity);
                setOpenViewDetail(true);
            }}
            href='#'>{entity._id}</a>;
        },
    },
    {
        title: 'Tên sách',
        dataIndex: 'mainText',
    },
    {
        title: 'Thể loại',
        dataIndex: 'category',
        hideInSearch: true,
    },
    {
        title: 'Giá',
        dataIndex: 'price',
        render: (_, record: IBookTable) => {
        const price = typeof _ === 'number' ? _ : record.price;
            return (
                <>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                </>
            );
        },
    },
    {
        title: 'Tác giả',
        dataIndex: 'author',
    },
    {
        title: 'Created At',
        dataIndex: 'createdAt',
        valueType: 'date', // để hiển thị đúng ngày giờ
        hideInSearch: true,    // không hiện ô search cho cột này
        sorter : true,        // hiện mũi tên sắp xếp
    },
    {
        title: 'Created At',
        dataIndex: 'createdAtRange',
        valueType: 'dateRange', // để hiện search theo khoảng
        hideInTable: true,      // không hiện trên bảng
    },
    {
        title: 'Action',
        hideInSearch: true,
        render: (dom, entity) => {
            return (
                <Space>
                    <Button
                        icon={<DeleteOutlined />}
                        onClick={async () => {
                            console.log('delete', entity);
                            // Call delete API here
                            await deleteUserAPI(entity._id);
                            refreshTable();
                        }}
                    ></Button>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                            setDataUpdateUser(entity);
                            setOpenUpdateUser(true);
                        }}
                    ></Button>
                </Space>
            );
        },
    },
    ];

    const refreshTable = () => {
        actionRef.current?.reload();
    }
    return (
        <>
            <ProTable<IBookTable, TSearch>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);

                    let query = '';
                    if(params){
                        query += `current=${params.current}&pageSize=${params.pageSize}`;
                        if(params.mainText){
                            query += `&mainText=/${params.mainText}/i`;
                        }
                        if(params.author){
                            query += `&author=/${params.author}/i`;
                        }
                        if(params.price){
                            query += `&price=/${params.price}/i`;
                        }
                        const createdDateRange = dateRangeValidate(params.createdAtRange);
                        if(createdDateRange){
                            query += `&createdAt>=${createdDateRange[0]}&createdAt[<=]=${createdDateRange[1]}`;
                        }
                    }
                    //default
                    query += `&sort=-createdAt`;

                    if(sort && sort.createdAt){
                        query += `&sort=${sort.createdAt === 'ascend' ? 'createdAt' : '-createdAt'}`;
                    }


                    const res = await getBookAPI(query);
                    if(res && res.data){
                        setMeta(res.data.meta);
                        setCurrentDataTable(res.data.result);
                    }
                    return {
                        data: res.data?.result,
                        page: 1,
                        success: true,
                        total: res.data?.meta.total
                    }

                }}

                rowKey="_id"

                pagination={{
                    current : meta.current,
                    pageSize : meta.pageSize,
                    showSizeChanger : true,
                    total : meta.total,
                    showTotal: (total, range) => {return <div>{range[0]}-{range[1]} of {total} books</div>}
                }}
                headerTitle="Table book"
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setOpenModelCreate(true);
                        }}
                        type="primary"
                    >
                        Add new
                    </Button>,

                    <Button
                        key="button"
                        icon={<CloudUploadOutlined />}
                        onClick={() => {
                            setOpenModelImport(true);
                        }}
                        type='dashed'
                    >
                        Import
                    </Button>,

                    <Button
                        key="button"
                        icon={<ExportOutlined />}
                        type='dashed'
                    >
                        <CSVLink
                            data={currentDataTable}
                            filename={"users.csv"}
                        >
                            Export
                        </CSVLink>
                    </Button>

                ]}
            />
            <DetailBook
                openViewDetail={openViewDetail}
                setOpenViewDetail={setOpenViewDetail}
                dataViewDetail={dataViewDetail}
                setDataViewDetail={setDataViewDetail}
            />

            <CreateBook
                openModelCreate={openModelCreate}
                setOpenModelCreate={setOpenModelCreate}
            />

            {/* <UpdateBook
                openUpdateUser={openUpdateUser}
                setOpenUpdateUser={setOpenUpdateUser}
                dataUpdateUser={dataUpdateUser}
                setDataUpdateUser={setDataUpdateUser}
                refreshTable={refreshTable}
            /> */}
        </>
    );
};

export default TableBook;