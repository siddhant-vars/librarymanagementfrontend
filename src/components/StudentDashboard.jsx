import React, { useState, useEffect } from 'react';
import API from '../api';

function StudentDashboard({ user, onLogout }) {
  const [availableBooks, setAvailableBooks] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [totalFine, setTotalFine] = useState(0);
  const [message, setMessage] = useState('');

  // 🔹 Reusable fetch functions
  const fetchAvailableBooks = async () => {
    try {
      const res = await API.get('/student/available-books');
      setAvailableBooks(res.data);
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

  // 🔹 Request Book
  const requestBook = async (bookId) => {
    try {
      await API.post('/student/request-book', { bookId });
      setMessage('Book request submitted successfully');
      fetchAvailableBooks(); // refresh list
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error requesting book');
    }
  };

  return (
    <div className="container">
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Student Dashboard - Welcome {user.name}</h2>
          <button onClick={onLogout} className="btn logout-btn">Logout</button>
        </div>

        {message && <div className="message success">{message}</div>}

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Fine</h3>
            <div className="number">₹{totalFine}</div>
          </div>
          <div className="stat-card">
            <h3>Books Currently Issued</h3>
            <div className="number">{myBooks.length}</div>
          </div>
        </div>

        {/* My Books */}
        <h3>Books Issued to You</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Book Title</th><th>Author</th><th>Issue Date</th><th>Due Date</th></tr>
            </thead>
            <tbody>
              {myBooks.map(b => (
                <tr key={b._id}>
                  <td>{b.bookId?.title}</td>
                  <td>{b.bookId?.author}</td>
                  <td>{new Date(b.issueDate).toLocaleDateString()}</td>
                  <td>{new Date(b.dueDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Available Books */}
        <h3>Available Books</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Title</th><th>Author</th><th>ISBN</th><th>Available Copies</th><th>Action</th></tr>
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
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default StudentDashboard;