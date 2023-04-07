
export const Pagination = ({ activePage, count, rowsPerPage, totalPages, setActivePage, onReset }) => {
    const beginning = activePage === 1 ? 1 : rowsPerPage * (activePage - 1) + 1
    const end = activePage === totalPages ? count : beginning + rowsPerPage - 1
  
    return (
      <>
        <div className="pagination">
          <button disabled={activePage === 1} onClick={() => setActivePage(1)}>
            ⏮️ First
          </button>
          <button disabled={activePage === 1} onClick={() => setActivePage(activePage - 1)}>
            ⬅️ Previous
          </button>
          <button disabled={activePage === totalPages} onClick={() => setActivePage(activePage + 1)}>
            Next ➡️
          </button>
          <button disabled={activePage === totalPages} onClick={() => setActivePage(totalPages)}>
            Last ⏭️
          </button>
        </div>
        <div className="pagination">◾  Page {activePage} of {totalPages}  ◾  Rows: {beginning === end ? end : `${beginning} - ${end}`} of {count}  ◾  <button onClick={onReset}>Reset table</button></div>
       
      </>
    )
  }
  