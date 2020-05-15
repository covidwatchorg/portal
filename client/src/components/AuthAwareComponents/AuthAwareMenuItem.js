import store from '../../store'
import MenuItem from '@material-ui/core/MenuItem';
import AuthUserContext from '../Session/context';
import firebase from '../Firebase/firebase';
import { withAuthorization } from '../Session';
import { compose } from 'recompose';
import { withFirebase } from '../Firebase';



class AuthAwareMenuItemBase extends React.Component{
    constructor(props) {
        super(props); 
    }
    condition(authUser) { 
        const roles = (this.props.roleguard ? this.props.roleguard.split(",") : []).map(string => string.trim());
        //const condition = this.props.roleGuard ? store.user && store.user.role.some(r=> roles.includes(r)) : false;
        var result = this.props.roleguard ? roles.some(r=> authUser.roles.hasOwnProperty(r) && authUser.roles[r]) : false;
        return result;
    }
    render() {
        const { children, ...rest } = this.props;  
        return (

        <AuthUserContext.Consumer>
          {authUser =>
                  this.condition(authUser) ? <MenuItem {...rest}>
                  {children}
              </MenuItem> : null
          }
        </AuthUserContext.Consumer>
        );
        
      }
}


const AuthAwareMenuItem =  compose(
    withFirebase,
)(AuthAwareMenuItemBase);
export default AuthAwareMenuItem;