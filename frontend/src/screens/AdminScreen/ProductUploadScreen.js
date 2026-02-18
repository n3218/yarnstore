import React from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { deleteAllProductsDataAction } from '../../actions/productActions';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import ProductsBulkUpload from '../../components/ProductsBulkUpload';
import { DELETE_ALL_PRODUCTS_DATA_RESET } from '../../constants/productConstants';

const ProductUploadScreen = () => {
  const dispatch = useDispatch();
  const deleteAllProductsData = useSelector(state => state.deleteAllProductsData);
  const { success: deleteAllProductsSuccess, loading: deleteAllProductsLoading, error: deleteAllProductsError, message: deleteAllProductsMessage } = deleteAllProductsData;

  const deleteAllProductsDataHandler = () => {
    dispatch(deleteAllProductsDataAction());
    setTimeout(() => dispatch({ type: DELETE_ALL_PRODUCTS_DATA_RESET }), 5000);
  };

  return (
    <>
      <h2>Products Upload</h2>

      <ProductsBulkUpload />

      {deleteAllProductsLoading && <Loader />}
      {deleteAllProductsError && <Message variant='danger'>{deleteAllProductsError}</Message>}
      {deleteAllProductsSuccess && <Message variant='success'>{deleteAllProductsMessage}</Message>}

      <div className='submenu'>
        <Button onClick={deleteAllProductsDataHandler} className='btn btn-danger bg-red my-3 py-2 px-5' disabled>
          <i className='fas fa-trash text-white mx-2'></i> Delete all Data
        </Button>
      </div>
    </>
  );
};

export default ProductUploadScreen;
