/**
 * Applies filters to data
 * @param {Array} data - The data to filter
 * @param {Object} filters - The filter criteria
 * @returns {Array} - Filtered data
 */
export const applyFilters = (data, filters) => {
  return data.filter(item => {
    // Filter by project name
    if (filters.projectName && 
        !item.projectName.toLowerCase().includes(filters.projectName.toLowerCase())) {
      return false
    }
    
    // Filter by user name
    if (filters.userName && 
        !item.userName.toLowerCase().includes(filters.userName.toLowerCase())) {
      return false
    }
    
    // Filter by date (task start date)
    if (filters.date) {
      const filterDate = new Date(filters.date)
      const itemDate = new Date(item.taskStartDate)
      
      // Compare dates without time
      if (filterDate.toDateString() !== itemDate.toDateString()) {
        return false
      }
    }
    
    return true
  })
}

/**
 * Sorts data by a field
 * @param {Array} data - The data to sort
 * @param {string} field - The field to sort by
 * @param {string} direction - The sort direction ('asc' or 'desc')
 * @returns {Array} - Sorted data
 */
export const sortData = (data, field, direction) => {
  return [...data].sort((a, b) => {
    let comparison = 0
    
    if (a[field] > b[field]) {
      comparison = 1
    } else if (a[field] < b[field]) {
      comparison = -1
    }
    
    return direction === 'asc' ? comparison : -comparison
  })
}

/**
 * Paginates data
 * @param {Array} data - The data to paginate
 * @param {number} page - The current page
 * @param {number} itemsPerPage - The number of items per page
 * @returns {Array} - Paginated data
 */
export const paginateData = (data, page, itemsPerPage) => {
  const startIndex = (page - 1) * itemsPerPage
  return data.slice(startIndex, startIndex + itemsPerPage)
}