import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Upload from "./pages/Upload/Upload";
import SideBar from "./components/SideBar";
import styled from "styled-components";

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
        </Routes>
      </MainWrapper>
    </>
  );
}

export default App;
