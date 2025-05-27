import { useState, useEffect, useCallback } from "react";
import Header from "../../components/Header";
import FilterBar from "../../components/FilterBar";
import Pagination from "../../components/Pagination";
import Table from "../../components/Table";
import { getTaskList } from "../../lib/store";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import "sweetalert2/dist/sweetalert2.min.css";
import Swal from "sweetalert2";
import { Download, RotateCcw } from "lucide-react";
import { FaSyncAlt } from "react-icons/fa";
import { Filter } from "lucide-react";
import "../../App.css";
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react";

function normalizeData(data) {
  return data.map((item) => ({
    id: item.id,
    projectName: item.project_name,
    userName: item.user_name,
    taskName: item.task_title,
    sprintName: item.sprint || "--",
    estimate: item.estimate,
    taskStartDate: item.task_start,
    taskDueDate: item.task_due,
    actualEffortStart: item.actual_effort_start,
    actualEffortEnd: item.actual_effort_end,
    actualSpent: item.actual_spent_hours,
    taskStatus: item.status,
    timelog_status: item.timelog_status,
    comments: item.comments || [],
  }));
}
function extractDate(dateString) {
  return dateString ? dateString.split("T")[0] : "";
}

export default function SheetPage() {
  // --- main data + filters + paging ---
  const [data, setData] = useState([]);

  const [filteredData, setFilteredData] = useState([]);
  //   console.log(filteredData, "filtered Data");
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem("filters");
    return saved
      ? JSON.parse(saved)
      : {
          projectName: "",
          userName: "",
          startDate: "",
          endDate: "",
          dateRange: "",
          taskStatus: "",
        };
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // --- syncing/loading state ---
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);

  // --- TODO‐TABLE state / persistence ---
  const [showTodoTable, setShowTodoTable] = useState(() => {
    const s = localStorage.getItem("showTodoTable");
    return s ? JSON.parse(s) : false;
  });
  const [todoFilters, setTodoFilters] = useState({
    userName: "",
    projectName: "",
  });
  const [todoPage, setTodoPage] = useState(1);
  const todoPerPage = 50;

  // --- payload for your sync endpoint ---
  const payload = {
    jobs: [
      {
        projectKey: "b23d4da39755a942b3995b79cd35237d10e3",
        apiId: "40d5eae7922e3942699b3e290c48860e5f3c",
        table: "miscwork",
      },
      {
        projectKey: "c362ab10817a7843f78a4c28e592f9e17bc3",
        apiId: "40d5eae7922e3942699b3e290c48860e5f3c",
        table: "rca",
      },
      {
        projectKey: "64c132e18edaf84af08a5b18d9e80a120445",
        apiId: "40d5eae7922e3942699b3e290c48860e5f3c",
        table: "astarv2",
      },
      {
        projectKey: "7d109b0274d86747077bcac7ac14d18e05bd",
        apiId: "40d5eae7922e3942699b3e290c48860e5f3c",
        table: "bhouse",
      },
      {
        projectKey: "99a0e2d0403f64459e49e024d29a537bef31",
        apiId: "40d5eae7922e3942699b3e290c48860e5f3c",
        table: "bmd_brunoeu",
      },
      {
        projectKey: "1d38d15c2425524d612bd3e2cce511c3f583",
        apiId: "40d5eae7922e3942699b3e290c48860e5f3c",
        table: "brunomdx",
      },
      {
        projectKey: "90159a6958a565467e596db5be0033b91455",
        apiId: "40d5eae7922e3942699b3e290c48860e5f3c",
        table: "foodeus",
      },
      {
        projectKey: "4c44d98c681406484e6a3a66f79dc8bbae84",
        apiId: "40d5eae7922e3942699b3e290c48860e5f3c",
        table: "guardxx",
      },

      {
        projectKey: "de41b00a778a4743fa7b38473181715e71b2",
        apiId: "40d5eae7922e3942699b3e290c48860e5f3c",
        table: "projmgt",
      },

      {
        projectKey: "83fe6e231f6d8145b91a98714756b9ee1b20",
        apiId: "40d5eae7922e3942699b3e290c48860e5f3c",
        table: "reviewsx",
      },
      {
        projectKey: "f3af3c9224dab249e42a30f2624536ce3f88",
        apiId: "40d5eae7922e3942699b3e290c48860e5f3c",
        table: "swif",
      },
      {
        projectKey: "14f8534331974347cb3b66a3049b8c1b12c7",
        apiId: "40d5eae7922e3942699b3e290c48860e5f3c",
        table: "tiwil_app",
      },
    ],
  };

  // --- fetch & normalize ---
  const fetchData = useCallback(async () => {
    setLoader(true);
    try {
      const apiData = await getTaskList();
      const normalized = normalizeData(apiData);
      setData(normalized);
      setFilteredData(normalized);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoader(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- global Sync button ---
  const onSync = useCallback(async () => {
    const { isConfirmed } = await Swal.fire({
      title: "This sync can take 5-6 minutes",
      text: "Do you want to continue?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, start sync",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
    });
    if (!isConfirmed) return;

    Swal.fire({
      title: "Syncing…",
      html: "Please do not close or refresh the page.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await axios.post("https://git.truet.net/get-data-button", payload, {
        headers: { "Content-Type": "application/json" },
      });
      await fetchData();
      Swal.close();
      Swal.fire({
        title: "Done!",
        text: "Sync completed successfully 😊",
        icon: "success",
      });
    } catch (err) {
      Swal.close();
      Swal.fire({ title: "Error", text: err.message, icon: "error" });
    }
  }, [fetchData]);

  // --- main‐table filter logic ---
  useEffect(() => {
    let result = data;
    if (filters.projectName) {
      result = result.filter((t) => t.projectName === filters.projectName);
    }
    if (filters.userName) {
      result = result.filter((t) => t.userName === filters.userName);
    }
    if (filters.taskStatus) {
      result = result.filter((t) => t.taskStatus === filters.taskStatus);
    }
    if (filters.dateRange) {
      const days = Number(filters.dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter((t) => {
        const start = t.actualEffortStart
          ? new Date(t.actualEffortStart)
          : null;
        const end = t.actualEffortEnd ? new Date(t.actualEffortEnd) : null;
        return start && end && start <= new Date() && end >= cutoff;
      });
    } else if (filters.startDate || filters.endDate) {
      const start = filters.startDate ? new Date(filters.startDate) : null;
      const end = filters.endDate
        ? new Date(filters.endDate).setHours(23, 59, 59, 999)
        : null;
      result = result.filter((t) => {
        const s = t.actualEffortStart ? new Date(t.actualEffortStart) : null;
        const e = t.actualEffortEnd ? new Date(t.actualEffortEnd) : null;
        if (!s || !e) return false;
        if (start && end) return s >= start && e <= end;
        if (start) return e >= start;
        if (end) return s <= end;
        return true;
      });
    }
    setFilteredData(result);
    setCurrentPage(1);
  }, [filters, data]);

  // --- main Clear & Download handlers ---
  const handleReload = () => {
    localStorage.removeItem("filters");
    setFilters({
      projectName: "",
      userName: "",
      startDate: "",
      endDate: "",
      dateRange: "",
      taskStatus: "",
    });
    setFilteredData(data);
  };
  const handleFilterChange = (name, val) => {
    setFilters((f) => ({ ...f, [name]: val }));
    localStorage.setItem(
      "filters",
      JSON.stringify({ ...filters, [name]: val })
    );
  };

  function convertTimeToDecimal(timeStr) {
    if (!timeStr) return 0;

    const lowerStr = timeStr.toLowerCase();

    const hourMatch = lowerStr.match(/(\d+)\s*h/);
    const minuteMatch = lowerStr.match(/(\d+)\s*m/);

    const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

    return +(hours + minutes / 60).toFixed(1);
  }

  const handleDownload = () => {
    if (!filteredData.length) return;
    console.log("filtered =D", filteredData);

    const dataForExport = filteredData.map((item) => {
      const MAX_CELL_LENGTH = 32767;
      const roundDownToTenth = (num) => Math.floor(num * 10) / 10;

      const commentsText = item.comments
        ? item.comments
            .map((comment, index) => {
              const roundedHours = roundDownToTenth(comment.hours);
              return `${index + 1}. ${comment.text} (${roundedHours}h)`;
            })
            .join("\n")
            .slice(0, MAX_CELL_LENGTH - 3) + ""
        : "";

      return {
        projectName: item.projectName,
        userName: item.userName,
        taskName: item.taskName,
        taskStatus: item.taskStatus,
        sprintName: item.sprintName,
        estimate: item.estimate,
        taskStartDate: item.taskStartDate
          ? item.taskStartDate.split("T")[0]
          : "",
        taskDueDate: item.taskDueDate ? item.taskDueDate.split("T")[0] : "",
        actualEffortStart: item.actualEffortStart
          ? item.actualEffortStart.split("T")[0]
          : "",
        actualEffortEnd: item.actualEffortEnd
          ? item.actualEffortEnd.split("T")[0]
          : "",
        actualSpent: convertTimeToDecimal(item.actualSpent),
        timelog_status: item.timelog_status ? item.timelog_status : "Pending",
        Comments: commentsText, // <-- Include combined comments text here
        "": "",
      };
    });

    // Convert data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataForExport);

    // Set row/column sizing
    worksheet["!rows"] = Array(dataForExport.length).fill({ hpt: 25 });
    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 35 },
      { wch: 25 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 60 },
      { wch: 10 },
    ];

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

    // Write workbook to binary array
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    // Trigger the download
    saveAs(blob, "TimeSheetData.xlsx");
  };

  // --- toggle Todo view & persist highlight ---
  const toggleTodo = useCallback(() => {
    setShowTodoTable((v) => {
      const next = !v;
      localStorage.setItem("showTodoTable", JSON.stringify(next));
      if (next) {
        setTodoFilters({ userName: "", projectName: "", taskStatus: "" });
        setFilters({
          projectName: "",
          userName: "",
          startDate: "",
          endDate: "",
          dateRange: "",
          taskStatus: "",
        });
        setFilteredData(data);
        setCurrentPage(1);
        localStorage.removeItem("filters");
      }

      return next;
    });
  }, [data, setFilters, setFilteredData, setCurrentPage]);

  // --- Extract and page only “Todo” tasks, after Todo‐filters ---
  // new: only keep tasks whose status is one of these four
  const desiredStatuses = ["Todo", "In Progress", "Dev QC"];

  const allTodos = filteredData.filter((t) => {
    // Check if the task's status is in the desired statuses
    const statusMatch = desiredStatuses.includes(t.taskStatus);

    // Check for username filter
    const userNameMatch =
      !todoFilters.userName || t.userName === todoFilters.userName;

    // Check for project filter
    const projectNameMatch =
      !todoFilters.projectName || t.projectName === todoFilters.projectName;

    // Check for taskStatus filter (if it's set)
    const taskStatusMatch =
      !todoFilters.taskStatus || t.taskStatus === todoFilters.taskStatus;

    // Return true if all conditions match
    return statusMatch && userNameMatch && projectNameMatch && taskStatusMatch;
  });

  // const pagedTodos = allTodos.slice(
  //   (todoPage - 1) * todoPerPage,
  //   todoPage * todoPerPage
  // );
  // const todoTotalPages = Math.ceil(allTodos.length / todoPerPage);

  const userGroups = Object.entries(
    allTodos.reduce((acc, t) => {
      (acc[t.userName] = acc[t.userName] || []).push(t);
      return acc;
    }, {})
  ).map(([userName, tasks]) => ({ userName, tasks }));

  // 2) Build pages of groups without splitting
  const pages = [];
  let curPage = [];
  let curCount = 0;

  for (const group of userGroups) {
    const groupSize = group.tasks.length;
    // if adding this user would overflow, start a new page
    if (curCount + groupSize > todoPerPage && curPage.length > 0) {
      pages.push(curPage);
      curPage = [];
      curCount = 0;
    }
    curPage.push(group);
    curCount += groupSize;
  }
  if (curPage.length) pages.push(curPage);

  // 3) Derive total pages and this page’s tasks
  const todoTotalPages = pages.length;
  const pagedGroups = pages[todoPage - 1] || [];
  const pagedTodos = pagedGroups.flatMap((g) => g.tasks);

  // --- Todo Clear + Download ---
  const handleTodoClear = () => {
    setTodoFilters({ userName: "", projectName: "" });
    setTodoPage(1);
  };

  const handleTodoDownload = () => {
    if (!allTodos.length) return;

    // Group by user to sum up Total Hours (Est) per user
    const groupedData = allTodos.reduce((acc, t) => {
      if (!acc[t.userName]) acc[t.userName] = [];
      acc[t.userName].push(t);
      return acc;
    }, {});

    // Prepare the data for the download
    const sheet = Object.entries(groupedData).flatMap(([user, tasks]) => {
      const totalHours = tasks
        .reduce((sum, t) => sum + (parseFloat(t.estimate) || 0), 0)
        .toFixed(1); // Sum up the estimates for the user
      return tasks.map((t, index) => ({
        User: index === 0 ? user : "", // Only show the user's name in the first row for each group
        TotalHrs: index === 0 ? totalHours : "", // Only show total hours in the first row
        Task: t.taskName,
        Project: t.projectName,
        StartDate: extractDate(t.taskStartDate),
        EndDate: extractDate(t.taskDueDate),
        Estimate: t.estimate,
        TaskStatus: t.taskStatus,
      }));
    });

    // Convert to worksheet
    const ws = XLSX.utils.json_to_sheet(sheet);

    // Set column widths for better readability
    // Increase column width for all columns
    ws["!cols"] = [
      { wch: 20 }, // User
      { wch: 15 }, // Total Hrs
      { wch: 50 }, // Task
      { wch: 30 }, // Project
      { wch: 12 }, // Start Date
      { wch: 12 }, // End Date
      { wch: 10 }, // Estimate
      { wch: 20 }, // Status
    ];

    // Create a workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Todos");

    // Write to binary array and download
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout]), "TodoSheet.xlsx");
  };

  // const handleTodoDownload = () => {
  //   console.log("todo download");
  //   if (!allTodos.length) return;
  //   const sheet = allTodos.map((t) => ({
  //     User: t.userName,
  //     Project: t.projectName,
  //     Task: t.taskName,
  //     Estimate: t.estimate,
  //     Start: extractDate(t.taskStartDate),
  //     End: extractDate(t.taskDueDate),
  //     Status: t.taskStatus,
  //   }));
  //   const ws = XLSX.utils.json_to_sheet(sheet);
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, "Todos");
  //   const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  //   saveAs(new Blob([wbout]), "TodoSheet.xlsx");
  // };

  // --- Main table pagination slice ---
  const idxLast = currentPage * itemsPerPage;
  const idxFirst = idxLast - itemsPerPage;
  const currentItems = filteredData.slice(idxFirst, idxLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleTimelogStatusChange = useCallback(
    async (projectName, id, newStatus) => {
      // 1) Ask for confirmation
      const { isConfirmed } = await Swal.fire({
        title: `Change timelog status?`,
        text: `Set status to "${newStatus}" for task #${id} in "${projectName}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, update it",
        cancelButtonText: "Cancel",
      });
      if (!isConfirmed) return;

      // 2) Call your API
      try {
        await axios.put("https://git.truet.net/update-timelog-status", {
          project_name: projectName,
          id,
          timelog_status: newStatus,
        });
        // 3) Success feedback
        Swal.fire({
          title: "Updated!",
          text: "Timelog status changed successfully.",
          icon: "success",
        });
        // 4) Refresh your table data
        await fetchData();
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: "Could not update status: " + err.message,
          icon: "error",
        });
      }
    },
    [fetchData]
  );

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <p className="text-lg">Syncing… please wait</p>
          </div>
        </div>
      )}

      {/* Filters sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-white shadow-lg transform transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl">Filters</h2>
          <button onClick={() => setSidebarOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        <FilterBar
          layout="vertical"
          filters={filters}
          onFilterChange={handleFilterChange}
          projectNames={[...new Set(data.map((d) => d.projectName))]}
          userNames={[...new Set(data.map((d) => d.userName))]}
          onReload={handleReload}
          onDownload={handleDownload}
          onSync={onSync}
        />
      </aside>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 "
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Page content */}
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Header />

          {/* Top action bar */}

          {/* Top action bar */}
          <div className="flex items-center space-x-3 mb-4 table-todo-header">
            {showTodoTable ? (
              <>
                {/* Todo filters */}
                <select
                  value={todoFilters.userName}
                  onChange={(e) =>
                    setTodoFilters((f) => ({ ...f, userName: e.target.value }))
                  }
                  className="px-3 py-2 border rounded"
                >
                  <option value="">All Users</option>
                  {[...new Set(filteredData.map((d) => d.userName))].map(
                    (u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    )
                  )}
                </select>
                <select
                  value={todoFilters.projectName}
                  onChange={(e) =>
                    setTodoFilters((f) => ({
                      ...f,
                      projectName: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border rounded"
                >
                  <option value="">All Projects</option>
                  {[...new Set(filteredData.map((d) => d.projectName))].map(
                    (p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    )
                  )}
                </select>
                <select
                  value={todoFilters.taskStatus}
                  onChange={(e) =>
                    setTodoFilters((f) => ({
                      ...f,
                      taskStatus: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border rounded"
                >
                  <option value="">All Statuses</option>
                  {["Todo", "In Progress", "Dev QC"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                {/* Sync */}
                <button
                  onClick={onSync}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded"
                >
                  <FaSyncAlt className="mr-1" /> Sync
                </button>

                {/* Todo‐specific actions */}
                <button
                  onClick={handleTodoClear}
                  className="px-3 py-2 bg-gray-600 text-white rounded"
                >
                  Clear Todo Filters
                </button>
                <button
                  onClick={handleTodoDownload}
                  className="px-3 py-2 bg-green-600 text-white rounded"
                >
                  Download Todo
                </button>

                {/* Toggle back to Timesheet */}
                <button
                  onClick={toggleTodo}
                  className="px-3 py-2 bg-blue-600 text-white rounded"
                >
                  Timesheet
                </button>
              </>
            ) : (
              <>
                {/* Sidebar‐filter icon */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 bg-blue-600 text-white rounded"
                >
                  <Filter />
                </button>

                {/* Sync */}
                <button
                  onClick={onSync}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded"
                >
                  <FaSyncAlt className="mr-1" /> Sync
                </button>

                {/* Timesheet‐specific actions */}
                <button
                  onClick={handleDownload}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded"
                >
                  <Download className="mr-1" /> Download
                </button>
                <button
                  onClick={handleReload}
                  className="flex items-center px-3 py-2 bg-gray-600 text-white rounded"
                >
                  <RotateCcw className="mr-1" /> Clear Filters
                </button>

                {/* Toggle to Todo */}
                <button
                  onClick={toggleTodo}
                  className="px-3 py-2 bg-blue-600 text-white rounded"
                >
                  Todo
                </button>
              </>
            )}
          </div>

          {/* Main vs Todo table */}
          {!showTodoTable ? (
            loader ? (
              <div className="w-full text-center py-10">
                {/* spinner SVG (Tailwind + animate-spin) */}
                <svg
                  className="animate-spin h-8 w-8 mx-auto"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <p className="mt-2 text-gray-600">Loading…</p>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="w-full text-center py-10 text-gray-500">
                No data found
              </div>
            ) : (
              <>
                <Table
                  data={currentItems}
                  onTimelogStatusChange={handleTimelogStatusChange}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  paginate={setCurrentPage}
                  totalItems={filteredData.length}
                  indexOfFirstItem={idxFirst}
                  indexOfLastItem={idxLast}
                />
              </>
            )
          ) : (
            <div className="mt-8 bg-white p-4 rounded shadow">
              {/* <h2 className="text-xl mb-4">Todo Tasks by User</h2> */}

              {/* Todo‐specific filters */}

              {/* Todo table */}
              <table className="min-w-full border-collapse">
                <thead className="todo-thead">
                  <tr className="bg-gray-100">
                    <th className="border px-3 py-2 text-left">User</th>
                    <th className="border px-3 py-2">Total Hrs (Est)</th>
                    <th className="border px-3 py-2">Task</th>
                    <th className="border px-3 py-2">Project</th>
                    <th className="border px-3 py-2">Start Date</th>
                    <th className="border px-3 py-2">End Date</th>
                    <th className="border px-3 py-2">Estimate</th>
                    <th className="border px-3 py-2">Task Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedTodos.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="border px-3 py-2 text-center">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    (() => {
                      // group only the paged tasks
                      const grp = pagedTodos.reduce((acc, t) => {
                        (acc[t.userName] = acc[t.userName] || []).push(t);
                        return acc;
                      }, {});
                      return Object.entries(grp).flatMap(([user, tasks]) => {
                        // sum estimates across this page for this user
                        const total = tasks
                          .reduce(
                            (s, t) => s + (parseFloat(t.estimate) || 0),
                            0
                          )
                          .toFixed(1);
                        return tasks.map((t, i) => (
                          <tr key={`${user}-${t.id}`}>
                            {i === 0 && (
                              <td
                                rowSpan={tasks.length}
                                className="border px-3 py-2 font-semibold align-top"
                              >
                                {user}
                              </td>
                            )}
                            {i === 0 && (
                              <td
                                rowSpan={tasks.length}
                                className="border px-3 py-2 align-top"
                              >
                                {total}
                              </td>
                            )}
                            <td className="border px-3 py-2 relative">
                              <div className="tooltip-container">
                                {t.taskName.length > 15
                                  ? t.taskName.slice(0, 15) + "…"
                                  : t.taskName}
                                {t.taskName.length > 15 && (
                                  <span className="tooltip-text">
                                    {t.taskName}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="border px-3 py-2">
                              {t.projectName}
                            </td>
                            <td className="border px-3 py-2">
                              {extractDate(t.taskStartDate) || "--"}
                            </td>
                            <td className="border px-3 py-2">
                              {extractDate(t.taskDueDate) || "--"}
                            </td>
                            <td className="border px-3 py-2">{t.estimate}</td>
                            <td className="border px-3 py-2">{t.taskStatus}</td>
                          </tr>
                        ));
                      });
                    })()
                  )}
                </tbody>
              </table>

              {/* Todo pagination */}
              <div className="pagi-main">
                <Pagination
                  currentPage={todoPage}
                  totalPages={todoTotalPages}
                  paginate={setTodoPage}
                  totalItems={allTodos.length}
                  indexOfFirstItem={(todoPage - 1) * todoPerPage + 1}
                  indexOfLastItem={Math.min(
                    todoPage * todoPerPage,
                    allTodos.length
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
