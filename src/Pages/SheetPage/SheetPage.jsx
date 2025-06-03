import { useState, useEffect, useCallback } from "react";
import Header from "../../components/Header";
import FilterBar from "../../components/FilterBar";
import Pagination from "../../components/Pagination";
import Table from "../../components/Table";
import {
  getDataButton,
  getTaskList,
  getTodoList,
  syncTodoList,
  updateTimelogStatus,
} from "../../lib/store";
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
import CheckboxDropdown from "../../components/CheckboxDropdown";

function normalizeData(data) {
  return data
    .filter(
      (item) => item.project_name !== null && item.project_name !== undefined
    ) // Skip if project_name is null or undefined
    .map((item) => ({
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
      comment_id: item.comment_id,
      comments: item.comments || [],
    }));
}

function extractDate(dateString) {
  return dateString ? dateString.split("T")[0] : "";
}

export default function SheetPage() {
  // --- main data + filters + paging ---
  const [data, setData] = useState([]);
  const [todoData, setTodoData] = useState([]);

  const [filteredData, setFilteredData] = useState([]);
  console.log("filtredData", filteredData);
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem("filters");
    return saved
      ? JSON.parse(saved)
      : {
          projectName: [], // changed from "" to []
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
    userName: [], // Initialize as empty array
    projectName: [], // Initialize as empty array
    taskStatus: [], // Initialize as empty array
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
      {
        projectKey: "9afea87a88c06848998b0938c0bd9df17e3d",
        apiId: "40d5eae7922e3942699b3e290c48860e5f3c",
        table: "REXPTINX",
      },
    ],
  };

  // --- fetch & normalize ---
  const fetchData = useCallback(async () => {
    setLoader(true);
    try {
      const apiData = await getTaskList();
      // console.log("dasdadadadsa", apiData);
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
      title: "This sync can take 8-10 minutes",
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

    console.log("payload", payload);

    try {
      await getDataButton(payload);
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
    if (filters.projectName && filters.projectName.length > 0) {
      result = result.filter((t) =>
        filters.projectName.includes(t.projectName)
      );
    }
    if (filters.userName && filters.userName.length > 0) {
      result = result.filter((t) => filters.userName.includes(t.userName));
    }
    if (filters.taskStatus && filters.taskStatus.length > 0) {
      result = result.filter((t) => filters.taskStatus.includes(t.taskStatus));
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
    // console.log("filtered =D", filteredData);

    const dataForExport = filteredData.map((item) => {
      const MAX_CELL_LENGTH = 32767;
      const roundDownToTenth = (num) => Math.floor(num * 10) / 10;

      // const commentsText = item.comments
      //   ? item.comments
      //       .map((comment, index) => {
      //         const roundedHours = roundDownToTenth(comment.hours);
      //         return `${index + 1}. ${comment.text} (${roundedHours}h)`;
      //       })
      //       .join("\n")
      //       .slice(0, MAX_CELL_LENGTH - 3) + ""
      //   : "";

      const comment = item.comments && item.comments[0];
      console.log("dasd", item);

      return {
        projectName: item.projectName,
        userName: item.userName,
        taskName: item.taskName,
        taskStatus: item.taskStatus,
        sprintName: item.sprintName,
        estimate: item.estimate,
        taskStartDate: item.taskStartDate
          ? item.taskStartDate.split("T")[0]
          : "--",
        taskDueDate: item.taskDueDate ? item.taskDueDate.split("T")[0] : "",
        actualEffortStart: item.actualEffortStart
          ? item.actualEffortStart
          : "--",
        actualEffortEnd: item.actualEffortEnd ? item.actualEffortEnd : "",
        actualSpent: item.actualSpent ? item.actualSpent : "--",
        timelog_status: item.timelog_status ? item.timelog_status : "Pending",
        Comments: item.comments[0]?.text || "--", // <-- Include combined comments text here
        "": "",
      };
    });

    // console.log("dataa",dataForExport)

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
  const fetchTodoData = useCallback(async () => {
    try {
      setLoader(true);
      const response = await getTodoList(); // replace with your actual endpoint
      const normalized = normalizeData(response.data);
      setTodoData(normalized);
    } catch (error) {
      console.error("Failed to fetch Todo data:", error);
      setTodoData([]);
    } finally {
      setLoader(false);
    }
  }, []);

  const onSyncTodo = useCallback(async () => {
    const { isConfirmed } = await Swal.fire({
      title: "This Todo sync can take 5-7 minutes",
      text: "Do you want to continue?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, start Todo sync",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
    });
    if (!isConfirmed) return;

    Swal.fire({
      title: "Syncing Todos…",
      html: "Please do not close or refresh the page.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // Call your different API here for Todo sync
      await syncTodoList(payload); // <-- Your new API call function
      await fetchTodoData();
      Swal.close();
      Swal.fire({
        title: "Done!",
        text: "Todo sync completed successfully 😊",
        icon: "success",
      });
    } catch (err) {
      Swal.close();
      Swal.fire({ title: "Error", text: err.message, icon: "error" });
    }
  }, [fetchTodoData]);

  // --- toggle Todo view & persist highlight ---
  const toggleTodo = useCallback(async () => {
    setShowTodoTable((v) => {
      const next = !v;
      if (next) {
        // Fetch Todo data from your API here
        fetchTodoData();
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
  }, [data]);

  // --- Extract and page only “Todo” tasks, after Todo‐filters ---
  // new: only keep tasks whose status is one of these four
  const desiredStatuses = ["Todo", "In Progress", "Dev QC"];

  const allTodos = todoData.filter((t) => {
    // Check if the task's status is in the desired statuses
    const statusMatch = desiredStatuses.includes(t.taskStatus);

    // Check if the task's userName is in the selected userNames (multi-selection)
    const userNameMatch =
      todoFilters.userName.length === 0 ||
      todoFilters.userName.includes(t.userName);

    // Check if the task's projectName is in the selected projectNames (multi-selection)
    const projectNameMatch =
      todoFilters.projectName.length === 0 ||
      todoFilters.projectName.includes(t.projectName);

    // Check if the task's taskStatus is in the selected taskStatus (multi-selection)
    const taskStatusMatch =
      todoFilters?.taskStatus?.length === 0 ||
      todoFilters?.taskStatus?.includes(t.taskStatus);

    // Return true if all conditions match
    return statusMatch && userNameMatch && projectNameMatch && taskStatusMatch;
  });

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
    setTodoFilters({
      userName: [], // Reset to empty array
      projectName: [], // Reset to empty array
      taskStatus: [], // Reset to empty array
    });
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

  // --- Main table pagination slice ---
  const idxLast = currentPage * itemsPerPage;
  const idxFirst = idxLast - itemsPerPage;
  const currentItems = filteredData.slice(idxFirst, idxLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleTimelogStatusChange = useCallback(
    async (projectName, id, newStatus) => {
      console.log("sd", projectName, id, newStatus);
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
        await updateTimelogStatus(projectName, id, newStatus);
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

  function parseTimeToHours(timeStr) {
    if (!timeStr) return 0;

    // Match hours and minutes separately
    const hourMatch = timeStr.match(/(\d+)\s*h/);
    const minuteMatch = timeStr.match(/(\d+)\s*m/);

    const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

    // Convert minutes to fraction of hour and sum
    return hours + minutes / 60;
  }

  // total estimate
  const uniqueIds = new Set();
  const totalEstimate = currentItems
    .reduce((sum, item) => {
      if (!uniqueIds.has(item.id)) {
        uniqueIds.add(item.id);
        return sum + (parseFloat(item?.estimate) || 0);
      }
      return sum; // skip duplicates
    }, 0)
    .toFixed(1);

  const totalActualSpent = currentItems
    .reduce((sum, item) => sum + parseTimeToHours(item?.actualSpent), 0)
    .toFixed(1);

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
          projectNames={[
            ...new Set(
              data.filter((d) => d.projectName).map((d) => d.projectName)
            ),
          ]}
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
        <div className="max-w-7xl mx-auto px-4 pt-5">
          <Header />

          {/* Top action bar */}

          {/* Top action bar */}
          <div className="z-10 flex items-center space-x-3 mb-2 table-todo-header">
            {showTodoTable ? (
              <>
                {/* Todo filters */}
                <div style={{ width: "15%" }}>
                  <CheckboxDropdown
                    label="User Name"
                    options={[...new Set(filteredData.map((d) => d.userName))]} // Get unique user names
                    selectedOptions={todoFilters.userName}
                    onChange={(vals) =>
                      setTodoFilters((prev) => ({ ...prev, userName: vals }))
                    }
                  />
                </div>
                <div style={{ width: "18%" }}>
                  <CheckboxDropdown
                    label="Project Name"
                    options={[
                      ...new Set(filteredData.map((d) => d.projectName)),
                    ]} // Get unique project names
                    selectedOptions={todoFilters.projectName}
                    onChange={(vals) =>
                      setTodoFilters((prev) => ({ ...prev, projectName: vals }))
                    }
                  />
                </div>
                <div style={{ width: "15%" }}>
                  <CheckboxDropdown
                    label="Task Status"
                    options={["Todo", "In Progress", "Dev QC"]} // Example of task statuses
                    selectedOptions={todoFilters.taskStatus}
                    onChange={(vals) =>
                      setTodoFilters((prev) => ({ ...prev, taskStatus: vals }))
                    }
                  />
                </div>

                {/* Sync */}
                <button
                  onClick={showTodoTable ? onSyncTodo : onSync}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded"
                >
                  <FaSyncAlt className="mr-1" />{" "}
                  {showTodoTable ? "Sync Todo" : "Sync"}
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
                <div className="flex items-center justify-between space-x-4 w-full">
                  {/* Left side: buttons */}
                  <div className="flex items-center space-x-3">
                    {/* Sidebar-filter icon */}
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

                    {/* Download */}
                    <button
                      onClick={handleDownload}
                      className="flex items-center px-3 py-2 bg-green-600 text-white rounded"
                    >
                      <Download className="mr-1" /> Download
                    </button>

                    {/* Clear Filters */}
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
                  </div>

                  {/* Right side: date filters pill */}
                  {(filters.startDate || filters.endDate) && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm whitespace-nowrap">
                      {filters.startDate ? `From ${filters.startDate}` : ""}
                      {filters.startDate && filters.endDate ? " – " : ""}
                      {filters.endDate ? `To ${filters.endDate}` : ""}
                    </span>
                  )}
                </div>
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
                {/* ===== Selected Filters Bar ===== */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {filters.projectName?.length > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      Project: {filters.projectName.join(", ")}
                    </span>
                  )}
                  {filters.userName && filters.userName.length > 0 && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      User:{" "}
                      {Array.isArray(filters.userName)
                        ? filters.userName.join(", ")
                        : filters.userName}
                    </span>
                  )}
                  {filters.taskStatus && filters.taskStatus.length > 0 && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      Status:{" "}
                      {Array.isArray(filters.taskStatus)
                        ? filters.taskStatus.join(", ")
                        : filters.taskStatus}
                    </span>
                  )}
                  {filters.dateRange && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      Last {filters.dateRange} days
                    </span>
                  )}
                </div>
                <Table
                  data={currentItems}
                  onTimelogStatusChange={handleTimelogStatusChange}
                />
                <div className=" flex justify-end space-x-8 text-sm font-semibold text-gray-700">
                  <div>Total Estimate: {totalEstimate} hrs</div>
                  <div>Total Actual Spent: {totalActualSpent} hrs</div>
                </div>
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
          ) : loader ? (
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
          ) : (
            <>
              <div
                style={{ maxHeight: "56vh" }}
                className="mt-8 bg-white p-0 rounded shadow"
              >
                {/* Todo‐specific filters */}

                {/* Todo table */}
                <table className="table-auto w-max divide-y divide-gray-200">
                  <thead
                    style={{ zIndex: "1" }}
                    className="sticky top-0 z-5 bg-gray-50 border-b-2 border-gray-200"
                  >
                    <tr className="sticky top-0 bg-gray-50 z-10">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Hrs (Est)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estimate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pagedTodos.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No data found
                        </td>
                      </tr>
                    ) : (
                      (() => {
                        const grp = pagedTodos.reduce((acc, t) => {
                          (acc[t.userName] = acc[t.userName] || []).push(t);
                          return acc;
                        }, {});
                        return Object.entries(grp).flatMap(([user, tasks]) => {
                          const total = tasks
                            .reduce(
                              (s, t) => s + (parseFloat(t.estimate) || 0),
                              0
                            )
                            .toFixed(1);
                          return tasks.map((t, i) => (
                            <tr
                              key={`${user}-${t.id}`}
                              className="hover:bg-gray-50"
                            >
                              {i === 0 && (
                                <td
                                  rowSpan={tasks.length}
                                  className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 align-top border-r border-gray-300"
                                >
                                  {user}
                                </td>
                              )}
                              {i === 0 && (
                                <td
                                  rowSpan={tasks.length}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 align-top border-r border-gray-300"
                                >
                                  {total}
                                </td>
                              )}
                              <td
                                style={{ minWidth: "250px", maxWidth: "350px" }}
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 tooltip"
                              >
                                {t.taskName.length > 20
                                  ? t.taskName.slice(0, 20) + "…"
                                  : t.taskName}
                                <span className="tooltiptext">
                                  {t.taskName}
                                </span>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {t.projectName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {extractDate(t.taskStartDate) || "--"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {extractDate(t.taskDueDate) || "--"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {t.estimate}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    t.taskStatus === "Completed"
                                      ? "bg-green-100 text-green-800"
                                      : t.taskStatus === "In Progress"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {t.taskStatus || "--"}
                                </span>
                              </td>
                            </tr>
                          ));
                        });
                      })()
                    )}
                  </tbody>
                </table>

                {/* Todo pagination */}
              </div>
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
            </>
          )}
        </div>
      </div>
    </>
  );
}
