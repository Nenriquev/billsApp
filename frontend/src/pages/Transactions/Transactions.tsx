import { useEffect, useMemo } from "react";
import VirtualizedTable from "../../components/Table";
import useData from "../../hooks/useData";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Loader from "../../components/Loader";

const Transactions = () => {
  const { getData, formateDate, formatCurrency } = useData();
  const data = useSelector((state: RootState) => state.data.data);
  const loading = useSelector((state: RootState) => state.data.loading.data);
  const columns = useMemo(
    () => [
      { Header: "Fecha", accessor: "date", width: 15, Cell: ({ value }: { value: string }) => formateDate(value) },
      { Header: "Categoria", accessor: "category", width: 15 },
      { Header: "Concepto", accessor: "concept", width: 40 },
      { Header: "Valor", accessor: "value", width: 15, Cell: ({ value }: { value: number }) => formatCurrency(value) },
      { Header: "Banco", accessor: "bank", width: 15 },
    ],
    [data, loading]
  );

  useEffect(() => {
    getData({});
  }, []);

 

  return <VirtualizedTable data={data || []} columns={columns} onRowClick={(e) => console.log(e)} />;
};

export default Transactions;
