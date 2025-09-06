import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';
import { useRef, useState } from 'react';
import { getUserAPI } from '../../../services/api';
import { dateRangeValidate } from '../../../services/helper';
import DetailUser from './detail.user';
import CreateUser from './create.user';

/* eslint-disable @typescript-eslint/no-explicit-any */





type TSearch =  {
    fullName : string,
    email : string,
    phone : string,
    createdAt : string,
    createdAtRange : string;
}



const TableUser = () => {
    const actionRef = useRef<ActionType>();
    const [meta, setMeta] = useState({
        current : 1,
        pageSize: 5,
        pages : 0,
        total : 0
    })

    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataViewDetail, setDataViewDetail] = useState<IUserTable | null>(null);

    const [openModelCreate, setOpenModelCreate] = useState<boolean>(false);

    const columns: ProColumns<IUserTable>[] = [
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
        title: 'Full Name',
        dataIndex: 'fullName',
    },
    {
        title: 'Email',
        dataIndex: 'email',
    },
    {
        title: 'Phone',
        dataIndex: 'phone',
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
        //icon delete and update on antd(like button with icon) and I want color
        render: (text, record, _, action) => [
            <Space size="middle">
                <Button
                    key="edit"
                    icon={<EditOutlined />}
                    style={{ color: 'blue' }}
                    // onClick={() => action?.startEditable?.(record._id)}
                />
                <Button
                    key="delete"
                    icon={<DeleteOutlined />}
                    // onClick={() => handleDelete(record._id)}
                    style={{ color: 'red' }}
                />
            </Space>,
        ],
        hideInSearch: true,
    },
    ];

    const refreshTable = () => {
        actionRef.current?.reload();
    }
    return (
        <>
            <ProTable<IUserTable, TSearch>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);

                    let query = '';
                    if(params){
                        query += `current=${params.current}&pageSize=${params.pageSize}`;
                        if(params.email){
                            query += `&email=/${params.email}/i`;
                        }
                        if(params.fullName){
                            query += `&fullName=/${params.fullName}/i`;
                        }
                        if(params.phone){
                            query += `&phone=/${params.phone}/i`;
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


                    const res = await getUserAPI(query);
                    if(res && res.data){
                        setMeta(res.data.meta);
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
                    showTotal: (total, range) => {return <div>{range[0]}-{range[1]} of {total} users</div>}
                }}
                headerTitle="Table user"
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
                    </Button>

                ]}
            />
            <DetailUser
                openViewDetail={openViewDetail}
                setOpenViewDetail={setOpenViewDetail}
                dataViewDetail={dataViewDetail}
                setDataViewDetail={setDataViewDetail}
            />

            <CreateUser
                openModelCreate={openModelCreate}
                setOpenModelCreate={setOpenModelCreate}
                refreshTable={refreshTable}
            />
        </>
    );
};

export default TableUser;