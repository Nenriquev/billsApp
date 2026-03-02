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
import { IconReceiptOff, IconPlus, IconFilterX, IconX, IconSearch } from "@tabler/icons-react";
import MultiSelectDropdown from "../../components/MultiSelectDropdown";
import DateRangePicker from "../../components/DateRangePicker";

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
  }

  .table_container {
    flex: 1;
    min-height: 0;
  }
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px dashed var(--border);

  .chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    background: var(--accent-light);
    color: var(--accent);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 20px;
    font-size: 0.82rem;
    font-weight: 500;
    
    .remove {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0.7;
      transition: 0.2s;
      
      &:hover {
        opacity: 1;
        color: var(--danger);
      }
      
      svg {
        width: 14px;
        height: 14px;
        stroke-width: 3;
      }
    }
  }
`;

const FiltersBar = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: flex-end;
  background: var(--bg-card);
  padding: 24px;
  border-radius: var(--radius-lg, 16px);
  border: 1px solid var(--border);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    min-width: 180px;
    max-width: 300px;
    
    label {
      font-size: 0.82rem;
      color: var(--text-secondary);
      font-weight: 600;
      letter-spacing: 0.02em;
    }
  }

  .reset-btn {
    padding: 0 18px;
    background: transparent;
    color: var(--text-secondary);
    border: 1px dashed var(--border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s;
    height: 40px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    &:hover {
      background: var(--danger-light, #fee2e2);
      color: var(--danger, #ef4444);
      border-color: transparent;
    }
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
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;

  const { transactions, categories, loading, selectedTransaction } = useAppSelector((s) => ({
    transactions: s.data.transactions,
    categories: s.data.categories,
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
    let result = transactions;

    if (categoryFilters.length > 0) {
      result = result.filter((item) => {
        if (!item.category) return categoryFilters.includes("unassigned");
        return categoryFilters.includes(item.category._id);
      });
    }

    if (startDate) {
      result = result.filter((item) => new Date(item.date).getTime() >= startDate.getTime());
    }
    
    if (endDate) {
      const to = new Date(endDate);
      to.setHours(23, 59, 59, 999);
      result = result.filter((item) => new Date(item.date).getTime() <= to.getTime());
    }

    if (filter) {
      const lower = filter.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some((val) => val && String(val).toLowerCase().includes(lower)) || 
        (item.category && item.category.category.toLowerCase().includes(lower))
      );
    }
    
    return result;
  }, [filter, categoryFilters, startDate, endDate, transactions]);

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
        </div>
      </div>

      <FiltersBar>
        <div className="filter-group" style={{ minWidth: '220px' }}>
          <label>Buscar</label>
          <Input
            icon={<IconSearch size={18} />}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Concepto, banco, etc..."
            value={filter}
          />
        </div>

        <div className="filter-group">
          <label>Categorías</label>
          <MultiSelectDropdown 
            options={[
              { name: "Sin categoría", value: "unassigned" },
              ...categories.map((cat) => ({ name: cat.category, value: cat._id }))
            ]}
            selectedOptions={categoryFilters}
            handleSelect={(opts) => setCategoryFilters(opts as string[])}
            placeholder="Seleccionar..."
          />
        </div>
        
        <div className="filter-group" style={{ minWidth: '260px' }}>
          <label>Rango de Fechas (Transacción)</label>
          <DateRangePicker 
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            placeholder="Selecciona inicio y fin"
          />
        </div>

        {(categoryFilters.length > 0 || startDate || endDate || filter) && (
          <button 
            className="reset-btn" 
            onClick={() => {
              setFilter("");
              setCategoryFilters([]);
              setDateRange([null, null]);
            }}
          >
            <IconFilterX size={18} /> Limpiar Filtros
          </button>
        )}
        {(categoryFilters.length > 0 || startDate || endDate || filter) && (
          <ActiveFilters>
            {startDate && endDate && (
              <div className="chip">
                Rango: {formatDate(startDate.toISOString())} - {formatDate(endDate.toISOString())}
                <div className="remove" onClick={() => setDateRange([null, null])}>
                  <IconX />
                </div>
              </div>
            )}
            
            {categoryFilters.map((id) => {
              const catName = id === "unassigned" ? "Sin categoría" : categories.find(c => c._id === id)?.category;
              return (
                <div key={id} className="chip">
                  {catName}
                  <div className="remove" onClick={() => setCategoryFilters(prev => prev.filter(c => c !== id))}>
                    <IconX />
                  </div>
                </div>
              );
            })}

            {filter && (
              <div className="chip">
                Búsqueda: "{filter}"
                <div className="remove" onClick={() => setFilter("")}>
                  <IconX />
                </div>
              </div>
            )}
          </ActiveFilters>
        )}
      </FiltersBar>

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
            defaultSorting={[{ id: "date", desc: true }]}
          />
        )}
      </div>

      <Modal open={openModal} element={selectedTransaction} />
    </Page>
  );
};

export default Transactions;
