import nodemailer from 'nodemailer';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';
import { itemRow, ifStorecredit, infoBlock, userButtons, footer } from './mailComponents.js';

dotenv.config();

export const sendOrderConfirmation = asyncHandler(async orderData => {
  const order = new Object(orderData);
  const OUGOING_ORDERS_EMAIL = process.env.OUGOING_ORDERS_EMAIL;
  const OUGOING_ORDERS_PASSWORD = process.env.OUGOING_ORDERS_PASSWORD;
  const DOMAIN_NAME = String(process.env.DOMAIN_NAME);

  const ORDERS_EMAIL = process.env.ORDERS_EMAIL;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: OUGOING_ORDERS_EMAIL,
      pass: OUGOING_ORDERS_PASSWORD
    }
  });

  const mailOptions = {
    from: `YarnStore Order <${ORDERS_EMAIL}>`,
    to: `${order.user.email}`,
    subject: `Thank you for your order! #${order.orderId}`,
    html: `
    <div style="color: #373a3c; font-family: 'Source Sans Pro',Roboto,'Helvetica Neue',Arial,sans-serifs; font-weight: 300; background-color: #f7f7f7; padding: 20px;">
      <div style="max-width: 500px; margin: 0px auto; background-color: white; padding: 16px;">
        <div style="font-size: 20px; line-height: 2; font-weight: 800; margin-bottom: 30px;" align="left">
          <a href="${DOMAIN_NAME}" style="text-decoration:none; color:#417d97; font-weight: 600;" target="_blank" rel="noreferrer">
            YarnStore
          </a>
          <a href="${DOMAIN_NAME}" rel="noreferrer" target="_blank"><img alt="YarnStore" src="${DOMAIN_NAME}/assets/logo.png" height="80" width="80" align="right" /></a>
        </div>
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">Order confirmation 
          <span style="font-size: 20px; margin-bottom: 10px;">
            <a href="${DOMAIN_NAME}/orders/${order._id}" style="text-decoration:none; color:#417d97; font-weight: 600;" target="_blank" rel="noreferrer">#${order.orderId}</a>
          </span>
        </div>
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">Hello ${order.user.name}</div> 
        <div style="font-size: 16px; font-weight: 300; margin-bottom: 10px;">Just to let you know, we've received your order. Thank you for shopping with us!</div>
        <div style="font-size: 16px; font-weight: 300; margin-bottom: 30px;">We will collect your order. After shipping you'll receive an email with the Track & Trace code.</div>        
        
        ${infoBlock(order)}

        <div>
          <div style="font-size: 18px; font-weight: 300; margin: 10px 0px;" align="left">
            ORDER DETAILS (total ${order.orderItems.length} items):
          </div>
          <table style="width: 100%; border: 1px solid gray; font-weight: 200">
            <tbody>
              ${order.orderItems.map(item => itemRow(item))}
            </tbody>
          </table>
        </div>

        <div align="right" style="padding-top: 10px; padding-bottom: 20px; background-color: #f7f7f7;">
          <table cellspacing="0" style="margin-right:15px">
            <tbody>
              <tr><td style="text-align: right; font-size: 12px; font-weight: 300;">items weight: </td><td style="font-size: 12px; font-weight: 300;"> ${order.itemsWeight}g</td></tr>
              <tr><td style="text-align: right; font-size: 12px; font-weight: 300;">estimated parcel weight: </td><td style="font-size: 12px; font-weight: 300;"> ${order.totalWeight}g</td></tr>
            </tbody>
          </table>

          <hr style="border-top: 2px solid #e2e4e8;" />
              
          <table cellspacing="0" style="margin-right:15px">
            <tbody>
              <tr><td style="text-align: right; font-size: 12px; font-weight: 300;">items price: </td><td style="font-size: 12px; font-weight: 300;"> €${order.itemsPrice.toFixed(2)}</td></tr>
              <tr><td style="text-align: right; font-size: 12px; font-weight: 300;">taxes included: </td><td style="font-size: 12px; font-weight: 300;"> €${order.taxPrice.toFixed(2)}</td></tr>
              <tr><td style="text-align: right; font-size: 12px; font-weight: 300;">shipping price: </td><td style="font-size: 12px; font-weight: 300;"> €${order.shippingPrice.toFixed(2)}</td></tr>
              ${ifStorecredit(order.storecredit)}
              <tr><td style="text-align: right; font-size: 16px; font-weight: 600; height: 30px;">total price: </td><td style="font-size: 16px; font-weight: 600; height: 30px;"> €${order.totalPrice.toFixed(2)}</td></tr>
            </tbody>
          </table>

          <hr style="border-top: 2px solid #e2e4e8;" />

          ${userButtons(order)}
                  
        </div>
      </div>
    </div>
    ${footer}`
  };

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return error;
    } else {
      console.log('Email with order confirmation sent... ' + info.response);
      return info.response;
    }
  });
});
