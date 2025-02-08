import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const EmergencyContactCard = ({ contact, onEdit, onRemove }) => {
  const { phoneNumber, contactName, address, postalCode } = contact;
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState({
    phoneNumber,
    contactName,
    address,
    postalCode,
  });

  const handleEditToggle = () => {
    if (isEditing) {
      // Save the updated contact when exiting edit mode
      onEdit(editedContact);
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (field, value) => {
    setEditedContact({ ...editedContact, [field]: value });
  };

    // Synchronize editedContact with contact props when the props change
    useEffect(() => {
        setEditedContact({
          phoneNumber,
          contactName,
          address,
          postalCode,
        });
      }, [phoneNumber, contactName, address, postalCode]);

  return (
    <div className="card shadow-sm mb-3" >
      <div className="card-body">
        {isEditing ? (
          <input
            type="text"
            className="form-control d-inline-block w-50"
            value={editedContact.contactName}
            onChange={(e) => handleChange("contactName", e.target.value)}
            style={{
              //Styling to mimic boostrap
              fontSize: "1.25rem", //Matches the h5 size
              color: "#0d6efd", //Bootstrap primary blue
            }}
          />
        ) : (
          <h5 className="card-title text-primary">{contactName || "Name"}</h5>
        )}
        <div className="mb-2">
          <strong>Phone Number: </strong>
          <span>{phoneNumber}</span>
        </div>
        <div className="mb-2">
          <strong>Address: </strong>
          {isEditing ? (
            <input
              type="text"
              className="form-control d-inline-block w-75"
              value={editedContact.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          ) : (
            <span>{address || "N/A"}</span>
          )}
        </div>
        <div className="mb-2">
          <strong>Postal Code: </strong>
          {isEditing ? (
            <input
              type="text"
              className="form-control d-inline-block w-25"
              value={editedContact.postalCode}
              onChange={(e) => handleChange("postalCode", e.target.value)}
            />
          ) : (
            <span>{postalCode || "N/A"}</span>
          )}
        </div>
        <div className="d-flex justify-content-end">
          <button
            className={`btn ${isEditing ? "btn-success" : "btn-primary"} me-2`}
            onClick={handleEditToggle}
          >
            {isEditing ? "Save" : "Edit"}
          </button>
          <button className="btn btn-danger" onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContactCard;
