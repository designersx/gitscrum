import "../App.css";
export default function Table({ data, onTimelogStatusChange }) {
  return (
    <div
      className="   
     max-h-[56vh]
     overflow-y-auto    
     overflow-x-auto   
     bg-white shadow-md rounded-lg mb-6
   "
    >
      <table className="table-auto w-max divide-y divide-gray-200">
        <thead className="sticky top-0 z-10 bg-gray-50 border-b-2 border-gray-200">
          <tr className="sticky top-0 bg-gray-50 z-10">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Project Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Task Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Task Status
            </th>

            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estimate
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Task Start Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Task Due Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actual Effort Start
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actual Effort End
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actual Spent (hours)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sprint Name
            </th>

            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timelog Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Comments
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={`${item.id}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.projectName || "--"}
                </td>
                <td  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.userName || "--"}
                </td>
                <td style={{marginTop:"4px"}} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 tooltip">
                  {item.taskName && item.taskName.length > 20
                    ? item.taskName.substring(0, 20) + "..."
                    : item.taskName || "--"}
                  <span className="tooltiptext">{item.taskName}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.taskStatus === "Completed"
                        ? "bg-green-100 text-green-800"
                        : item.taskStatus === "In Progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.taskStatus || "--"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.estimate || "--"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.taskStartDate ? item.taskStartDate.split("T")[0] : "--"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.taskDueDate ? item.taskDueDate.split("T")[0] : "--"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.actualEffortStart || "--"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.actualEffortEnd || "--"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.actualSpent || "--"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 tooltip">
                  {item.sprintName && item.sprintName.length > 20
                    ? item.sprintName.substring(0, 20) + "..."
                    : item.sprintName || "--"}
                  <span className="tooltiptext">{item.sprintName}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <select
                    value={(item?.timelog_status || "pending").toLowerCase()}
                    className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onChange={(e) =>
                      onTimelogStatusChange(
                        item.projectName,
                        item.comment_id,
                        e.target.value
                      )
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                  {item.comments?.length > 0 ? (
                    <div className="relative group inline-block max-w-xs">
                      {/* snippet: first comment + “+N more” */}
                      <p className="truncate">
                        {` ${
                          item.comments[0].text.length > 20
                            ? item.comments[0].text.slice(0, 20) + "…"
                            : item.comments[0].text
                        } 
                            `}
                        {item.comments.length > 1 && (
                          <span className="text-gray-500">{` +${
                            item.comments.length - 1
                          } more`}</span>
                        )}
                      </p>

                      {/* full list on hover, numbered + truncated */}
                      <div className="absolute z-10 hidden w-44 p-2 mt-1 bg-gray-800 text-white text-xs rounded whitespace-normal group-hover:block">
                        {item.comments.map((c, i) => {
                          const h = Math.floor(c.hours * 10) / 10;
                          return (
                            <p key={i} className="mb-1">
                              {`${c.text} `}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    "--"
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={11}
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
