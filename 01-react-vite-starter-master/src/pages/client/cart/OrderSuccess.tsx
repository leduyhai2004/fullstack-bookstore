import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { CheckCircleOutlined, ArrowLeftOutlined, HistoryOutlined } from '@ant-design/icons';

const OrderSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="order-success-wrapper">
      <div className="success-card">
        <div className="success-icon-container">
          <CheckCircleOutlined className="icon-pulse" />
        </div>
        <h2 className="success-title">Đặt Hàng Thành Công!</h2>
        <p className="success-message">
          Cảm ơn quý khách đã mua sắm tại Bookstore. Đơn đặt hàng của quý khách đã được lưu và đang được tiến hành xử lý giao nhận.
        </p>
        <div className="success-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button
            type="primary"
            onClick={() => navigate('/')}
            className="btn-continue-shopping"
            icon={<ArrowLeftOutlined />}
          >
            Tiếp tục mua sắm
          </Button>
          <Button
            onClick={() => navigate('/history')}
            className="btn-view-history"
            icon={<HistoryOutlined />}
            style={{ height: '48px', borderRadius: '8px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            Xem lịch sử đơn hàng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
