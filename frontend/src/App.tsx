import { Route, Routes } from "react-router-dom";
import styled from "styled-components";
import SideBar from "./components/SideBar";
import Toast from "./components/Toast";
import Home from "./pages/Home/Home";
import Analytics from "./pages/Analytics/Analytics";
import Transactions from "./pages/Transactions/Transactions";
import Upload from "./pages/Upload/Upload";
import CategoriesPage from "./pages/Categories/Categories";
import Configuration from "./pages/Configuration/Configuration";

const Layout = styled.div`
  display: flex;
  height: 100%;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 64px;
  height: 100%;
  overflow-y: auto;
`;

function App() {
  return (
    <Layout>
      <SideBar />
      <MainContent>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/configuration" element={<Configuration />} />
          <Route path="*" element={<div style={{ padding: 40 }}><h1>404 - Página no encontrada</h1></div>} />
        </Routes>
      </MainContent>
      <Toast />
    </Layout>
  );
}

export default App;
