/**
 * Query Builder Utility
 * Handles filtering, pagination, sorting, and searching for all CRUD operations
 */

const buildQuery = (req, defaultFilter = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search = '',
    searchFields = [],
    ...filters
  } = req.query;

  // Build base query with default filters
  let query = { ...defaultFilter };

  // Apply additional filters
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== '') {
      // Handle special filter types
      if (key.includes('min')) {
        const field = key.replace('min', '').toLowerCase();
        query[field] = { ...query[field], $gte: Number(filters[key]) };
      } else if (key.includes('max')) {
        const field = key.replace('max', '').toLowerCase();
        query[field] = { ...query[field], $lte: Number(filters[key]) };
      } else if (key.includes('Date')) {
        // Date range filtering
        if (filters[key]) {
          query[key] = new Date(filters[key]);
        }
      } else if (filters[key] === 'true' || filters[key] === 'false') {
        query[key] = filters[key] === 'true';
      } else {
        query[key] = filters[key];
      }
    }
  });

  // Apply search across specified fields
  if (search && searchFields.length > 0) {
    const searchRegex = { $regex: search, $options: 'i' };
    query.$or = searchFields.map(field => ({
      [field]: searchRegex
    }));
  }

  return query;
};

const buildSort = (sortBy = 'createdAt', sortOrder = 'desc') => {
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  return sort;
};

const buildPagination = async (model, query, page = 1, limit = 10) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [data, total] = await Promise.all([
    model.find(query).skip(skip).limit(limitNum),
    model.countDocuments(query)
  ]);

  return {
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      hasNext: pageNum * limitNum < total,
      hasPrev: pageNum > 1
    }
  };
};

const buildResponse = (data, pagination = null, filters = null, sort = null) => {
  const response = {
    success: true,
    data
  };

  if (pagination) {
    response.pagination = pagination;
  }

  if (filters) {
    response.filters = filters;
  }

  if (sort) {
    response.sort = sort;
  }

  return response;
};

module.exports = {
  buildQuery,
  buildSort,
  buildPagination,
  buildResponse
};

