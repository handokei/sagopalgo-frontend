import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div className="p-4">홈페이지 (로그인 후)</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
