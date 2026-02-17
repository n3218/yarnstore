import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PayPalButton } from 'react-paypal-button-v2';
import axios from 'axios';
import { Col, Row } from 'react-bootstrap';
import FormContainer from '../../components/FormContainer';
import { getOrderDetailsAction, molliePayAction, payOrderAction } from '../../actions/orderActions';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { ORDER_CREATE_RESET } from '../../constants/orderConstants';
import './PayOrderScreen.css';

const PayOrderScreen = ({ match, history }) => {
  const dispatch = useDispatch();
  const orderId = match.params.id;
  const paymentMethod = match.params.paymentmethod;
  const orderDetails = useSelector(state => state.orderDetails);
  const { order, loading, error, success } = orderDetails;
  const orderPay = useSelector(state => state.orderPay);
  const { loading: loadingPay, success: successPay } = orderPay;
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if ((!success && !order) || order._id !== orderId) {
      dispatch(getOrderDetailsAction(orderId));
    } else {
      console.log('order: ', order);
      if (order && paymentMethod === 'PayPal') {
        const addPayPalScript = async () => {
          console.log('addPayPalScript');
          const { data: clientId } = await axios.get('/api/config/paypal');
          const script = document.createElement('script');
          const curr = 'EUR';
          script.type = 'text/javascript';
          script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${curr}`;
          script.async = true;
          script.onload = () => {
            setSdkReady(true);
            console.log('setSdkReady(true)');
          };
          document.body.appendChild(script);
        };

        console.log('paymentMethod: ', paymentMethod);

        if (!successPay && !(order && order.isPaid)) {
          if (!window.paypal) {
            addPayPalScript();
          } else {
            setSdkReady(true);
          }
        }
        if (successPay) {
          dispatch({ type: ORDER_CREATE_RESET });
          history.push(`/orders/${order._id}`);
        }
      }

      // if (order && paymentMethod === "Mollie") {
      //   const data = {
      //     totalPrice: order.totalPrice,
      //     currency: "EUR",
      //     description: `Order #${order.orderId}`,
      //     orderId: order._id
      //   }
      //   console.log("proceedMollyPayment: data: ", data)
      //   dispatch(molliePayAction(data))
      // }
    }
  }, [order, history, successPay, dispatch, orderId, paymentMethod, success]);

  useEffect(() => {
    console.log('--------------sdkReady: ', sdkReady);
  }, [sdkReady]);

  const payPalPaymentHandler = paymentResult => {
    console.log('successPaymentHandler');
    console.log('paymentResult: ', paymentResult);
    dispatch(payOrderAction(order._id, paymentResult));
  };

  return (
    <FormContainer className='hide-container pt-6'>
      {error && <Message variant='danger'>{error}</Message>}
      <Row>
        <Col md={3}></Col>
        <Col md={6}>
          {/* {(loading || loadingPay || paymentMethod === "mollie" || !sdkReady) && <Loader />} */}
          {sdkReady && <PayPalButton amount={order.totalPrice} onSuccess={payPalPaymentHandler} currency='EUR' />}
        </Col>
        <Col md={3}></Col>
      </Row>
    </FormContainer>
  );
};

export default PayOrderScreen;
