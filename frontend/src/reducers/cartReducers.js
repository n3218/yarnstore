import {
  //
  CART_ADD_ITEM,
  CART_CLEAR_ITEMS,
  CART_REMOVE_ITEM,
  CART_SAVE_PAYMENT_METHOD,
  CART_SAVE_SHIPPING_ADDRESS,
  CART_UPDATE_ITEM,
  CART_CLEAN_ITEMS,
  CART_CHECK_ITEMS_REQUEST,
  CART_CHECK_ITEMS_SUCCESS,
  CART_CHECK_ITEMS_FAIL,
  REMOVE_CART_ITEMS_FROM_DB_REQUEST,
  REMOVE_CART_ITEMS_FROM_DB_SUCCESS,
  REMOVE_CART_ITEMS_FROM_DB_FAIL,
  CART_ADD_ITEM_REQUEST,
  CART_ADD_ITEM_SUCCESS,
  CART_ADD_ITEM_FAIL
} from "../constants/cartConstants"

export const cartReducer = (state = { items: [] }, action) => {
  switch (action.type) {
    case CART_ADD_ITEM_REQUEST:
      return {
        loading: true
      }
    case CART_ADD_ITEM_SUCCESS:
      return {
        loading: false,
        ...action.payload
      }
    case CART_ADD_ITEM_FAIL:
      return {
        loading: false,
        items: []
      }
    case CART_REMOVE_ITEM:
      return {
        ...state,
        cartItems: state.cartItems.filter(item => !(item.qty === action.payload.qty && item.product === action.payload.id))
      }
    case CART_SAVE_SHIPPING_ADDRESS:
      return {
        ...state,
        shippingAddress: action.payload
      }
    case CART_SAVE_PAYMENT_METHOD:
      return {
        ...state,
        paymentMethod: action.payload
      }
    case CART_CLEAR_ITEMS:
      return {
        ...state,
        cartItems: []
      }
    case CART_CLEAN_ITEMS:
      return {
        ...state,
        cartItems: state.cartItems.filter(item => !item.message || item.message === "")
      }
    case CART_CHECK_ITEMS_REQUEST:
      return {
        ...state,
        loading: true
      }
    case CART_CHECK_ITEMS_SUCCESS:
      return {
        ...state,
        loading: false,
        cartItems: action.payload
      }
    case CART_CHECK_ITEMS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      }

    case REMOVE_CART_ITEMS_FROM_DB_REQUEST:
      return {
        ...state,
        loading: true
      }
    case REMOVE_CART_ITEMS_FROM_DB_SUCCESS:
      return {
        ...state,
        loading: false,
        cartItems: []
      }
    case REMOVE_CART_ITEMS_FROM_DB_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      }
    default:
      return state
  }
}
