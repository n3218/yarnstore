import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { ListGroup, Form, Button } from "react-bootstrap"
import CartLayout from "./CartLayout"
import ShippingSection from "../../components/ShippingSection"
import { savePaymentMethodAction, saveShippingAddressAction } from "../../actions/cartActions"

import { getShippingAction } from "../../actions/shippingActions"

const ShippingScreen = ({ history }) => {
  const dispatch = useDispatch()
  const checkoutStep = "shipping"
  const cart = useSelector(state => state.cart)
  const userLogin = useSelector(state => state.userLogin)
  const { userInfo } = userLogin
  const { shippingAddress } = cart
  const [address, setAddress] = useState(shippingAddress ? shippingAddress.address : "")
  const [city, setCity] = useState(shippingAddress ? shippingAddress.city : "")
  const [zipCode, setZipCode] = useState(shippingAddress ? shippingAddress.zipCode : "")
  const [country, setCountry] = useState(shippingAddress ? shippingAddress.country : "")

  useEffect(() => {
    dispatch(getShippingAction())
  }, [dispatch])

  const submitShippingHandler = e => {
    e.preventDefault()
    dispatch(saveShippingAddressAction({ address, city, zipCode, country }))
    dispatch(savePaymentMethodAction(""))
    history.push("/checkout/payment")
  }

  return (
    <CartLayout history={history} checkoutStep={checkoutStep} title="Shipping">
      <ListGroup variant="flush">
        <ShippingSection cart={cart} checkoutStep={checkoutStep} userInfo={userInfo}>
          <Form onSubmit={submitShippingHandler}>
            <Form.Group controlId="country">
              <Form.Label>Country</Form.Label>
              <Form.Control //
                type="text"
                placeholder="Enter Country"
                value={country}
                required
                onChange={e => setCountry(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="address">
              <Form.Label>Address</Form.Label>
              <Form.Control //
                type="text"
                placeholder="Enter Address"
                value={address}
                required
                onChange={e => setAddress(e.target.value)}
              ></Form.Control>
            </Form.Group>
            <Form.Group controlId="city">
              <Form.Label>City</Form.Label>
              <Form.Control //
                type="text"
                placeholder="Enter City"
                value={city}
                required
                onChange={e => setCity(e.target.value)}
              ></Form.Control>
            </Form.Group>
            <Form.Group controlId="zipCode">
              <Form.Label>Zip Code</Form.Label>
              <Form.Control //
                type="text"
                placeholder="Enter ZipCode"
                value={zipCode}
                required
                onChange={e => setZipCode(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Button type="submit" className="btn-success my-3 px-5">
              Continue
            </Button>
          </Form>
        </ShippingSection>
      </ListGroup>
    </CartLayout>
  )
}

export default ShippingScreen
