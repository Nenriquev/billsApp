import React, { useEffect, useMemo, useRef, useState } from "react";
import { FixedSizeList } from "react-window";
import styled from "styled-components";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import Input from "./Input";

const TableWrapper = styled.div`
  display: block;
  border-collapse: collapse;
  width: 100%;
  height: 100%;
  border: 1px solid black;
  border-radius: 10px;
  overflow: hidden;

  .header {
    display: block;
    height: 41px;

    div > div:last-child {
      padding-right: 27px;
    }
  }

  .body {
    height: calc(100% - 41px);
  }

  .tr {
    display: flex;
    width: 100%;

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (containerRef.current) {
      setHeight(containerRef.current.clientHeight);
    }

    const handleResize = () => {
      if (containerRef.current) {
        setHeight(containerRef.current.clientHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const table = useReactTable({
    data,
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
      <div className="body" ref={containerRef}>
        <FixedSizeList height={height} itemCount={table.getRowModel().rows.length} itemSize={35} width="100%" className="main_table">
          {({ index, style }) => <RenderRow index={index} style={style} />}
        </FixedSizeList>
      </div>
    </TableWrapper>
  );
};

export default VirtualizedTable;
