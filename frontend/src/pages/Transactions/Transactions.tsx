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
      { header: "Fecha", accessorKey: "date", width: 15, cell: ({ getValue }: { getValue: any }) => formateDate(getValue()) },
      { header: "Categoria", accessorKey: "category", width: 15 },
      { header: "Concepto", accessorKey: "concept", width: 40 },
      { header: "Valor", accessorKey: "value", width: 15, cell: ({ getValue }: { getValue: any }) => formatCurrency(getValue()) },
      { header: "Banco", accessorKey: "bank", width: 15 },
    ],
    []
  );

  useEffect(() => {
    getData({});
  }, []);

  if (loading) {
    return <Loader />;
  }

  return <VirtualizedTable data={data || []} columns={columns} onRowClick={(e) => console.log(e)} />;
};

export default Transactions;
