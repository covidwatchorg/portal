import React from 'react'

const AddMemberModal = ({ showModal, setShowModal }) => {
  return (
    <div className="add-member-modal-container">
      <span onClick={() => setShowModal(false)}>X</span>
      <div className="add-member-form">
        <label for="fname">First Name</label>
        <input type="text" id="fname" name="fname" />
        <label for="lname">Last Name</label>
        <input type="text" id="lname" name="lname" />
        <button>Submit</button>
      </div>
    </div>
  )
}

export default AddMemberModal;