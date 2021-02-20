import path from "path"
import express from "express"
import multer from "multer"
import fs from "fs"
import csv from "fast-csv"
import Product from "../models/productModel.js"

const router = express.Router()

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/imports")
  },
  filename(req, file, cb) {
    cb(null, `data-${new Date().toISOString().slice(0, 13)}${path.extname(file.originalname)}`)
  }
})

function checkFileType(file, cb) {
  const filetypes = /csv/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)
  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb("Csv only!")
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    console.log("csvUploadRoutes.const.upload")
    checkFileType(file, cb)
  }
})

router.post("/", upload.single("csv-file"), async (req, res) => {
  console.log("req.file: ", req.file)
  let updatedProducts = 0
  let newlyAddedProducts = 0

  fs.createReadStream(req.file.path)
    .pipe(csv.parse({ headers: true }))
    .on("error", error => console.error(error))
    .on("data", async row => {
      let newData = {}
      if (row.art) {
        newData.art = row.art.trim()
      }
      if (row.brand) {
        newData.brand = row.brand.trim()
      }
      if (row.name) {
        newData.name = row.name.trim()
      }
      if (row.color) {
        newData.color = row.color.trim()
      }
      if (row.colorWay) {
        newData.colorWay = row.colorWay.trim()
      }
      if (row.category) {
        newData.category = row.category.trim()
      }
      if (row.meterage) {
        newData.meterage = Number(row.meterage)
      }
      if (row.fibers) {
        newData.fibers = row.fibers.trim()
      }
      if (row.price) {
        newData.price = Number(row.price.replace(/[ €]+/g, ""))
      }
      if (row.nm) {
        newData.nm = row.nm.trim()
      }
      if (row.minimum) {
        newData.minimum = Number(row.minimum) | 0
      }
      if (row.inStock) {
        newData.inStock = row.inStock.trim()
      }
      if (Number(row.novelty) === 1) {
        newData.novelty = true
      } else {
        newData.novelty = false
      }
      if (Number(row.regular) === 1) {
        newData.regular = true
      } else {
        newData.regular = false
      }
      if (Number(row.inSale) === 1) {
        newData.inSale = true
      } else {
        newData.inSale = false
      }
      if (Number(row.outOfStock) === 1) {
        newData.outOfStock = true
      } else {
        newData.outOfStock = false
      }
      newData.user = `5fc6e1458fa9f7a30eaf05ec`

      let product = await Product.findOne({ brand: row.brand, name: row.name, color: row.color })
      if (product) {
        product.art = newData.art || product.art
        product.colorWay = newData.colorWay || product.colorWay
        product.category = newData.category || product.category
        product.meterage = newData.meterage || product.meterage
        product.fibers = newData.fibers || product.fibers
        product.price = newData.price || product.price
        product.nm = newData.nm || product.nm
        product.minimum = newData.minimum || product.minimum
        product.novelty = newData.novelty || product.novelty
        product.regular = newData.regular || product.regular
        product.inSale = newData.inSale || product.inSale
        product.outOfStock = newData.outOfStock || product.outOfStock
        product.inStock = newData.inStock || product.inStock
        // product.inStock = product.inStock + "," + newData.inStock
        product.user = `5fc6e1458fa9f7a30eaf05ec`

        let result = await product.save()
        if (result) {
          updatedProducts++
          console.log("--------------------Product.save: result: ", result)
          // res.json(newProduct)
        } else {
          res.status(400)
          throw new Error({ message: "Can not updated Product" })
        }
      } else {
        let newProduct = await Product.create(newData)
        if (newProduct) {
          newlyAddedProducts++
          console.log("--------------------Product.create: newProduct: ", newProduct)
          // res.json(newProduct)
        } else {
          res.status(400)
          throw new Error({ message: "Can not save New Product" })
        }
      }

      console.log("++++++++++++++++++updatedProducts, newlyAddedProducts: ", updatedProducts, newlyAddedProducts)
    })
    .on("end", async rowCount => {
      console.log(`================================Parsed ${rowCount} rows`)
    })
  res.json({ success: true, fileName: req.file.path, rows: rowCount, updatedProducts, newlyAddedProducts })
})

export default router