import { Link, Redirect } from 'react-router-dom';
import React, { useState } from 'react';


export const signin = {
  isAdmin : false, 
  checkIfAdmin(user) {
    if (user.email === 'admin') {
      console.log(user)
      this.isAdmin = true;
    } 
  }
}

