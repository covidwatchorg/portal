import React from 'react'
import AddMemberModal from '../src/components/AddMemberModal'

var onAddMemberCancel = () => {}
var onAddMemberSuccess = () => {}
var onAddMemberFailure = () => {}

test('test', () => {
  const addmembermodal = (
    <AddMemberModal
      hidden={false}
      onClose={onAddMemberCancel}
      onSuccess={onAddMemberSuccess}
      onFailure={onAddMemberFailure}
    />
  )
  addmembermodal
})
