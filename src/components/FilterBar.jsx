import { Download, RotateCcw } from "lucide-react";
import { FaSyncAlt } from "react-icons/fa";
import CheckboxDropdown from "./CheckboxDropdown";
import {useState} from "react"

export default function FilterBar({
  layout = "horizontal",
  filters,
  onFilterChange,
  projectNames,
  userNames,
  onReload,
  onDownload,
  onSync,
  onTaskDatesChange,
  useTaskDates
}) {

  // const [useTaskDates, setUseTaskDates] = useState(false); 
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

 const handleToggleChange = () => {
    onTaskDatesChange(!useTaskDates); // Pass the opposite value of useTaskDates to parent
  };

  return (
    <div>
      <div className={`${fieldsContainer} bg-white`}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Name
          </label>
          <CheckboxDropdown
            label="Project Name"
            options={projectNames}
            selectedOptions={filters.projectName || []}
            onChange={(vals) => onFilterChange("projectName", vals)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User Name
          </label>
          <CheckboxDropdown
            label="User Name"
            options={userNames}
            selectedOptions={filters.userName || []}
            onChange={(vals) => onFilterChange("userName", vals)}
          />
        </div>

        {/* Toggle for Task vs Effort Dates */}
        <div className="flex items-center mb-4">
          <label className="block text-sm font-medium text-gray-700 mr-2">Use Task Dates</label>
          <input
            type="checkbox"
            checked={useTaskDates}  // Checkbox is controlled by the useTaskDates prop
            onChange={handleToggleChange}
            className="cursor-pointer"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {useTaskDates ? "Task Start Date" : "Actual Effort Start"}
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
            {useTaskDates ? "Task Due Date" : "Actual Effort End"}
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
          <CheckboxDropdown
            label="Status"
            options={[
              "HR",
              "Recurring Tasks",
              "Backlog",
              "Todo",
              "In Progress",
              "Dev QC",
              "QA",
              "Rework",
              "Reopen Bug",
              "Bug Resolved",
              "Done",
              "In Review",
              "On Hold",
            ]}
            selectedOptions={filters.taskStatus || []}
            onChange={(vals) => onFilterChange("taskStatus", vals)}
          />
        </div>

        <button onClick={onReload} className="w-1/4 px-2 py-1 bg-red-700 hover:bg-red-800 text-white rounded">
          Reset
        </button>
      </div>
    </div>
  );
}
