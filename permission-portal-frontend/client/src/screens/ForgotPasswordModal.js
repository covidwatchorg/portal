import React, { useState } from 'react';
import Modal from '../components/Modal';
import PendingOperationButton from '../components/PendingOperationButton';
import store from '../store'

class ForgotPasswordModal extends React.Component{
    constructor(props){
        super(props);
        this.state = { emailPrompt: true,
                      email: '',
                      validEmail: true};
        this.onSubmit = this.onSubmit.bind(this);
        this.onClose = this.onClose.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    onSubmit(event){
        event.preventDefault();

        if(!this.state.email){
            this.setState({validEmail: false});
            return
        }

        // TODO send recovery email from store 

        // Reset
        this.setState({emailPrompt: false, email: '', validEmail: true});
    }

    handleChange(event) {
        this.setState({email: event.target.value});
    }

    onClose() {
        this.setState({emailPrompt: true});
        this.props.onClose();
    }

    render() {
        if (this.state.emailPrompt) {
            return (
                <div className="recover-password-form">
                <Modal hidden={this.props.hidden} onClose={this.onClose} containerClass="recover-password-modal-container">
                    <h2>Recover Password</h2>
                    <label> Email or User Name</label>
                    <form onSubmit={this.onSubmit} onChange={this.handleChange}>
                        <input type="text"/>
                        <button type="submit" className="save-button recovery-button"> Email Recovery Link </button>
                        {
                            ! this.state.validEmail &&
                            <div className="validationResult">
                                Please enter an email or user name.
                            </div>
                        }
                    </form>
                </Modal>
                </div>
            );
        }
        else {
            return (
                <div className="recover-password-form">
                    <Modal hidden={this.props.hidden} onClose={this.onClose} containerClass="recover-password-modal-container">
                    <h2>Recover Password</h2>
                    <p> A password recovery link has been sent to the email address associated with your account. Please click the link in the email to reset your password. </p>
                    </Modal>
                </div>           
            );
        }
    }
}

export default ForgotPasswordModal;
