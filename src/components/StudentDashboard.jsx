import React, { useState, useEffect } from 'react';
import API from '../api';

function StudentDashboard({ user, onLogout }) {
  const [availableBooks, setAvailableBooks] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [totalFine, setTotalFine] = useState(0);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllData = async () => {
    try {
      const [booksRes, myBooksRes, fineRes] = await Promise.all([
        API.get('/student/available-books'),
        API.get('/student/my-issued-books'),
        API.get('/student/my-fine'),
      ]);

      setAvailableBooks(booksRes.data);
      setMyBooks(myBooksRes.data);
      setTotalFine(fineRes.data.totalFine);
    } catch (err) {
      console.error(err);
    }
  };

 useEffect(() => {
  let isMounted = true;

  const loadData = async () => {
    try {
      const [booksRes, myBooksRes, fineRes] = await Promise.all([
        API.get('/student/available-books'),
        API.get('/student/my-issued-books'),
        API.get('/student/my-fine'),
      ]);

      if (isMounted) {
        setAvailableBooks(booksRes.data);
        setMyBooks(myBooksRes.data);
        setTotalFine(fineRes.data.totalFine);
      }
    } catch (err) {
      console.error(err);
    }
  };

  loadData();

  return () => {
    isMounted = false;
  };
}, []);

  useEffect(() => {
    const delay = setTimeout(async () => {
      try {
        const res = await API.get(`/student/search-books?q=${searchTerm}`);
        setAvailableBooks(res.data);
      } catch (err) {
        console.error(err);
      }
    }, 400); // debounce

    return () => clearTimeout(delay);
  }, [searchTerm]);

  const requestBook = async (bookId) => {
    try {
      await API.post('/student/request-book', { bookId });
      setMessage('Book request submitted successfully');
      fetchAllData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error requesting book');
    }
  };


  const returnBook = async (issueId) => {
    try {
      const res = await API.post(`/student/return-book/${issueId}`);
      setMessage(`Book returned. Fine: ₹${res.data.fine}`);
      fetchAllData();
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error returning book');
    }
  };

  return (
    <div className="container">
      <div className="dashboard">

        <div className="dashboard-header">
          <h2>Student Dashboard - Welcome {user.name}</h2>
          <button onClick={onLogout} className="btn logout-btn">Logout</button>
        </div>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Fine</h3>
            <div className="number">₹{totalFine}</div>
          </div>
          <div className="stat-card">
            <h3>Books Issued</h3>
            <div className="number">{myBooks.length}</div>
          </div>
        </div>

        {/*  My Books (Return Added) */}
        <h3>Books Issued to You</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {myBooks.map(b => (
                <tr key={b._id}>
                  <td>{b.bookId?.title}</td>
                  <td>{b.bookId?.author}</td>
                  <td>{new Date(b.issueDate).toLocaleDateString()}</td>
                  <td>{new Date(b.dueDate).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => returnBook(b._id)}
                      className="action-btn btn-return"
                    >
                      Return
                    </button>
                  </td>
                </tr>
              ))}
              {myBooks.length === 0 && (
                <tr><td colSpan="5">No books issued</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🔹 Search */}
        <h3>Available Books</h3>
        <input
          type="text"
          placeholder="Search by title or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />

        {/*  Available Books */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Copies</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {availableBooks.map(b => (
                <tr key={b._id}>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{b.isbn}</td>
                  <td>{b.availableCopies}</td>
                  <td>
                    <button
                      onClick={() => requestBook(b._id)}
                      className="action-btn btn-issue"
                    >
                      Request
                    </button>
                  </td>
                </tr>
              ))}
              {availableBooks.length === 0 && (
                <tr><td colSpan="5">No books found</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default StudentDashboard;