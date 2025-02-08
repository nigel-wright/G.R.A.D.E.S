import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const StudentCard = ({ email, fullName, yearInProgram, graduationYear, program, onEdit, onDelete, onManageEmergencyContacts }) => {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title text-primary">{fullName}</h5>
        <p className="card-text">
          <strong>Email:</strong> {email}
        </p>
        <p className="card-text">
          <strong>Year:</strong> {yearInProgram}
        </p>
        <p className="card-text">
          <strong>Graduating Year:</strong> {graduationYear}
        </p>
        <p className="card-text">
          <strong>Program:</strong> {program}
        </p>
        <div className="d-flex justify-content-end mt-3">
        <button
            className="btn btn-outline-primary btn-sm me-2"
            type="button"
            onClick={onManageEmergencyContacts}
          >
            Manage Emergency Contacts
          </button>
          <button
            className="btn btn-primary btn-sm me-2"
            type="button"
            onClick={onEdit}
          >
            Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            type="button"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
