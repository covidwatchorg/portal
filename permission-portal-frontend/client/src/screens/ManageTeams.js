import React, { useState, useEffect } from 'react'
import * as ROUTES from '../constants/routes'
import { Redirect } from 'react-router-dom'
import addMember from '../../assets/add-member.svg'
import arrowLeft from '../../assets/arrow-left.svg'
import arrowRight from '../../assets/arrow-right.svg'
import '../../Styles/screens/manage_teams.scss'
import AddMemberModal from '../components/AddMemberModal'
import Toast from '../components/Toast'
import RoleSelector from '../components/RoleSelector'
import * as ROLES from '../constants/roles'
import { withStore } from '../store'
import { observer } from 'mobx-react'
import PageTitle from '../components/PageTitle'

const PAGE_SIZE = 15

const ManageTeamsBase = observer((props) => {
  const userEmail = props.store.user.email

  const [toastShouldOpen, setToastShouldOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [currentPage, setCurrentPage] = useState(0)
  const pages = props.store.organization.members
    ? [...Array(Math.ceil(props.store.organization.members.length / PAGE_SIZE)).keys()]
    : []
  const [showModal, setShowModal] = useState(false)

  const inCurrentPage = (index) => {
    return index >= PAGE_SIZE * currentPage && index < PAGE_SIZE * (currentPage + 1)
  }

  useEffect(() => {
    console.log('Store', props.store)
  }, [])

  const onAddMemberCancel = () => {
    setShowModal(false)
  }

  const onAddMemberSuccess = () => {
    setToastMessage('Member Email Invitation sent')
    setIsSuccess(true)
    setToastShouldOpen(true)
    setShowModal(false)
  }

  const onAddMemberFailure = (e) => {
    console.error(e)
    setToastMessage('Member Email Invitation failed to send')
    setIsSuccess(false)
    setToastShouldOpen(true)
    setShowModal(false)
  }

  const deleteAccount = () => {
    console.log('TODO delete account')
  }

  const resetPassword = async (e, email) => {
    e.preventDefault()
    try {
      await props.store.sendPasswordResetEmail(email)
      setToastMessage(`Password Reset Email Sent to ${email}`)
      setIsSuccess(true)
      setToastShouldOpen(true)
    } catch (err) {
      console.error(err)
      setToastMessage('Password Reset Failed. Please try again')
      setIsSuccess(false)
      setToastShouldOpen(true)
    }
  }

  return props.store.user.isSignedIn && props.store.user.isAdmin ? (
    <div className="module-container">
      <PageTitle title="Manage Members" />
      <h1>Manage Members</h1>
      <div className="add-member-button" onClick={() => setShowModal(true)}>
        <img src={addMember} alt="" />
        <span className="add-button-text">Add Member</span>
      </div>
      <AddMemberModal
        hidden={!showModal}
        onClose={onAddMemberCancel}
        onSuccess={onAddMemberSuccess}
        onFailure={onAddMemberFailure}
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
          {props.store.organization.members &&
            props.store.organization.members.map((data, index) => (
              <tr className={inCurrentPage(index) ? '' : 'hidden'} key={index}>
                <td>{data.lastName + ', ' + data.firstName}</td>
                <td style={{ padding: 0 }}>
                  <RoleSelector
                    memberIndex={index}
                    onChange={(e) => {
                      props.store.updateUserByEmail(data.email, { isAdmin: e.target.value == ROLES.ADMIN_LABEL })
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
                        props.store.updateUserByEmail(data.email, { disabled: e.target.value == 'deactivated' })
                        data.disabled = e.target.value == 'deactivated'
                        e.target.className = !data.disabled ? 'active' : 'inactive'
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
                    <a onClick={deleteAccount}>Delete Account</a>
                    <a onClick={(e) => resetPassword(e, data.email)}>Reset Password</a>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="table-bottom-container">
        <div className="pages-container">
          <div className="arrow" onClick={currentPage === 0 ? () => {} : () => setCurrentPage(currentPage - 1)}>
            <img src={arrowLeft} alt="Previous" />
          </div>
          {pages.map((page) => (
            <a
              key={page}
              className={`${page === currentPage ? 'current-' : ''}page`}
              onClick={page === currentPage ? () => {} : () => setCurrentPage(page)}
            >
              {page + 1}
            </a>
          ))}
          <div
            className="arrow"
            onClick={currentPage === pages[pages.length - 1] ? () => {} : () => setCurrentPage(currentPage + 1)}
          >
            <img src={arrowRight} alt="Next" />
          </div>
        </div>
      </div>
      <Toast
        open={toastShouldOpen}
        onClose={() => setToastShouldOpen(false)}
        isSuccess={isSuccess}
        message={toastMessage}
      />
    </div>
  ) : props.store.user.isSignedIn ? (
    <Redirect to={ROUTES.CODE_VALIDATIONS} />
  ) : (
    <Redirect to={ROUTES.LANDING} />
  )
})

const ManageTeams = withStore(ManageTeamsBase)

export default ManageTeams
