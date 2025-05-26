import { Download, RotateCcw } from "lucide-react";
import { FaSyncAlt } from "react-icons/fa";

export default function FilterBar({
  layout = "horizontal", 
  filters,
  onFilterChange,
  projectNames,
  userNames,
  onReload,
  onDownload,
  onSync,
}) {
  const isVertical = layout === "vertical";

  const fieldsContainer = isVertical
    ? "flex flex-col p-4 space-y-4"
    : "md:flex-row md:items-center md:justify-between gap-4";

  const buttonsContainer = isVertical
    ? "flex flex-col p-4 space-y-2 border-t"
    : "flex space-x-2 md:pt-6 justify-end";

  const handleChange = (e) => {
    onFilterChange(e.target.name, e.target.value);
  };

  return (
    <div>
      <div className={`${fieldsContainer} bg-white`}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Name
          </label>
          <select
            name="projectName"
            value={filters.projectName}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">All Projects</option>
            {projectNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User Name
          </label>
          <select
            name="userName"
            value={filters.userName}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">All Users</option>
            {userNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate || ""}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate || ""}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <select
            name="dateRange"
            value={filters.dateRange || ""}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="15">Last 15 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="taskStatus"
            name="taskStatus"
            value={filters.taskStatus || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Statuses</option>
            <option value="HR">HR</option>
            <option value="Recurring Tasks">Recurring Tasks</option>
            <option value="Backlog">Backlog</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Dev QC">Dev QC</option>
            <option value="QA">QA</option>
            <option value="Rework">Rework</option>
            <option value="Reopen Bug">Reopen Bug</option>
            <option value="Bug Resolved">Bug Resolved </option>
            <option value="Done">Done</option>
            <option value="In Review">In Review</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Buttons */}
      {/* <div className={buttonsContainer}>
        <button
          onClick={onDownload}
          className="flex items-center px-3 py-2 border rounded bg-primary-600 text-white"
        >
          <Download className="w-4 h-4 mr-1" /> Download
        </button>
        <button
          onClick={onReload}
          className="flex items-center px-3 py-2 border rounded bg-white text-dark-700"
        >
          <RotateCcw className="w-4 h-4 mr-1" /> Clear Filters
        </button>
        <button
          onClick={onSync}
          className="flex items-center px-3 py-2 border rounded bg-primary-600 text-white"
        >
          <FaSyncAlt className="w-4 h-4 mr-1" /> Sync
        </button>
      </div> */}
    </div>
  );
}
