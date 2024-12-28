import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import Modal from "react-modal";
import { TbDeviceTabletSearch } from "react-icons/tb"; // Import the new search icon

Modal.setAppElement("#root");

const NATDataList = () => {
  const [natData, setNatData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    respondents: "",
    age: "",
    sex: "",
    ethnic: "",
    academic_performance: "",
    academic_description: "",
    iq: "",
    type_of_school: "",
    socio_economic_status: "",
    study_habit: "",
    nat_results: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const natCollection = collection(db, "natData");
    const natSnapshot = await getDocs(natCollection);
    const dataList = natSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setNatData(dataList);
    setFilteredData(dataList);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = natData.filter((entry) =>
      Object.keys(entry).some((key) =>
        String(entry[key]).toLowerCase().includes(lowercasedFilter)
      )
    );
    setFilteredData(filteredData);
  }, [searchTerm, natData]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentData = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(currentPage - 2, 1);
    let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

    startPage = Math.max(1, endPage - maxPagesToShow + 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`pagination-button ${currentPage === i ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  const handleDelete = async () => {
    const natDocRef = doc(db, "natData", deleteId);
    try {
      await deleteDoc(natDocRef);
      setNatData(natData.filter((data) => data.id !== deleteId));
      alert("Data deleted successfully!");
    } catch (error) {
      console.error("Error deleting document: ", error);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteId(null);
  };

  const handleEdit = (data) => {
    setEditingId(data.id);
    const { id, ...editableData } = data;
    setEditForm(editableData);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const natDocRef = doc(db, "natData", editingId);

    try {
      await updateDoc(natDocRef, {
        ...editForm,
        age: Number(editForm.age),
        nat_results: Number(editForm.nat_results),
      });

      setNatData(
        natData.map((data) =>
          data.id === editingId ? { id: editingId, ...editForm } : data
        )
      );
      setEditingId(null);
      setIsEditModalOpen(false);
      alert("Data updated successfully!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="data-list-section">
      <div className="search-data-container">
        <TbDeviceTabletSearch className="search-data-icon" />
        <input
          type="text"
          placeholder="Search data..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-data-field"
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Respondents</th>
            <th>Age</th>
            <th>Sex</th>
            <th>Ethnic</th>
            <th>Academic Performance</th>
            <th>Academic Description</th>
            <th>IQ</th>
            <th>Type of School</th>
            <th>Socio-Economic Status</th>
            <th>Study Habit</th>
            <th>NAT Results</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((data) => (
            <tr key={data.id}>
              <td>{data.respondents}</td>
              <td>{data.age}</td>
              <td>{data.sex}</td>
              <td>{data.ethnic}</td>
              <td>{data.academic_performance}</td>
              <td>{data.academic_description}</td>
              <td>{data.iq}</td>
              <td>{data.type_of_school}</td>
              <td>{data.socio_economic_status}</td>
              <td>{data.study_habit}</td>
              <td>{data.nat_results}</td>
              <td>
                <button className="data-list-button edit" onClick={() => handleEdit(data)}>
                  Edit
                </button>
                <button className="data-list-button delete" onClick={() => openDeleteModal(data.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1} className="pagination-button">
          Prev
        </button>
        {renderPageNumbers()}
        <button onClick={nextPage} disabled={currentPage === totalPages} className="pagination-button">
          Next
        </button>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={closeEditModal}
        contentLabel="Edit NAT Data"
        className="modal edit-data-modal"
        overlayClassName="modal-overlay"
      >
        <h2>Edit NAT Data</h2>
        <form onSubmit={handleUpdate} className="edit-data-form">
          {Object.keys(editForm).map((key) => (
            <input
              key={key}
              type={key === "age" || key === "nat_results" ? "number" : "text"}
              placeholder={key}
              value={editForm[key]}
              onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
              required
            />
          ))}
          <div className="modal-footer">
            <button type="submit">Update Data</button>
            <button type="button" onClick={closeEditModal}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Delete Confirmation"
        className="modal delete-confirmation-modal"
        overlayClassName="modal-overlay"
      >
        <h2>Are you sure you want to delete this data?</h2>
        <p>This will delete this row permanently. You cannot undo this action.</p>
        <div className="modal-footer">
          <button onClick={closeDeleteModal}>Cancel</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default NATDataList;
