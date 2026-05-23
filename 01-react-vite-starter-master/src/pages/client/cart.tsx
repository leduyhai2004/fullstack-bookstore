import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentApp } from '../../components/context/app.context';
import {
  Layout,
  Row,
  Col,
  Card,
  InputNumber,
  Button,
  Empty,
  Divider,
  message,
  Steps
} from 'antd';
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  CreditCardOutlined,
  SmileOutlined,
  UserOutlined,
  SolutionOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import './order.scss';

const { Content } = Layout;

// Premium gradient generator for cover backgrounds if thumbnail is missing
const getPremiumGradient = (title: string) => {
  const gradients = [
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(120deg, #f6d365 0%, #fda085 100%)',
    'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(to top, #30cfd0 0%, #330867 100%)',
    'linear-gradient(to top, #ff0844 0%, #ffb199 100%)',
    'linear-gradient(to right, #ffc3a0 0%, #ffafbd 100%)'
  ];
  const index = title.length % gradients.length;
  return gradients[index];
};

const CartPage = () => {
  const { cart, setCart } = useCurrentApp();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const navigate = useNavigate();

  // Helper currency formatter
  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
  };

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

  // Checkout trigger
  const handleCheckout = () => {
    message.success(`Bắt đầu xử lý đơn đặt hàng gồm ${totalItems} cuốn sách!`);
  };

  return (
    <div className="order-page-container">
        <Steps
          size='small'
          current={currentStep}
          items={[
            {
              title: 'Đơn hàng',
              status: 'finish',
              icon: <ShoppingCartOutlined />,
            },
            {
              title: 'Đặt hàng',
              status: 'finish',
              icon: <SolutionOutlined />,
            },
            {
              title: 'Thanh toán',
              status: 'process',
              icon: <LoadingOutlined />,
            },
          ]}
        />
      <Content className="order-page-inner">
        {cart.length > 0 ? (
          <Row gutter={[24, 24]}>
            {/* Left Column: Cart Items List */}
            <Col xs={24} lg={17}>
              <div className="cart-list-wrapper">
                
                {/* Table Header labels for desktop */}
                <div className="cart-header-row">
                  <span className="col-title">Sản Phẩm</span>
                  <span className="col-price">Đơn Giá</span>
                  <span className="col-qty">Số Lượng</span>
                  <span className="col-subtotal">Thành Tiền</span>
                  <span className="col-action"></span>
                </div>

                {/* Cart Items list blocks */}
                {cart.map(item => {
                  const gradient = getPremiumGradient(item.detail.mainText);
                  return (
                    <div key={item._id} className="cart-item-card">
                      <div className="item-row">
                        
                        {/* Cover Image */}
                        <div className="item-image-wrapper">
                          {item.detail.thumbnail ? (
                            <img
                              src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${item.detail.thumbnail}`}
                              alt={item.detail.mainText}
                            />
                          ) : (
                            <div
                              className="item-gradient-cover"
                              style={{ background: gradient }}
                            />
                          )}
                        </div>

                        {/* Title details */}
                        <div className="item-title-wrapper">
                          <h3
                            className="item-title"
                            title={item.detail.mainText}
                            onClick={() => navigate(`/book/${item._id}`)}
                          >
                            {item.detail.mainText}
                          </h3>
                          <span className="item-meta">Tác giả: {item.detail.author}</span>
                        </div>

                        {/* Unit price */}
                        <div className="item-price">
                          {formatVND(item.detail.price)}
                        </div>

                        {/* Quantity changer */}
                        <div className="item-qty">
                          <InputNumber
                            min={1}
                            max={item.detail.quantity}
                            value={item.quantity}
                            onChange={(val) => handleQuantityChange(val, item._id)}
                          />
                        </div>

                        {/* Subtotal calculated */}
                        <div className="item-subtotal">
                          {formatVND(item.detail.price * item.quantity)}
                        </div>

                        {/* Delete action trigger */}
                        <div className="item-delete">
                          <DeleteOutlined
                            onClick={() => handleDeleteItem(item._id, item.detail.mainText)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Col>

            {/* Right Column: Checkout Summary Card */}
            <Col xs={24} lg={7}>
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
                  onClick={handleCheckout}
                >
                  Mua Hàng ({totalItems})
                </Button>
              </Card>
            </Col>
          </Row>
        ) : (
          /* Empty Cart state */
          <div className="cart-list-wrapper">
            <div className="empty-cart-card">
              <Empty
                image={<ShoppingCartOutlined style={{ fontSize: '5rem', color: '#1677ff', opacity: 0.8 }} />}
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
  );
};

export default CartPage;
