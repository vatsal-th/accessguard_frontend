import React from 'react';

const Table = ({ columns, data, loading = false, emptyText = 'No data', rowActions }) => {
  return (
    <div className="overflow-x-auto rounded shadow bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
              >
                {col.title}
              </th>
            ))}
            {rowActions && <th className="px-4 py-2"></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td colSpan={columns.length + (rowActions ? 1 : 0)} className="text-center py-6 text-gray-400">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (rowActions ? 1 : 0)} className="text-center py-6 text-gray-400">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id || idx} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2 text-sm text-gray-700">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {rowActions && (
                  <td className="px-4 py-2 text-right">
                    {rowActions(row)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table; 