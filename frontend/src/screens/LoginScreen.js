import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from '../components/FormContainer';
import Message from '../components/Message';
import { login } from '../actions/userActions';
import Loader from '../components/Loader';
import Meta from '../components/Meta';

const LoginScreen = ({ history, location }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const userLogin = useSelector(state => state.userLogin);
  const { loading, error, userInfo } = userLogin;

  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo && redirect) {
      history.push(redirect);
    }
  }, [history, userInfo, redirect]);

  const submitHandler = e => {
    e.preventDefault();
    dispatch(login(email, password));
  };

  const [googleLoading, setGoogleLoading] = useState(false);

  const loginWithGoogle = () => {
    setGoogleLoading(true);
    const apiBase = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : '';

    setTimeout(() => {
      window.location.href = `${apiBase}/api/auth/google`;
    }, 150); // маленькая задержка чтобы React успел перерисовать кнопку
  };

  return (
    <FormContainer>
      <Meta title='Sign In | YarnStore' />
      <h2>Sign In</h2>
      {error && <Message variant='danger'>{error}</Message>}
      {loading && <Loader />}
      <br />
      <br />
      <Form onSubmit={submitHandler}>
        <Form.Group controlId='email'>
          <Form.Label>Email Address</Form.Label>
          <Form.Control type='email' placeholder='Enter Email' value={email} autoComplete='email' onChange={e => setEmail(e.target.value)}></Form.Control>
        </Form.Group>
        <Form.Group controlId='password'>
          <Form.Label>Password</Form.Label>
          <Form.Control type='password' placeholder='Enter Password' value={password} autoComplete='password' onChange={e => setPassword(e.target.value)}></Form.Control>
        </Form.Group>
        <Button type='submit' className='btn-success my-3 px-5'>
          Sign In
        </Button>
      </Form>
      <p>OR</p>
      <p>
        <Button onClick={loginWithGoogle} disabled={googleLoading}>
          {googleLoading ? 'Signing in…' : 'Continue with Google'}
        </Button>
      </p>
      <p>
        New Customer? <Link to={redirect ? `/register?redirect=${redirect}` : '/register'}>Register</Link>
      </p>
      <p>
        <Link to={redirect ? `/forgot-password?redirect=${redirect}` : '/forgot-password'}>Forgot password?</Link>
      </p>
    </FormContainer>
  );
};

export default LoginScreen;
