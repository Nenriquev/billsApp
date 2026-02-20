import { IconChartBarPopular, IconReceipt2, IconUpload, IconLayoutDashboard, IconSettings, IconLogout, IconX } from "@tabler/icons-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Tooltip from "./Tooltip";
import { useAuth } from "../context/AuthContext";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setSidebarOpen } from "../redux/slices/appSlice";

const SideBarWrapper = styled.nav<{ $isOpen: boolean }>`
  position: fixed;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--bg-sidebar);
  width: 64px;
  padding: 16px 8px;
  gap: 4px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 1024px) {
    width: 280px;
    transform: ${({ $isOpen }) => ($isOpen ? "translateX(0)" : "translateX(-100%)")};
    padding: 20px;
    box-shadow: ${({ $isOpen }) => ($isOpen ? "20px 0 50px rgba(0,0,0,0.5)" : "none")};
  }

  .logo_section {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 48px;
    margin-bottom: 24px;
    position: relative;

    .logo {
      font-size: 1.6rem;
      font-weight: 800;
      color: white;
      background: var(--accent);
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
    }

    .close-btn {
      display: none;
      position: absolute;
      right: 0;
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      padding: 8px;
      
      @media (max-width: 1024px) {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .links {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }

  a, .logout-btn {
    color: rgba(255, 255, 255, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 48px;
    border-radius: var(--radius-sm);
    transition: all 0.2s ease;
    text-decoration: none;
    border: none;
    background: transparent;
    cursor: pointer;
    width: 100%;
    gap: 12px;
    overflow: hidden;

    span {
      display: none;
      font-size: 0.95rem;
      font-weight: 500;
      white-space: nowrap;

      @media (max-width: 1024px) {
        display: block;
      }
    }

    svg {
      width: 22px;
      height: 22px;
      min-width: 22px;
    }

    @media (max-width: 1024px) {
      justify-content: flex-start;
      padding: 0 16px;
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

  .logout-btn {
    margin-top: auto;
  }
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: none;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
  transition: opacity 0.3s ease;

  @media (max-width: 1024px) {
    display: block;
  }
`;

const navItems = [
  { name: "Dashboard", link: "/", icon: <IconLayoutDashboard /> },
  { name: "Análisis", link: "/analytics", icon: <IconChartBarPopular /> },
  { name: "Transacciones", link: "/transactions", icon: <IconReceipt2 /> },
  { name: "Subir archivo", link: "/upload", icon: <IconUpload /> },
  { name: "Configuración", link: "/configuration", icon: <IconSettings /> },
];

const SideBar = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const isOpen = useAppSelector((state) => state.app.sidebarOpen);

  const handleLogout = () => {
    logout();
    navigate("/login");
    dispatch(setSidebarOpen(false));
  };

  const closeSidebar = () => dispatch(setSidebarOpen(false));

  return (
    <>
      <Overlay $isOpen={isOpen} onClick={closeSidebar} />
      <SideBarWrapper $isOpen={isOpen}>
        <div className="logo_section">
          <div className="logo">B</div>
          <button className="close-btn" onClick={closeSidebar}>
            <IconX size={24} />
          </button>
        </div>
        <div className="links">
          {navItems.map((item) => (
            <Tooltip position="right" text={item.name} key={item.link} disabled={window.innerWidth <= 1024}>
              <Link
                to={item.link}
                className={location.pathname === item.link ? "active" : ""}
                onClick={closeSidebar}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </Tooltip>
          ))}
        </div>
        <Tooltip position="right" text="Cerrar sesión" disabled={window.innerWidth <= 1024}>
          <button className="logout-btn" onClick={handleLogout}>
            <IconLogout />
            <span>Cerrar sesión</span>
          </button>
        </Tooltip>
      </SideBarWrapper>
    </>
  );
};

export default SideBar;
