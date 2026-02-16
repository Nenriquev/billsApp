import React, { useEffect, useRef, useState } from "react";
import { FixedSizeList } from "react-window";
import styled from "styled-components";
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from "@tanstack/react-table";

const Wrapper = styled.div`
  display: block;
  width: 100%;
  height: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg-card);

  .header {
    display: block;
    height: 42px;
    div > div:last-child { padding-right: 24px; }
  }

  .body { height: calc(100% - 42px); }

  .tr {
    display: flex;
    width: 100%;
    cursor: pointer;
    transition: background 0.15s;
    &:hover { background: var(--accent-light); }
  }

  .th, .td {
    padding: 10px 14px;
    box-sizing: border-box;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 0.85rem;
  }

  .th {
    background: var(--border-light);
    font-weight: 600;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border);
  }

  .td {
    border-bottom: 1px solid var(--border-light);
    color: var(--text-primary);
  }
`;

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  onRowClick?: (row: T) => void;
}

function VirtualizedTable<T>({ data, columns, onRowClick }: TableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) setHeight(containerRef.current.clientHeight);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = table.getRowModel().rows[index];
    return (
      <div style={style} className="tr" onClick={() => onRowClick?.(row.original)}>
        {row.getVisibleCells().map((cell) => (
          <div className="td" style={{ flex: `${cell.column.columnDef.size || 1}` }} key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Wrapper>
      <div className="header">
        {table.getHeaderGroups().map((hg) => (
          <div key={hg.id} className="tr">
            {hg.headers.map((h) => (
              <div key={h.id} className="th" style={{ flex: `${h.column.getSize() || 1}` }}>
                {flexRender(h.column.columnDef.header, h.getContext())}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="body" ref={containerRef}>
        <FixedSizeList height={height} itemCount={table.getRowModel().rows.length} itemSize={42} width="100%">
          {({ index, style }) => <Row index={index} style={style} />}
        </FixedSizeList>
      </div>
    </Wrapper>
  );
}

export default VirtualizedTable;
