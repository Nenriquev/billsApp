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

const Home = () => {
  const { getData } = useData();
  const data = useSelector((state: RootState) => state.data.data);
  const loading = useSelector((state: RootState) => state.data.loading);
  const dispatch = useDispatch();

  useEffect(() => {
    getData({ category: "Agua" });
    getData({ category: "Luz" });
    getData({ category: "Gas" });

    return () => {
      dispatch(setLoadingData(initialState.loading));
    };
  }, []);

  return (
    <HomeWrapper>
      <h1>HOME</h1>
      <Link to={"/upload"}>SUBIR ARCHIVO</Link>

      <div className="grid">
        <div className="card">
          <div className="head">
            <h1>Agua</h1>
            {data.Agua?.total && <CountUp end={data.Agua.total} duration={1} decimals={2} suffix=" €" className="total" />}
          </div>

          <BarChart data={data?.Agua?.data || []} loading={loading.Agua} colors={["#4fb6cd", "#70eb6a"]} id="agua" />
        </div>
        <div className="card">
          <div className="head">
            <h1>Luz</h1>
            {data.Luz?.total && <CountUp end={data.Luz.total} duration={1} decimals={2} suffix=" €" className="total" />}
          </div>
          <BarChart data={data?.Luz?.data || []} loading={loading.Luz} colors={["#f29f41", "#f25941"]} id="luz" />
        </div>

        <div className="card">
          <div className="head">
            <h1>Gas</h1>
            {data.Gas?.total && <CountUp end={data.Gas.total} duration={1} decimals={2} suffix=" €" className="total" />}
          </div>
          <BarChart data={data?.Gas?.data || []} loading={loading.Gas} colors={["#8b1eff", "#ad3188"]} id="gas" />
        </div>
      </div>
    </HomeWrapper>
  );
};

export default Home;
