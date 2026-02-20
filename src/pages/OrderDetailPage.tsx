import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(buildApiUrl(`/api/orders/${id}`), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('주문 조회 실패');
        }

        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error('주문 조회 실패:', error);
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const formatDate = (dateString: string | number[]) => {
    if (Array.isArray(dateString)) {
      const [year, month, day, hour, minute] = dateString;
      return `${year}년 ${month}월 ${day}일 ${hour}:${String(minute).padStart(2, '0')}`;
    }
    return new Date(dateString).toLocaleString('ko-KR');
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

  const handleAction = async (action: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch(buildApiUrl(`/api/orders/${id}/${action}`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('작업 실패');
      }

      const data = await response.json();
      setOrder(prev => prev ? { ...prev, orderStatus: data.orderStatus } : null);

      const actionMessages: Record<string, string> = {
        pay: '결제가 완료되었습니다.',
        cancel: '주문이 취소되었습니다.',
        ship: '배송이 시작되었습니다.',
        complete: '배송이 완료되었습니다.',
      };
      alert(actionMessages[action] || '처리되었습니다.');
    } catch (error) {
      alert('처리에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setActionLoading(false);
    }
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

  if (!order) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-red-500 mb-4">주문을 찾을 수 없습니다.</p>
          <a href="/orders" className="text-blue-500 hover:underline">주문 목록으로</a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">주문 상세</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">{formatDate(order.createAt)}</p>
              <p className="text-sm text-gray-400">주문번호: {order.id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.orderStatus)}`}>
              {getStatusText(order.orderStatus)}
            </span>
          </div>

          <div className="p-6">
            <h2 className="font-semibold mb-4">주문 상품</h2>
            <p className="text-lg mb-2">{order.productTitle}</p>
            <p className="text-2xl font-bold text-blue-600">{formatPrice(order.totalPrice)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="font-semibold mb-4">배송 정보</h2>
          <div className="space-y-2 text-gray-700">
            <p><span className="text-gray-500">수령인:</span> {order.recipientName || '-'}</p>
            <p><span className="text-gray-500">연락처:</span> {order.phoneNumber || '-'}</p>
            <p><span className="text-gray-500">배송지:</span> {order.address || '-'}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            목록으로
          </button>

          {order.orderStatus === 'CREATED' && (
            <>
              <button
                onClick={() => handleAction('pay')}
                disabled={actionLoading}
                className="flex-1 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
              >
                {actionLoading ? '처리 중...' : '결제하기'}
              </button>
              <button
                onClick={() => handleAction('cancel')}
                disabled={actionLoading}
                className="flex-1 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300"
              >
                {actionLoading ? '처리 중...' : '주문 취소'}
              </button>
            </>
          )}

          {order.orderStatus === 'PAID' && (
            <button
              onClick={() => handleAction('cancel')}
              disabled={actionLoading}
              className="flex-1 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300"
            >
              {actionLoading ? '처리 중...' : '주문 취소'}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetailPage;
