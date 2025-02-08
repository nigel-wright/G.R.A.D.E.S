import React, { useState, useEffect } from "react";
import EmergencyContactCard from "../components/EmergencyContactCard/EmergencyContactCard";
import AddContactModal from "../components/AddContactModal/AddContactModal";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const ManageEmergencyContactsModal = ({
  isOpen,
  onClose,
  emergencyContacts = [],
  onSave,
}) => {
  const [localContacts, setLocalContacts] = useState(emergencyContacts);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [allContacts, setAllContacts] = useState([]);


  //Synchronize localContacts with emergencyContacts whenever the modal opens or the emergencyContacts prop changes
  useEffect(() => {
    if (isOpen) {
      setLocalContacts(emergencyContacts);
    }
  }, [isOpen, emergencyContacts]);

  //Fetch all existing contacts to check if the user creates a contact with a phone number that already exists
  const fetchAllContacts = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/contacts");
      setAllContacts(response.data);
    } catch (error) {
      console.error("Error fetching all contacts: ", error.response?.data || error.message);
    }
  };
  
  useEffect(() => {
    fetchAllContacts();
  }, []);
  

  //Add a new contact locally
  const handleAddContact = (newContact) => {
    setLocalContacts([...localContacts, newContact]);
    console.log("Inside Handle Add: ", localContacts)
  };

  //Remove a contact locally
  const handleRemoveContact = (contactToRemove) => {
    setLocalContacts(
      localContacts.filter(
        (contact) => contact.phoneNumber !== contactToRemove.phoneNumber
      )
    );
  };

  //Edit a contact locally
  const handleEditContact = (updatedContact) => {
    setLocalContacts(
      localContacts.map((contact) =>
        contact.phoneNumber === updatedContact.phoneNumber
          ? { ...updatedContact }
          : contact
      )
    );

    console.log("Inside Handle Edit: ", localContacts);
  };

  const handleConfirmChanges = () => {
    console.log("Inside Confirm Changes: ", localContacts[0], localContacts[1], localContacts[2])
    onSave(localContacts); //Pass the updated contacts back to the parent
    onClose(); //Close the modal
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop"></div>
      <div className="modal show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Manage Emergency Contacts</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3 d-flex align-items-center">
                <button
                  type="button"
                  className="btn btn-success text-nowrap w-100"
                  onClick={() => {setIsAddContactModalOpen(true)}}
                  disabled={!(localContacts.length < 3)} //Prevent the user from adding a contact if the student already has 3
                >
                  Add Contact
                </button>
              </div>

              <div className="contact-list">
                {localContacts.map((contact, index) => (
                  <EmergencyContactCard
                    key={index}
                    contact={contact}
                    onRemove={() => handleRemoveContact(contact)}
                    onEdit={handleEditContact}
                  />
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmChanges}
              >
                Confirm Changes
              </button>
            </div>
          </div>
        </div>
      </div>
      <AddContactModal
        isOpen={isAddContactModalOpen}
        onClose={() => setIsAddContactModalOpen(false)}
        onSave={handleAddContact}
        existingContacts={allContacts}
      />
    </>
  );
};

export default ManageEmergencyContactsModal;
