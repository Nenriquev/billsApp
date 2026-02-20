import { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { IconTags, IconRobot, IconSettings, IconUserCircle } from "@tabler/icons-react";
import Categories from "../Categories/Categories";
import AIProvidersConfig from "../../components/AIProvidersConfig";
import ProfileSettings from "../../components/ProfileSettings";

/* ────── Tabs config ────── */

const tabs = [
  { id: "profile", label: "Perfil", icon: <IconUserCircle size={18} /> },
  { id: "categories", label: "Categorías", icon: <IconTags size={18} /> },
  { id: "ai-providers", label: "Proveedores de IA", icon: <IconRobot size={18} /> },
] as const;

type TabId = (typeof tabs)[number]["id"];

/* ────── Styles ────── */

const Page = styled.div`
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
    background: var(--accent-light);
    color: var(--accent);
  }

  h1 {
    font-size: 1.6rem;
    font-weight: 700;
  }
`;

const TabBar = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--border-light);
  border-radius: var(--radius-sm);
  width: fit-content;
`;

const Tab = styled.button<{ $active: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
  background: transparent;
  color: ${(p) => (p.$active ? "var(--accent)" : "var(--text-secondary)")};
  z-index: 1;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    color: ${(p) => (p.$active ? "var(--accent)" : "var(--text-primary)")};
  }
`;

const TabIndicator = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: var(--bg-card);
  border-radius: 6px;
  box-shadow: var(--shadow-sm);
  z-index: 0;
`;

const TabContent = styled(motion.div)`
  flex: 1;
`;

/* ────── Component ────── */

const Configuration = () => {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
    <Page>
      <Header>
        <div className="icon-wrapper">
          <IconSettings size={22} />
        </div>
        <h1>Configuración</h1>
      </Header>

      <TabBar>
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {activeTab === tab.id && (
              <TabIndicator layoutId="tab-indicator" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
            )}
            <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 8 }}>
              {tab.icon}
              {tab.label}
            </span>
          </Tab>
        ))}
      </TabBar>

      <TabContent
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "profile" && <ProfileSettings />}
        {activeTab === "categories" && <Categories />}
        {activeTab === "ai-providers" && <AIProvidersConfig />}
      </TabContent>
    </Page>
  );
};

export default Configuration;
