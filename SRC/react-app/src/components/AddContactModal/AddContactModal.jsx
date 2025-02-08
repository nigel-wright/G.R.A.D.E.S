import React, { useState } from "react";

const AddContactModal = ({ isOpen, onClose, onSave, existingContacts }) => {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    contactName: "",
    address: "",
    postalCode: "",
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    if (!formData.phoneNumber.trim()) {
      alert("Phone number is required.");
      return;
    }
  
    // Check for duplicate phone numbers
    const matchingContact = existingContacts.find(
      (contact) => contact.phoneNumber === formData.phoneNumber
    );
  
    if (matchingContact) {
        // Prompt user with options
        const action = window.confirm(
          `A contact with this phone number already exists. Do you want to import the existing contact? (Click "OK" to import or "Cancel" to overwrite.)`
        );
  
        if (action) {
          // Import existing contact
          onSave(matchingContact);
        } else {
          // Overwrite existing contact locally
          onSave(formData);
        }
      } else {
        // Save the new contact if no match is found
        onSave(formData);
      }

    onClose();
  };
  

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop"></div>
      <div className="modal show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New Contact</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label>Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="mb-3">
                <label>Contact Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.contactName}
                  onChange={(e) => handleChange("contactName", e.target.value)}
                  placeholder="Enter contact name"
                />
              </div>
              <div className="mb-3">
                <label>Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Enter address"
                />
              </div>
              <div className="mb-3">
                <label>Postal Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  placeholder="Enter postal code"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                Save Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddContactModal;
