import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';
import { useRef, useState } from 'react';
import { getUserAPI } from '../../../services/api';

/* eslint-disable @typescript-eslint/no-explicit-any */


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
        render: (text) => <a href={`/user/${text}`}>{text}</a>,

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
        //format date for me
        render: (text: unknown) => <span>{text ? new Date(text as string | number | Date).toLocaleString() : ''}</span>,
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
    },
];



const TableUser = () => {
    const actionRef = useRef<ActionType>();
    const [meta, setMeta] = useState({
        current : 1,
        pageSize: 5,
        pages : 0,
        total : 0
    })
    return (
        <>
            <ProTable<IUserTable>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);
                    const res = await getUserAPI(params?.current ?? 1, params?.pageSize ?? 5);
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
                            actionRef.current?.reload();
                        }}
                        type="primary"
                    >
                        Add new
                    </Button>

                ]}
            />
        </>
    );
};

export default TableUser;