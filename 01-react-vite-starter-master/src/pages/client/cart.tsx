import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentApp } from '../../components/context/app.context';
import { Layout, Row, Col, Empty, Button, message } from 'antd';
import { ShoppingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { placeOrderAPI } from '../../services/api';

// Split sub-components
import CartStepBar from './cart/CartStepBar';
import CartItemsList from './cart/CartItemsList';
import CartSummary from './cart/CartSummary';
import CheckoutForm from './cart/CheckoutForm';
import OrderSuccess from './cart/OrderSuccess';

import '../../styles/order.scss';

const { Content } = Layout;

const CartPage = () => {
  const { cart, setCart, user } = useCurrentApp();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  // 1. Recalculate Tạm tính and Tổng tiền
  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.detail.price * item.quantity), 0);
  }, [cart]);

  // Recalculate total items in cart
  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // 2. Quantity Change Handler (Min: 1)
  const handleQuantityChange = (value: number | null, bookId: string) => {
    if (value === null || value < 1) return;

    const updatedCart = cart.map(item => {
      if (item._id === bookId) {
        // Cap quantity at stock limits
        const cappedQty = Math.min(value, item.detail.quantity);
        if (value > item.detail.quantity) {
          message.warning(`Số lượng tồn kho tối đa chỉ còn ${item.detail.quantity} cuốn`);
        }
        return {
          ...item,
          quantity: cappedQty
        };
      }
      return item;
    });

    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // 3. Delete Action Handler
  const handleDeleteItem = (bookId: string, title: string) => {
    const updatedCart = cart.filter(item => item._id !== bookId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    message.success(`Đã xóa thành công "${title}" khỏi giỏ hàng!`);
  };

  // 4. Place Order API Call Handler
  const handlePlaceOrder = async (formData: { name: string; phone: string; address: string; paymentMethod: string }) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        type: formData.paymentMethod,
        totalPrice: totalAmount,
        detail: cart.map(item => ({
          bookName: item.detail.mainText,
          quantity: item.quantity,
          _id: item._id
        }))
      };

      const res = await placeOrderAPI(payload);

      if (res && res.statusCode === 201) {
        message.success("Đặt hàng thành công!");
        setCart([]);
        localStorage.setItem('cart', '[]');
        setCurrentStep(2); // Move to Success Step
      } else {
        message.error(res.message || "Đặt hàng không thành công, vui lòng thử lại.");
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Có lỗi xảy ra trong quá trình đặt hàng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="order-page-container">
      <div className="order-page-inner">
        {/* Step progress bar */}
        <CartStepBar currentStep={currentStep} />

        <Content className="order-page-content-inner">
          {currentStep === 2 ? (
            <OrderSuccess />
          ) : cart.length > 0 ? (
            <Row gutter={[24, 24]}>
              {/* Left Column: Cart Items List */}
              <Col xs={24} lg={17}>
                <CartItemsList
                  cart={cart}
                  readOnly={currentStep === 1}
                  onQuantityChange={handleQuantityChange}
                  onDeleteItem={handleDeleteItem}
                  onGoBack={() => setCurrentStep(0)}
                />
              </Col>

              {/* Right Column: Dynamic Cards */}
              <Col xs={24} lg={7}>
                {currentStep === 0 ? (
                  <CartSummary
                    totalAmount={totalAmount}
                    totalItems={totalItems}
                    onCheckout={() => setCurrentStep(1)}
                  />
                ) : (
                  <CheckoutForm
                    userFullName={user?.fullName || ''}
                    userPhone={user?.phone || ''}
                    totalAmount={totalAmount}
                    totalItems={totalItems}
                    onPlaceOrder={handlePlaceOrder}
                    isSubmitting={isSubmitting}
                  />
                )}
              </Col>
            </Row>
          ) : (
            /* Empty Cart state */
            <div className="cart-list-wrapper">
              <div className="empty-cart-card">
                <Empty
                  image={<ShoppingOutlined style={{ fontSize: '5rem', color: '#1677ff', opacity: 0.8 }} />}
                  description={
                    <span style={{ fontSize: '1rem', color: '#595959', fontWeight: 500 }}>
                      Giỏ hàng của bạn đang trống
                    </span>
                  }
                />
                <Button
                  type="primary"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/')}
                  style={{ height: '40px', borderRadius: '4px', fontWeight: 600 }}
                >
                  Quay lại mua sắm
                </Button>
              </div>
            </div>
          )}
        </Content>
      </div>
    </div>
  );
};

export default CartPage;
