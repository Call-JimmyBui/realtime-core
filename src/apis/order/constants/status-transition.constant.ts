
import { ROLE } from '@/constants/entity-enum.constant';
import { OrderStatus } from '../enums/order-status.enum';

const USER_TRANSITIONS = {
  [OrderStatus.Pending]: [OrderStatus.Paid],
  [OrderStatus.Paid]: [],
  [OrderStatus.Shipped]: [],
  [OrderStatus.Delivered]: [], 
};

const ADMIN_TRANSITIONS = {
  [OrderStatus.Pending]: [OrderStatus.Paid, OrderStatus.Shipped, OrderStatus.Delivered],
  [OrderStatus.Paid]: [OrderStatus.Shipped, OrderStatus.Delivered],
  [OrderStatus.Shipped]: [OrderStatus.Delivered], 
  [OrderStatus.Delivered]: [],
};

export const TRANSITION_RULES = {
  [ROLE.USER]: USER_TRANSITIONS,
  [ROLE.SUPER_ADMIN]: ADMIN_TRANSITIONS,
  [ROLE.ADMIN]: ADMIN_TRANSITIONS,
};