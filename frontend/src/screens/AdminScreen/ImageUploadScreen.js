import React from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { deleteAllProductsImagesAction } from '../../actions/productActions';
import ImagesBulkUpload from '../../components/ImagesBulkUpload';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { DELETE_ALL_PRODUCTS_IMAGES_RESET } from '../../constants/productConstants';

const ImageUploadScreen = () => {
  const dispatch = useDispatch();
  const deleteAllProductsImages = useSelector(state => state.deleteAllProductsImages);
  const { success: deleteAllProductsImagesSuccess, loading: deleteAllProductsImagesLoading, error: deleteAllProductsImagesError, message: deleteAllProductsImagesMessage } = deleteAllProductsImages;

  const deleteAllProductsImagesHandler = () => {
    dispatch(deleteAllProductsImagesAction());
    setTimeout(() => dispatch({ type: DELETE_ALL_PRODUCTS_IMAGES_RESET }), 15000);
  };

  return (
    <>
      <h2>Images Upload</h2>

      <ImagesBulkUpload />

      {deleteAllProductsImagesLoading && <Loader />}
      {deleteAllProductsImagesError && <Message variant='danger'>{deleteAllProductsImagesError}</Message>}
      {deleteAllProductsImagesSuccess && <Message variant='success'>{deleteAllProductsImagesMessage}</Message>}

      <div className='submenu'>
        <Button onClick={deleteAllProductsImagesHandler} className='btn btn-danger bg-red my-3 py-2 px-5' disabled>
          <i className='fas fa-trash text-white px-2'> </i> Delete all Images
        </Button>
      </div>
    </>
  );
};

export default ImageUploadScreen;
