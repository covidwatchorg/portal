import React from 'react';

const AddMemberModel = () => {
  return (
    <div className="loginContainer">
      <label for="name">Name</label>
      <input type="name" id="name" name="name" />
      <label for="password">Role</label>
      <input type="password" id="password" name="password" />
      <button>Submit</button>
    </div>
  );
};

export default AddMemberModel;