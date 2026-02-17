import { IconChartBarPopular, IconReceipt2, IconUpload, IconLayoutDashboard, IconTags, IconSettings } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import Tooltip from "./Tooltip";

const SideBarWrapper = styled.nav`
  position: fixed;
  display: flex;
  flex-direction: column;
  z-index: 20;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--bg-sidebar);
  width: 64px;
  padding: 16px 8px;
  gap: 4px;

  .logo {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    margin-bottom: 20px;
    font-size: 1.4rem;
    font-weight: 700;
    color: white;
  }

  .links {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  a {
    color: rgba(255, 255, 255, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 44px;
    border-radius: var(--radius-sm);
    transition: all 0.2s ease;
    text-decoration: none;

    svg {
      width: 22px;
      height: 22px;
    }

    &:hover {
      background: var(--bg-sidebar-hover);
      color: white;
    }

    &.active {
      background: var(--accent);
      color: white;
    }
  }
`;

const navItems = [
  { name: "Dashboard", link: "/", icon: <IconLayoutDashboard /> },
  { name: "Análisis", link: "/analytics", icon: <IconChartBarPopular /> },
  { name: "Transacciones", link: "/transactions", icon: <IconReceipt2 /> },
  { name: "Categorías", link: "/categories", icon: <IconTags /> },
  { name: "Subir archivo", link: "/upload", icon: <IconUpload /> },
  { name: "Configuración", link: "/configuration", icon: <IconSettings /> },
];

const SideBar = () => {
  const location = useLocation();

  return (
    <SideBarWrapper>
      <div className="logo">B</div>
      <div className="links">
        {navItems.map((item) => (
          <Tooltip position="left" text={item.name} key={item.link}>
            <Link
              to={item.link}
              className={location.pathname === item.link ? "active" : ""}
            >
              {item.icon}
            </Link>
          </Tooltip>
        ))}
      </div>
    </SideBarWrapper>
  );
};

export default SideBar;
