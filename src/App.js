import React, { useState, useEffect } from 'react';
import "./App.css"

function App() {
  const itemsPerPage = 10;
  const [members, setMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [editChanges, setEditChanges] = useState({});
  const [filteredMembers, setFilteredMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
        const data = await response.json();
        setMembers(data);
        setFilteredMembers(data);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
        console.log(data);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredMembers.length / itemsPerPage));
  }, [searchTerm, filteredMembers]);

  const handleDelete = (id) => {
    const updatedMembers = members.filter((member) => member.id !== id);
    setMembers(updatedMembers);
    setFilteredMembers(updatedMembers);
    setSelectedRows([]);
    setSelectAllChecked(false);
    console.log(`Deleted member with ID: ${id}`);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      const newFilteredMembers = members.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMembers(newFilteredMembers);
      setCurrentPage(1);
    }
  };
  

  const handleCheckboxChange = (id) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(id)) {
        return prevSelectedRows.filter((rowId) => rowId !== id);
      } else {
        return [...prevSelectedRows, id];
      }
    });
  };

  const handleDeleteSelected = () => {
    const updatedMembers = members.filter((member) => !selectedRows.includes(member.id));
    setMembers(updatedMembers);
    setFilteredMembers(updatedMembers);
    setSelectedRows([]);
    setSelectAllChecked(false);
    console.log('Deleted selected rows:', selectedRows);
  };

  const handleEditChange = (id, field, value) => {
    setEditChanges((prevChanges) => ({ ...prevChanges, [id]: { ...prevChanges[id], [field]: value } }));
  };

  const handleSaveEdit = (id) => {
    console.log(`Saved edits for member with ID: ${id}`, editChanges[id]);

    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === id ? { ...member, ...editChanges[id], editing: false } : member
      )
    );

    setFilteredMembers((prevFilteredMembers) =>
      prevFilteredMembers.map((member) =>
        member.id === id ? { ...member, ...editChanges[id], editing: false } : member
      )
    );

    setEditChanges((prevChanges) => {
      const { [id]: _, ...restChanges } = prevChanges;
      return restChanges;
    });
  };

  const handleCancelEdit = (id) => {
    console.log(`Cancelled edits for member with ID: ${id}`);

    setEditChanges((prevChanges) => {
      const { [id]: _, ...restChanges } = prevChanges;
      return restChanges;
    });

    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === id ? { ...member, editing: false } : member
      )
    );

    setFilteredMembers((prevFilteredMembers) =>
      prevFilteredMembers.map((member) =>
        member.id === id ? { ...member, editing: false } : member
      )
    );
  };

  const handleEdit = (id) => {
    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === id ? { ...member, editing: true } : member
      )
    );
  
    setFilteredMembers((prevFilteredMembers) =>
      prevFilteredMembers.map((member) =>
        member.id === id ? { ...member, editing: true } : member
      )
    );
  };
  

  useEffect(() => {
    setSelectedRows([]);
    setSelectAllChecked(false);
  }, [currentPage]);

  const handleSelectAll = () => {
    const allPageIds = filteredMembers
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      .map((member) => member.id);

    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.length === allPageIds.length ? [] : allPageIds
    );
    setSelectAllChecked((prev) => !prev);
  };

  const renderMembers = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentMembers = filteredMembers.slice(startIndex, endIndex);
  
    return currentMembers.map((member) => (
      <tr key={member.id} className={`${selectedRows.includes(member.id) ? 'row-selected' : 'row-not-selected'}`}>
        <td className="row-item">
          <input
            type="checkbox"
            checked={selectedRows.includes(member.id)}
            onChange={() => handleCheckboxChange(member.id)}
          />
        </td>
        <td className="row-item">
          {member.editing ? (
            <input
              type="text"
              value={editChanges[member.id]?.name || member.name}
              onChange={(e) => handleEditChange(member.id, 'name', e.target.value)}
            />
          ) : (
            member.name
          )}
        </td>
        <td className="row-item">
          {member.editing ? (
            <input
              type="text"
              value={editChanges[member.id]?.email || member.email}
              onChange={(e) => handleEditChange(member.id, 'email', e.target.value)}
            />
          ) : (
            member.email
          )}
        </td>
        <td className="row-item">
          {member.editing ? (
            <input
              type="text"
              value={editChanges[member.id]?.role || member.role}
              onChange={(e) => handleEditChange(member.id, 'role', e.target.value)}
            />
          ) : (
            member.role
          )}
        </td>
        <td className="actions">
          {member.editing ? (
            <React.Fragment>
              <button
                onClick={() => handleSaveEdit(member.id)}
                className="save"
              >
                Save
              </button>
              <button
                onClick={() => handleCancelEdit(member.id)}
                className="cancel"
              >
                Cancel
              </button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <button
                onClick={() => handleEdit(member.id)}
                className="edit"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(member.id)}
                className="delete"
              >
                Delete
              </button>
            </React.Fragment>
          )}
        </td>
      </tr>
    ));
  };
  
  

  const renderPaginationButtons = () => {
    const pageButtons = [];
    for (let i = 1; i <= totalPages; i++) {
      pageButtons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination ${
            i === currentPage ? 'pagination-enabled' : 'pagination-disabled'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="mt-4">
        <button onClick={() => handlePageChange(1)} className="first-page">
          First
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className="previous-page"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {pageButtons}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className="next-page"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
        <button onClick={() => handlePageChange(totalPages)} className="last-page">
          Last
        </button>
      </div>
    );
  };

  return (
    <div className="main-container">
      <h1>Admin Dashboard</h1>
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={handleSearch}
        onKeyPress={handleKeyPress}
        className="search-box"
      />
      <table className="border">
        <thead>
          <tr className="border">
            <th className="row-item checked-all">
              <input type="checkbox" checked={selectAllChecked} onChange={handleSelectAll} />
            </th>
            <th className="row-item">Name</th>
            <th className="row-item">Email</th>
            <th className="row-item">Role</th>
            <th className="row-item">Actions</th>
          </tr>
        </thead>
        <tbody>{renderMembers()}</tbody>
      </table>
      {selectedRows.length > 0 && (
        <button onClick={handleDeleteSelected} className="delete-selected">
          Delete Selected
        </button>
      )}
      {renderPaginationButtons()}
    </div>
  );
}

export default App;