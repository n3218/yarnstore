import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { USER_LOGIN_SUCCESS } from '../constants/userConstants';

const OAuthSuccessScreen = ({ location, history }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) {
      history.push('/login');
      return;
    }

    const run = async () => {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const { data } = await axios.get('/api/users/profile', config);

      const userInfo = { ...data, token };

      dispatch({ type: USER_LOGIN_SUCCESS, payload: userInfo });
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      setTimeout(() => {
        history.push('/');
      }, 3000);
    };

    run().catch(() => history.push('/login'));
  }, [dispatch, history, location.search]);

  return <h1 style={{ padding: 20 }}>Signing you in with Google…</h1>;
};

export default OAuthSuccessScreen;
