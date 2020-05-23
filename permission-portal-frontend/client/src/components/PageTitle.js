import React from 'react'
import DocumentTitle from 'react-document-title'

const PageTitle = (props) => {
  return (
    <DocumentTitle
      title={
        props.title ? props.title + ' - Covid Watch Community Tracing Portal' : 'Covid Watch Community Tracing Portal'
      }
    >
      {props.children}
    </DocumentTitle>
  )
}

export default PageTitle
