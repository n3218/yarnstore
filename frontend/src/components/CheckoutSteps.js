import React from "react"
import { Nav } from "react-bootstrap"
import { LinkContainer } from "react-router-bootstrap"

const CheckoutSteps = ({ step }) => {
  return (
    <>
      <ol className="breadcrumb justify-content-center">
        <li className="breadcrumb-item">
          <Nav.Item>
            <Nav.Link href="/cart">Cart</Nav.Link>
          </Nav.Item>
        </li>
        <li className="breadcrumb-item">
          <Nav.Item>
            <Nav.Link href="/checkout/shipping">Shipping</Nav.Link>
          </Nav.Item>
        </li>
        <li className="breadcrumb-item">
          <Nav.Item>
            <Nav.Link href="/checkout/payment" disabled={step === "shipping"}>
              Payment Method
            </Nav.Link>
          </Nav.Item>
        </li>
        <li className="breadcrumb-item">
          <Nav.Item>
            {step === 4 ? (
              <LinkContainer to="/placeorder">
                <Nav.Link>Order</Nav.Link>
              </LinkContainer>
            ) : (
              <Nav.Link disabled>Order</Nav.Link>
            )}
          </Nav.Item>
        </li>
      </ol>
    </>
  )
}

export default CheckoutSteps
