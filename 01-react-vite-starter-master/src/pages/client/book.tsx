import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layout,
  Row,
  Col,
  Card,
  Image,
  Button,
  Typography,
  Rate,
  InputNumber,
  Divider,
  Tag,
  Spin,
  Space,
  Breadcrumb
} from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  ShareAltOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  BookOutlined
} from '@ant-design/icons';
import { getBookDetailAPI } from '../../services/api';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const BookPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<IBookTable | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchBookDetail(id);
    }
  }, [id]);

  const fetchBookDetail = async (bookId: string) => {
    setLoading(true);
    try {
      const res = await getBookDetailAPI(bookId);
      if (res?.data) {
        setBook(res.data);
      }
    } catch (error) {
      console.error('Error fetching book detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const handleAddToCart = () => {
    // Implement add to cart logic
    console.log('Add to cart:', { book, quantity });
  };

  const handleBuyNow = () => {
    // Implement buy now logic
    console.log('Buy now:', { book, quantity });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        minHeight: '60vh'
      }}>
        <Title level={3}>Không tìm thấy sách</Title>
        <Button type="primary" onClick={() => navigate('/')}>
          Về trang chủ
        </Button>
      </div>
    );
  }

  const images = book.slider && book.slider.length > 0 
    ? [book.thumbnail, ...book.slider] 
    : [book.thumbnail];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{ padding: '24px' }}>
        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: 24 }}>
          <Breadcrumb.Item>
            <HomeOutlined />
            <span onClick={() => navigate('/')} style={{ cursor: 'pointer', marginLeft: 8 }}>
              Trang chủ
            </span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <BookOutlined />
            <span>Chi tiết sách</span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{book.mainText}</Breadcrumb.Item>
        </Breadcrumb>

        {/* Back Button */}
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          style={{ marginBottom: 24 }}
        >
          Quay lại
        </Button>

        <Row gutter={[32, 32]}>
          {/* Image Gallery */}
          <Col xs={24} md={10}>
            <Card>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Image
                  width="100%"
                  height={400}
                  style={{ objectFit: 'cover' }}
                  src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${images[currentImageIndex]}`}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FVn4H3qUeWAPzAN4A/+ABeCdAmPgHYzYATDA0/q2B3+CB+L8kgBcAd7XJKaMAhYF19aDyWXXGv1wXJAAgqCAfBD2+P7/6vT1VmYqkjB2LyHx7B10BAAIAHBg="
                />
              </div>
              
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <Row gutter={[8, 8]}>
                  {images.map((img, index) => (
                    <Col span={6} key={index}>
                      <div
                        style={{
                          border: currentImageIndex === index ? '2px solid #1890ff' : '1px solid #d9d9d9',
                          borderRadius: 4,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          padding: 2
                        }}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${img}`}
                          alt={`${book.mainText} ${index + 1}`}
                          style={{
                            width: '100%',
                            height: 60,
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    </Col>
                  ))}
                </Row>
              )}
            </Card>
          </Col>

          {/* Book Information */}
          <Col xs={24} md={14}>
            <Card>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Title and Category */}
                <div>
                  <Title level={2} style={{ marginBottom: 8 }}>
                    {book.mainText}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 16 }}>
                    Tác giả: <strong>{book.author}</strong>
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                      {book.category}
                    </Tag>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <Rate disabled defaultValue={4} style={{ fontSize: 16 }} />
                  <Text style={{ marginLeft: 8, color: '#8c8c8c' }}>
                    (Đã bán: {book.sold || 0})
                  </Text>
                </div>

                {/* Price */}
                <div style={{ 
                  background: '#f5f5f5', 
                  padding: '16px', 
                  borderRadius: 8 
                }}>
                  <Text style={{ 
                    fontSize: 24, 
                    fontWeight: 'bold', 
                    color: '#ff4d4f' 
                  }}>
                    {formatPrice(book.price)}
                  </Text>
                </div>

                {/* Quantity and Stock */}
                <Row gutter={16} align="middle">
                  <Col>
                    <Text>Số lượng:</Text>
                  </Col>
                  <Col>
                    <InputNumber
                      min={1}
                      max={book.quantity}
                      value={quantity}
                      onChange={(value) => setQuantity(value || 1)}
                      style={{ width: 100 }}
                    />
                  </Col>
                  <Col>
                    <Text type="secondary">
                      (Còn lại: {book.quantity} sản phẩm)
                    </Text>
                  </Col>
                </Row>

                {/* Action Buttons */}
                <Space size="large" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                    style={{ minWidth: 150 }}
                  >
                    Thêm vào giỏ
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    danger
                    onClick={handleBuyNow}
                    style={{ minWidth: 150 }}
                  >
                    Mua ngay
                  </Button>
                </Space>

                {/* Additional Actions */}
                <Space>
                  <Button icon={<HeartOutlined />}>
                    Yêu thích
                  </Button>
                  <Button icon={<ShareAltOutlined />}>
                    Chia sẻ
                  </Button>
                </Space>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Book Description */}
        <Row style={{ marginTop: 32 }}>
          <Col span={24}>
            <Card title="Mô tả sản phẩm">
              <Paragraph>
                <strong>Tên sách:</strong> {book.mainText}
              </Paragraph>
              <Paragraph>
                <strong>Tác giả:</strong> {book.author}
              </Paragraph>
              <Paragraph>
                <strong>Thể loại:</strong> {book.category}
              </Paragraph>
              <Paragraph>
                <strong>Giá:</strong> {formatPrice(book.price)}
              </Paragraph>
              <Paragraph>
                <strong>Số lượng có sẵn:</strong> {book.quantity}
              </Paragraph>
              <Divider />
              <Paragraph>
                Đây là một cuốn sách tuyệt vời trong thể loại <strong>{book.category}</strong>. 
                Được viết bởi tác giả <strong>{book.author}</strong>, cuốn sách này sẽ mang đến 
                cho bạn những trải nghiệm thú vị và kiến thức bổ ích.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default BookPage;