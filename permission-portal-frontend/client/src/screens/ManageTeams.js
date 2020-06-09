import React, { useState, useEffect, useRef } from 'react'
import * as ROUTES from '../constants/routes'
import { Redirect } from 'react-router-dom'
import addMember from '../../assets/add-member.svg'
import arrowLeft from '../../assets/arrow-left.svg'
import arrowRight from '../../assets/arrow-right.svg'
import '../../Styles/screens/manage_teams.scss'
import AddMemberModal from '../components/AddMemberModal'
import DeleteUserModal from '../components/DeleteUserModal'
import Toast from '../components/Toast'
import RoleSelector from '../components/RoleSelector'
import * as ROLES from '../constants/roles'
import { withStore } from '../store'
import { observer } from 'mobx-react'
import PageTitle from '../components/PageTitle'
import Logging from '../util/logging'

const ManageTeamsBase = observer((props) => {
  const userEmail = props.store.data.user.email

  const [toastMessage, setToastMessage] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const confirmationToast = useRef()

  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false)

  const [emailOfUserToBeDeleted, setEmailOfUserToBeDeleted] = useState('')

  useEffect(() => {
    Logging.log('Store', props.store)
  }, [])

  const onAddMemberCancel = () => {
    setShowAddMemberModal(false)
  }

  const onAddMemberSuccess = () => {
    setToastMessage('Member Email Invitation sent')
    setIsSuccess(true)
    setShowAddMemberModal(false)
    confirmationToast.current.show()
  }

  const onAddMemberFailure = (e) => {
    Logging.error(e)
    setToastMessage('Member Email Invitation failed to send')
    setIsSuccess(false)
    confirmationToast.current.show()
    setShowAddMemberModal(false)
  }

  const onDeleteUserSuccess = () => {
    setToastMessage('User successfully deleted')
    setIsSuccess(true)
    confirmationToast.current.show()
    setShowAddMemberModal(false)
  }

  const onDeleteUserFailure = (e) => {
    Logging.error(e)
    setToastMessage('Failed to delete user: unknown error')
    setIsSuccess(false)
    confirmationToast.current.show()
    setShowAddMemberModal(false)
  }

  const openDeleteUserModal = (e, email) => {
    e.preventDefault()
    setEmailOfUserToBeDeleted(email)
    setShowDeleteUserModal(true)
  }

  const closeDeleteUserModal = () => {
    setEmailOfUserToBeDeleted('')
    setShowDeleteUserModal(false)
  }

  const resetPassword = async (e, email) => {
    e.preventDefault()
    try {
      await props.store.data.sendPasswordResetEmail(email)
      setToastMessage(`Password Reset Email Sent to ${email}`)
      setIsSuccess(true)
      confirmationToast.current.show()
    } catch (err) {
      Logging.error(err)
      setToastMessage('Password Reset Failed. Please try again')
      setIsSuccess(false)
      confirmationToast.current.show()
    }
  }

  return props.store.data.user.isSignedIn && props.store.data.user.isAdmin ? (
    <div className="module-container">
      <PageTitle title="Manage Members" />
      <h1>Manage Members</h1>
      <div className="add-member-button" onClick={() => setShowAddMemberModal(true)}>
        <img src={addMember} alt="" />
        <span className="add-button-text">Add Member</span>
      </div>
      <AddMemberModal
        hidden={!showAddMemberModal}
        onClose={onAddMemberCancel}
        onSuccess={onAddMemberSuccess}
        onFailure={onAddMemberFailure}
      />
      <DeleteUserModal
        email={emailOfUserToBeDeleted}
        hidden={!showDeleteUserModal}
        onClose={closeDeleteUserModal}
        onSuccess={onDeleteUserSuccess}
        onFailure={onDeleteUserFailure}
      />
      <table>
        <thead>
          <tr>
            <th style={{ borderTopLeftRadius: 5 }}>Name</th>
            <th id="role-header">Role</th>
            <th id="status-header">Status</th>
            <th style={{ borderTopRightRadius: 5 }}>Settings</th>
          </tr>
        </thead>
        <tbody>
          {props.store.data.organization.currentPageOfMembers &&
            props.store.data.organization.currentPageOfMembers.map((data, index) => (
              <tr key={index}>
                <td>{data.lastName + ', ' + data.firstName}</td>
                <td style={{ padding: 0 }}>
                  <RoleSelector
                    memberIndex={index}
                    onChange={(e) => {
                      props.store.data.updateUserByEmail(data.email, { isAdmin: e.target.value == ROLES.ADMIN_LABEL })
                    }}
                    ariaLabelledBy="role-header"
                  />
                </td>
                <td style={{ padding: 0 }}>
                  <div className="custom-select">
                    <select
                      disabled={data.email == userEmail}
                      className={!data.disabled ? 'active' : 'inactive'}
                      value={!data.disabled ? 'active' : 'deactivated'}
                      onChange={(e) => {
                        props.store.data.updateUserByEmail(data.email, { disabled: e.target.value == 'deactivated' })
                      }}
                      aria-labelledby="status-header"
                    >
                      <option value="active">Active</option>
                      <option value="deactivated">Deactivated</option>
                    </select>
                  </div>
                </td>
                <td>
                  <div className="settings-container">
                    <a onClick={(e) => openDeleteUserModal(e, data.email)}>Delete Account</a>
                    <a onClick={(e) => resetPassword(e, data.email)}>Reset Password</a>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="table-bottom-container">
        <div className="pages-container">
          <div
            className="arrow"
            onClick={(e) => {
              e.preventDefault()
              props.store.previousPageOfMembers()
            }}
          >
            <img src={arrowLeft} alt="Previous" />
          </div>
          <div
            className="arrow"
            onClick={(e) => {
              e.preventDefault()
              props.store.nextPageOfMembers()
            }}
          >
            <img src={arrowRight} alt="Next" />
          </div>
        </div>
      </div>
      <Toast ref={confirmationToast} isSuccess={isSuccess} message={toastMessage} />
    </div>
  ) : props.store.data.user.isSignedIn ? (
    <Redirect to={ROUTES.CODE_VALIDATIONS} />
  ) : (
    <Redirect to={ROUTES.LANDING} />
  )
})

const ManageTeams = withStore(ManageTeamsBase)

export default ManageTeams
