import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom';
import { sortRows, filterRows, paginateRows } from './helpers'
import { Pagination } from './Pagination/Pagination'

export const Table = ({ columns, rows, onZoom }) => {
  const [activePage, setActivePage] = useState(1)
  const [filters, setFilters] = useState({})
  const [sort, setSort] = useState({ order: 'desc', orderBy: '_createdOn' })
  const rowsPerPage = 5;

  const filteredRows = useMemo(() => filterRows(rows, filters), [rows, filters])
  const sortedRows = useMemo(() => sortRows(filteredRows, sort), [filteredRows, sort])
  const calculatedRows = paginateRows(sortedRows, activePage, rowsPerPage)

  const count = filteredRows.length
  const totalPages = Math.ceil(count / rowsPerPage)

  const handleSearch = (value, accessor) => {
    setActivePage(1)

    if (value) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [accessor]: value,
      }))
    } else {
      setFilters((prevFilters) => {
        const updatedFilters = { ...prevFilters }
        delete updatedFilters[accessor]

        return updatedFilters
      })
    }
  }

  const handleSort = (accessor) => {
    setActivePage(1)
    setSort((prevSort) => ({
      order: prevSort.order === 'asc' && prevSort.orderBy === accessor ? 'desc' : 'asc',
      orderBy: accessor,
    }))
  }

  const onReset = () => {
    setSort({ order: 'asc', orderBy: 'id' })
    setActivePage(1)
    setFilters({})
    
  }

  return (
    <>
      <table>
        <thead>
          <tr>
            {columns.map((column) => {
                const sortIcon = () => {
                   if (column.accessor === sort.orderBy) {
                  if (sort.order === 'asc') {
                    return '⬆️'
                  }
                  return '⬇️'
                } else {
                  return '️↕️'
                }
              }
              return (
                <th key={column.accessor + column.id}>
                  <span>{column.label}</span>
                  {["zoom", "details"]
                    .includes(column.accessor)
                    ? ""
                    : <button onClick={() => handleSort(column.accessor)}>{sortIcon()}</button>}
                </th>
              )
            })}
          </tr>
          <tr>
            {columns.map((column) => {
                
              return (
                <th key={`${column.id}-head`}>
                  {["zoom", "details"]
                    .includes(column.accessor)
                    ? "⛔"
                    : <input
                    key={`${column.id}-search`}
                    type="search"
                    placeholder={`Search ${column.label}`}
                    value={filters[column.accessor]}
                    onChange={(event) => handleSearch(event.target.value, column.accessor)}
                  />}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {calculatedRows.map((row) => {
            return (
              <tr key={row._id}>
                {columns.map((column) => {
                  if (column.accessor === "zoom") {
                    return <td key={column.accessor + row._id}>{
                        <button type='zoom' onClick={() => onZoom(row.zoomPointCoordinates)}>🔍</button>
                        }</td>
                  }
                  if (column.accessor === "details") {
                    return <td key={column.accessor + row._id}>{
                        <Link to={`/activities/${row._id}`}>View</Link>
                        }</td>
                  }
                  if (column.accessor === "start" || column.accessor === "end") {
                    return <td key={column.accessor + row._id}>{row[column.accessor].replace("T", " ").slice(0, 16)}</td>
                  }
                  return <td key={column.accessor + row._id}>{row[column.accessor]}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>

      {count > 0 ? (
        <Pagination
          activePage={activePage}
          count={count}
          rowsPerPage={rowsPerPage}
          totalPages={totalPages}
          setActivePage={setActivePage}
          onReset={onReset}
        />
      ) : (
        <p>No data found</p>
      )}

    </>
  )
}
