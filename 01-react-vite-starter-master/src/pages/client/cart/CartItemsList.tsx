import { useNavigate } from 'react-router-dom';
import { InputNumber, Button } from 'antd';
import { DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';

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

const formatVND = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
};

interface CartItemsListProps {
  cart: ICart[];
  readOnly: boolean;
  onQuantityChange?: (value: number | null, bookId: string) => void;
  onDeleteItem?: (bookId: string, title: string) => void;
  onGoBack?: () => void;
}

const CartItemsList = ({
  cart,
  readOnly,
  onQuantityChange,
  onDeleteItem,
  onGoBack
}: CartItemsListProps) => {
  const navigate = useNavigate();

  return (
    <div className="cart-list-wrapper">
      {/* Table Header labels for desktop - hide in readOnly */}
      {!readOnly && (
        <div className="cart-header-row">
          <span className="col-title">Sản Phẩm</span>
          <span className="col-price">Đơn Giá</span>
          <span className="col-qty">Số Lượng</span>
          <span className="col-subtotal">Thành Tiền</span>
          <span className="col-action"></span>
        </div>
      )}

      {/* Cart Items list blocks */}
      <div className="cart-items-cards-container">
        {cart.map(item => {
          const gradient = getPremiumGradient(item.detail.mainText);
          return (
            <div key={item._id} className={`cart-item-card ${readOnly ? 'readonly-item' : ''}`}>
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
                    onClick={() => !readOnly && navigate(`/book/${item._id}`)}
                    style={{ cursor: readOnly ? 'default' : 'pointer' }}
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
                  {readOnly ? (
                    <span className="qty-readonly-text">Số lượng: {item.quantity}</span>
                  ) : (
                    <InputNumber
                      min={1}
                      max={item.detail.quantity}
                      value={item.quantity}
                      onChange={(val) => onQuantityChange && onQuantityChange(val, item._id)}
                    />
                  )}
                </div>

                {/* Subtotal calculated */}
                <div className="item-subtotal">
                  {readOnly ? `Tổng: ${formatVND(item.detail.price * item.quantity)}` : formatVND(item.detail.price * item.quantity)}
                </div>

                {/* Delete action trigger (Only in Step 1) */}
                {!readOnly && onDeleteItem && (
                  <div className="item-delete">
                    <DeleteOutlined
                      onClick={() => onDeleteItem(item._id, item.detail.mainText)}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Back button (Only in Step 2) */}
      {readOnly && onGoBack && (
        <div className="back-link-wrapper">
          <Button type="link" onClick={onGoBack} className="btn-back-link" icon={<ArrowLeftOutlined />}>
            Quay trở lại
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartItemsList;
