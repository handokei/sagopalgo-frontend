import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { buildApiUrl } from '../lib/api';

interface Order {
  id: number;
  productTitle: string;
  totalPrice: number;
  orderStatus: string;
  recipientName: string;
  phoneNumber: string;
  address: string;
  createAt: string | number[];
}

interface PageInfo {
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

const OrderListPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchOrders = async (page: number = 0) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      let url = `/api/orders?page=${page}&size=10`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await fetch(buildApiUrl(url), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('주문 조회 실패');
      }

      const data = await response.json();
      setOrders(data.content || []);
      setPageInfo({
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        number: data.number,
        size: data.size,
        first: data.first,
        last: data.last,
      });
    } catch (error) {
      console.error('주문 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [navigate, currentPage]);

  const handleSearch = () => {
    setCurrentPage(0);
    fetchOrders(0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const formatDate = (dateString: string | number[]) => {
    if (Array.isArray(dateString)) {
      const [year, month, day] = dateString;
      return `${year}년 ${month}월 ${day}일`;
    }
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      CREATED: '주문완료',
      PAID: '결제완료',
      SHIPPED: '배송중',
      COMPLETED: '배송완료',
      CANCELED: '주문취소',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      CREATED: 'bg-yellow-100 text-yellow-600',
      PAID: 'bg-blue-100 text-blue-600',
      SHIPPED: 'bg-purple-100 text-purple-600',
      COMPLETED: 'bg-green-100 text-green-600',
      CANCELED: 'bg-red-100 text-red-600',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <span>로딩 중...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">주문 내역</h1>

        {/* 날짜 필터 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              검색
            </button>
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setCurrentPage(0);
                fetchOrders(0);
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              초기화
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">주문 내역이 없습니다.</p>
            <a href="/" className="text-blue-500 hover:underline">쇼핑하러 가기</a>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500">{formatDate(order.createAt)}</p>
                      <p className="text-sm text-gray-400">주문번호: {order.id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.orderStatus)}`}>
                      {getStatusText(order.orderStatus)}
                    </span>
                  </div>
                  <p className="font-semibold mb-2">{order.productTitle}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">{formatPrice(order.totalPrice)}</span>
                    <a
                      href={`/orders/${order.id}`}
                      className="text-blue-500 hover:underline text-sm"
                    >
                      상세보기
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {pageInfo && pageInfo.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={pageInfo.first}
                  className={`px-3 py-1 rounded ${
                    pageInfo.first
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  이전
                </button>

                {Array.from({ length: pageInfo.totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 rounded ${
                      currentPage === i
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={pageInfo.last}
                  className={`px-3 py-1 rounded ${
                    pageInfo.last
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  다음
                </button>
              </div>
            )}

            {pageInfo && (
              <p className="text-center text-sm text-gray-500 mt-2">
                총 {pageInfo.totalElements}건
              </p>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default OrderListPage;
