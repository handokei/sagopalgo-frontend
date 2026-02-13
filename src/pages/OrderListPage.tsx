import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Order {
  id: number;
  totalPrice: number;
  orderStatus: string;
  createdAt: string;
}

const OrderListPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:8080/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('주문 조회 실패');
        }

        const data = await response.json();
        setOrders(data.content || []);
      } catch (error) {
        console.error('주문 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const formatDate = (dateString: string) => {
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
      <div className="min-h-screen flex items-center justify-center">
        <span>로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-blue-600">사고팔고</a>
          <div className="space-x-4">
            <a href="/" className="text-gray-600 hover:text-blue-600">홈</a>
            <a href="/cart" className="text-gray-600 hover:text-blue-600">장바구니</a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">주문 내역</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">주문 내역이 없습니다.</p>
            <a href="/" className="text-blue-500 hover:underline">쇼핑하러 가기</a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    <p className="text-sm text-gray-400">주문번호: {order.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.orderStatus)}`}>
                    {getStatusText(order.orderStatus)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">{formatPrice(order.totalPrice)}</span>
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
        )}
      </main>
    </div>
  );
};

export default OrderListPage;
