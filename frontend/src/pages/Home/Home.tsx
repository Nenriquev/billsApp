import { Link } from "react-router-dom";
import { HomeWrapper } from "./Home.styles";
import BarChart from "../../components/BarChart";
import { useEffect } from "react";
import useData from "../../hooks/useData";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import CountUp from "react-countup";
import { setLoadingData } from "../../redux/slices/dataSlice";
import { initialState } from "../../redux/actions/dataActions";
import Dropdown from "../../components/Dropdown";

const options = [
  {
    name: 2023,
    value: 2023,
  },
  {
    name: 2024,
    value: 2024,
  },
  {
    name: 2025,
    value: 2025,
  },
];

const Home = () => {
  const { getData, setDate, extractYear } = useData();
  const data = useSelector((state: RootState) => state.data.data);
  const dates = useSelector((state: RootState) => state.data.dates);
  const loading = useSelector((state: RootState) => state.data.loading);
  const dispatch = useDispatch();

  const handleChange = (e: any) => {
    setDate(e.value);
  };

  useEffect(() => {
    getData({ category: "Alquiler", dates: dates });
    getData({ category: "Agua", dates: dates });
    getData({ category: "Luz", dates: dates });
    getData({ category: "Gas", dates: dates });
    getData({ category: "Seguro", dates: dates });
    getData({ category: "Teléfono", dates: dates });
    getData({ category: "Supermercados", dates: dates });
    getData({ category: "Otra categoría", dates: dates });

    return () => {
      dispatch(setLoadingData(initialState.loading));
    };
  }, [dates]);

  return (
    <HomeWrapper>
      <h1>HOME</h1>

      <div className="drop">
        <Dropdown options={options} handleSelect={handleChange} selectedOption={extractYear(dates?.to)} />
      </div>

      <div className="grid">
        <div className="card">
          <div className="head">
            <h1>Alquiler</h1>
            {data.Alquiler?.total && <CountUp end={data.Alquiler.total} duration={1} decimals={2} suffix=" €" className="total" />}
          </div>

          <BarChart data={data?.Alquiler?.data || []} loading={loading.Alquiler} id="alquiler" />
        </div>

        <div className="card">
          <div className="head">
            <h1>Luz</h1>
            {data.Luz?.total && <CountUp end={data.Luz.total} duration={1} decimals={2} suffix=" €" className="total" />}
          </div>
          <BarChart data={data?.Luz?.data || []} loading={loading.Luz} id="luz" />
        </div>

        <div className="card">
          <div className="head">
            <h1>Supermercados</h1>
            {data.Supermercados?.total && <CountUp end={data.Supermercados.total} duration={1} decimals={2} suffix=" €" className="total" />}
          </div>
          <BarChart data={data?.Supermercados?.data || []} loading={loading.Supermercados} id="supermercado" />
        </div>

        <div className="card">
          <div className="head">
            <h1>Agua</h1>
            {data.Agua?.total && <CountUp end={data.Agua.total} duration={1} decimals={2} suffix=" €" className="total" />}
          </div>

          <BarChart data={data?.Agua?.data || []} loading={loading.Agua} id="agua" />
        </div>

        <div className="card">
          <div className="head">
            <h1>Gas</h1>
            {data.Gas?.total && <CountUp end={data.Gas.total} duration={1} decimals={2} suffix=" €" className="total" />}
          </div>
          <BarChart data={data?.Gas?.data || []} loading={loading.Gas} id="gas" />
        </div>

        <div className="card">
          <div className="head">
            <h1>Seguro</h1>
            {data.Seguro?.total && <CountUp end={data.Seguro.total} duration={1} decimals={2} suffix=" €" className="total" />}
          </div>
          <BarChart data={data?.Seguro?.data || []} loading={loading.Seguro} id="seguro" />
        </div>

        <div className="card">
          <div className="head">
            <h1>Teléfono</h1>
            {data.Teléfono?.total && <CountUp end={data.Teléfono.total} duration={1} decimals={2} suffix=" €" className="total" />}
          </div>
          <BarChart data={data?.Teléfono?.data || []} loading={loading.Teléfono} id="telefono" />
        </div>
      </div>
    </HomeWrapper>
  );
};

export default Home;
