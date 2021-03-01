import React from "react"
import axios from "axios"
import createMollieClient from "@mollie/api-client"
import { Button } from "react-bootstrap"

const MolliePayment = ({ totalPrice, currency = "EUR", orderId }) => {
  const addMollyPayment = async () => {
    const { data: mollieApiKey } = await axios.get("/api/config/mollie")
    const mollieClient = createMollieClient({ apiKey: mollieApiKey })
    console.log("mollieApiKey: ", mollieApiKey)
    mollieClient.payments
      .create({
        amount: {
          value: totalPrice,
          currency: currency
        },
        description: "My first API payment",
        redirectUrl: `https://woolunatic.herokuapp.com/orders/${orderId}`,
        webhookUrl: "https://woolunatic.herokuapp.com/api/orders/molliewebhook"
      })
      .then(payment => {
        console.log("payment: ", payment)
        return payment.getCheckoutUrl() // Forward the customer to the payment.getCheckoutUrl()
      })
      .catch(error => {
        console.log("Error with Molly Payments", error) // Handle the error
      })
  }
  return (
    <>
      <Button onClick={() => addMollyPayment()}>Mollie Pay</Button>
    </>
  )
}

export default MolliePayment