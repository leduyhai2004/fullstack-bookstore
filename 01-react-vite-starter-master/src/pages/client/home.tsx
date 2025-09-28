import React, { useEffect, useState } from 'react';
import {
  Layout,
  Row,
  Col,
  Card,
  Rate,
  Slider,
  Checkbox,
  Button,
  Typography,
  Input,
  Tabs,
  Space,
  Divider,
  Pagination
} from 'antd';
import {
  FilterOutlined
} from '@ant-design/icons';
import { getCategoryAPI, getBookAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const HomePage =  () => {
  const navigate = useNavigate();
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [categories, setCategories] = useState<string[]>([]);
  const [books, setBooks] = useState<IBookTable[]>([]);
  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 12,
    pages: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('sold'); // Default sort by sold (popular)


  const getCategory = async () => {
    const res = await getCategoryAPI();
    if (res?.data) {
      setCategories(res.data);
    }
  }

  const getBooks = async (page: number = currentPage, size: number = pageSize, sort: string = sortBy) => {
    setLoading(true);
    try {
      let query = `current=${page}&pageSize=${size}`;
      
      // Add category filter
      if (selectedCategories.length > 0) {
        const categoryQuery = selectedCategories.map(cat => `category=${cat}`).join('&');
        query += `&${categoryQuery}`;
      }
      
      // Add price range filter
      if (priceRange[0] > 0 || priceRange[1] < 2000000) {
        query += `&price>=${priceRange[0]}&price<=${priceRange[1]}`;
      }
      
      // Add sorting
      if (sort) {
        switch (sort) {
          case 'sold':
            query += `&sort=-sold`; // Popular: sort by sold descending
            break;
          case 'updatedAt':
            query += `&sort=-updatedAt`; // New: sort by updatedAt descending
            break;
          case 'price-asc':
            query += `&sort=price`; // Price low to high
            break;
          case 'price-desc':
            query += `&sort=-price`; // Price high to low
            break;
          default:
            query += `&sort=-sold`; // Default to popular
        }
      }

      const res = await getBookAPI(query);
      if (res?.data) {
        setBooks(res.data.result);
        setMeta(res.data.meta);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getCategory();
  }, []);

  useEffect(() => {
    getBooks();
  }, [currentPage, pageSize, selectedCategories, priceRange, sortBy]);

  // Apply price range filter
  const handleApplyPriceFilter = () => {
    setCurrentPage(1); // Reset to first page when applying filter
    getBooks(1, pageSize);
  };

  // Handle category selection
  const handleCategoryChange = (checkedValues: string[]) => {
    setSelectedCategories(checkedValues);
    setCurrentPage(1); // Reset to first page when changing category
  };

  // Handle tab change for sorting
  const handleTabChange = (key: string) => {
    setSortBy(key);
    setCurrentPage(1); // Reset to first page when changing sort
  };
  


  
  const formatPrice = (price : any) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when changing page size
    }
    // Scroll to top khi chuyển trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const BookCard = ({ book }: { book: IBookTable }) => (
    <Card
      hoverable
      className="book-card"
      onClick={() => navigate(`/book/${book._id}`)}
      cover={
        <div className="book-image-container">
          {book.thumbnail ? (
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${book.thumbnail}`}
              alt={book.mainText}
              style={{
                width: '100%',
                height: 280,
                objectFit: 'cover'
              }}
              onError={(e) => {
                // Fallback to gradient background if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div style="
                      width: 100%;
                      height: 280px;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: white;
                      font-size: 48px;
                      font-weight: bold;
                    ">📚</div>
                  `;
                }
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: 280,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '48px',
                fontWeight: 'bold'
              }}
            >
              📚
            </div>
          )}
        </div>
      }
      style={{ marginBottom: 16 }}
    >
      <div className="book-info">
        <Title level={5} className="book-title" style={{ 
          fontSize: '14px', 
          lineHeight: '1.4',
          marginBottom: '8px',
          height: '56px',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}>
          {book.mainText}
        </Title>
        
        <Text style={{ 
          fontSize: '12px', 
          color: '#8c8c8c',
          display: 'block',
          marginBottom: '4px'
        }}>
          {book.author}
        </Text>
        
        <Text className="book-price" style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          color: '#ff4d4f',
          display: 'block',
          marginBottom: '8px'
        }}>
          {formatPrice(book.price)}
        </Text>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Rate disabled defaultValue={4} style={{ fontSize: '12px' }} />
          <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>Số lượng: {book.quantity}</Text>
        </div>
      </div>
    </Card>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Layout>
        {/* Sidebar */}
        <Sider 
          width={280} 
          style={{ 
            background: '#fff', 
            padding: '24px',
            borderRight: '1px solid #f0f0f0'
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <Title level={5} style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <FilterOutlined style={{ marginRight: 8 }} />
              Bộ lọc tìm kiếm
            </Title>
            <Text style={{ color: '#8c8c8c' }}>Danh mục sản phẩm</Text>
          </div>

          {/* Categories */}
          <div style={{ marginBottom: 32 }}>
            <Checkbox.Group 
              value={selectedCategories}
              onChange={handleCategoryChange}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {categories.map(category => (
                  <Checkbox key={category} value={category}>
                    {category}
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: 32 }}>
            <Title level={5} style={{ marginBottom: 16 }}>Khoảng giá</Title>
            <div style={{ display: 'flex', marginBottom: 16 }}>
              <Input 
                value={priceRange[0].toLocaleString()}
                style={{ marginRight: 8 }}
                readOnly
              />
              <Text style={{ margin: '0 8px', alignSelf: 'center' }}>-</Text>
              <Input 
                value={priceRange[1].toLocaleString()}
                style={{ marginLeft: 8 }}
                readOnly
              />
            </div>
            <Slider
              range
              min={0}
              max={20000000}
              step={10000}
              value={priceRange}
              onChange={setPriceRange}
              style={{ marginBottom: 16 }}
            />
            <Button type="primary" block onClick={handleApplyPriceFilter}>
              Áp dụng
            </Button>
          </div>

          {/* Rating Filter */}
          <div>
            <Title level={5} style={{ marginBottom: 16 }}>Đánh giá</Title>
            <Space direction="vertical">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} style={{ cursor: 'pointer' }}>
                  <Rate disabled defaultValue={rating} style={{ fontSize: '14px' }} />
                  <Text style={{ marginLeft: 8, color: '#8c8c8c' }}>trở lên</Text>
                </div>
              ))}
            </Space>
          </div>
        </Sider>

        {/* Main Content */}
        <Content style={{ padding: '24px', background: '#f5f5f5' }}>
          <Tabs 
            defaultActiveKey="sold" 
            size="large"
            onChange={handleTabChange}
            items={[
              { key: 'sold', label: 'Phổ biến' },
              { key: 'updatedAt', label: 'Hàng Mới' },
              { key: 'price-asc', label: 'Giá Thấp Đến Cao' },
              { key: 'price-desc', label: 'Giá Cao Đến Thấp' }
            ]}
          />

          <Divider style={{ margin: '16px 0' }} />

          {/* Books Grid */}
          <Row gutter={[16, 16]}>
            {loading ? (
              // Loading skeleton
              Array.from({ length: pageSize }, (_, index) => (
                <Col key={index} xs={24} sm={12} md={8} lg={6} xl={4}>
                  <Card loading style={{ marginBottom: 16 }} />
                </Col>
              ))
            ) : books.length > 0 ? (
              books.map(book => (
                <Col key={book._id} xs={24} sm={12} md={8} lg={6} xl={4}>
                  <BookCard book={book} />
                </Col>
              ))
            ) : (
              <Col span={24}>
                <div style={{ textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
                  <Title level={4} style={{ color: '#8c8c8c' }}>Không tìm thấy sách nào</Title>
                  <Text>Thử thay đổi bộ lọc để xem thêm sách khác</Text>
                </div>
              </Col>
            )}
          </Row>

          {/* Pagination */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginTop: '32px',
            padding: '24px 0'
          }}>
            <Pagination
              current={meta.current}
              total={meta.total}
              pageSize={meta.pageSize}
              onChange={handlePageChange}
              onShowSizeChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} của ${total} sản phẩm`
              }
              pageSizeOptions={['12', '24', '36', '48']}
              size="default"
              style={{
                background: 'white',
                padding: '16px 24px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default HomePage;