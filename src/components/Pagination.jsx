// import React from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";

// export default function Pagination({
//   currentPage,
//   totalPages,
//   paginate,
//   totalItems,
//   indexOfFirstItem,
//   indexOfLastItem,
// }) {
//   // Generate page numbers to display, max 5 pages visible
//   const getPageNumbers = () => {
//     if (totalPages <= 5)
//       return Array.from({ length: totalPages }, (_, i) => i + 1);

//     if (currentPage <= 3) return [1, 2, 3, 4, 5];

//     if (currentPage >= totalPages - 2)
//       return [
//         totalPages - 4,
//         totalPages - 3,
//         totalPages - 2,
//         totalPages - 1,
//         totalPages,
//       ];

//     return [
//       currentPage - 2,
//       currentPage - 1,
//       currentPage,
//       currentPage + 1,
//       currentPage + 2,
//     ];
//   };

//   return (
//     <>
//       {totalItems > 0 && (
//         <nav
//           className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow"
//           aria-label="Pagination"
//         >
//           <div className="hidden sm:block">
//             <p className="text-sm text-gray-700">
//               Showing page <span className="font-medium">{currentPage}</span> of{" "}
//               <span className="font-medium">{totalPages}</span>
//             </p>
//           </div>
//           <div className="flex flex-1 justify-between sm:justify-end">
//             <button
//               onClick={() => paginate(currentPage - 1)}
//               disabled={currentPage === 1}
//               className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
//                 currentPage === 1
//                   ? "cursor-not-allowed text-gray-400"
//                   : "text-gray-700 hover:bg-gray-100 transition-colors duration-200"
//               }`}
//             >
//               <ChevronLeft className="h-4 w-4 mr-1" />
//               Previous
//             </button>

//             <div className="hidden md:flex mx-2">
//               {getPageNumbers().map((page) => (
//                 <button
//                   key={page}
//                   onClick={() => paginate(page)}
//                   className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md mx-1 transition-colors duration-200 ${
//                     currentPage === page
//                       ? "bg-purple-600 text-white"
//                       : "text-gray-700 hover:bg-gray-100"
//                   }`}
//                 >
//                   {page}
//                 </button>
//               ))}
//             </div>

//             <button
//               onClick={() => paginate(currentPage + 1)}
//               disabled={currentPage === totalPages}
//               className={`relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
//                 currentPage === totalPages
//                   ? "cursor-not-allowed text-gray-400"
//                   : "text-gray-700 hover:bg-gray-100 transition-colors duration-200"
//               }`}
//             >
//               Next
//               <ChevronRight className="h-4 w-4 ml-1" />
//             </button>
//           </div>
//         </nav>
//       )}
//     </>
//   );
// }

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  currentPage,
  totalPages,
  paginate,
  totalItems,
}) {
  const siblings = 1;

  const getPageItems = () => {
    const pages = [];

    pages.push(1);

    if (currentPage - siblings > 2) {
      pages.push("left-ellipsis");
    }

    const start = Math.max(2, currentPage - siblings);
    const end = Math.min(totalPages - 1, currentPage + siblings);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage + siblings < totalPages - 1) {
      pages.push("right-ellipsis");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageItems = getPageItems();

  return (
    totalItems > 0 && (
      <nav
        className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 rounded-lg shadow"
        aria-label="Pagination"
      >
        {/* Info */}
        <div className="hidden sm:block">
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-1 justify-between sm:justify-end items-center space-x-1">
          {/* Prev */}
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>

          {/* Page Numbers */}
          <div className="hidden md:flex items-center space-x-1">
            {pageItems.map((item, idx) => {
              if (item === "left-ellipsis" || item === "right-ellipsis") {
                return (
                  <span key={idx} className="px-2 text-gray-500 select-none">
                    …
                  </span>
                );
              }
              return (
                <button
                  key={idx}
                  onClick={() => paginate(item)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    item === currentPage
                      ? "bg-purple-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* Next */}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </nav>
    )
  );
}
