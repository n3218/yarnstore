import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import axios from "axios"
import { Form, Row, Col, Jumbotron, Table } from "react-bootstrap"
import Loader from "../components/Loader"
import Meta from "../components/Meta"
import "react-quill/dist/quill.snow.css"
import Message from "../components/Message"

const AdminScreen = ({ history }) => {
  const [uploading, setUploading] = useState(false)
  const [data, setData] = useState("")
  const userLogin = useSelector(state => state.userLogin)
  const { userInfo } = userLogin

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      history.push("/login")
    }
  }, [history, userInfo])

  const uploadCsvFileHandler = async e => {
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append("csv-file", file)
    setUploading(true)

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userLogin.userInfo.token}`
        }
      }
      console.log("formData: ", formData.get("csv-file"))
      const { data } = await axios.post("/api/importdata", formData, config)
      console.log("data: ", data)

      setData(data)
      setUploading(false)
    } catch (error) {
      console.error(error)
      setUploading(false)
    }
  }

  const submitHandler = () => {
    console.log("submitHandler")
  }

  return (
    <>
      <Meta title="Admin | Woolunatics" />
      <Row>
        <Col md={4} sm={12}></Col>
        <Col md={8}>
          <h2>Admin Interface</h2>
          <Form onSubmit={submitHandler} id="UploadCsvData">
            <Form.Group controlId="csv-file">
              <Row>
                <Col sm="2">
                  <Form.Label>Update Products by uploading CSV file (fields separated by commas)</Form.Label>
                </Col>
                <Col>
                  <Form.File //
                    id="csv-file"
                    label="Choose Csv File"
                    custom
                    onChange={uploadCsvFileHandler}
                    accept="text/csv"
                  ></Form.File>
                </Col>
              </Row>
            </Form.Group>
          </Form>
          {uploading && <Loader />}
          {!uploading && data.success && (
            <Message variant="success">
              File {data.fileName} successfully uploaded! {data.rowCount}
            </Message>
          )}
          <Jumbotron>
            <p>
              This is a form for uploading product data (<span className="text-danger">inserts new products ONLY</span>)
            </p>
            <p>
              File example here: <a href="https://docs.google.com/spreadsheets/d/1YpUqced7qPwX1tomarHuTFO9BGcNOeXGdNqbeKfqqxk/edit?usp=sharing">https://docs.google.com/spreadsheets/... </a>
            </p>
            System is looking for next headers in any order:
            <Table striped hover responsive className="table-sm product-list">
              <thead>
                <tr>
                  <th>category</th>
                  <th>brand</th>
                  <th>name</th>
                  <th>colorWay</th>
                  <th>color</th>
                  <th>fibers</th>
                  <th>inStock</th>
                  <th>nm</th>
                  <th>price</th>
                  <th>meterage</th>
                </tr>
              </thead>
            </Table>
            <ol>
              <li>
                save/export excel file as <strong>.csv</strong> (text file with comma separated fields) to your computer
              </li>
              <li>
                upload <strong>.csv</strong> file via this field.
              </li>
            </ol>
            <p className="text-danger">File may contain any other columns and order of columns does not matter</p>.
          </Jumbotron>
        </Col>
      </Row>
    </>
  )
}

export default AdminScreen
