import React from 'react'
import * as ROLES from '../constants/roles'
import { observer } from 'mobx-react'
import { withStore } from '../store'

const RoleSelector = observer((props) => {
  // If passed memberIndex, return a component whose value corresponds to the member with that index
  // in store.organization.members
  return props.store.organization.members[props.memberIndex] ? (
    <div className="custom-select">
      <select
        onChange={props.onChange}
        value={
          props.store.organization.members[props.memberIndex].isAdmin === true
            ? ROLES.ADMIN_LABEL
            : ROLES.NON_ADMIN_LABEL
        }
      >
        <option value={ROLES.ADMIN_LABEL}>{ROLES.ADMIN_LABEL}</option>
        <option value={ROLES.NON_ADMIN_LABEL}>{ROLES.NON_ADMIN_LABEL}</option>
      </select>
    </div>
  ) : (
    // Else, programmer should pass isAdmin as a prop, and base the default value of the selector on props.isAdmin
    <div className="custom-select">
      <select
        onChange={props.onChange}
        id={props.id || null}
        aria-labelledby={props.ariaLabelledBy || null}
        required={props.required || false}
        aria-required={props.required || false}
        defaultValue={props.isAdmin === true ? ROLES.ADMIN_LABEL : ROLES.NON_ADMIN_LABEL}
      >
        <option value={ROLES.ADMIN_LABEL}>{ROLES.ADMIN_LABEL}</option>
        <option value={ROLES.NON_ADMIN_LABEL}>{ROLES.NON_ADMIN_LABEL}</option>
      </select>
    </div>
  )
})

export default withStore(RoleSelector)
