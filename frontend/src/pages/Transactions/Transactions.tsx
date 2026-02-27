import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import VirtualizedTable from "../../components/Table";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setSelectedTransaction, resetData } from "../../redux/slices/dataSlice";
import { setModal } from "../../redux/slices/appSlice";
import { fetchTransactions, fetchCategories } from "../../redux/thunks/dataThunks";
import { formatDate, formatCurrency } from "../../utils/format";
import { Transaction } from "../../types";
import { ColumnDef } from "@tanstack/react-table";
import { IconReceiptOff, IconPlus } from "@tabler/icons-react";

const Page = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px 32px;

  @media (max-width: 1024px) {
    padding: 20px 16px;
  }

  .header_bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 16px;
    flex-wrap: wrap;

    h1 { font-size: 1.6rem; }
    .search { width: 280px; }
  }

  .table_container {
    flex: 1;
    min-height: 0;
  }
`;

const LoaderWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: var(--bg-card);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  gap: 20px;
  margin-top: 40px;

  .empty-icon {
    width: 64px;
    height: 64px;
    background: var(--accent-light);
    color: var(--accent);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    svg { width: 32px; height: 32px; }
  }

  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
  }

  p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    max-width: 320px;
    margin: 0 auto;
    line-height: 1.5;
  }
`;

const PrimaryBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  svg { width: 18px; height: 18px; }
  &:hover { background: #4f46e5; }
`;

const Transactions = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const { transactions, loading, selectedTransaction } = useAppSelector((s) => ({
    transactions: s.data.transactions,
    loading: s.data.loading.transactions,
    selectedTransaction: s.data.selectedTransaction,
  }));
  const openModal = useAppSelector((s) => s.app.modal.transaction);

  const columns = useMemo(
    () => [
      {
        header: "Fecha",
        accessorKey: "date",
        size: 15,
        cell: (info: { getValue: () => unknown }) => formatDate(info.getValue() as string),
      },
      {
        header: "Categoría",
        accessorKey: "category",
        size: 15,
        cell: (info: { getValue: () => unknown }) => {
          const cat = info.getValue() as Transaction["category"] | null;
          return cat?.category ?? "—";
        },
      },
      { header: "Concepto", accessorKey: "concept", size: 40 },
      {
        header: "Valor",
        accessorKey: "value",
        size: 15,
        cell: (info: { getValue: () => unknown }) => formatCurrency(info.getValue() as number),
      },
      { header: "Banco", accessorKey: "bank", size: 15 },
    ],
    []
  );

  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetData());
    };
  }, [dispatch]);

  const filteredData = useMemo(() => {
    if (!filter) return transactions;
    const lower = filter.toLowerCase();
    return transactions.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(lower))
    );
  }, [filter, transactions]);

  const handleOpenModal = (element: Transaction) => {
    dispatch(setModal({ transaction: true }));
    dispatch(setSelectedTransaction(element));
  };

  if (loading) {
    return <LoaderWrap><Loader /></LoaderWrap>;
  }

  return (
    <Page>
      <div className="header_bar">
        <h1>Transacciones</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <PrimaryBtn onClick={() => {
            dispatch(setSelectedTransaction(null));
            dispatch(setModal({ transaction: true }));
          }}>
            <IconPlus /> Nuevo gasto
          </PrimaryBtn>
          <div className="search">
            <Input
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Buscar..."
              value={filter}
            />
          </div>
        </div>
      </div>

      <div className="table_container">
        {transactions.length === 0 ? (
          <EmptyStateContainer>
            <div className="empty-icon">
              <IconReceiptOff />
            </div>
            <div>
              <h3>Sin transacciones</h3>
              <p>No hay movimientos registrados. Sube un extracto bancario para empezar a organizar tus gastos.</p>
            </div>
            <PrimaryBtn onClick={() => navigate("/upload")}>
              <IconPlus /> Subir mi primer extracto
            </PrimaryBtn>
          </EmptyStateContainer>
        ) : (
          <VirtualizedTable
            data={filteredData}
            columns={columns as ColumnDef<Transaction, unknown>[]}
            onRowClick={(el) => handleOpenModal(el as Transaction)}
          />
        )}
      </div>

      <Modal open={openModal} element={selectedTransaction} />
    </Page>
  );
};

export default Transactions;
