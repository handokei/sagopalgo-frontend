import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { buildApiUrl } from '../lib/api';

interface Product {
  id: number;
  title: string;
  price: number;
  stock: number;
  productStatus: string;
  categoryId: number;
  categoryName: string;
  createdAt: string;
}

const MyProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProducts = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(buildApiUrl('/api/products/me'), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('상품 조회 실패');
        }

        const data = await response.json();
        setProducts(data.content || []);
      } catch (error) {
        console.error('상품 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProducts();
  }, [navigate]);

  const handleDelete = async (productId: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(buildApiUrl(`/api/products/${productId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('삭제 실패');
      }

      setProducts(products.filter(p => p.id !== productId));
      alert('상품이 삭제되었습니다.');
    } catch (error) {
      alert('삭제에 실패했습니다.');
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const getStatusText = (status: string) => {
    return status === 'ON_SALE' ? '판매중' : '판매완료';
  };

  const getStatusColor = (status: string) => {
    return status === 'ON_SALE'
      ? 'bg-green-100 text-green-600'
      : 'bg-gray-100 text-gray-600';
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">내 상품</h1>
          <a
            href="/products/create"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            상품 등록
          </a>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">등록한 상품이 없습니다.</p>
            <a href="/products/create" className="text-blue-500 hover:underline">
              첫 상품 등록하기
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">상품명</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">가격</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">재고</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">상태</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <a
                        href={`/products/${product.id}`}
                        className="font-medium hover:text-blue-600"
                      >
                        {product.title}
                      </a>
                    </td>
                    <td className="px-4 py-4 text-blue-600 font-semibold">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-4">{product.stock}개</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(product.productStatus)}`}>
                        {getStatusText(product.productStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <a
                          href={`/products/${product.id}/edit`}
                          className="text-blue-500 hover:underline text-sm"
                        >
                          수정
                        </a>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-500 hover:underline text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyProductsPage;
