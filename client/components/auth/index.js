import { Link, Redirect } from 'react-router-dom';
import React, { useState } from 'react';

export const signin = (user) => {
  console.log(user)
  if (user.email === 'admin') {
    console.log(user)
    return true
  } else {
    return false
  }
}