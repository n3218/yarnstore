import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Switch from 'react-bootstrap/esm/Switch';
import Footer from './components/Footer';
import Header from './components/Header/Header';
import HomeScreen from './screens/HomeScreen/HomeScreen';
import CollectionScreen from './screens/CollectionScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import PayOrderScreen from './screens/OrderScreen/PayOrderScreen';
import ProductScreen from './screens/ProductScreen/ProductScreen';
import CartScreen from './screens/OrderScreen/CartScreen';
import ShippingScreen from './screens/OrderScreen/ShippingScreen';
import PaymentScreen from './screens/OrderScreen/PaymentScreen';
import OrderScreen from './screens/OrderScreen/OrderScreen';
import UserListScreen from './screens/AdminScreen/UserListScreen';
import UserEditScreen from './screens/AdminScreen/UserEditScreen';
import ProductListScreen from './screens/AdminScreen/ProductListScreen';
import ProductEditScreen from './screens/AdminScreen/ProductEditScreen';
import OrderListScreen from './screens/AdminScreen/OrderListScreen';
// import AdminScreen from "./screens/AdminScreen/AdminScreen"
import AdminLayout from './screens/AdminScreen/AdminLayout';
import ColorListScreen from './screens/AdminScreen/ColorListScreen';
import ProductUploadScreen from './screens/AdminScreen/ProductUploadScreen';
import ImageUploadScreen from './screens/AdminScreen/ImageUploadScreen';
import TextListScreen from './screens/AdminScreen/TextListScreen';
import TextEditScreen from './screens/AdminScreen/TextEditScreen';
import InfoScreen from './screens/TextScreens/InfoScreen';
import ShippingListScreen from './screens/AdminScreen/ShippingListScreen';
import ShippingEditScreen from './screens/AdminScreen/ShippingEditScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import OAuthSuccessScreen from './screens/OAuthSuccessScreen';

const App = () => {
  return (
    <Router>
      <Header />
      <main>
        <Container>
          <Switch>
            <Route path='/admin'>
              <AdminLayout>
                <Switch>
                  <Route path={`/admin/colorlist`} component={ColorListScreen} exact />
                  <Route path={`/admin/productsupload`} component={ProductUploadScreen} exact />
                  <Route path={`/admin/imagesupload`} component={ImageUploadScreen} exact />
                  <Route path={`/admin/textlist`} component={TextListScreen} exact />
                  <Route path={`/admin/text/:id/edit`} component={TextEditScreen} exact />
                  <Route path={`/admin/shippinglist`} component={ShippingListScreen} exact />
                  <Route path={`/admin/shipping/:id/edit`} component={ShippingEditScreen} exact />
                  <Route path={`/admin/userlist`} component={UserListScreen} exact />
                  <Route path={`/admin/user/:id/edit`} component={UserEditScreen} exact />
                  <Route path={`/admin/product/:id/edit`} component={ProductEditScreen} exact />
                  <Route path={`/admin/productlist`} component={ProductListScreen} exact />
                  <Route path={`/admin/productlist/:pageNumber`} component={ProductListScreen} exact />
                  {/* <Route path={`/admin/orderlist`} component={OrderListScreen} exact /> */}
                  <Route path={`/admin/orderlist/:pageNumber`} component={OrderListScreen} exact />
                  <Route path={`/admin`} component={OrderListScreen} exact />
                </Switch>
              </AdminLayout>
            </Route>

            <Route path='/'>
              <Switch>
                <Route path='/login' component={LoginScreen} exact />
                <Route path='/oauth' component={OAuthSuccessScreen} />
                <Route path='/register' component={RegisterScreen} exact />
                <Route path='/profile' component={ProfileScreen} exact />
                <Route path='/forgot-password' component={ForgotPasswordScreen} exact />
                <Route path='/reset-password/:id/:token' component={ResetPasswordScreen} exact />

                <Route path='/cart/:id?/:qty?' component={CartScreen} exact />
                <Route path='/checkout/shipping' component={ShippingScreen} exact />
                <Route path='/checkout/payment' component={PaymentScreen} exact />
                <Route path='/checkout/payorder/:id?/:paymentmethod?' component={PayOrderScreen} exact />
                <Route path='/orders/:id' component={OrderScreen} exact />

                <Route path='/info/:textUrl' component={InfoScreen} exact />
                <Route path='/search/:keyword' component={CollectionScreen} exact />
                <Route path='/search/:keyword/page/:pageNumber' component={CollectionScreen} exact />
                <Route path='/products/:id' component={ProductScreen} exact />
                <Route path='/yarns/page/:pageNumber' component={CollectionScreen} exact />
                <Route path='/yarns/:category' component={CollectionScreen} exact />
                <Route path='/yarns' component={CollectionScreen} exact />
                <Route path='/' component={HomeScreen} exact />
              </Switch>
            </Route>
          </Switch>
        </Container>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
