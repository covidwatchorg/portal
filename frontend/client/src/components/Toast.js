import React from 'react'
import Snackbar from '@material-ui/core/Snackbar'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import white_check_success_icon from '../../assets/white_check_success_icon.svg'

/**
 * Encapsulates a button driven operation which takes time and may succeed or fail
 */
class Toast extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      vertical: 'top',
      horizontal: 'center',
      open: false,
    }
  }

  /**
   * Set this toast's state to open. The toast will close itself.
   */
  show() {
    this.setState({
      open: true,
    })
  }

  render() {
    return (
      <Snackbar
        anchorOrigin={{ vertical: this.state.vertical, horizontal: this.state.horizontal }}
        key={`${this.state.vertical},${this.state.horizontal}`}
        open={this.state.open}
        onClose={() => {
          this.setState({
            open: false,
          })
        }}
        autoHideDuration={3000}
      >
        <SnackbarContent
          style={{
            backgroundColor: this.props.isSuccess ? '#43C4D9' : '#F05452',
            fontFamily: 'Montserrat',
            width: '100vw',
            fontSize: '24px',
            lineHeigh: '29px',
            fontWeight: '600',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '46px',
          }}
          message={
            <span id="msg">
              <div className="toastMessage">{this.props.message}</div>
              {this.props.isSuccess && <img className="toastCheck" src={white_check_success_icon} alt="check" />}
            </span>
          }
        />
      </Snackbar>
    )
  }
}

export default Toast
