import { useEffect, useMemo } from "react";
import VirtualizedTable from "../../components/Table";
import useData from "../../hooks/useData";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Loader from "../../components/Loader";
import styled from "styled-components";
import Modal from "../../components/Modal";
import { setModal } from "../../redux/slices/appSlice";
import { setSelectedTransaction } from "../../redux/slices/dataSlice";

const TransactionsWrapper = styled.div``;

const Transactions = () => {
  const { getData, formateDate, formatCurrency, getCategories } = useData();
  const data = useSelector((state: RootState) => state.data.data);
  const loading = useSelector((state: RootState) => state.data.loading.data);
  const openModal = useSelector((state: RootState) => state.app.modal.transaction);
  const element = useSelector((state: RootState) => state.data.selectedTransaction);
  const dispatch = useDispatch();
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
    getCategories();
  }, []);

  const handleOpenModal = (element: any) => {
    dispatch(setModal({ transaction: true }));
    dispatch(setSelectedTransaction(element));
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <TransactionsWrapper>
      <h1>Transacciones</h1>
      <div className="table">
        <VirtualizedTable data={data || []} columns={columns} onRowClick={(element) => handleOpenModal(element)} />
      </div>
      <Modal open={openModal} element={element}/>
    </TransactionsWrapper>
  );
};

export default Transactions;
