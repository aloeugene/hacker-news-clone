import React, { useState } from 'react';
import { Mutation } from 'react-apollo';
import { AUTH_TOKEN, LOGIN_MUTATION, SIGNUP_MUTATION } from '../constants';

const initialState = {
  login: true,
  email: '',
  password: '',
  name: ''
}

const saveUserData = token => {
  localStorage.setItem(AUTH_TOKEN, token)
}

const Login = ({ history }) => {
  const [ userInfo, setUserInfo ] = useState(initialState);
  const { login, email, password, name } = userInfo;

  const confirm = async data => {
    const { token } = login ? data.login : data.signup;

    saveUserData(token);
    history.push('/');
  }

  return (
    <div>
      <h4 className="mv3">{ login ? 'Login' : 'Sign Up' }</h4>
      <div className="flex flex-column">
        {
          !login &&
            <input
              type="text"
              placeholder="Your name"
              value={ name }
              onChange={ e => setUserInfo({ ...userInfo, name: e.target.value }) }
            />
        }
        <input
          type="text"
          placeholder="Your email address"
          value={ email }
          onChange={ e => setUserInfo({ ...userInfo, email: e.target.value }) }
        />
        <input
          type="password"
          placeholder="Choose a safe password"
          value={ password }
          onChange={ e => setUserInfo({ ...userInfo, password: e.target.value }) }
        />
      </div>
      <div className="flex mt3">
        <Mutation
          mutation={ login ? LOGIN_MUTATION : SIGNUP_MUTATION }
          variables={{ email, password, name }}
          onCompleted={ data => confirm(data) }
        >
          {
            mutation =>
              <div className="pointer mr2 button" onClick={ mutation }>
                { login ? 'login' : 'create account' }
              </div>

          }
        </Mutation>
        <div className="pointer button" onClick={ () => setUserInfo({ ...userInfo, login: !login }) }>
          { login ? 'need to create an account?' : 'already have an account?' }
        </div>
      </div>
    </div>
  )
}

export default Login;
