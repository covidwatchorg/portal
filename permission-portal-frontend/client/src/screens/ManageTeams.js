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
import PendingOperationButton from '../components/PendingOperationButton'

const PAGE_SIZE = 15;

const ManageTeamsBase = observer((props) => {
  const userEmail = props.store.user.email;

  const [toastShouldOpen, setToastShouldOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const viewDataFromMemberData = (members) => {
    return members.map((m)=>{
      return {
        email: m.email,
        isAdmin: m.isAdmin,
        disabled: m.disabled,
        firstName: m.firstName,
        lastName: m.lastName
      }
    })
  }

  const [memberData, setMemberData] = useState(viewDataFromMemberData(props.store.organization.members));

  const [currentPage, setCurrentPage] = useState(0)
  const pages = memberData
      ? [...Array(Math.ceil(memberData.length / PAGE_SIZE)).keys()]
      : []
  const [showModal, setShowModal] = useState(false)

  const getPageData = () => {
    const pageStart = PAGE_SIZE * currentPage
    return memberData.slice(pageStart, pageStart + PAGE_SIZE)
  }

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

  const saveMemebers = async () => {
    try {
      await props.store.updateUsers(memberData);

      console.log('Member data saved successfully')
      setToastMessage('Member data saved successfully')
      setIsSuccess(true)
      setToastShouldOpen(true)
    } catch (err) {
      console.log(`Member data failed to save: ${err}`)
      setToastMessage('Failed to save member data')
      setIsSuccess(false)
      setToastShouldOpen(true)
    }
  }

  const deleteAccount = () => {
    console.log("TODO delete account");
  }

  const resetPassword = () => {
    console.log("TODO reset password");
  }

  return props.store.user.isSignedIn && props.store.user.isAdmin ? (
    <div className="module-container">
      <h1>Manage Members</h1>
      <div className="add-member-button" onClick={() => setShowModal(true)}>
        <img src={addMember} />
        <span className="add-button-text">Add Member</span>
      </div>
      <AddMemberModal hidden={!showModal} onClose={onAddMemberCancel} onSuccess={onAddMemberSuccess} onFailure={onAddMemberFailure} />
      <table>
        <thead>
          <tr>
            <th style={{ borderTopLeftRadius: 5 }}>Name</th>
            <th>Role</th>
            <th>Status</th>
            <th style={{ borderTopRightRadius: 5 }}>Settings</th>
          </tr>
        </thead>
        <tbody>
          {memberData &&
            memberData.map((data, index) => (
              <tr className={inCurrentPage(index) ? '' : 'hidden'} key={index}>
                <td>{data.lastName + ', ' + data.firstName}</td>
                <td style={{ padding: 0 }}>
                  <RoleSelector isAdmin={data.isAdmin} onChange={(e)=>{data.isAdmin = e.target.value == ROLES.ADMIN_LABEL}} />
                </td>
                <td style={{ padding: 0 }}>
                  <div className="custom-select">
                    <select
                      disabled={data.email == userEmail}
                      className={!data.disabled ? 'active' : 'inactive'}
                      defaultValue={!data.disabled ? 'active' : 'deactivated'}
                      onChange={(e)=>{
                        data.disabled = e.target.value == "deactivated"
                        e.target.className = !data.disabled ? 'active' : 'inactive'
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="deactivated">Deactivated</option>
                    </select>
                  </div>
                </td>
                <td>
                  <div className="settings-container">
                    <a onClick={deleteAccount}>Delete Account</a>
                    <a onClick={resetPassword}>Reset Password</a>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="table-bottom-container">
        <PendingOperationButton className="save-button" operation={saveMemebers}>
          Save Changes
        </PendingOperationButton>
        <div className="pages-container">
          <div className="arrow" onClick={currentPage === 0 ? () => {} : () => setCurrentPage(currentPage - 1)}>
            <img src={arrowLeft} />
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
            <img src={arrowRight} />
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
