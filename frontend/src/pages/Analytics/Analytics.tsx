import { useEffect, useMemo } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchCategories, fetchAnalytics } from "../../redux/thunks/dataThunks";
import { setDates } from "../../redux/slices/dataSlice";
import Dropdown from "../../components/Dropdown";
import BarChart from "../../components/BarChart";
import CountUp from "react-countup";
import { extractYear, getYearRange } from "../../utils/format";
import { DropdownOption } from "../../types";

const currentYear = new Date().getFullYear();

const yearOptions: DropdownOption[] = Array.from({ length: 5 }, (_, i) => {
  const y = currentYear - i;
  return { name: y, value: y };
});

const Page = styled.div`
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 { font-size: 1.6rem; }

  .dropdown-wrap { width: 160px; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 380px;
  background: var(--bg-card);
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  padding: 10px 0;
  transition: box-shadow 0.2s;

  &:hover { box-shadow: var(--shadow-md); }

  .head {
    position: absolute;
    top: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    width: 100%;
    z-index: 1;

    h3 { font-size: 0.95rem; }

    .total {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--accent);
    }
  }

  .chart {
    position: absolute;
    bottom: 10px;
    width: 100%;
    height: calc(100% - 50px);
  }
`;

const Analytics = () => {
  const dispatch = useAppDispatch();
  const { analytics, loadingAnalytics, categories, dates } = useAppSelector((s) => s.data);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (categories.length === 0) return;
    for (const cat of categories) {
      dispatch(fetchAnalytics({ category: cat.category, ...dates }));
    }
  }, [dispatch, categories, dates]);

  const handleYearChange = (opt: DropdownOption) => {
    dispatch(setDates(getYearRange(opt.value as number)));
  };

  const items = useMemo(
    () =>
      categories.map((cat) => ({
        key: cat.category,
        data: analytics[cat.category],
        loading: loadingAnalytics[cat.category] ?? true,
      })),
    [categories, analytics, loadingAnalytics]
  );

  return (
    <Page>
      <Header>
        <h1>Análisis por categoría</h1>
        <div className="dropdown-wrap">
          <Dropdown
            options={yearOptions}
            handleSelect={handleYearChange}
            selectedOption={extractYear(dates.to)}
          />
        </div>
      </Header>

      <Grid>
        {items.map(({ key, data, loading }) => (
          <Card key={key}>
            <div className="head">
              <h3>{key}</h3>
              {data?.total != null && data.total > 0 && (
                <CountUp
                  end={data.total}
                  duration={1}
                  decimals={2}
                  suffix=" €"
                  className="total"
                />
              )}
            </div>
            <BarChart data={data?.data || {}} loading={loading} id={key} />
          </Card>
        ))}
      </Grid>
    </Page>
  );
};

export default Analytics;
