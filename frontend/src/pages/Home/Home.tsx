import { useEffect } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchDashboard } from "../../redux/thunks/dataThunks";
import { setSelectedYear, setSelectedMonth } from "../../redux/slices/dataSlice";
import Dropdown from "../../components/Dropdown";
import Loader from "../../components/Loader";
import { formatCurrency } from "../../utils/format";
import { DropdownOption } from "../../types";
import DonutChart from "../../components/charts/DonutChart";
import TrendChart from "../../components/charts/TrendChart";
import CategoryBarChart from "../../components/charts/CategoryBarChart";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconCash,
  IconReceipt,
  IconChartPie,
} from "@tabler/icons-react";

const currentYear = new Date().getFullYear();

const yearOptions: DropdownOption[] = Array.from({ length: 5 }, (_, i) => {
  const y = currentYear - i;
  return { name: y, value: y };
});

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const monthOptions: DropdownOption[] = MONTH_NAMES.map((name, i) => ({
  name,
  value: i,
}));

const Page = styled.div`
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100%;

  @media (max-width: 1024px) {
    padding: 20px 16px;
    gap: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  h1 {
    font-size: 1.6rem;
    font-weight: 700;
  }

  .filters {
    display: flex;
    gap: 12px;
    .dropdown-wrap { width: 160px; }
  }
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
`;

const KpiCard = styled.div<{ $accent?: string }>`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s;

  &:hover { box-shadow: var(--shadow-md); }

  .kpi-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .kpi-icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${(p) => p.$accent || "var(--accent-light)"};
    color: ${(p) => (p.$accent ? "white" : "var(--accent)")};

    svg { width: 20px; height: 20px; }
  }

  .kpi-label {
    font-size: 0.82rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .kpi-value {
    font-size: 1.5rem;
    font-weight: 700;
    
    @media (max-width: 768px) {
      font-size: 1.3rem;
    }
  }

  .kpi-comparison {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.78rem;
    font-weight: 500;

    svg { width: 14px; height: 14px; }

    &.positive { color: var(--danger); }
    &.negative { color: var(--success); }
    &.neutral { color: var(--text-muted); }
  }
`;

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);

  h3 {
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--text-primary);
  }

  &.full-width {
    grid-column: 1 / -1;
  }
`;

const TopExpensesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .expense-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    background: var(--border-light);

    .rank {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--accent);
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .info {
      flex: 1;
      min-width: 0;

      .name {
        font-size: 0.85rem;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .count {
        font-size: 0.72rem;
        color: var(--text-muted);
      }
    }

    .amount {
      font-size: 0.9rem;
      font-weight: 600;
      white-space: nowrap;
    }
  }
`;

const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

function ComparisonBadge({ changePercent, label }: { changePercent: number; label: string }) {
  const isUp = changePercent > 0;
  const isNeutral = changePercent === 0;
  const cls = isNeutral ? "neutral" : isUp ? "positive" : "negative";
  const Icon = isNeutral ? IconMinus : isUp ? IconTrendingUp : IconTrendingDown;

  return (
    <span className={`kpi-comparison ${cls}`}>
      <Icon />
      {isNeutral ? "Sin cambios" : `${Math.abs(changePercent)}% ${label}`}
    </span>
  );
}

const Home = () => {
  const dispatch = useAppDispatch();
  const { dashboard, loading, selectedYear, selectedMonth } = useAppSelector((s) => s.data);

  useEffect(() => {
    dispatch(fetchDashboard({ year: selectedYear, month: selectedMonth }));
  }, [dispatch, selectedYear, selectedMonth]);

  const handleYearChange = (opt: DropdownOption) => {
    dispatch(setSelectedYear(opt.value as number));
  };

  const handleMonthChange = (opt: DropdownOption) => {
    dispatch(setSelectedMonth(opt.value as number));
  };

  if (loading.dashboard && !dashboard) {
    return (
      <LoaderWrapper>
        <Loader />
      </LoaderWrapper>
    );
  }

  const d = dashboard;

  return (
    <Page>
      <Header>
        <h1>Dashboard</h1>
        <div className="filters">
          <div className="dropdown-wrap">
            <Dropdown
              options={monthOptions}
              handleSelect={handleMonthChange}
              selectedOption={selectedMonth}
            />
          </div>
          <div className="dropdown-wrap">
            <Dropdown
              options={yearOptions}
              handleSelect={handleYearChange}
              selectedOption={selectedYear}
            />
          </div>
        </div>
      </Header>

      <KpiGrid>
        <KpiCard $accent="#6366f1">
          <div className="kpi-header">
            <span className="kpi-label">Gasto total ({selectedYear})</span>
            <div className="kpi-icon"><IconCash /></div>
          </div>
          <span className="kpi-value">{formatCurrency(d?.totalSpent ?? 0)}</span>
        </KpiCard>

        <KpiCard $accent="#3b82f6">
          <div className="kpi-header">
            <span className="kpi-label">Gasto del mes</span>
            <div className="kpi-icon"><IconReceipt /></div>
          </div>
          <span className="kpi-value">{formatCurrency(d?.vsLastMonth?.current ?? 0)}</span>
          {d?.vsLastMonth && <ComparisonBadge changePercent={d.vsLastMonth.changePercent} label="vs mes anterior" />}
        </KpiCard>

        <KpiCard $accent="#8b5cf6">
          <div className="kpi-header">
            <span className="kpi-label">vs mismo mes año anterior</span>
            <div className="kpi-icon"><IconChartPie /></div>
          </div>
          <span className="kpi-value">{formatCurrency(d?.vsLastYear?.previous ?? 0)}</span>
          {d?.vsLastYear && <ComparisonBadge changePercent={d.vsLastYear.changePercent} label="interanual" />}
        </KpiCard>

        <KpiCard>
          <div className="kpi-header">
            <span className="kpi-label">Promedio por transacción</span>
          </div>
          <span className="kpi-value">{formatCurrency(d?.averageTransaction ?? 0)}</span>
          <span className="kpi-comparison neutral">{d?.transactionCount ?? 0} transacciones</span>
        </KpiCard>
      </KpiGrid>

      <ChartsRow>
        <ChartCard>
          <h3>Distribución por categoría</h3>
          <DonutChart data={d?.categoryBreakdown ?? []} />
        </ChartCard>

        <ChartCard>
          <h3>Top 10 gastos del año</h3>
          <TopExpensesList style={{ position: "relative", minHeight: 200 }}>
            {d?.topExpenses && d.topExpenses.length > 0 ? (
              d.topExpenses.map((exp, i) => (
                <div className="expense-row" key={exp.concept}>
                  <div className="rank">{i + 1}</div>
                  <div className="info">
                    <div className="name">{exp.concept}</div>
                    <div className="count">{exp.count} transacciones</div>
                  </div>
                  <div className="amount">{formatCurrency(exp.total)}</div>
                </div>
              ))
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#94a3b8",
                  fontSize: "1rem",
                  fontWeight: 500,
                  marginTop: "60px"
                }}
              >
                Sin datos
              </div>
            )}
          </TopExpensesList>
        </ChartCard>
      </ChartsRow>

      <ChartCard className="full-width">
        <h3>Tendencia mensual de gastos</h3>
        <TrendChart data={d?.monthlyTrend ?? []} />
      </ChartCard>

      <ChartCard className="full-width">
        <h3>Gastos mensuales por categoría</h3>
        <CategoryBarChart data={d?.monthlyByCategory ?? { months: [], series: [] }} />
      </ChartCard>
    </Page>
  );
};

export default Home;
