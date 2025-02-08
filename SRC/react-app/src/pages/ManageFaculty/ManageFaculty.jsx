import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Correct import for React Router v6
import "bootstrap/dist/css/bootstrap.min.css";
import "./ManageFaculty.css";

const ManageFacultyPage = () => {
  const [faculty, setFaculty] = useState([]);
  const [query, setQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); // Alert state
  const [alertType, setAlertType] = useState(""); // Alert type (success or danger)
  const navigate = useNavigate(); // useNavigate for redirecting to home

  const fetchFaculty = async (searchQuery = "") => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/faculty/view", {
        params: { search: searchQuery.trim() },
      });
      setFaculty(response.data);
      setAlertMessage("Faculty members fetched successfully!");
      setAlertType("success");
    } catch (error) {
      console.error("Error fetching faculty:", error.message);
      setFaculty([]);
      setAlertMessage("Failed to fetch faculty members. Please try again.");
      setAlertType("danger");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFaculty(query);
  };

  const handleDeleteFaculty = async (facultyMember) => {
    try {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete ${facultyMember.name}?`
      );
      if (!confirmDelete) return;

      await axios.delete(
        `http://127.0.0.1:5000/api/faculty/${facultyMember.facultyID}`
      );
      fetchFaculty(query);
      setAlertMessage(`${facultyMember.fullName} deleted successfully.`);
      setAlertType("success");
    } catch (error) {
      console.error("Error deleting faculty member:", error.message);
      setAlertMessage("Failed to delete faculty member. Please try again.");
      setAlertType("danger");
    }
  };

  const handleSaveFaculty = async (facultyMember) => {
    try {
      if (isEditing) {
        await axios.put(
          `http://127.0.0.1:5000/api/faculty/${facultyMember.facultyID}`,
          facultyMember
        );
        setAlertMessage("Faculty member updated successfully!");
      } else {
        await axios.post("http://127.0.0.1:5000/api/faculty", facultyMember);
        setAlertMessage("Faculty member added successfully!");
      }
      setAlertType("success");
      fetchFaculty(query);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving faculty member:", error.message);
      setAlertMessage("Failed to save faculty member. Please try again.");
      setAlertType("danger");
    }
  };

  const openModal = (facultyMember = null) => {
    setSelectedFaculty(facultyMember || {});
    setIsEditing(!!facultyMember);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Back button to navigate to home
  const handleBackButton = () => {
    navigate("/home"); // Correct navigation with useNavigate
  };

  return (
    <div className="d-flex flex-column vh-100 container">
      <h1 className="text-center">Manage Faculty</h1>

      {/* Top Bar */}
      <div className="container py-3 border-bottom">
        <div className="row align-items-center">
          <div className="col-md-8">
            <form onSubmit={handleSearch} className="d-flex">
              <input
                type="text"
                placeholder="Search by name or faculty ID"
                className="form-control me-2"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                Search
              </button>
            </form>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <button className="btn btn-success" onClick={() => openModal()}>
              Add Faculty
            </button>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <button className="btn btn-secondary mt-3" onClick={handleBackButton}>
        Back to Home
      </button>

      {/* Alert */}
      {alertMessage && (
        <div className={`alert alert-${alertType} mt-3`}>
          {alertMessage}
        </div>
      )}

      {/* Faculty List */}
      <div className="container-fluid flex-grow-1 overflow-auto">
        <div className="row g-3">
          {faculty.map((facultyMember) => (
            <div className="col-md-4" key={facultyMember.facultyID}>
              <div className="card p-3">
                <h4>{facultyMember.name}</h4>
                <p>Email: {facultyMember.email}</p>
                <p>Department: {facultyMember.department}</p>
                <div className="d-flex justify-content-between">
                  <button
                    className="btn btn-primary"
                    onClick={() => openModal(facultyMember)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteFaculty(facultyMember)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {faculty.length === 0 && (
          <div className="alert alert-warning text-center mt-4">
            No faculty members found. Try searching again.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditing ? "Edit Faculty" : "Add Faculty"}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveFaculty(selectedFaculty);
                  }}
                >
                  <div className="mb-3">
                    <label className="form-label abc">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedFaculty.name || ""}
                      onChange={(e) =>
                        setSelectedFaculty({
                          ...selectedFaculty,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label abc">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={selectedFaculty.email || ""}
                      onChange={(e) =>
                        setSelectedFaculty({
                          ...selectedFaculty,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label abc">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedFaculty.department || ""}
                      onChange={(e) =>
                        setSelectedFaculty({
                          ...selectedFaculty,
                          department: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFacultyPage;
