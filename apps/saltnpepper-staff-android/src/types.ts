export type User = {
  id: string;
  email: string;
  name: string | null;
  role: "OWNER" | "STAFF";
};

export type Session = {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  user: User;
};

export type AllowedActions = {
  nextStatus: string | null;
  canConfirmCash: boolean;
  canCancel: boolean;
  canRefundAndCancel: boolean;
};

export type Order = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  fulfillmentType: "DELIVERY" | "PICKUP";
  status: string;
  paymentMethod: string;
  scheduledFor: string | null;
  estimatedReadyAt: string | null;
  totalRappen: number;
  remainingRefundableRappen: number;
  version: number;
  note: string | null;
  address?: {
    street: string;
    streetExtra: string | null;
    postalCode: string;
    city: string;
  } | null;
  items: Array<{
    id: string;
    productNameDeSnapshot: string;
    productNameEnSnapshot: string;
    variantNameDeSnapshot: string | null;
    variantNameEnSnapshot: string | null;
    quantity: number;
    lineSubtotalRappen: number;
    options: Array<{ nameDeSnapshot: string; nameEnSnapshot: string }>;
  }>;
  allowedActions: AllowedActions;
};
