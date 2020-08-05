import React from 'react'
import { withStore } from '../store'
import { observer } from 'mobx-react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Image from 'react-bootstrap/Image'

const FooterBase = observer(() => {
  const cwImg = require('../../assets/powered-by-cw.svg')

  return (
    <Container fluid className="footer py-2">
      <Row className="align-items-center">
        <Col
          xs={{ span: 12, offset: 0 }}
          md={{ offset: 1 }}
          className="d-flex justify-content-center just justify-content-md-start"
        >
          <Image src={cwImg} fluid />
        </Col>
        <Col className="pt-1">
          <Row>
            <Col xs={12} md={6} className="d-flex justify-content-center">
              <span id="copyright" className="small text-center">
                © 2020 Covid Watch. All rights reserved.
              </span>
            </Col>
            <Col xs={6} md={3} className="d-flex justify-content-end justify-content-md-center p-0 pr-1 px-md-3">
              <a
                target="_blank"
                href="https://docs.google.com/document/d/1pcnFidqiebgQpxxVoi0VCoiRsSndCl5VF_7kZMtnZOA/edit?usp=sharing"
                rel="noreferrer"
                className="ml-md-3 ml-sm-0 small"
              >
                Privacy Policy
              </a>
            </Col>
            <Col xs={6} md={3} className="d-flex justify-content-start justify-content-md-center p-0 pl-1 px-md-3">
              <a target="_blank" href="https://covidwatch.org/get_support" rel="noreferrer" className="small">
                Support
              </a>
            </Col>
          </Row>
        </Col>
        <Col md={1} xs={0}></Col>
      </Row>
    </Container>
  )
})

const Footer = withStore(FooterBase)

export default Footer
