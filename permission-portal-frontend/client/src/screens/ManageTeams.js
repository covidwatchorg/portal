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
import { withStore } from '../store'
import { observer } from 'mobx-react'
import PageTitle from '../components/PageTitle'

const ManageTeamsBase = observer((props) => {
  const [toastShouldOpen, setToastShouldOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [currentPage, setCurrentPage] = useState(0)
  const pages =
    props.store.organization && props.store.organization.members
      ? [...Array(Math.ceil(props.store.organization.members.length / 15)).keys()]
      : []
  const [showModal, setShowModal] = useState(false)

  const getPageData = () => {
    const pageStart = 15 * currentPage
    return props.store.organization.members.slice(pageStart, pageStart + 15)
  }

  useEffect(() => {
    console.log('Store', props.store)
  }, [])

  const onCancel = () => {
    setShowModal(false)
    console.log(pages)
  }

  const onSuccess = () => {
    setIsSuccess(true)
    setToastShouldOpen(true)
    setShowModal(false)
  }

  const onFailure = (e) => {
    console.error(e)
    setIsSuccess(false)
    setToastShouldOpen(true)
    setShowModal(false)
  }

  // TODO: conditional rendering
  return props.store.user.isSignedIn && props.store.user.isAdmin ? (
    <div className="module-container">
      <PageTitle title="Manage Members" />
      <h1>Manage Members</h1>
      <div className="add-member-button" onClick={() => setShowModal(true)}>
        <img src={addMember} alt="" />
        <span className="add-button-text">Add Member</span>
      </div>
      <AddMemberModal hidden={!showModal} onClose={onCancel} onSuccess={onSuccess} onFailure={onFailure} />
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
          {props.store.organization &&
            props.store.organization.members &&
            getPageData().map((data, index) => (
              <tr key={index}>
                <td>{data.lastName + ', ' + data.firstName}</td>
                <td style={{ padding: 0 }}>
                  <RoleSelector ariaLabelledBy="role-header" isAdmin={data.isAdmin} />
                </td>
                <td style={{ padding: 0 }}>
                  <div className="custom-select">
                    <select
                      className={!data.disabled ? 'active' : 'inactive'}
                      defaultValue={!data.disabled ? 'active' : 'deactivated'}
                      aria-labelledby="status-header"
                    >
                      <option value="active">Active</option>
                      <option value="deactivated">Deactivated</option>
                    </select>
                  </div>
                </td>
                <td>
                  <div className="settings-container">
                    <a onClick={() => {}}>Delete Account</a>
                    <a onClick={() => {}}>Reset Password</a>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="table-bottom-container">
        <div className="save-button">Save Changes</div>
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
        message={isSuccess ? 'Member Email Invitation set' : 'Member Email Invitation failed to send'}
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
