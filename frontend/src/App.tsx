import { Route, Routes, Navigate } from "react-router-dom";
import styled from "styled-components";
import SideBar from "./components/SideBar";
import Toast from "./components/Toast";
import Home from "./pages/Home/Home";
import Analytics from "./pages/Analytics/Analytics";
import Transactions from "./pages/Transactions/Transactions";
import Upload from "./pages/Upload/Upload";
import CategoriesPage from "./pages/Categories/Categories";
import Configuration from "./pages/Configuration/Configuration";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import { IconMenu2 } from "@tabler/icons-react";
import { useAppDispatch } from "./redux/hooks";
import { setSidebarOpen } from "./redux/slices/appSlice";

const Layout = styled.div`
  display: flex;
  height: 100%;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 64px;
  height: 100%;
  overflow-y: auto;
  transition: margin-left 0.3s ease;

  @media (max-width: 1024px) {
    margin-left: 0;
  }
`;

const MobileHeader = styled.header`
  display: none;
  height: 60px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  padding: 0 20px;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;

  @media (max-width: 1024px) {
    display: flex;
  }

  button {
    background: transparent;
    border: none;
    color: var(--text-base);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    margin-left: -8px;
  }

  .logo-text {
    margin-left: 12px;
    font-weight: 700;
    font-size: 1.1rem;
  }
`;

const AuthenticatedLayout = () => {
  const dispatch = useAppDispatch();

  return (
    <Layout>
      <SideBar />
      <MainContent>
        <MobileHeader>
          <button onClick={() => dispatch(setSidebarOpen(true))}>
            <IconMenu2 size={24} />
          </button>
          <span className="logo-text">Bills App</span>
        </MobileHeader>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/configuration" element={<Configuration />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainContent>
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toast />
    </AuthProvider>
  );
}

export default App;
