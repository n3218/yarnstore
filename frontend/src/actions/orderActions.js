import {
  ORDER_CREATE_REQUEST, //
  ORDER_CREATE_SUCCESS,
  ORDER_CREATE_FAIL,
  ORDER_DETAILS_REQUEST,
  ORDER_DETAILS_SUCCESS,
  ORDER_DETAILS_FAIL,
  ORDER_PAY_REQUEST,
  ORDER_PAY_SUCCESS,
  ORDER_PAY_FAIL,
  ORDER_LIST_MY_REQUEST,
  ORDER_LIST_MY_SUCCESS,
  ORDER_LIST_MY_FAIL,
  ORDER_LIST_REQUEST,
  ORDER_LIST_SUCCESS,
  ORDER_LIST_FAIL,
  ORDER_DELIVER_REQUEST,
  ORDER_DELIVER_SUCCESS,
  ORDER_DELIVER_FAIL,
  ORDER_MOLLIE_PAY_REQUEST,
  ORDER_MOLLIE_PAY_SUCCESS,
  ORDER_MOLLIE_PAY_FAIL,
  ORDER_CANCEL_REQUEST,
  ORDER_CANCEL_SUCCESS,
  ORDER_CANCEL_FAIL
} from '../constants/orderConstants';

import axios from 'axios';
import { logout } from './userActions';

export const createOrderAction = order => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_CREATE_REQUEST });
    const {
      userLogin: { userInfo }
    } = getState();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    const { data } = await axios.post(`/api/orders`, order, config);
    dispatch({ type: ORDER_CREATE_SUCCESS, payload: data });
    localStorage.removeItem('startCheckout');
    localStorage.removeItem('cartItems');
  } catch (error) {
    const message = error.response && error.response.data.message ? error.response.data.message : error.message;
    if (message === 'Not authorized, token failed') {
      dispatch(logout());
    }
    dispatch({ type: ORDER_CREATE_FAIL, payload: message });
  }
};

export const getOrderDetailsAction = id => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_DETAILS_REQUEST });
    const {
      userLogin: { userInfo }
    } = getState();
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    const { data } = await axios.get(`/api/orders/${id}`, config);
    dispatch({ type: ORDER_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    const message = error.response && error.response.data.message ? error.response.data.message : error.message;
    if (message === 'Not authorized, token failed') {
      dispatch(logout());
    }
    dispatch({ type: ORDER_DETAILS_FAIL, payload: message });
  }
};

export const listMyOrdersAction = () => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_LIST_MY_REQUEST });
    const {
      userLogin: { userInfo }
    } = getState();
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };

    const { data } = await axios.get(`/api/orders/myorders`, config);

    dispatch({ type: ORDER_LIST_MY_SUCCESS, payload: data });
  } catch (error) {
    const message = error.response && error.response.data.message ? error.response.data.message : error.message;
    if (message === 'Not authorized, token failed') {
      dispatch(logout());
    }
    dispatch({ type: ORDER_LIST_MY_FAIL, payload: message });
  }
};

export const listOrdersAction =
  (pageNumber = '') =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: ORDER_LIST_REQUEST });
      const {
        userLogin: { userInfo }
      } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      };
      const { data } = await axios.get(`/api/orders?pageNumber=${pageNumber}`, config);
      dispatch({ type: ORDER_LIST_SUCCESS, payload: data });
    } catch (error) {
      const message = error.response && error.response.data.message ? error.response.data.message : error.message;
      if (message === 'Not authorized, token failed') {
        dispatch(logout());
      }
      dispatch({ type: ORDER_LIST_FAIL, payload: message });
    }
  };

export const payOrderAction = (orderId, paymentResult) => async (dispatch, getState) => {
  console.log('payOrderAction: orderId: ', orderId);
  console.log('payOrderAction: paymentResult: ', paymentResult);
  try {
    dispatch({ type: ORDER_PAY_REQUEST });
    const {
      userLogin: { userInfo }
    } = getState();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    const { data } = await axios.put(`/api/orders/${orderId}/pay`, paymentResult, config);
    dispatch({ type: ORDER_PAY_SUCCESS, payload: data });
  } catch (error) {
    const message = error.response && error.response.data.message ? error.response.data.message : error.message;
    if (message === 'Not authorized, token failed') {
      dispatch(logout());
    }
    dispatch({ type: ORDER_PAY_FAIL, payload: message });
  }
};

export const molliePayAction = orderData => async (dispatch, getState) => {
  console.log('molliePayAction: orderData:', orderData);
  // try {
  //   dispatch({ type: ORDER_MOLLIE_PAY_REQUEST })
  //   const {
  //     userLogin: { userInfo }
  //   } = getState()
  //   const config = {
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${userInfo.token}`
  //     }
  //   }
  //   console.log("molliePayAction: orderData.orderId: ", orderData.orderId)
  //   const { data } = await axios.put(`/api/orders/${orderData.orderId}/molliepay`, orderData, config)
  //   console.log("molliePayAction: data: ", data)
  //   dispatch({ type: ORDER_MOLLIE_PAY_SUCCESS, payload: data })
  //   window.location.href = data
  // } catch (error) {
  //   const message = error.response && error.response.data.message ? error.response.data.message : error.message
  //   if (message === "Not authorized, token failed") {
  //     dispatch(logout())
  //   }
  //   dispatch({ type: ORDER_MOLLIE_PAY_FAIL, payload: message })
  // }
};

export const deliverOrderAction = (order, shippingCode, shippingLink) => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_DELIVER_REQUEST });
    const {
      userLogin: { userInfo }
    } = getState();
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    const input = {
      shippingCode,
      shippingLink
    };
    const { data } = await axios.put(`/api/orders/${order._id}/deliver`, input, config);
    dispatch({ type: ORDER_DELIVER_SUCCESS, payload: data });
  } catch (error) {
    const message = error.response && error.response.data.message ? error.response.data.message : error.message;
    if (message === 'Not authorized, token failed') {
      dispatch(logout());
    }
    dispatch({ type: ORDER_DELIVER_FAIL, payload: message });
  }
};

export const cancelOrderAction = (id, notes) => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_CANCEL_REQUEST });
    const {
      userLogin: { userInfo }
    } = getState();
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    const input = {
      notes,
      user: userInfo._id
    };
    const { data } = await axios.put(`/api/orders/${id}/cancel`, input, config);
    dispatch({ type: ORDER_CANCEL_SUCCESS, payload: data });
  } catch (error) {
    const message = error.response && error.response.data.message ? error.response.data.message : error.message;
    if (message === 'Not authorized, token failed') {
      dispatch(logout());
    }
    dispatch({ type: ORDER_CANCEL_FAIL, payload: message });
  }
};
