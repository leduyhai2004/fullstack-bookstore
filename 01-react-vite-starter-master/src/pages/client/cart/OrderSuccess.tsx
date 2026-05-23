import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';

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
        <div className="success-actions">
          <Button
            type="primary"
            onClick={() => navigate('/')}
            className="btn-continue-shopping"
            icon={<ArrowLeftOutlined />}
          >
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
