import {Config, CognitoIdentityCredentials} from "aws-sdk";
import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js'
import poolData from './'

Config.region = poolData.region;
Config.credentials = new CognitoIdentityCredentials({
  IdentityPoolId: poolData.IdentityPoolId
});

const userPool = new CognitoUserPool(poolData);

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
    onSuccess: (result) => {
      getCurrentUserData().then((r)=>{
        callback(null, r);
      })
    },
    onFailure: err => {
      console.error("Auth error",err);
      callback(err);
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

export const getCurrentUserName = (callback) => {
  const cognitoUser = userPool.getCurrentUser();
  if (!cognitoUser) return false;
  if (cognitoUser !== null) {
    let user = cognitoUser.getUsername();
    return user;
  }
}

export const getCurrentUserData = (callback) => {
  let uname = getCurrentUserName();
  let url = "https://api.blufieldsenergy.com/v1/me?un="+uname;
  const API_KEY = poolData.LocalAPIKey;
  const APIHEADERS = {
    headers: {
      "X-Api-Key": API_KEY,
    },
    method: 'GET'
  };
  return fetch(url,APIHEADERS)
    .then(response => response.json())
    .then(function(response) {
      console.log("UDATA RES:",response.user[0].p);
      window.localStorage.setItem('nuser',JSON.stringify(response.user[0]));
      return true;
    })
    .catch((err)=>{
      console.error("APP Fetch Error:",err);
      return false;
    });
}

export const signinCallback = (googleUser) => {
  // if (authResult['status']['signed_in']) {
    console.log("SignIn Call back");
     Config.credentials = new CognitoIdentityCredentials({
        IdentityPoolId: poolData.IdentityPoolId,
        Logins: {
           'accounts.google.com': googleUser.getAuthResponse().id_token
        }
     });

     Config.credentials.get(function(){

     });
  // }
}
