import { Link } from "react-router-dom";
import styled from "styled-components";

const SideBarWrapper = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  z-index: 10;
  left: 0;
  top: 0;
  height: 100%;
  background-color: #2d2d7c;
  width: 70px;
  border-radius: 0px 10px 10px 0;

  a {
    color: white;
  }
`;

const SideBar = () => {
  return (
    <SideBarWrapper>
      <Link to={'/upload'}>Subir</Link>
      <Link to={'/'}>Charts</Link>
    </SideBarWrapper>
  );
};

export default SideBar;
