import React from "react";

const FilterBarWithCheckboxes = ({ filters, setFilters, data }) => {
  const handleCheckboxChange = (filterType, value) => {
    setFilters((prev) => {
      const newFilter = prev[filterType].includes(value)
        ? prev[filterType].filter((item) => item !== value)
        : [...prev[filterType], value];
      return { ...prev, [filterType]: newFilter };
    });
  };

  const renderCheckboxes = (filterType, options) => {
    return (
      <div className="space-y-2">
        <div className="font-semibold">{filterType}</div>
        {options.map((option) => (
          <div key={option} className="flex items-center">
            <input
              type="checkbox"
              id={`${filterType}-${option}`}
              checked={filters[filterType].includes(option)}
              onChange={() => handleCheckboxChange(filterType, option)}
              className="mr-2"
            />
            <label htmlFor={`${filterType}-${option}`}>{option}</label>
          </div>
        ))}
      </div>
    );
  };

  const userNames = [...new Set(data.map((d) => d.userName))];
  const projectNames = [...new Set(data.map((d) => d.projectName))];
  const taskStatuses = ["Todo", "In Progress", "Dev QC"];

  return (
    <div className="p-4 space-y-4">
      {renderCheckboxes("userName", ["", ...userNames])}
      {renderCheckboxes("projectName", ["", ...projectNames])}
      {renderCheckboxes("taskStatus", ["", ...taskStatuses])}

      <div className="flex space-x-4 mt-4">
        <button
          onClick={() => setFilters({ userName: [], projectName: [], taskStatus: [] })}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default FilterBarWithCheckboxes;
