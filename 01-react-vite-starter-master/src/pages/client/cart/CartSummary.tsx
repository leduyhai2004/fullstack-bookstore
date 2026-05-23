import { Card, Divider, Button } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';

const formatVND = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
};

interface CartSummaryProps {
  totalAmount: number;
  totalItems: number;
  onCheckout: () => void;
}

const CartSummary = ({ totalAmount, totalItems, onCheckout }: CartSummaryProps) => {
  return (
    <Card title="Tóm Tắt Đơn Hàng" className="order-summary-card">
      <div className="summary-row">
        <span className="label">Tạm tính</span>
        <span className="value">{formatVND(totalAmount)}</span>
      </div>
      
      <Divider style={{ margin: '12px 0' }} />
      
      <div className="summary-row total-row">
        <span className="label">Tổng tiền</span>
        <span className="value">{formatVND(totalAmount)}</span>
      </div>
      
      <Divider style={{ margin: '12px 0 20px 0' }} />
      
      <Button
        type="primary"
        className="btn-checkout"
        icon={<CreditCardOutlined />}
        onClick={onCheckout}
      >
        Mua Hàng ({totalItems})
      </Button>
    </Card>
  );
};

export default CartSummary;
