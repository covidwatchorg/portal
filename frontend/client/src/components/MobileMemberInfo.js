import React from 'react'
import RoleSelector from '../components/RoleSelector'
import arrowRight from '../../assets/arrow-right.svg'
import arrowDown from '../../assets/arrow-down.svg'

const MobileMemberInfo = ({
  data,
  key,
  memberIndex,
  userEmail,
  handleRoleChange,
  handleStatusChange,
  resetPassword,
}) => {
  const [showInfoState, setShowInfoState] = React.useState(false)
  const infoClass = showInfoState ? 'show-info' : 'show-info collapse'

  return (
    <div className="mobile-member-info" key={key}>
      <div className="show-info-btn" onClick={() => setShowInfoState(!showInfoState)}>
        <img src={showInfoState ? arrowDown : arrowRight} />
        <h4>{data.lastName + ', ' + data.firstName}</h4>
      </div>
      <div className={infoClass}>
        <p>{data.email}</p>
        <RoleSelector
          memberIndex={memberIndex}
          onChange={() => handleRoleChange(data.isAdmin, data.firstName, data.lastName, data.email)}
        />
        <select
          disabled={data.email === userEmail}
          className={!data.disabled ? 'active' : 'inactive'}
          value={!data.disabled ? 'active' : 'deactivated'}
          onChange={(e) => handleStatusChange(data.email, e.target.value, data.firstName, data.lastName)}
        >
          <option value="active">Active</option>
          <option value="deactivated">Deactivated</option>
        </select>
        <a onClick={(e) => resetPassword(e, data.email)}>Reset Password</a>
      </div>
    </div>
  )
}

export default MobileMemberInfo
