import { useState, useEffect, useMemo } from 'react';
import { Spin, Modal, Tag, Button, Empty, message, Divider } from 'antd';
import { EyeOutlined, HistoryOutlined, RightOutlined, LeftOutlined, CloseOutlined } from '@ant-design/icons';
import { getOrderHistoryAPI } from '../../services/api';
import '../../styles/order.scss';

// Date Formatter Helper (DD-MM-YYYY)
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Currency Formatter Helper (VND)
const formatVND = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
};

const HistoryPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [orderList, setOrderList] = useState<IOrderHistory[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState<IOrderHistory | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // 1. Fetch History from backend API
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await getOrderHistoryAPI();
        if (res && res.data) {
          // Cast data as array
          const fetchedData = Array.isArray(res.data) ? res.data : [res.data];
          setOrderList(fetchedData);
        }
      } catch (error) {
        console.error("Không thể tải lịch sử đơn hàng thực tế:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // 2. Predefined Mock Data exactly as requested (6 rows, date 20-11-2024)
  const mockOrders: IOrderHistory[] = useMemo(() => [
    {
      _id: 'mock-1',
      name: 'Khách hàng Demo 1',
      type: 'COD',
      email: 'demo1@example.com',
      phone: '0987654321',
      userId: 'mock-user',
      totalPrice: 171000,
      paymentStatus: 'Thành công',
      paymentRef: 'COD_REF_1',
      createdAt: '2024-11-20T10:00:00.000Z',
      updatedAt: '2024-11-20T10:00:00.000Z',
      __v: 0,
      detail: [
        {
          _id: 'book-mock-1',
          bookName: 'Sách học React TypeScript nâng cao',
          quantity: 1
        }
      ]
    },
    {
      _id: 'mock-2',
      name: 'Khách hàng Demo 2',
      type: 'BANKING',
      email: 'demo2@example.com',
      phone: '0987654322',
      userId: 'mock-user',
      totalPrice: 820000,
      paymentStatus: 'Thành công',
      paymentRef: 'BANK_REF_2',
      createdAt: '2024-11-20T11:30:00.000Z',
      updatedAt: '2024-11-20T11:30:00.000Z',
      __v: 0,
      detail: [
        {
          _id: 'book-mock-2',
          bookName: 'Fullstack Web Development với Node.js & React',
          quantity: 2
        }
      ]
    },
    {
      _id: 'mock-3',
      name: 'Khách hàng Demo 3',
      type: 'COD',
      email: 'demo3@example.com',
      phone: '0987654323',
      userId: 'mock-user',
      totalPrice: 171000,
      paymentStatus: 'Thành công',
      paymentRef: 'COD_REF_3',
      createdAt: '2024-11-20T13:15:00.000Z',
      updatedAt: '2024-11-20T13:15:00.000Z',
      __v: 0,
      detail: [
        {
          _id: 'book-mock-1',
          bookName: 'Sách học React TypeScript nâng cao',
          quantity: 1
        }
      ]
    },
    {
      _id: 'mock-4',
      name: 'Khách hàng Demo 4',
      type: 'BANKING',
      email: 'demo4@example.com',
      phone: '0987654324',
      userId: 'mock-user',
      totalPrice: 820000,
      paymentStatus: 'Thành công',
      paymentRef: 'BANK_REF_4',
      createdAt: '2024-11-20T14:45:00.000Z',
      updatedAt: '2024-11-20T14:45:00.000Z',
      __v: 0,
      detail: [
        {
          _id: 'book-mock-2',
          bookName: 'Fullstack Web Development với Node.js & React',
          quantity: 2
        }
      ]
    },
    {
      _id: 'mock-5',
      name: 'Khách hàng Demo 5',
      type: 'COD',
      email: 'demo5@example.com',
      phone: '0987654325',
      userId: 'mock-user',
      totalPrice: 171000,
      paymentStatus: 'Thành công',
      paymentRef: 'COD_REF_5',
      createdAt: '2024-11-20T16:00:00.000Z',
      updatedAt: '2024-11-20T16:00:00.000Z',
      __v: 0,
      detail: [
        {
          _id: 'book-mock-1',
          bookName: 'Sách học React TypeScript nâng cao',
          quantity: 1
        }
      ]
    },
    {
      _id: 'mock-6',
      name: 'Khách hàng Demo 6',
      type: 'COD',
      email: 'demo6@example.com',
      phone: '0987654326',
      userId: 'mock-user',
      totalPrice: 171000,
      paymentStatus: 'Thành công',
      paymentRef: 'COD_REF_6',
      createdAt: '2024-11-20T17:20:00.000Z',
      updatedAt: '2024-11-20T17:20:00.000Z',
      __v: 0,
      detail: [
        {
          _id: 'book-mock-1',
          bookName: 'Sách học React TypeScript nâng cao',
          quantity: 1
        }
      ]
    }
  ], []);

  // 3. Combine Real + Mock Data
  // Place real orders first, and mock orders next to always fulfill the user's specific mock items request
  const allOrders = useMemo(() => {
    return [...orderList, ...mockOrders];
  }, [orderList, mockOrders]);

  // 4. Client-side Paginations
  const totalPages = Math.ceil(allOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return allOrders.slice(startIndex, startIndex + pageSize);
  }, [allOrders, currentPage]);

  const handleOpenDetails = (order: IOrderHistory) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  return (
    <div className="history-page-container">
      <div className="history-page-inner">
        <h2 className="history-title">Lịch sử mua hàng</h2>

        {loading ? (
          <div className="history-spinner-wrapper">
            <Spin size="large" tip="Đang tải lịch sử mua sắm..." />
          </div>
        ) : allOrders.length > 0 ? (
          <div className="history-content-wrapper">
            {/* Table Layout Wrapper with horizontal scroll responsive */}
            <div className="history-table-responsive">
              <table className="history-table">
                <thead>
                  <tr>
                    <th className="th-stt">STT</th>
                    <th className="th-time">Thời gian</th>
                    <th className="th-amount">Tổng số tiền</th>
                    <th className="th-status">Trạng thái</th>
                    <th className="th-details">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order, idx) => {
                    const stt = (currentPage - 1) * pageSize + idx + 1;
                    return (
                      <tr key={order._id} className="history-table-row">
                        <td className="td-stt">{stt}</td>
                        <td className="td-time">{formatDate(order.createdAt)}</td>
                        <td className="td-amount">{formatVND(order.totalPrice)}</td>
                        <td className="td-status">
                          <span className="badge-success">Thành công</span>
                        </td>
                        <td className="td-details">
                          <Button
                            type="link"
                            className="btn-view-details"
                            onClick={() => handleOpenDetails(order)}
                          >
                            Xem chi tiết
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination custom controls underneath on the right */}
            <div className="history-pagination-wrapper">
              <div className="custom-pagination">
                <button
                  className={`btn-pag-nav ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={() => currentPage > 1 && setCurrentPage(prev => prev - 1)}
                  disabled={currentPage === 1}
                >
                  <LeftOutlined />
                </button>

                {Array.from({ length: totalPages }).map((_, pageIdx) => {
                  const pageNum = pageIdx + 1;
                  return (
                    <button
                      key={pageNum}
                      className={`btn-pag-num ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  className={`btn-pag-nav ${currentPage === totalPages ? 'disabled' : ''}`}
                  onClick={() => currentPage < totalPages && setCurrentPage(prev => prev + 1)}
                  disabled={currentPage === totalPages}
                >
                  <RightOutlined />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="history-empty-card">
            <Empty
              image={<HistoryOutlined style={{ fontSize: '4.5rem', color: '#cbd5e1' }} />}
              description={<span>Bạn chưa thực hiện bất kỳ giao dịch nào.</span>}
            />
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal
        title={
          <div className="modal-title-custom">
            <span>Chi Tiết Đơn Hàng</span>
            <span className="modal-ref-label">Mã: {selectedOrder?.paymentRef || selectedOrder?._id}</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setModalOpen(false)} style={{ borderRadius: '6px' }}>
            Đóng
          </Button>
        ]}
        width={640}
        className="history-details-modal"
        closeIcon={<CloseOutlined style={{ fontSize: '1rem', color: '#64748b' }} />}
      >
        {selectedOrder && (
          <div className="modal-order-content">
            <div className="order-profile-summary">
              <p><strong>Khách hàng:</strong> {selectedOrder.name}</p>
              <p><strong>Điện thoại:</strong> {selectedOrder.phone}</p>
              <p><strong>Ngày lập đơn:</strong> {formatDate(selectedOrder.createdAt)}</p>
              <p><strong>Phương thức:</strong> {selectedOrder.type === 'COD' ? 'Thanh toán COD' : 'Chuyển khoản ngân hàng'}</p>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <h4 className="modal-books-heading">Danh sách sản phẩm mua</h4>
            <div className="modal-books-list">
              {selectedOrder.detail.map((book, idx) => (
                <div key={book._id || idx} className="modal-book-row">
                  <span className="book-index">{idx + 1}.</span>
                  <div className="book-info">
                    <span className="book-name">{book.bookName}</span>
                    <span className="book-qty">Số lượng: {book.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div className="modal-totals-summary">
              <div className="total-row-item">
                <span>Trạng thái:</span>
                <span className="badge-success">Thành công</span>
              </div>
              <div className="total-row-item bold-red-row">
                <span>Tổng tiền:</span>
                <span className="amount-total">{formatVND(selectedOrder.totalPrice)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HistoryPage;
