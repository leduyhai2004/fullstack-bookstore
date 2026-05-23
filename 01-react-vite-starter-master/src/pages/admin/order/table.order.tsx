import { ExportOutlined, EyeOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Drawer, Space, Descriptions, Table, Tag } from 'antd';
import { useRef, useState } from 'react';
import { getOrderAPI } from '../../../services/api';
import { dateRangeValidate } from '../../../services/helper';
import { CSVLink } from 'react-csv';

type TSearch = {
  name: string;
  phone: string;
  createdAtRange: string;
};

const TableOrder = () => {
  const actionRef = useRef<ActionType>();
  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 5,
    pages: 0,
    total: 0,
  });

  const [openDetailDrawer, setOpenDetailDrawer] = useState<boolean>(false);
  const [dataDetail, setDataDetail] = useState<any | null>(null);
  const [currentDataTable, setCurrentDataTable] = useState<any[]>([]);

  // Columns definition for Order Table
  const columns: ProColumns<any>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: 'Id',
      dataIndex: '_id',
      hideInSearch: true,
      render(_, entity) {
        return (
          <a
            onClick={() => {
              setDataDetail(entity);
              setOpenDetailDrawer(true);
            }}
            href="#"
          >
            {entity._id}
          </a>
        );
      },
    },
    {
      title: 'Khách hàng',
      dataIndex: 'name',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'type',
      hideInSearch: true,
      render: (_, record) => {
        return (
          <Tag color={record.type === 'MOMO' ? 'magenta' : 'blue'}>
            {record.type}
          </Tag>
        );
      },
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      hideInSearch: true,
      sorter: true,
      render: (_, record) => {
        return (
          <span style={{ fontWeight: 600, color: '#ff4d4f' }}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(record.totalPrice ?? 0)}
          </span>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      valueType: 'date',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: 'Khoảng ngày tạo',
      dataIndex: 'createdAtRange',
      valueType: 'dateRange',
      hideInTable: true,
    },
    {
      title: 'Hành động',
      hideInSearch: true,
      render: (_, entity) => {
        return (
          <Space>
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setDataDetail(entity);
                setOpenDetailDrawer(true);
              }}
            >
              Chi tiết
            </Button>
          </Space>
        );
      },
    },
  ];

  // Nested book item table columns inside detail view
  const detailTableColumns = [
    {
      title: 'Tên sách',
      dataIndex: 'bookName',
      key: 'bookName',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
    },
    {
      title: 'Mã sách',
      dataIndex: '_id',
      key: '_id',
    },
  ];

  return (
    <>
      <ProTable<any, TSearch>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort) => {
          let query = '';
          if (params) {
            query += `current=${params.current}&pageSize=${params.pageSize}`;
            if (params.name) {
              query += `&name=/${params.name}/i`;
            }
            if (params.phone) {
              query += `&phone=/${params.phone}/i`;
            }
            const createdDateRange = dateRangeValidate(params.createdAtRange);
            if (createdDateRange) {
              query += `&createdAt>=${createdDateRange[0]}&createdAt[<=]=${createdDateRange[1]}`;
            }
          }

          // sorting parameters
          if (sort && sort.totalPrice) {
            query += `&sort=${
              sort.totalPrice === 'ascend' ? 'totalPrice' : '-totalPrice'
            }`;
          } else if (sort && sort.createdAt) {
            query += `&sort=${
              sort.createdAt === 'ascend' ? 'createdAt' : '-createdAt'
            }`;
          } else {
            query += `&sort=-createdAt`;
          }

          const res = await getOrderAPI(query);
          if (res && res.data) {
            setMeta(res.data.meta);
            setCurrentDataTable(res.data.result);
          }
          return {
            data: res.data?.result,
            page: params.current,
            success: true,
            total: res.data?.meta.total,
          };
        }}
        rowKey="_id"
        pagination={{
          current: meta.current,
          pageSize: meta.pageSize,
          showSizeChanger: true,
          total: meta.total,
          showTotal: (total, range) => (
            <div>
              {range[0]}-{range[1]} của {total} đơn hàng
            </div>
          ),
        }}
        headerTitle="Danh sách đơn hàng"
        toolBarRender={() => [
          <Button
            key="export-btn"
            icon={<ExportOutlined />}
            type="dashed"
          >
            <CSVLink
              data={currentDataTable}
              filename={'orders.csv'}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              Xuất File CSV
            </CSVLink>
          </Button>,
        ]}
      />

      {/* Drawer showing Order Detailed Information */}
      <Drawer
        title="Chi tiết đơn hàng"
        width={680}
        open={openDetailDrawer}
        onClose={() => {
          setOpenDetailDrawer(false);
          setDataDetail(null);
        }}
        destroyOnClose
      >
        {dataDetail && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions title="Thông tin chung" bordered column={1}>
              <Descriptions.Item label="Mã đơn hàng">
                {dataDetail._id}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {dataDetail.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {dataDetail.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {dataDetail.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ nhận hàng">
                {dataDetail.address || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Hình thức thanh toán">
                <Tag color={dataDetail.type === 'MOMO' ? 'magenta' : 'blue'}>
                  {dataDetail.type}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng hóa đơn">
                <span style={{ fontWeight: 700, color: '#ff4d4f' }}>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(dataDetail.totalPrice ?? 0)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian tạo">
                {new Date(dataDetail.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'rgba(0, 0, 0, 0.85)',
                  marginBottom: 16,
                }}
              >
                Danh sách sản phẩm đã mua
              </div>
              <Table
                dataSource={dataDetail.detail || []}
                columns={detailTableColumns}
                pagination={false}
                rowKey={(record: any, idx) => `${record._id}-${idx}`}
                bordered
              />
            </div>
          </Space>
        )}
      </Drawer>
    </>
  );
};

export default TableOrder;
