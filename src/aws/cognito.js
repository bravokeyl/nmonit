import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails
} from 'amazon-cognito-identity-js'
import poolData from './'

const userPool = new CognitoUserPool(poolData)

export const createUser = (username, email, password, callback) => {
  const attributeList = [
    new CognitoUserAttribute({
      Name: 'email',
      Value: email,
    }),
  ]

  userPool.signUp(username, password, attributeList, null, callback)
}


export const verifyUser = (username, verifyCode, callback) => {
  const userData = {
    Username: username,
    Pool: userPool,
  }
  const cognitoUser = new CognitoUser(userData)
  cognitoUser.confirmRegistration(verifyCode, true, callback)
}

export const authenticateUser = (email, password, callback) => {
  const authData = {
    Username: email,
    Password: password,
  }
  const authDetails = new AuthenticationDetails(authData)
  const userData = {
    Username: email,
    Pool: userPool,
  }
  const cognitoUser = new CognitoUser(userData)
  cognitoUser.authenticateUser(authDetails, {
    onSuccess: (result,userConfirmationNecessary) => {
      console.log('access token + ' + userConfirmationNecessary)
      cognitoUser.setDeviceStatusRemembered({
        onSuccess: function (result) {
            console.log('call result: ' , result);
            return callback(null, result);
        },
        onFailure: function(err) {
            alert(err);
        }
      });
      cognitoUser.listDevices(4, null, {
        onSuccess: function (result) {
            console.log('CAll listDevices: ' ,result);
        },
        onFailure: function(err) {
            alert(err);
        }
      });
      return callback(null, false);
    },
    onFailure: err => {
      callback(err)
    }
  })
}

export const signOut = () => {
  const cognitoUser = userPool.getCurrentUser()
  if (!cognitoUser){
    return;
  } else {
    userPool.getCurrentUser().signOut()
  }
}

export const getIdToken = (callback) => {
  const cognitoUser = userPool.getCurrentUser();
  if (!cognitoUser) return false;
  if (cognitoUser !== null) {
    return cognitoUser.getSession((err, session) => {
      if (err) {
        console.log("Cognito Session Err",err);
        return false;
      }
      if(session){
        if(session.isValid()){
          return session.getIdToken();
        }
      }
      return false;
    })
  }
}


export const getCurrentUser = (callback) => {
  const cognitoUser = userPool.getCurrentUser();
  if (!cognitoUser) return false;
  if (cognitoUser !== null) {
    return cognitoUser.getSession((err, session) => {
      if (err) {
        console.log("Cognito Session Err",err);
        return false;
      }
      if(session){
        if(session.isValid()){
          return true;
        }
      }
      return false;
      // cognitoUser.getUserAttributes((err, attributes) => {
      //   if (err) return console.log(err);
      //   callback(attributes)
      // });
    })
  }
}
