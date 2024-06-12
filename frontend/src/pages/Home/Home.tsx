import { Link } from "react-router-dom";
import { HomeWrapper } from "./Home.styles";
import BarChart from "../../components/BarChart";
import { useEffect } from "react";
import useData from "../../hooks/useData";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const Home = () => {
  const { getData } = useData();
  const data = useSelector((state: RootState) => state.data.data);
  const loading = useSelector((state: RootState) => state.data.loading);

  useEffect(() => {
    getData({ category: "Agua" });
    getData({ category: "Luz" });
  }, []);

  console.log(data);

  return (
    <HomeWrapper>
      <h1>HOME</h1>
      <Link to={"/upload"}>SUBIR ARCHIVO</Link>

      <main className="main">
        <div className="card">
          <div className="head">
            <h1>Agua</h1>
            {data.Agua?.total && <h2>{data.Agua?.total} €</h2>}
          </div>

          <BarChart data={data?.Agua?.data || []} loading={loading.Agua} colors={["#4fb6cd", "#70eb6a"]} id="agua" />
        </div>
        <div className="card">
          <div className="head">
            <h1>Luz</h1>
            {data.Luz?.total && <h2>{data.Luz?.total} €</h2>}
          </div>
          <BarChart data={data?.Luz?.data || []} loading={loading.Luz} colors={["#f29f41", "#f25941"]} id="luz" />
        </div>
      </main>
    </HomeWrapper>
  );
};

export default Home;
