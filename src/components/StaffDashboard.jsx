import React, { useState, useEffect } from 'react';
import API from '../api';

function StaffDashboard({ user, onLogout }) {
  const [books, setBooks] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', totalCopies: 1 });
  const [issueData, setIssueData] = useState({ enrollmentNo: '', bookId: '' });
  const [message, setMessage] = useState('');

  // 🔹 Reusable fetch functions (for refresh after actions)
  const fetchBooks = async () => {
    try {
      const res = await API.get('/staff/books');
      setBooks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIssuedBooks = async () => {
    try {
      const res = await API.get('/staff/issued-books');
      setIssuedBooks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  

  // 🔥 Correct useEffect
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [booksRes, issuedRes, requestsRes] = await Promise.all([
          API.get('/staff/books'),
          API.get('/staff/issued-books'),
          API.get('/staff/requests'),
        ]);

        if (isMounted) {
          setBooks(booksRes.data);
          setIssuedBooks(issuedRes.data);
          setRequests(requestsRes.data);
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

  // 🔹 Add Book
  const addBook = async (e) => {
    e.preventDefault();
    try {
      await API.post('/staff/add-book', newBook);
      setMessage('Book added successfully');
      fetchBooks();
      setNewBook({ title: '', author: '', isbn: '', totalCopies: 1 });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error adding book');
    }
  };

  // 🔹 Delete Book
  const deleteBook = async (id) => {
    if (window.confirm('Delete this book?')) {
      try {
        await API.delete(`/staff/delete-book/${id}`);
        fetchBooks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 🔥 Separate API logic for issuing book
  const issueBookAPI = async (data) => {
    try {
      await API.post('/staff/issue-book', data);
      setMessage('Book issued successfully');
      fetchBooks();
      fetchIssuedBooks();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error issuing book');
    }
  };

  // 🔹 Form submit handler
  const issueBook = async (e) => {
    e.preventDefault();
    await issueBookAPI(issueData);
    setIssueData({ enrollmentNo: '', bookId: '' });
  };

  // 🔹 Return Book
  const returnBook = async (issueId) => {
    try {
      const res = await API.post(`/staff/return-book/${issueId}`);
      setMessage(`Book returned. Fine: ₹${res.data.fine}`);
      fetchBooks();
      fetchIssuedBooks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Staff Dashboard - Welcome {user.name}</h2>
          <button onClick={onLogout} className="btn logout-btn">Logout</button>
        </div>

        {message && <div className="message success">{message}</div>}

        {/* Add Book */}
        <div className="form-card">
          <h3>Add New Book</h3>
          <form onSubmit={addBook}>
            <div className="form-row">
              <input type="text" placeholder="Title" value={newBook.title} onChange={(e) => setNewBook({ ...newBook, title: e.target.value })} required />
              <input type="text" placeholder="Author" value={newBook.author} onChange={(e) => setNewBook({ ...newBook, author: e.target.value })} required />
              <input type="text" placeholder="ISBN" value={newBook.isbn} onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })} required />
              <input type="number" placeholder="Total Copies" value={newBook.totalCopies} onChange={(e) => setNewBook({ ...newBook, totalCopies: Number(e.target.value) || 1 })} required />
              <button type="submit" className="btn">Add Book</button>
            </div>
          </form>
        </div>

        {/* Issue Book */}
        <div className="form-card">
          <h3>Issue Book to Student</h3>
          <form onSubmit={issueBook}>
            <div className="form-row">
              <input type="text" placeholder="Student Enrollment No" value={issueData.enrollmentNo} onChange={(e) => setIssueData({ ...issueData, enrollmentNo: e.target.value })} required />
              <select value={issueData.bookId} onChange={(e) => setIssueData({ ...issueData, bookId: e.target.value })} required>
                <option value="">Select Book</option>
                {books.filter(b => b.availableCopies > 0).map(b => (
                  <option key={b._id} value={b._id}>
                    {b.title} (Available: {b.availableCopies})
                  </option>
                ))}
              </select>
              <button type="submit" className="btn">Issue Book</button>
            </div>
          </form>
        </div>

        {/* Available Books */}
        <h3>Available Books</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Title</th><th>Author</th><th>ISBN</th><th>Total</th><th>Available</th><th>Action</th></tr>
            </thead>
            <tbody>
              {books.map(b => (
                <tr key={b._id}>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{b.isbn}</td>
                  <td>{b.totalCopies}</td>
                  <td>{b.availableCopies}</td>
                  <td>
                    <button onClick={() => deleteBook(b._id)} className="action-btn btn-delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Issued Books */}
        <h3>Currently Issued Books</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Student</th><th>Book</th><th>Issue Date</th><th>Due Date</th><th>Action</th></tr>
            </thead>
            <tbody>
              {issuedBooks.map(i => (
                <tr key={i._id}>
                  <td>{i.studentId?.name} ({i.studentId?.enrollmentNo})</td>
                  <td>{i.bookId?.title}</td>
                  <td>{new Date(i.issueDate).toLocaleDateString()}</td>
                  <td>{new Date(i.dueDate).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => returnBook(i._id)} className="action-btn btn-return">Return</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Requests */}
        <h3>Book Requests from Students</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Student</th><th>Book</th><th>Request Date</th><th>Action</th></tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r._id}>
                  <td>{r.studentId?.name} ({r.studentId?.enrollmentNo})</td>
                  <td>{r.bookId?.title}</td>
                  <td>{new Date(r.requestDate).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() =>
                        issueBookAPI({
                          enrollmentNo: r.studentId?.enrollmentNo,
                          bookId: r.bookId?._id
                        })
                      }
                      className="action-btn btn-issue"
                    >
                      Issue
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

export default StaffDashboard;