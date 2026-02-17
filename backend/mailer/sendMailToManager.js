import nodemailer from 'nodemailer';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';
import { itemRowCompact, ifStorecredit, infoBlock, footer } from './mailComponents.js';

dotenv.config();

export const sendMailToManager = asyncHandler(async orderData => {
  const order = new Object(orderData);
  const DOMAIN_NAME = String(process.env.DOMAIN_NAME);
  const MANAGER_EMAIL = String(process.env.MANAGER_EMAIL);
  const OUGOING_ORDERS_EMAIL = process.env.OUGOING_ORDERS_EMAIL;
  if (!OUGOING_ORDERS_EMAIL) {
    throw new Error('Missing env: OUGOING_ORDERS_EMAIL');
  }
  const OUGOING_ORDERS_PASSWORD = process.env.OUGOING_ORDERS_PASSWORD;
  if (!OUGOING_ORDERS_PASSWORD) {
    throw new Error('Missing env: OUGOING_ORDERS_PASSWORD');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: OUGOING_ORDERS_EMAIL,
      pass: OUGOING_ORDERS_PASSWORD
    }
  });

  const mailOptions = {
    from: `#${order.orderId} New Order <${OUGOING_ORDERS_EMAIL}>`,
    to: `${MANAGER_EMAIL}`,
    subject: `New Order #${order.orderId} received`,
    html: `
    <div style="color: #373a3c; font-family: 'Source Sans Pro',Roboto,'Helvetica Neue',Arial,sans-serifs; font-weight: 300; background-color: #f7f7f7; padding: 20px;">
      <div style="max-width: 700px; margin: 0px auto; background-color: white; padding: 16px;">
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">
          New order 
          <span style="font-size: 20px; margin-bottom: 10px;">
            <a href="${DOMAIN_NAME}/orders/${order._id}" style="text-decoration:none; color:#417d97; font-weight: 600;" target="_blank" rel="noreferrer">#${order.orderId}</a>
          </span>
          placed
        </div>
        
        ${infoBlock(order)}

        <div>
          <div style="font-size: 18px; font-weight: 300; margin: 10px 0px;" align="left">ORDER DETAILS (total ${order.orderItems.length} items):</div>
          <table style="width: 100%; border: 2px solid gray; font-weight: 300; font-size: 10px;">
            <thead>
              <tr>
                <th><i></i></th>
                <th><i>art</i></th>
                <th><i>brand</i></th>
                <th><i>name</i></th>
                <th><i>color</i></th>
                <th><i>fibers,%</i></th>
                <th><i>weight,g</i></th>
                <th><i>m/100gr</i></th>
                <th><i>€/100gr</i></th>
                <th><i>price</i></th>
              </tr>
            </thead>
            <tbody>
            ${order.orderItems.map(item => itemRowCompact(item))}
            </tbody>
          </table>
        </div>
        <div align="right" style="padding-top: 10px; padding-bottom: 20px; background-color: #f7f7f7;">

          <table cellspacing="0" style="margin-right:15px">
            <tbody>
              <tr><td style="text-align: right; font-size: 12px; font-weight: 300;">items weight: </td><td style="font-size: 12px; font-weight: 300;"> ${order.itemsWeight}g</td></tr>
              <tr><td style="text-align: right; font-size: 12px; font-weight: 300;">estimated parcel weight: </td><td style="font-size: 12px; font-weight: 300;"> ${order.totalWeight}g</td></tr>
              <tr><td style="text-align: right; font-size: 12px; font-weight: 300;">items price: </td><td style="font-size: 12px; font-weight: 300;"> €${order.itemsPrice.toFixed(2)}</td></tr>
              <tr><td style="text-align: right; font-size: 12px; font-weight: 300;">taxes included: </td><td style="font-size: 12px; font-weight: 300;"> €${order.taxPrice.toFixed(2)}</td></tr>
              <tr><td style="text-align: right; font-size: 12px; font-weight: 300;">shipping price: </td><td style="font-size: 12px; font-weight: 300;"> €${order.shippingPrice.toFixed(2)}</td></tr>
              ${ifStorecredit(order.storecredit)}
              <tr><td style="text-align: right; font-size: 16px; font-weight: 600; height: 30px;">total price: </td><td style="font-size: 16px; font-weight: 600; height: 30px;"> €${order.totalPrice.toFixed(2)}</td></tr>
            </tbody>
          </table>

          <hr style="border-top: 2px solid #e2e4e8;" />

          <div align="center">
            <table cellpadding="15">
              <tbody>
                <tr>
                  <td style="width:33%"><div style="width:100%; padding:10px; text-align:center; background-color:#81869c"><a href="${DOMAIN_NAME}/orders/${order.id}" style="color:#f0f3f7; text-decoration:none" target="_blank" rel="noreferrer">Go to Order Details</a></div></td>
                  <td style="width:33%"><div style="width:100%; padding:10px; text-align:center; background-color:#56556e"><a href="${DOMAIN_NAME}/admin/orderlist" style="color:#f0f3f7; text-decoration:none" target="_blank" rel="noreferrer">Go to Orders List</a></div></td>
                  <td style="width:33%"><div style="width:100%; padding:10px; text-align:center; background-color:#56556e"><a href="${DOMAIN_NAME}/admin/user/${order.user._id}/edit" style="color:#f0f3f7; text-decoration:none" target="_blank" rel="noreferrer">Edit User</a></div></td>
                </tr>
              </tbody>
            </table>  
          </div>          
        </div>
      </div>
    </div>`
  };

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return error;
    } else {
      console.log('Email to manager with new order sent... ' + info.response);
      return info.response;
    }
  });
});
