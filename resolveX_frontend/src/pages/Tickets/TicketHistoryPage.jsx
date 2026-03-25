import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

const ITEMS_PER_PAGE = 10;

const TicketHistoryPage = () => {
  const { ticket_id } = useParams();

  const [history, setHistory] = useState([]);
  const [ticketTitle, setTicketTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  //  FETCH HISTORY
  const fetchHistory = async () => {
    setLoading(true);

    try {
      const params = {};

      if (selectedMonth) params.month = selectedMonth;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await api.get(`/tickets/${ticket_id}/history/`, {
        params,
      });

      const data = res.data.results || res.data;

      setHistory(data);
      setCurrentPage(1);

      if (data.length > 0) {
        setTicketTitle(data[0].ticket);
      }

    } catch (err) {
      console.error(err);
      alert("Failed to fetch ticket history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [ticket_id]);

  const applyFilters = () => {
    fetchHistory();
  };

  // PAGINATION
  const paginatedItems = () => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return history.slice(start, start + ITEMS_PER_PAGE);
  };

  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* TOP BAR (MATCHED WITH ALLTICKETS) */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-gray-800">
          Ticket History {ticketTitle && `: ${ticketTitle}`}
        </h1>

        {/* FILTERS (HORIZONTAL LIKE ALLTICKETS) */}
        <div className="flex gap-2 flex-wrap items-center">

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          />

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          />

          <button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Apply
          </button>

        </div>
      </div>

      {/*  TABLE */}
      <div className="bg-white shadow rounded-lg overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">Timestamp</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : paginatedItems().length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-6 text-gray-500">
                  No history found
                </td>
              </tr>
            ) : (
              paginatedItems().map((h, idx) => (
                <tr
                  key={h.id}
                  className={`border-t ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-3">{h.user || "Unknown"}</td>
                  <td className="p-3">{h.action}</td>
                  <td className="p-3 text-sm text-gray-500">
                    {new Date(h.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2 flex-wrap">

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.max(prev - 1, 1))
            }
            className="px-3 py-1 border rounded"
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1
                  ? "bg-indigo-600 text-white"
                  : "bg-white"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, totalPages)
              )
            }
            className="px-3 py-1 border rounded"
            disabled={currentPage === totalPages}
          >
            Next
          </button>

        </div>
      )}

    </div>
  );
};

export default TicketHistoryPage;