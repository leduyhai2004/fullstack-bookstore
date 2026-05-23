import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { getBookDetailAPI } from '../../services/api';
import {
  Row,
  Col,
  Rate,
  Button,
  Divider,
  Breadcrumb,
  Spin,
  message
} from 'antd';
import {
  TruckOutlined,
  SafetyCertificateOutlined,
  SwapOutlined,
  ShoppingCartOutlined,
  BookOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import './bookDetail.scss';

// Dynamic book description generator for premium feel
const getMockSynopsis = (title: string, category: string, author: string) => {
  return `Cuốn sách "${title}" được viết bởi tác giả ${author} thuộc thể loại ${category} là một tác phẩm xuất sắc và đầy tính gợi mở, mang lại cho độc giả những góc nhìn sâu sắc và trải nghiệm đọc vô cùng ấn tượng. Tác phẩm đã khéo léo kết hợp giữa nền tảng kiến thức vững chắc và lối hành văn lôi cuốn, giàu hình ảnh, giúp truyền tải những thông điệp giá trị một cách trực quan, gần gũi. Đây chắc chắn là một cuốn sách không thể thiếu trên kệ sách của bất kỳ ai đang muốn tìm kiếm nguồn cảm hứng mới, khám phá sâu hơn các khía cạnh tri thức và hoàn thiện bản thân mỗi ngày.`;
};

// Premium gradient generator for cover backgrounds based on book title length
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

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<IBookTable | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Gallery Active Image
  const [activeImage, setActiveImage] = useState<string>('');

  // Selected Purchase Quantity
  const [selectedQty, setSelectedQty] = useState<number>(1);

  useEffect(() => {
    const fetchBookDetail = async () => {
      if (!id) return;
      setIsLoading(true);

      const res = await getBookDetailAPI(id);

      if (res && res.data) {
        setBook(res.data);
        // Default active image is the book thumbnail
        setActiveImage(res.data.thumbnail || '');
      } else {
        message.error('Không thể tải thông tin chi tiết cuốn sách này');
      }

      setIsLoading(false);
    };

    fetchBookDetail();
  }, [id]);

  // Sync selected qty when stock changes
  useEffect(() => {
    setSelectedQty(1);
  }, [book]);

  // Compute image gallery list
  const galleryList = useMemo(() => {
    if (!book) return [];
    const list = [];
    if (book.thumbnail) {
      list.push({
        id: 'main-thumb',
        src: book.thumbnail,
        type: 'thumb'
      });
    }
    if (book.slider && Array.isArray(book.slider)) {
      book.slider.forEach((slide, index) => {
        if (slide) {
          list.push({
            id: `slide-${index}`,
            src: slide,
            type: 'slide'
          });
        }
      });
    }
    return list;
  }, [book]);

  // Currency Formatter Helper
  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
  };

  // Quantity handlers
  const handleIncrease = () => {
    if (!book) return;
    if (selectedQty < book.quantity) {
      setSelectedQty(prev => prev + 1);
    } else {
      message.warning(`Số lượng tồn kho tối đa chỉ còn ${book.quantity} cuốn`);
    }
  };

  const handleDecrease = () => {
    if (selectedQty > 1) {
      setSelectedQty(prev => prev - 1);
    }
  };

  const handleQtyInputChange = (val: string) => {
    if (!book) return;
    const cleanNum = parseInt(val.replace(/[^0-9]/g, ''));
    if (isNaN(cleanNum) || cleanNum < 1) {
      setSelectedQty(1);
    } else if (cleanNum > book.quantity) {
      setSelectedQty(book.quantity);
      message.warning(`Số lượng tồn kho tối đa chỉ còn ${book.quantity} cuốn`);
    } else {
      setSelectedQty(cleanNum);
    }
  };

  // CTA triggers
  const handleAddToCart = () => {
    if (!book) return;
    message.success(`Đã thêm thành công ${selectedQty} cuốn "${book.mainText}" vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    if (!book) return;
    message.success(`Bắt đầu thanh toán mua ngay ${selectedQty} cuốn "${book.mainText}"!`);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spin size="large" tip="Đang tải thông tin sách..." />
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', gap: '16px' }}>
        <BookOutlined style={{ fontSize: '4rem', color: '#bfbfbf' }} />
        <h3>Không tìm thấy cuốn sách yêu cầu</h3>
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
          Quay lại trang chủ
        </Button>
      </div>
    );
  }

  const mockGradient = getPremiumGradient(book.mainText);
  const mockSynopsis = getMockSynopsis(book.mainText, book.category, book.author);

  return (
    <div className="book-detail-container">
      <div className="book-detail-inner">
        {/* 1. Breadcrumbs Nav */}
        <Breadcrumb
          items={[
            { title: <a onClick={() => navigate('/')}>Trang chủ</a> },
            { title: book.category },
            { title: book.mainText }
          ]}
          style={{ marginBottom: '8px' }}
        />

        {/* 2. Main Detail Card Grid */}
        <div className="book-detail-card-panel">
          <Row gutter={[32, 24]}>
            {/* Left Side: Interactive Gallery */}
            <Col xs={24} md={10}>
              <div className="book-gallery-section">
                
                {/* Active Main Cover Display */}
                <div className="main-image-frame">
                  {activeImage ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${activeImage}`}
                      alt={book.mainText}
                    />
                  ) : (
                    <div
                      className="book-placeholder-detail-cover"
                      style={{ background: mockGradient }}
                    >
                      <span className="detail-placeholder-logo">
                        <BookOutlined /> BOOKSTORE
                      </span>
                      <span className="detail-placeholder-title">
                        {book.mainText}
                      </span>
                      <span className="detail-placeholder-author">
                        {book.author}
                      </span>
                    </div>
                  )}
                </div>

                {/* Horizontal Thumbnails list */}
                {galleryList.length > 1 && (
                  <div className="thumbnail-carousel">
                    {galleryList.map(item => (
                      <div
                        key={item.id}
                        className={`thumbnail-item ${activeImage === item.src ? 'active' : ''}`}
                        onClick={() => setActiveImage(item.src)}
                      >
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${item.src}`}
                          alt="thumbnail spec"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Col>

            {/* Right Side: Primary Info Block */}
            <Col xs={24} md={14}>
              <div className="book-info-section">
                <h1 className="book-title">{book.mainText}</h1>

                {/* Sub Metadata rows */}
                <div className="book-meta-inline">
                  <div className="meta-item">
                    Tác giả: <strong>{book.author}</strong>
                  </div>
                  <Divider type="vertical" />
                  <div className="meta-item">
                    <Rate disabled defaultValue={4} />
                    <span style={{ color: '#faad14', fontWeight: 600 }}>4.0</span>
                  </div>
                  <Divider type="vertical" />
                  <div className="meta-item">
                    Đã bán: <strong>{book.sold}+</strong>
                  </div>
                </div>

                {/* Price Panel */}
                <div className="book-price-panel">
                  <span className="price-current">{formatVND(book.price)}</span>
                  <span className="price-original">{formatVND(Math.round(book.price * 1.25))}</span>
                  <span className="price-discount-tag">-20%</span>
                </div>

                {/* Guarantees Policy */}
                <div className="shipping-policy-ribbon">
                  <div className="policy-row">
                    <TruckOutlined />
                    <span>Vận chuyển: <strong>Miễn phí vận chuyển</strong> toàn quốc (cho đơn hàng trên 250k)</span>
                  </div>
                  <div className="policy-row">
                    <SafetyCertificateOutlined />
                    <span>Cam kết: <strong>100% Sách thật chính hãng</strong>, hoàn tiền 110% nếu phát hiện hàng giả</span>
                  </div>
                  <div className="policy-row">
                    <SwapOutlined />
                    <span>Đổi trả: Đổi trả hàng trong <strong>7 ngày</strong> lỗi sản xuất</span>
                  </div>
                </div>

                {/* Quantity widget */}
                <div className="quantity-selector-container">
                  <span className="quantity-label">Số Lượng</span>
                  <div className="quantity-widget">
                    <button
                      className="btn-qty"
                      onClick={handleDecrease}
                      disabled={selectedQty <= 1}
                    >
                      -
                    </button>
                    <input
                      className="input-qty"
                      value={selectedQty}
                      onChange={e => handleQtyInputChange(e.target.value)}
                    />
                    <button
                      className="btn-qty"
                      onClick={handleIncrease}
                      disabled={selectedQty >= book.quantity}
                    >
                      +
                    </button>
                  </div>
                  <span className="stock-available">
                    {book.quantity} sản phẩm có sẵn
                  </span>
                </div>

                {/* Action CTAs */}
                <div className="book-detail-cta-panel">
                  <Button
                    type="default"
                    icon={<ShoppingCartOutlined />}
                    className="btn-add-to-cart"
                    onClick={handleAddToCart}
                  >
                    Thêm Vào Giỏ Hàng
                  </Button>
                  <Button
                    type="primary"
                    className="btn-buy-now"
                    onClick={handleBuyNow}
                  >
                    Mua Ngay
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* 3. Specs and Synopsis Panel */}
        <div className="book-specs-synopsis-panel">
          <h3 className="specs-header">Thông Tin Chi Tiết</h3>
          
          <table className="specs-table">
            <tbody>
              <tr>
                <td className="label-col">Nhà xuất bản</td>
                <td className="value-col">Kim Đồng / NXB Phụ Nữ</td>
              </tr>
              <tr>
                <td className="label-col">Tác giả</td>
                <td className="value-col">{book.author}</td>
              </tr>
              <tr>
                <td className="label-col">Thể loại sách</td>
                <td className="value-col">{book.category}</td>
              </tr>
              <tr>
                <td className="label-col">Ngôn ngữ</td>
                <td className="value-col">Tiếng Việt</td>
              </tr>
              <tr>
                <td className="label-col">Ngày phát hành</td>
                <td className="value-col">{new Date(book.createdAt).toLocaleDateString('vi-VN')}</td>
              </tr>
              <tr>
                <td className="label-col">Kích thước</td>
                <td className="value-col">14 x 20.5 cm</td>
              </tr>
              <tr>
                <td className="label-col">Số trang</td>
                <td className="value-col">340 trang</td>
              </tr>
            </tbody>
          </table>

          <Divider style={{ margin: '8px 0' }} />

          <h3 className="specs-header">Giới Thiệu Nội Dung Sách</h3>
          <p className="synopsis-content">{mockSynopsis}</p>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;