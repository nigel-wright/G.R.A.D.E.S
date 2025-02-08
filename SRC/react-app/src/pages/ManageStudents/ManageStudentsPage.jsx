import { useState } from "react";
import axios from "axios";
import StudentCard from "../../components/StudentCard/StudentCard.jsx";
import ViewStudentModal from "../../components/ViewStudentModal/ViewStudentModal.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ManageStudentsPage.css";
import ManageEmergencyContactsModal from "../../ManageEmergencyContactsModal/ManageEmergencyContactsModal.jsx";

const ManageStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [isViewStudentModalOpen, setIsViewStudentModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState({});
  const [isEmergencyContactsModalOpen, setIsEmergencyContactsModalOpen] =
    useState(false);
  const [selectedStudentContacts, setSelectedStudentContacts] = useState([]);

  const closeViewStudentModal = () => {
    setIsViewStudentModalOpen(false);
  };

  const openViewStudentModal = (student = null) => {
    setSelectedStudent(student || {});
    setIsEditing(!!student);
    setIsViewStudentModalOpen(true);
  };

  const handleSubmitStudentForm = async (student) => {
    try {
      if (isEditing) {
        // Make an API call to update the student
        const response = await axios.put(
          `http://127.0.0.1:5000/api/students/${student.studentID}`,
          student
        );
        console.log("Student updated:", response.data);
      } else {
        // Make an API call to create a new student
        const response = await axios.post(
          "http://127.0.0.1:5000/api/students",
          student
        );
        console.log("New student created:", response.data);
      }
      // Refresh the student list after the operation
      fetchStudents(query);
      closeViewStudentModal();
    } catch (error) {
      console.error(
        "Error submitting form:",
        error.response?.data || error.message
      );
    }
  };

  const handleSearch = (e) => {
    e.preventDefault(); //prevent refresh
    fetchStudents(query);
  };

  const handleDeleteStudent = async (student) => {
    try {
      // Confirm deletion with the user
      const confirmDelete = window.confirm(
        `Are you sure you want to delete ${student.fullName}?`
      );
      if (!confirmDelete) return;

      console.log("Deleting Student:", student);

      // API call to delete the student
      const response = await axios.delete(
        `http://127.0.0.1:5000/api/students/${student.studentID}`
      );

      console.log("Student deleted successfully:", response.data);

      // Refresh the student list
      await fetchStudents(query);
    } catch (error) {
      console.error(
        "Error deleting student:",
        error.response?.data || error.message
      );
      alert("Failed to delete the student. Please try again.");
    }
  };

  const fetchStudents = async (searchQuery = "") => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/students", {
        params: { student: searchQuery.trim() },
      });
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students: " + error);
      setStudents([]); // Display no results
    }
  };

  const openManageEmergencyContactsModal = (student) => {
    setSelectedStudent(student);
    setSelectedStudentContacts(student.emergencyContacts || []);
    setIsEmergencyContactsModalOpen(true);
  };

  const closeEmergencyContactsModal = () => {
    setIsEmergencyContactsModalOpen(false);
    setSelectedStudentContacts([]);
  };

  const handleConfirmEmergencyContacts = async (updatedContacts) => {
    const currentContacts = selectedStudentContacts;

    //Determine which contact were updated
    const updated = updatedContacts.filter((newContact) =>
      currentContacts.some(
        (currentContact) =>
          currentContact.phoneNumber === newContact.phoneNumber &&
          (currentContact.contactName !== newContact.contactName ||
            currentContact.address !== newContact.address ||
            currentContact.postalCode !== newContact.postalCode)
      )
    );

    //Determine which contacts were created
    const added = updatedContacts.filter(
      (newContact) =>
        !currentContacts.some(
          (currentContact) =>
            currentContact.phoneNumber === newContact.phoneNumber
        )
    );

    //Determine which contacts were removed
    const removed = currentContacts.filter(
      (currentContact) =>
        !updatedContacts.some(
          (newContact) => currentContact.phoneNumber === newContact.phoneNumber
        )
    );

    try {
      //Handle deletions first
      for (const contact of removed) {
        await axios.delete(`http://127.0.0.1:5000/api/emergency-contacts`, {
          params: {
            studentID: selectedStudent.studentID,
            phoneNumber: contact.phoneNumber,
          },
        });
      }

      //Handle updates
      for (const contact of updated) {
        await axios.put(
          `http://127.0.0.1:5000/api/contacts/${contact.phoneNumber}`,
          {
            contactName: contact.contactName,
            address: contact.address,
            postalCode: contact.postalCode,
          }
        );
      }

      //Handle additions
      for (const contact of added) {
        await axios.post(`http://127.0.0.1:5000/api/emergency-contacts`, {
          studentID: selectedStudent.studentID,
          phoneNumber: contact.phoneNumber,
          postalCode: contact.postalCode,
          address: contact.address,
          contactName: contact.contactName,
        });
      }

      //Refresh data
      fetchStudents(query);
      setIsEmergencyContactsModalOpen(false);
      alert("Emergency contacts updated successfully!");
    } catch (error) {
      console.error(
        "Error updating emergency contacts:",
        error.response?.data || error.message
      );
      alert("Failed to update emergency contacts. Please try again.");
    }
  };

  return (
    <div className="d-flex flex-column vh-100">
      <h1 className="text-center" style={{marginTop: "6rem"}}>Manage Students</h1>
      {/* Top Bar */}
      <div className="container py-3 border-bottom">
        <div className="row align-items-center">
          <div className="col-md-8">
            <form
              style={{ all: "unset" /*Remove Global styles */ }}
              onSubmit={handleSearch}
              className="d-flex"
            >
              <input
                type="text"
                placeholder="Search by name or student number"
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
            <button
              className="btn btn-success"
              onClick={() => openViewStudentModal()}
            >
              Add Student
            </button>
          </div>
        </div>
      </div>

      {/* Student Cards */}
      <div className="container-fluid flex-grow-1 overflow-auto">
        <div className="row g-3">
          {students.map((student, index) => (
            <div className="col-md-4" key={index}>
              <StudentCard
                fullName={student.fullName}
                email={student.email}
                yearInProgram={student.yearInProgram}
                graduationYear={student.graduationYear}
                program={student.program}
                onEdit={() => openViewStudentModal(student)}
                onDelete={() => handleDeleteStudent(student)}
                onManageEmergencyContacts={() =>
                  openManageEmergencyContactsModal(student)
                }
              />
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {students.length === 0 && (
          <div className="alert alert-warning text-center mt-4">
            No students found. Try searching again.
          </div>
        )}
      </div>

      <ViewStudentModal
        isOpen={isViewStudentModalOpen}
        onClose={closeViewStudentModal}
        onSave={handleSubmitStudentForm}
        initialData={selectedStudent}
        isEditing={isEditing}
      />

      <ManageEmergencyContactsModal
        isOpen={isEmergencyContactsModalOpen}
        onClose={closeEmergencyContactsModal}
        emergencyContacts={selectedStudentContacts}
        onSave={handleConfirmEmergencyContacts}
      />
    </div>
  );
};

export default ManageStudentsPage;
