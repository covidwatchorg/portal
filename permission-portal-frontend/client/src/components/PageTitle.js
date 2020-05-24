import React from 'react'
import DocumentTitle from 'react-document-title'
import { observer } from 'mobx-react'
import { withStore } from '../store'

const PageTitleBase = observer((props) => {
  let title = [props.title, props.store.organization.name, 'Covid Watch Community Tracing Portal']
    .filter(Boolean)
    .join(' - ')

  return <DocumentTitle title={title}>{props.children}</DocumentTitle>
})

const PageTitle = withStore(PageTitleBase)

export default PageTitle
