import { useState, useEffect } from 'react';
import { Divider, Radio, Input, Button, message } from 'antd';

const { TextArea } = Input;

const formatVND = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
};

interface CheckoutFormProps {
  userFullName: string;
  userPhone: string;
  totalAmount: number;
  totalItems: number;
  onPlaceOrder: (formData: { name: string; phone: string; address: string; paymentMethod: string }) => void;
  isSubmitting: boolean;
}

const CheckoutForm = ({
  userFullName,
  userPhone,
  totalAmount,
  totalItems,
  onPlaceOrder,
  isSubmitting
}: CheckoutFormProps) => {
  const [name, setName] = useState<string>(userFullName);
  const [phone, setPhone] = useState<string>(userPhone);
  const [address, setAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('COD');

  // Keep state sync if user loaded after component mount
  useEffect(() => {
    if (userFullName) setName(userFullName);
    if (userPhone) setPhone(userPhone);
  }, [userFullName, userPhone]);

  const handleSubmit = () => {
    if (!name.trim()) {
      message.error("Vui lòng điền Họ tên giao hàng!");
      return;
    }
    if (!phone.trim()) {
      message.error("Vui lòng điền Số điện thoại nhận hàng!");
      return;
    }
    if (!address.trim()) {
      message.error("Vui lòng điền Địa chỉ nhận hàng!");
      return;
    }
    onPlaceOrder({ name, phone, address, paymentMethod });
  };

  return (
    <div className="checkout-form-card">
      <h3 className="form-section-title">Hình thức thanh toán</h3>
      <div className="payment-methods-wrapper">
        <Radio.Group
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="payment-radio-group"
        >
          <Radio value="COD" className="payment-radio-option">
            Thanh toán khi nhận hàng
          </Radio>
          <Radio value="BANKING" className="payment-radio-option">
            Chuyển khoản ngân hàng
          </Radio>
        </Radio.Group>
      </div>

      <Divider style={{ margin: '20px 0 16px 0' }} />

      <h3 className="form-section-title">Thông tin giao hàng</h3>
      <div className="checkout-inputs-wrapper">
        <div className="form-field">
          <label className="field-label required">Họ tên</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập họ tên người nhận"
            className="checkout-input"
          />
        </div>

        <div className="form-field">
          <label className="field-label required">Số điện thoại</label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Nhập số điện thoại nhận hàng"
            className="checkout-input"
          />
        </div>

        <div className="form-field">
          <label className="field-label required">Địa chỉ nhận hàng</label>
          <TextArea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
            rows={3}
            className="checkout-textarea"
          />
        </div>
      </div>

      <Divider style={{ margin: '20px 0 16px 0' }} />

      <div className="checkout-pricing-summary">
        <div className="summary-row">
          <span className="label">Tạm tính:</span>
          <span className="value-normal">{formatVND(totalAmount)}</span>
        </div>
        <div className="summary-row total-row">
          <span className="label">Tổng tiền:</span>
          <span className="value-large">{formatVND(totalAmount)}</span>
        </div>
      </div>

      <Button
        type="primary"
        className="btn-place-order"
        loading={isSubmitting}
        onClick={handleSubmit}
      >
        Đặt Hàng ({totalItems})
      </Button>
    </div>
  );
};

export default CheckoutForm;
