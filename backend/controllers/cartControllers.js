import asyncHandler from "express-async-handler"
import Cart from "../models/cartModel.js"
import Product from "../models/productModel.js"
import { checkQtyInHolds, checkQtyInMinMax, recalculateInStock, checkIfHoldBelongsCurrentUser } from "../utils/utils.js"

const holdTime = 300000

const fillTheCartWithData = async cart => {
  console.log("================================== fillTheCartWithData:")
  const prodIds = cart.items.map(it => it.product) //------------------------------- collect cartItem's IDs
  const products = await Product.find({ _id: { $in: prodIds } }) //----------------- find Products with those IDs
  const prodMap = {}
  products.map(prod => {
    prodMap[prod._id] = prod //----------------------------------------- build a map of Products
    recalculateInStock(prodMap[prod._id])
  })
  const itemsData = cart.items //--------------------------------------------------- iterate by Cart Items
    .map(it => {
      let result = {
        qty: it.qty, //-------------------------------------------------- take item's properties to resultItem
        art: it.art,
        brand: it.brand,
        name: it.name,
        color: it.color,
        meterage: it.meterage,
        fibers: it.fibers,
        image: it.image,
        price: it.price
      }
      console.log("------------------------- fillTheCartWithData: item: " + it.art + " - " + it.qty)
      if (prodMap[it.product]) {
        //--------------------------------------------------------------------- if Product exists in Map
        let product = prodMap[it.product] // ------------------ take Product properties from Map to resultItem
        result.price = product.price
        result.product = product

        if (product.outOfStock) {
          result.message = "out of stock" //------------------------------------- if Product Out Of Stock
        } else if (product.inStock) {
          console.log("totalInStock BEFORE: ", prodMap[it.product].totalInStock)
          prodMap[it.product].totalInStock -= it.qty
          console.log("totalInStock AFTER: ", prodMap[it.product].totalInStock)
          const arr = prodMap[it.product].arrayInStock
          let index = arr.indexOf(it.qty)
          console.log("fillTheCartWithData: index: ", index)
          if (index >= 0) {
            arr.splice(index, 1).join(",") //--------------------------- if ARR includes it.qty, exclude it
            console.log("fillTheCartWithData: arr: ", arr)
            prodMap[it.product].inStock = arr.join(",")

            recalculateInStock(prodMap[it.product])

            console.log("FILTERED.inStock: ", prodMap[it.product].inStock)
            console.log("FILTERED.totalInStock: ", prodMap[it.product].totalInStock)
            console.log("FILTERED.arrayInStock: ", prodMap[it.product].arrayInStock)
          } else {
            //---------------------------------------------------------------- if ARR DOES NOT includes it.qty,

            if (product.minimum > 0) {
              let qtyInMinMax = checkQtyInMinMax(it.qty, product)
              let isQtyInHolds = checkQtyInHolds(it.qty, product, cart.user)
              console.log("IF QTY BETWEEN MIN and MAX: ", qtyInMinMax)
              if (qtyInMinMax) {
                arr[arr.length - 1] = arr[arr.length - 1] - it.qty //----------------- REMOVE QTY from Stock
                prodMap[it.product].inStock = arr.join(",")
                console.log("----------------------- inStock after removing it.qty: ", prodMap[it.product].inStock)
              } else {
                result.message = "weight not found"
              }
            } else {
              result.message = "weight not found"
            }
          }
        } else {
          result.message = "out of stock"
        }
      } else {
        result.message = "product not found"
        result.price = 0
        result.product = it.product
      }
      return result
    })
  cart.items = itemsData
  return cart
}

// @desc Get Cart
// @route POST /api/cart/:userId
// @access Private
export const getCart = asyncHandler(async (req, res) => {
  console.log("======================getCart: req.params: ", req.params)
  console.log("getCart: req.body: ", req.body)
  const itemsFromLocalCart = req.body
  console.log("getCart: itemsFromLocalCart: ", itemsFromLocalCart)
  const cart = await Cart.findOne({ user: req.params.userId }).populate("user", "storecredit address phone")
  let updatedCart = {}
  if (cart) {
    console.log("getCart: itemsFromLocalCart: ", itemsFromLocalCart)
    console.log("getCart: cart.items.length: ", cart.items.length)
    if (itemsFromLocalCart) {
      cart.items = [...itemsFromLocalCart, ...cart.items]
      console.log("getCart: +itemsFromLocalCart=cart.items.length: ", cart.items.length)
      let newCart = await cart.save()
      updatedCart = await fillTheCartWithData(newCart)
    } else {
      updatedCart = await fillTheCartWithData(cart)
    }
    console.log("//======================getCart: updatedCart: ", updatedCart)
    res.json(updatedCart)
  } else {
    console.log("======================getCart: ELSE: ")
    if (itemsFromLocalCart) {
      const newCart = new Cart({
        user: req.params.userId,
        items: itemsFromLocalCart
      })
      let updatedNewCart = await newCart.save()
      console.log("updatedNewCart: ", updatedNewCart)
      updatedCart = await fillTheCartWithData(updatedNewCart)
      console.log("//======================getCart: ELSE: updatedCart: ", updatedCart)
      if (updatedCart) {
        res.status(200).json(updatedCart)
      }
    } else {
      res.status(200).json({ message: "Your cart is empty" })
    }
  }
  // res.status(404)
  // throw new Error("Can not find a product")
})

// @desc Add Item to Cart
// @route POST /api/cart
// @access Private
export const addItemToCart = asyncHandler(async (req, res) => {
  let updatedCart = {}
  const { user, productId, qty } = req.body
  const newItem = { user, productId, qty }
  let product = {}
  try {
    try {
      product = await Product.findById(productId) //------------- get Product from DB
      if (product) {
        console.log("addItemToCart: product._id: ", product._id)
        newItem.product = productId //------------- take data from Product
        newItem.art = product.art
        newItem.brand = product.brand
        newItem.name = product.name
        newItem.color = product.color
        newItem.fibers = product.fibers
        newItem.meterage = product.meterage
        newItem.image = product.image[0] || ""
        newItem.price = product.price
      }
    } catch (err) {
      console.log("Error on finding Product by Id: ", err)
    }

    const cart = await Cart.findOne({ user: user }).populate("user", "storecredit address phone") //------------- get Cart from DB
    if (cart) {
      console.log("addItemToCart: cart._id: ", cart._id)
      let qtyMayBeAdded = checkIfEnoughQtyInStock(cart, product, qty)
      console.log("addItemToCart: qtyMayBeAdded: ", qtyMayBeAdded)

      if (qtyMayBeAdded) {
        // checkIfHoldBelongsCurrentUser(cart, user, product, qty)
        cart.items = [newItem, ...cart.items]
        updatedCart = await cart.save()
        console.log("addItemToCart: updatedCart: ", updatedCart)
      } else {
        res.status(401)
        throw new Error("Weight " + qty + " can not be added to the Cart")
      }
    } else {
      const newCart = new Cart({
        user,
        items: [newItem]
      })
      updatedCart = await newCart.save()
    }
    let resultCart = await fillTheCartWithData(updatedCart)
    res.status(201).json(resultCart)
  } catch {
    res.status(401)
    throw new Error("Weight " + qty + " can not be added to the Cart")
  }
})

// @desc Checking Weight is available to add to the cart:
// Calculate total in stock,
// filter cart items relevant to current item
// iterate by relevant items and substract their qty from total in stock
// finally if total in stock still positive and if total - qty still bigger or equal 0
// return true, otherwise false
const checkIfEnoughQtyInStock = (cart, product, qty) => {
  product.totalInStock = product.inStock.split(",").reduce((acc, el) => acc + Number(el.trim()), 0)
  product.arrayInStock = product.inStock.split(",").map(el => Number(el.trim()))
  let relevantItems = cart.items.filter(it => String(it.product._id) === String(product._id))
  console.log("checkIfEnoughQtyInStock: totalInStock: ", product.totalInStock)
  console.log("checkIfEnoughQtyInStock: arrayInStock: ", product.arrayInStock)
  console.log("checkIfEnoughQtyInStock: relevantItems.length: ", relevantItems.length)
  relevantItems.map(it => {
    let index = product.arrayInStock.indexOf(Number(it.qty))
    console.log("checkIfEnoughQtyInStock: index: ", index)
    if (index >= 0) {
      product.arrayInStock.splice(index, 1) //--------- if qty in arrayInStock, remove it from totalInStock
      product.totalInStock -= it.qty
    } else if (product.minimum > 0) {
      let qtyInMinMax = checkQtyInMinMax(it.qty, product)
      if (qtyInMinMax) {
        product.totalInStock -= it.qty //--------- if qty in MinMax, remove it from totalInStock
      } else {
        console.log("QTY IS NOT IN CONES WEIGHTS AND ALSO IS NOT IN MIN-MAX DIAPASON")
      }
    }
  })

  console.log("checkIfEnoughQtyInStock: totalInStock after relevant items: ", product.totalInStock)
  console.log("checkIfEnoughQtyInStock: arrayInStock after relevant items: ", product.arrayInStock)

  if (product.totalInStock > 0) {
    console.log("checkIfEnoughQtyInStock: totalInStock > 0")
    let index = product.arrayInStock.indexOf(Number(qty)) //--- if Qty in cones array
    console.log("checkIfEnoughQtyInStock: index: ", index)

    if (index >= 0) {
      console.log("checkIfEnoughQtyInStock: index >= 0")
      return true
    } else if (checkQtyInMinMax(qty, product)) {
      console.log("checkIfEnoughQtyInStock: ELSE 1")
      return true
    } else {
      console.log("checkIfEnoughQtyInStock: ELSE 2")
      return false
    }
  } else {
    console.log("checkIfEnoughQtyInStock: ELSE 3")
    return false
  }
}

// @desc Remove Item from Cart
// @route PUT /api/cart/:userId
// @access Private
export const removeItemFromCart = asyncHandler(async (req, res) => {
  const productId = req.body.productId
  const qty = req.body.qty
  const userId = req.params.userId
  console.log("removeItemFromCart: req.params: ", req.params)
  console.log("removeItemFromCart: req.body: ", req.body)
  const cart = await Cart.findOne({ user: userId }).populate("user", "storecredit address phone")
  if (cart) {
    const index = cart.items.findIndex(item => item.product == productId && item.qty == qty)
    console.log("removeItemFromCart: index: ", index)

    cart.items.splice(index, index >= 0 ? 1 : 0)
    console.log("removeItemFromCart: cart.items: ", cart.items)

    let filteredCart = await cart.save()
    console.log("removeItemFromCart: filteredCart.items.length: ", filteredCart.items.length)

    let updatedCart = await fillTheCartWithData(filteredCart)
    console.log("removeItemFromCart: updatedCart.items.length: ", updatedCart.items.length)

    res.status(201).json(updatedCart)
  } else {
    res.status(404)
    throw new Error("Cart not found")
  }
})

// @desc Start Checkout
// @route PUT /api/cart/startcheckout
// @access Private
export const startCheckout = asyncHandler(async (req, res) => {
  const { user } = req.body
  console.log("startCheckout: user: ", user)
  const cart = await Cart.findOne({ user: user }).populate("user", "storecredit address phone")
  const prodMap = {} //

  if (cart) {
    const updatedProducts = await Promise.all(
      cart.items.map(async item => {
        const product = await Product.findById(item.product)
        if (product) {
          console.log("--------------------------------startCheckout: product._id: ", product._id)
          if (!prodMap[product._id]) {
            prodMap[product._id] = product
          }
          prodMap[product._id].onHold.push({
            qty: item.qty,
            user: user,
            lockedAt: Date.now()
          })

          const arr = prodMap[product._id].inStock.split(",").sort((a, b) => a - b)

          console.log("prodMap[product._id].outOfStock: ", prodMap[product._id].outOfStock)
          console.log("prodMap[product._id].inStock: ", prodMap[product._id].inStock)

          if (arr.length === 1 && Number(arr[0]) === Number(item.qty)) {
            //--------------------------------------- if only one weight is in Stock and is equal item.qty
            console.log("arr.length: ", arr.length)
            console.log("arr.length === 1: ", arr.length === 1)
            prodMap[product._id].outOfStock = true
            prodMap[product._id].inStock = ""
          } else {
            const index = arr.indexOf(String(item.qty)) //----------------------------- else find an index
            if (index !== -1) {
              //----------------------------------------------------- if index found
              arr.splice(index, 1)
              console.log("arr after splice: ", arr)
            } else {
              if (product.minimum > 0) {
                //--------------------------------------------------------------------- if no index found check minimum
                let minLeftover = Math.ceil(((1500 / product.meterage) * 100) / 100) * 100
                let maxVal = arr[arr.length - 1] - minLeftover
                if (item.qty >= product.minimum && item.qty <= maxVal) {
                  console.log("/////item.qty: ", `${item.qty} >= ${product.minimum} && ${item.qty} <= ${maxVal}`)
                  console.log("before replacing arr: ", arr)
                  arr.splice(arr.length - 1, 1, arr[arr.length - 1] - item.qty) // remove qty from biggest cone
                  console.log("after replacing arr: ", arr)
                } else {
                  console.log(`Error: Qty not found in Stock: ${item.qty}g in ${item.brand} ${item.name} ${item.color}`)
                  res.status(404)
                  throw new Error(`Qty not found in Stock: ${item.qty}g in ${item.brand} ${item.name} ${item.color}`)
                }
              } else {
                console.log(`Error: Qty not found in Stock: ${item.qty}g in ${item.brand} ${item.name} ${item.color}`)
                res.status(404)
                throw new Error(`Qty not found in Stock: ${item.qty}g in ${item.brand} ${item.name} ${item.color}`)
              }
            }
            prodMap[product._id].inStock = arr.join(",")
          }
          console.log("prodMap[product._id].outOfStock: ", prodMap[product._id].outOfStock)
          console.log("prodMap[product._id].inStock: ", prodMap[product._id].inStock)
          console.log("prodMap[product._id].onHold: ", prodMap[product._id].onHold)
          return await product.save()
        } else {
          console.log("Error: Product not found: ", item.qty)
          res.status(404)
          throw new Error(`Product not found: ${item.brand} ${item.name} ${item.color}`)
        }
      })
    )

    if (updatedProducts) {
      Object.keys(prodMap).map(async key => {
        let id = prodMap[key]._id
        let update = {
          $set: {
            outOfStock: prodMap[key].outOfStock,
            inStock: prodMap[key].inStock,
            onHold: prodMap[key].onHold
          }
        }
        let options = { upsert: false }

        await Product.findByIdAndUpdate(id, update, options)
          .then(result => {
            const { matchedCount, modifiedCount } = result
            if (matchedCount && modifiedCount) {
              console.log(`/////////////////////Successfully updated the item. `, matchedCount, modifiedCount)
            }
          })
          .catch(err => console.error(`Failed to update the item: ${err}`))
      })
      res.status(201).json(cart)
    }
  } else {
    res.status(404)
    throw new Error("Cart not found")
  }
})
