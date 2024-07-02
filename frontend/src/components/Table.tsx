import React, { useMemo, useState } from "react";
import { useTable } from "react-table";
import { FixedSizeList } from "react-window";
import styled from "styled-components";

const TableWrapper = styled.div`
  .table {
    display: block;
    border-collapse: collapse;
    width: 100%;
  }

  .header,
  .body {
    display: block;
  }

  .tr {
    display: flex;
    width: calc(100% - 17px);
    cursor: pointer;
    transition: 0.3s;
    border: none;

    &:hover {
      background-color: #c1dfff;
      transition: 0.3s;
    }
  }

  .th,
  .td {
    padding: 10px;
    border: 1px solid black;
    box-sizing: border-box;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    border: 0.1px solid #ededed;
  }

  .th {
    background-color: #f0f0f0;
    font-weight: bold;
    text-align: left;
  }
`;

interface TableProps {
  data: Array<any>;
  columns: {
    Header: string;
    accessor: string;
    width: number;
  }[];
  onRowClick?: (row: any) => void;
}

const VirtualizedTable: React.FC<TableProps> = ({ data, columns, onRowClick }) => {
  const [filter, setFilter] = useState<string>("");

  const filteredData = useMemo(() => {
    return data.filter((item) => Object.values(item).some((val) => String(val).toLowerCase().includes(filter.toLowerCase())));
  }, [filter, data]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: data,
  });

  const RenderRow = ({ index, style }: { index: number; style: any }) => {
    const row = rows[index];
    prepareRow(row);
    return (
      <div {...row.getRowProps({ style })} className="tr" onClick={() => onRowClick && onRowClick(row?.original)}>
        {row.cells.map((cell) => (
          <div {...cell.getCellProps()} className="td" style={{ width: `${cell.column.width}%` }}>
            {cell.render("Cell")}
          </div>
        ))}
      </div>
    );
  };

  return (
    <TableWrapper>
      <div {...getTableProps()} className="table">
        <div className="header">
          {headerGroups.map((headerGroup) => (
            <div {...headerGroup.getHeaderGroupProps()} className="tr">
              {headerGroup.headers.map((column) => (
                <div {...column.getHeaderProps()} className="th" style={{ width: `${column.width}%` }}>
                  {column.render("Header")}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div {...getTableBodyProps()} className="body">
          <FixedSizeList height={400} itemCount={rows.length} itemSize={35} width="100%" className="row">
            {RenderRow}
          </FixedSizeList>
        </div>
      </div>
    </TableWrapper>
  );
};

export default VirtualizedTable;
