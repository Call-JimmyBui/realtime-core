
export enum CacheKey {

  SESSION_BLACKLIST = 'auth:session-blacklist:%s', // %s: sessionId
  EMAIL_VERIFICATION = 'auth:token:%s:email-verification', // %s: userId
  PASSWORD_RESET = 'auth:token:%s:password', // %s: userId

  PRODUCT_FIND_ONE = 'product:find_one:%s', // %s: productId
  CART_FIND_ONE = 'cart:find_one:%', // %s: cartId

  ORDER_FIND_ONE = 'order:find_one:%s', // %s: orderId
  USER_ORDERS = 'order:user:%s', // %s: userId
}