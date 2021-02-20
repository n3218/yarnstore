import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import axios from "axios"
import { Form, Row, Col, Button } from "react-bootstrap"
import Loader from "./Loader"
import imageCompression from "browser-image-compression"
import { productImageDeleteAction } from "../actions/productActions"
import { PRODUCT_IMAGE_DELETE_RESET } from "../constants/productConstants"
import Message from "./Message"

const ImageUpload = ({ image, setImage, uploading, setUploading }) => {
  const dispatch = useDispatch()
  const thumbPath = "/uploads/thumbs/thumb-"
  const productImageDelete = useSelector(state => state.productImageDelete)
  const { loading: loadingImageDelete, error: errorImageDelete, success: successImageDelete } = productImageDelete

  useEffect(() => {
    if (successImageDelete) {
      dispatch({ type: PRODUCT_IMAGE_DELETE_RESET })
    }
  }, [dispatch, successImageDelete])

  const handleImageUpload = async e => {
    const file = e.target.files
    const formData = new FormData()
    for (let i in file) {
      if (typeof file[i] === "object") {
        const options = {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1440,
          useWebWorker: true
        }
        try {
          const compressedFile = await imageCompression(file[i], options)
          console.log("compressedFile: ", compressedFile)
          await formData.append(`image`, compressedFile, compressedFile.name) // write your own logic
        } catch (error) {
          console.log(error)
        }
      }
    }

    setUploading(true)

    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } }
      const { data } = await axios.post("/api/upload", formData, config)
      console.log("data: ", data)
      setImage([...image, ...data.map(img => `${img.filename}`)])
      setUploading(false)
    } catch (error) {
      console.error(error)
      setUploading(false)
    }
  }

  const moveImage = img => {
    console.log("moveImage")
    let copy = image
    let filteredImages = copy.filter(el => el !== img)
    setImage([img, ...filteredImages])
  }

  const deleteImage = img => {
    let copy = image
    let filteredImages = copy.filter(el => el !== img)
    dispatch(productImageDeleteAction(img))
    setImage([...filteredImages])
  }

  return (
    <Form.Group controlId="images" className="mb-4">
      <Row>
        <Col sm="2">
          <Form.Label>Images</Form.Label>
          <div className="label-comment">Upload, move to first place, delete</div>
        </Col>
        <Col>
          {image &&
            image.map(img => (
              <div key={img} className="color-picture">
                <Form.Label>
                  <img src={thumbPath + img} alt="Color Preview" width="80" />
                </Form.Label>
                <Row>
                  <Col>
                    <Button variant="link text-success" title="Move Image" onClick={() => moveImage(img)}>
                      <i className="fas fa-arrow-left"></i>
                    </Button>
                  </Col>
                  <Col>
                    <Button variant="link text-danger" title="Delete Image" onClick={() => deleteImage(img)}>
                      <i className="fas fa-trash"></i>
                    </Button>
                  </Col>
                </Row>
              </div>
            ))}
          {errorImageDelete && <Message>{errorImageDelete}</Message>}
          <Form.File id="images" label="Choose Images to upload" custom onChange={handleImageUpload} multiple accept="image/*"></Form.File>
          {(uploading || loadingImageDelete) && <Loader />}
        </Col>
      </Row>
    </Form.Group>
  )
}

export default ImageUpload
