import React from 'react'
import * as ROLES from '../constants/roles'

const RoleSelector = (props) => {
  return (
    <div className="custom-select">
      <select
        onChange={props.onChange}
        id={props.id || null}
        aria-labelledby={props.ariaLabeledBy || null}
        defaultValue={props.isAdmin === true ? ROLES.ADMIN_LABEL : ROLES.NON_ADMIN_LABEL}
      >
        <option value={ROLES.ADMIN_LABEL}>{ROLES.ADMIN_LABEL}</option>
        <option value={ROLES.NON_ADMIN_LABEL}>{ROLES.NON_ADMIN_LABEL}</option>
      </select>
    </div>
  )
}

export default RoleSelector
