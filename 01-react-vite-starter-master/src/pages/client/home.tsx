import { useState, useEffect } from 'react';
import {
  Layout,
  Row,
  Col,
  Rate,
  Checkbox,
  Button,
  Input,
  Radio,
  Divider,
  Pagination,
  Tag,
  Breadcrumb,
  Drawer,
  Spin
} from 'antd';
import {
  FilterOutlined,
  ReloadOutlined,
  BookOutlined,
  MenuOutlined,
  StarFilled
} from '@ant-design/icons';
import '../../styles/home.scss';
import { getBookAPI, getCategoryAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const HomePage = () => {
  // 1. Sidebar Filters States
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceFrom, setPriceFrom] = useState<number>(0);
  const [priceTo, setPriceTo] = useState<number>(0);
  const [tempPriceFrom, setTempPriceFrom] = useState<number>(0);
  const [tempPriceTo, setTempPriceTo] = useState<number>(0);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // 2. Sorting & Pagination States
  const [sortKey, setSortKey] = useState<string>('Phổ biến');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);

  const [listCategory, setListCategory] = useState<{label: string, value: string}[]>([]);
  const [listBook, setListBook] = useState<IBookTable[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [filter, setFilter] = useState<string>("");
  const [sortQuery, setSortQuery] = useState<string>("sort=-sold");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initCategory = async () => {
        const res = await getCategoryAPI();

        if (res && res.data) {
            const d = res.data.map(item => {
                return {
                    label: item,
                    value: item
                };
            });

            setListCategory(d);
        }
    };

    initCategory();
}, []);

  useEffect(() => {
    let queryParts = [];
    if (selectedCategories.length > 0) {
      // Encode values for safety
      queryParts.push(`category=${selectedCategories.map(c => encodeURIComponent(c)).join(',')}`);
    }
    if (priceFrom) {
      queryParts.push(`price>=${priceFrom}`);
    }
    if (priceTo) {
      queryParts.push(`price<=${priceTo}`);
    }
    setFilter(queryParts.join('&'));
  }, [selectedCategories, priceFrom, priceTo]);

  useEffect(() => {
    if (sortKey === 'Hàng Mới') {
      setSortQuery('sort=-createdAt');
    } else if (sortKey === 'Giá Thấp Đến Cao') {
      setSortQuery('sort=price');
    } else if (sortKey === 'Giá Cao Đến Thấp') {
      setSortQuery('sort=-price');
    } else {
      setSortQuery('sort=-sold');
    }
  }, [sortKey]);

  useEffect(() => {
    fetchBook();
  }, [currentPage, pageSize, filter, sortQuery]);

  const fetchBook = async () => {
    setIsLoading(true);

    let query = `current=${currentPage}&pageSize=${pageSize}`;

    if (filter) {
        query += `&${filter}`;
    }

    if (sortQuery) {
        query += `&${sortQuery}`;
    }

    const res = await getBookAPI(query);

    if (res && res.data) {
        setListBook(res.data.result);
        setTotal(res.data.meta.total);
    }

    setIsLoading(false);
};

  // Mobile Drawer Toggle
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // 3. Clear/Reset All Filters
  const handleResetFilters = () => {
    setSelectedCategories([]);
    setPriceFrom(0);
    setPriceTo(0);
    setTempPriceFrom(0);
    setTempPriceTo(0);
    setSelectedRating(null);
    setCurrentPage(1);
  };

  // Format Helper for Currency
  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
  };

  // Format Helper for Sales Counter
  const formatSold = (soldCount: number) => {
    if (soldCount >= 1000) {
      return `Đã bán ${(soldCount / 1000).toFixed(1).replace('.0', '')}k`;
    }
    return `Đã bán ${soldCount}`;
  };

  // Handle price application
  const handleApplyPrice = () => {
    setPriceFrom(tempPriceFrom);
    setPriceTo(tempPriceTo);
    setCurrentPage(1);
  };

  // Checkbox handlers
  const handleCategoryChange = (checkedValues: any[]) => {
    setSelectedCategories(checkedValues);
    setCurrentPage(1);
  };

  // 4. Client Side Logical Filtering & Sorting of Mock Data

  // Paginated List (already paginated by backend API)
  const paginatedBooks = listBook;

  // Handle active tag removes
  const handleRemoveCategoryTag = (cat: string) => {
    setSelectedCategories(prev => prev.filter(c => c !== cat));
  };

  const handleRemoveRatingTag = () => {
    setSelectedRating(null);
  };

  const handleRemovePriceTag = () => {
    setPriceFrom(0);
    setPriceTo(0);
    setTempPriceFrom(0);
    setTempPriceTo(0);
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    priceFrom > 0 ||
    priceTo > 0 ||
    selectedRating !== null;

  // Sidebar Filter Content helper (Avoids component unmounting / focus loss)
  const renderFilterContent = () => (
    <div className="filter-inner-wrapper">
      <div className="filter-header">
        <span className="filter-title">
          <FilterOutlined /> Bộ lọc tìm kiếm
        </span>
        {hasActiveFilters && (
          <button className="btn-reset-all" onClick={handleResetFilters}>
            <ReloadOutlined /> Xóa tất cả
          </button>
        )}
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* 1. Category Filter Section */}
      <div className="filter-section">
        <h4>Danh Mục Sách</h4>
        <Checkbox.Group
          value={selectedCategories}
          onChange={handleCategoryChange}
          className="category-checkbox-group"
        >
          {listCategory.map(category => (
            <Checkbox key={category.value} value={category.value}>
              {category.label}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* 3. Price Filter Section */}
      <div className="filter-section">
        <h4>Khoảng Giá</h4>
        <div className="price-range-container">
          <div className="price-inputs">
            <Input
              placeholder="đ TỪ"
              value={tempPriceFrom}
              onChange={e => setTempPriceFrom(Number(e.target.value.replace(/[^0-9]/g, '')))}
            />
            <span>-</span>
            <Input
              placeholder="đ ĐẾN"
              value={tempPriceTo}
              onChange={e => setTempPriceTo(Number(e.target.value.replace(/[^0-9]/g, '')))}
            />
          </div>
          <Button type="primary" className="btn-apply-price" onClick={handleApplyPrice}>
            Áp dụng
          </Button>
        </div>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* 4. Rating Filter Section */}
      <div className="filter-section">
        <h4>Đánh Giá</h4>
        <div className="rating-filter-list">
          {[5, 4, 3, 2, 1].map(stars => (
            <div
              key={stars}
              className={`rating-row ${selectedRating === stars ? 'active' : ''}`}
              onClick={() => {
                setSelectedRating(prev => (prev === stars ? null : stars));
                setCurrentPage(1);
              }}
            >
              <Rate disabled defaultValue={stars} />
              <span className="rating-label">{stars !== 5 ? 'trở lên' : ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const handleClickBook = (book: IBookTable) => {
    navigate(`/book/${book._id}`);
  };

  return (
    <div className="homepage-container">
      <Layout className="homepage-inner-layout">
        
        {/* Responsive Sider: Collapses on Breakpoint lg (992px) */}
        <Sider
          width={280}
          breakpoint="lg"
          collapsedWidth="0"
          trigger={null}
          className="homepage-sider"
        >
          {renderFilterContent()}
        </Sider>

        <Layout className="homepage-main-layout">
          
          {/* Main Layout Header (Sorting and Filters summary) */}
          <Header className="homepage-content-header">
            <div className="header-top">
              <Breadcrumb
                items={[
                  { title: 'Trang chủ' },
                  { title: 'Cửa hàng sách' }
                ]}
              />
              <Button
                className="mobile-filter-btn"
                style={{ display: 'none' }} // Controlled by SCSS media queries but referenced for standard drawer toggles
                icon={<MenuOutlined />}
                onClick={() => setIsMobileDrawerOpen(true)}
              >
                Bộ lọc
              </Button>
            </div>
            
            {/* Sorting Tabs Toolbar */}
            <div className="sorting-toolbar">
              <div>
                <span className="sort-label">Sắp xếp theo</span>
                <Radio.Group
                  value={sortKey}
                  onChange={e => {
                    setSortKey(e.target.value);
                    setCurrentPage(1);
                  }}
                  optionType="button"
                  buttonStyle="solid"
                >
                  <Radio.Button value="Phổ biến">Phổ biến</Radio.Button>
                  <Radio.Button value="Hàng Mới">Hàng Mới</Radio.Button>
                  <Radio.Button value="Giá Thấp Đến Cao">Giá Thấp Đến Cao</Radio.Button>
                  <Radio.Button value="Giá Cao Đến Thấp">Giá Cao Đến Thấp</Radio.Button>
                </Radio.Group>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#8c8c8c' }}>
                Tìm thấy <strong>{total}</strong> sản phẩm
              </span>
            </div>

            {/* Active Tags ribbon to easily clear active filters */}
            {hasActiveFilters && (
              <div className="active-tags-container">
                <span className="tags-label">Đang lọc: </span>
                {selectedCategories.map(cat => (
                  <Tag
                    key={cat}
                    closable
                    onClose={() => handleRemoveCategoryTag(cat)}
                  >
                    Thể loại: {cat}
                  </Tag>
                ))}
                {(priceFrom > 0 || priceTo > 0) && (
                  <Tag closable onClose={handleRemovePriceTag}>
                    Giá: {priceFrom ? formatVND(priceFrom) : '0đ'} - {priceTo ? formatVND(priceTo) : '∞'}
                  </Tag>
                )}
                {selectedRating !== null && (
                  <Tag closable onClose={handleRemoveRatingTag}>
                    Đánh giá: {selectedRating} <StarFilled style={{ color: '#fadb14', fontSize: '0.8rem' }} /> trở lên
                  </Tag>
                )}
              </div>
            )}
          </Header>

          {/* Grid Layout of Cards */}
          <Content className="homepage-content">
            <Spin spinning={isLoading}>
              {paginatedBooks.length > 0 ? (
                <Row gutter={[16, 24]}>
                  {paginatedBooks.map(book => (
                    <Col key={book._id} xs={24} sm={12} md={8} lg={6}>
                      <div
                      onClick={()=> handleClickBook(book)}
                       className="product-card"
                       style={{ cursor: 'pointer' }}
                       >
                        {/* Product Image and high fidelity fallback cover */}
                        <div className="card-image-wrapper">
                          {book.thumbnail ? (
                            <img
                              src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${book.thumbnail}`}
                              alt={book.mainText}
                            />
                          ) : (
                            <div
                              className="book-placeholder-cover"
                            >
                              <span className="placeholder-logo">
                                <BookOutlined /> BOOKSTORE
                              </span>
                              <span className="placeholder-title">
                                {book.mainText}
                              </span>
                              <span className="placeholder-author">
                                {book.author}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info and pricing section */}
                        <div className="card-info-wrapper">
                          <h3 className="product-title" title={book.mainText}>
                            {book.mainText}
                          </h3>
                          <div className="product-pricing">
                            <span className="price-current">
                              {formatVND(book.price)}
                            </span>
                            <span className="price-original">
                              {formatVND(Math.round(book.price * 1.25))}
                            </span>
                          </div>

                          <div className="product-rating-sold">
                            <span className="sold-counter">
                              {formatSold(book.sold)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '8px',
                    padding: '48px',
                    textAlign: 'center',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ fontSize: '3rem', color: '#bfbfbf', marginBottom: '16px' }}>
                    🔍
                  </div>
                  <h3 style={{ color: '#262626', margin: '0 0 8px 0' }}>
                    Không tìm thấy sản phẩm phù hợp
                  </h3>
                  <p style={{ color: '#8c8c8c', margin: '0 0 24px 0', fontSize: '0.9rem' }}>
                    Hãy thử thay đổi tiêu chí bộ lọc của bạn hoặc làm mới trang
                  </p>
                  <Button type="primary" onClick={handleResetFilters}>
                    Làm mới bộ lọc
                  </Button>
                </div>
              )}

              {/* Pagination controls at the bottom */}
              {listBook.length > 0 && (
                <div className="pagination-container">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={total}
                    onChange={(page, size) => {
                      setCurrentPage(page);
                      if (size) setPageSize(size);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    showSizeChanger
                    pageSizeOptions={['4', '8', '12', '24']}
                  />
                </div>
              )}
            </Spin>
          </Content>
        </Layout>
      </Layout>

      {/* Drawer for Mobile layout */}
      <Drawer
        title="Bộ lọc tìm kiếm"
        placement="right"
        onClose={() => setIsMobileDrawerOpen(false)}
        open={isMobileDrawerOpen}
        width={320}
        rootClassName="mobile-filter-drawer"
      >
        {renderFilterContent()}
      </Drawer>
    </div>
  );
};

export default HomePage;