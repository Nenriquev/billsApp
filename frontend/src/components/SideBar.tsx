import { IconChartBarPopular, IconReceipt2, IconUpload } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Tooltip from "./Tooltip";

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
  padding: 10px 0;

  .links {
    display: flex;
    flex-direction: column;
    padding: 0px 5px;
  }

  a {
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    border-radius: 10px;
    transition: 0.3s;

    &:hover {
      transition: 0.3s;
      background-color: #5454c8;
    }
  }
`;

const elements = [
  {
    name: "Inicio",
    link: "/",
    icon: <IconChartBarPopular />,
  },
  {
    name: "Transacciones",
    link: "/transactions",
    icon: <IconReceipt2/>,
  },
  {
    name: "Subir archivos",
    link: "/upload",
    icon: <IconUpload />,
  },
];

const SideBar = () => {
  return (
    <SideBarWrapper>
      <div className="links">
        {elements.map((item, key: number) => (
          <Tooltip position="left" text={item.name} key={key}>
            <Link to={item.link}>{item.icon}</Link>
          </Tooltip>
        ))}
      </div>
    </SideBarWrapper>
  );
};

export default SideBar;
