import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    isPublished: 'true'
  });
  const [sort, setSort] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(9);

  useEffect(() => {
    fetchCourses();
  }, [currentPage, filters, sort]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      });

      const res = await axios.get(`/api/courses?${params}`);

      if (res.data.success) {
        setCourses(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setCourses(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSortChange = (sortBy) => {
    setSort(prev => ({
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && courses.length === 0) {
    return (
      <main>
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '70vh', paddingTop: '40px', paddingBottom: '60px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '48px' }} className="animate-fadeIn">
          <h1 style={{
            fontSize: '48px',
            fontWeight: '900',
            marginBottom: '16px',
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            📚 Explore Our Courses
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Discover the perfect course to advance your skills and achieve your goals
          </p>
        </div>

        {/* Filters and Search */}
        <div className="card glass-card" style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🔍</span>
            <span>Find Your Perfect Course</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Search</label>
              <input
                type="text"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Category</label>
              <input
                type="text"
                placeholder="Category"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Min Price</label>
              <input
                type="number"
                placeholder="Min price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Max Price</label>
              <input
                type="number"
                placeholder="Max price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => {
                setFilters({ search: '', category: '', minPrice: '', maxPrice: '', isPublished: 'true' });
                setCurrentPage(1);
              }}
              className="btn btn-secondary btn-sm"
            >
              Clear Filters
            </button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label>Sort by:</label>
              <select
                value={sort.sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '2px solid var(--border-color)' }}
              >
                <option value="createdAt">Date</option>
                <option value="title">Title</option>
                <option value="price">Price</option>
                <option value="category">Category</option>
              </select>
              <button
                onClick={() => handleSortChange(sort.sortBy)}
                className="btn btn-outline btn-sm"
              >
                {sort.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {pagination && (
          <div style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
            Showing {((currentPage - 1) * limit) + 1} - {Math.min(currentPage * limit, pagination.total)} of {pagination.total} courses
          </div>
        )}

        {courses.length === 0 ? (
          <div className="card">
            <p>No courses found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid">
              {courses.map((course) => (
                <div key={course._id} className="card" style={{
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      width: '100%',
                      height: '160px',
                      background: 'var(--gradient-primary)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '64px',
                      marginBottom: '16px'
                    }}>
                      📖
                    </div>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>{course.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>{course.description}</p>
                  <div style={{ marginBottom: '12px' }}>
                    <span className="badge green-badge">{course.category}</span>
                    {course.isPublished && <span className="badge badge-success" style={{ marginLeft: '8px', backgroundColor: '#10b981', color: 'white' }}>Published</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '20px' }}>👨‍🏫</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{course.instructor?.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '18px' }}>💰</span>
                      <strong>{course.price === 0 ? 'Free' : `$${course.price}`}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '18px' }}>👥</span>
                      <span>{course.enrolledStudents?.length || 0} students</span>
                    </div>
                  </div>
                  <Link to={`/courses/${course._id}`} className="btn btn-primary" style={{ marginTop: '12px', display: 'block', textAlign: 'center' }}>
                    View Course
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="btn btn-outline"
                  style={{ opacity: pagination.hasPrev ? 1 : 0.5, cursor: pagination.hasPrev ? 'pointer' : 'not-allowed' }}
                >
                  Previous
                </button>

                {[...Array(pagination.pages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === pagination.pages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={currentPage === page ? 'btn btn-primary' : 'btn btn-outline'}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page}>...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="btn btn-outline"
                  style={{ opacity: pagination.hasNext ? 1 : 0.5, cursor: pagination.hasNext ? 'pointer' : 'not-allowed' }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default Courses;
