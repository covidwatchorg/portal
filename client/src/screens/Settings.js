import React, { Fragment, useState } from 'react';

const Settings = () => {
  
  const settingsForm = () => (
    <Fragment>

    <form className="settingsContainer">
     
      <div id='formCol1'>
        <label for='prefix'>
          Prefix 
        </label>
        <input type='text' name='prefix'/>

        <label for='firstName'>
          First Name
        </label>
        <input type='text' name='firstName'/>

        <label for='lastName'>
          Last Name
        </label>
        <input type='text' name='lastName'/>
      
        <label for='email'>
          Email Address
        </label>
        <input type='text' name='email'/>
       
        <label for='phoneNumber'>
          Phone Number
        </label>
        <input type='text' name='phoneNumber'/> 
      </div>


      <div id='formCol2'>
        <label for='location'>
          Location
        </label>
        <input type='text' name='location'/>
    
        <label for='role'>
          Role 
        </label>
        <input type='text' name='role'/>

        <label for='accountPermissions'>
          Account Permissions
          </label>
          <input type='text' name='accountPermissions'/>
       
        <label for='password'>
          Password
        </label>
        <input type='text' name='password'/>

        <input type='submit' name='submit'/>
      </div>


   

    </form>
   
    </Fragment>
  );
   return(
     <React.Fragment>
           <h1>My Settings</h1>
           {settingsForm()}s
     </React.Fragment>
   )
};

export default Settings;