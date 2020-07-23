import React, { useState, useRef } from 'react'
import * as ROUTES from '../constants/routes'
import { Redirect } from 'react-router-dom'
import addMember from '../../assets/add-member.svg'
import arrowLeft from '../../assets/arrow-left.svg'
import arrowRight from '../../assets/arrow-right.svg'
import '../../Styles/screens/manage_teams.scss'
import AddMemberModal from '../components/AddMemberModal'
import Toast from '../components/Toast'
import RoleSelector from '../components/RoleSelector'
import { withStore, PAGE_SIZE } from '../store'
import { observer } from 'mobx-react'
import PageTitle from '../components/PageTitle'
import Logging from '../util/logging'
import ChangeRoleModal from '../components/ChangeRoleModal'
import ChangeStatusModal from '../components/ChangeStatusModal'

const ManageTeamsBase = observer((props) => {
  const userEmail = props.store.data.user.email

  const [toastMessage, setToastMessage] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const confirmationToast = useRef()

  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false)
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false)
  const [modalUserProperties, setModalUserProperties] = useState({})

  const onAddMemberCancel = () => {
    setShowAddMemberModal(false)
  }

  const onAddMemberSuccess = () => {
    setToastMessage('Success: member email invitation sent')
    setIsSuccess(true)
    setShowAddMemberModal(false)
    confirmationToast.current.show()
  }

  const onAddMemberFailure = (e) => {
    Logging.error(e)
    if (e.code === 'already-exists') {
      setToastMessage("The email address is already in use by another account")
    } else {
      setToastMessage('Member email invitation failed to send')
    }
    setIsSuccess(false)
    confirmationToast.current.show()
    setShowAddMemberModal(false)
  }

  const handleRoleChange = (isAdmin, firstName, lastName, email) => {
    setModalUserProperties({
      isAdmin,
      firstName,
      lastName,
      email,
    })
    setShowChangeRoleModal(true)
  }

  const onChangeRoleModalClose = () => {
    setShowChangeRoleModal(false)
  }

  const handleStatusChange = (email, toStatus, firstName, lastName) => {
    setModalUserProperties({
      email,
      toStatus,
      firstName,
      lastName,
    })
    setShowChangeStatusModal(true)
  }

  const onChangeStatusModalClose = () => {
    setShowChangeStatusModal(false)
  }

  const resetPassword = async (e, email) => {
    e.preventDefault()
    try {
      await props.store.sendPasswordRecoveryEmail(email)
      setToastMessage(`Password reset email sent to ${email}`)
      setIsSuccess(true)
      confirmationToast.current.show()
    } catch (err) {
      Logging.error(err)
      setToastMessage('Password reset failed. Please try again')
      setIsSuccess(false)
      confirmationToast.current.show()
    }
  }

  return !props.store.data.user.isSignedIn ||
    !props.store.data.user.isAdmin ||
    props.store.data.user.isFirstTimeUser ||
    (props.store.data.user.passwordResetRequested && props.store.data.user.signedInWithEmailLink) ? (
    <Redirect to={ROUTES.LANDING} />
  ) : (
    <div className="module-container">
      <PageTitle title="Manage Members" />
      <h1>Manage Members</h1>
      <button className="button btn-medium btn-tertiary add-member-button" onClick={() => setShowAddMemberModal(true)}>
        <img src={addMember} alt="" />
        <span className="add-button-text">Add Member</span>
      </button>
      <AddMemberModal
        hidden={!showAddMemberModal}
        onClose={onAddMemberCancel}
        onSuccess={onAddMemberSuccess}
        onFailure={onAddMemberFailure}
      />
      <ChangeRoleModal
        hidden={!showChangeRoleModal}
        onClose={onChangeRoleModalClose}
        userProperties={modalUserProperties}
      />
      <ChangeStatusModal
        hidden={!showChangeStatusModal}
        onClose={onChangeStatusModalClose}
        userProperties={modalUserProperties}
      />
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email Address</th>
            <th>Role</th>
            <th>Status</th>
            <th>Settings</th>
          </tr>
        </thead>
        <tbody>
          {props.store.data.organization.members &&
            props.store.data.organization.currentPageOfMembers.map((data, index) => (
              <tr key={index}>
                <td>{data.lastName + ', ' + data.firstName}</td>
                <td>{data.email}</td>
                <td style={{ padding: 0 }}>
                  <RoleSelector
                    memberIndex={index + (props.store.data.organization.membersPage - 1) * PAGE_SIZE}
                    onChange={() => handleRoleChange(data.isAdmin, data.firstName, data.lastName, data.email)}
                  />
                </td>
                <td style={{ padding: 0 }}>
                  <div className="custom-select">
                    <select
                      disabled={data.email === userEmail}
                      className={!data.disabled ? 'active' : 'inactive'}
                      value={!data.disabled ? 'active' : 'deactivated'}
                      onChange={(e) => handleStatusChange(data.email, e.target.value, data.firstName, data.lastName)}
                    >
                      <option value="active">Active</option>
                      <option value="deactivated">Deactivated</option>
                    </select>
                  </div>
                </td>
                <td>
                  <div className="settings-container">
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
              if (props.store.data.organization.membersPage - 1 > 0) {
                props.store.data.organization.setMembersPage(props.store.data.organization.membersPage - 1)
              }
            }}
          >
            <img style={{ marginRight: 4 }} src={arrowLeft} alt="Previous" />
          </div>
          {[...Array(props.store.data.organization.totalPagesOfMembers).keys()].map((pageNumber) => (
            <div
              className={pageNumber + 1 === props.store.data.organization.membersPage ? 'current-page' : 'page'}
              key={pageNumber.toString()}
              onClick={() => {
                props.store.data.organization.setMembersPage(pageNumber + 1)
              }}
            >
              {pageNumber + 1}
            </div>
          ))}
          <div
            className="arrow"
            onClick={(e) => {
              e.preventDefault()
              if (props.store.data.organization.membersPage + 1 <= props.store.data.organization.totalPagesOfMembers) {
                props.store.data.organization.setMembersPage(props.store.data.organization.membersPage + 1)
              }
            }}
          >
            <img style={{ marginLeft: 4 }} src={arrowRight} alt="Next" />
          </div>
        </div>
      </div>
      <Toast ref={confirmationToast} isSuccess={isSuccess} message={toastMessage} />
    </div>
  )
})

const ManageTeams = withStore(ManageTeamsBase)

export default ManageTeams
