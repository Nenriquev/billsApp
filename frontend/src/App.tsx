import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Upload from "./pages/Upload/Upload";
import SideBar from "./components/SideBar";
import styled from "styled-components";
import Transactions from "./pages/Transactions/Transactions";

const MainWrapper = styled.div`
  width: calc(100% - 70px);
  height: 100%;
  overflow-y: scroll;
  position: absolute;
  right: 0;
`;

function App() {
  return (
    <>
      <SideBar />
      <MainWrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="*" element={<h1>Not found</h1>} />
        </Routes>
      </MainWrapper>
    </>
  );
}

export default App;
