import React, { useMemo, useState } from "react";
import { FixedSizeList } from "react-window";
import styled from "styled-components";
import { useReactTable, GlobalFiltering, Column, getCoreRowModel, flexRender } from "@tanstack/react-table";

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
    header: string;
    accessorKey: string;
    width: number;
    cell?: any;
  }[];
  onRowClick?: (row: any) => void;
}

const VirtualizedTable: React.FC<TableProps> = ({ data, columns, onRowClick }) => {
  const [filter, setFilter] = useState<string>("");

  const filteredData = useMemo(() => {
    return data.filter((item) => Object.values(item).some((val) => String(val).toLowerCase().includes(filter.toLowerCase())));
  }, [filter, data]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const RenderRow = ({ index, style }: { index: number; style: any }) => {
    const row = table.getRowModel().rows[index];
    return (
      <div style={style} className="tr" onClick={() => onRowClick && onRowClick(row.original)}>
        {row.getVisibleCells().map((cell, key) => (
          <div className="td" style={{ flex: `${cell.column.columnDef.size || 1}` }} key={key}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
        ))}
      </div>
    );
  };

  return (
    <TableWrapper>
      <div className="table">
        <div className="header">
          {table.getHeaderGroups().map((headerGroup) => (
            <div key={headerGroup.id} className="tr">
              {headerGroup.headers.map((header) => (
                <div key={header.id} className="th" style={{ flex: `${header.column.getSize() || 1}` }}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="body">
          <FixedSizeList height={400} itemCount={table.getRowModel().rows.length} itemSize={35} width="100%">
            {({ index, style }) => <RenderRow index={index} style={style} />}
          </FixedSizeList>
        </div>
      </div>
    </TableWrapper>
  );
};

export default VirtualizedTable;
