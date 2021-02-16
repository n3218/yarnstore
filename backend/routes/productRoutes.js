import express from "express"
const router = express.Router()

import { createProduct, createProductReview, deleteProduct, getProductById, getProducts, updateProduct, getTopProducts, checkProductsInStock, removeItemsFromDB, deleteProductImage } from "../controllers/productControllers.js"
import { protect, admin } from "../middleware/authMiddleware.js"

router //
  .route("/")
  .get(getProducts)
  .post(protect, admin, createProduct)
router //
  .get("/top", getTopProducts)
router //
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct)
router //
  .route("/:id/reviews")
  .post(protect, createProductReview)
router //
  .route("/check")
  .post(protect, checkProductsInStock)
router //
  .route("/removefromdb")
  .post(protect, admin, removeItemsFromDB)
router //
  .route("/deleteimage/:img")
  .delete(protect, admin, deleteProductImage)

export default router
