export type PaymentMethodType = 'CARD' | 'WALLET' | 'KIOSK';
export type PaymentOrderStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface InitiatePaymentRequest {
  method: PaymentMethodType;
  amountCents: number;
  currency: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface InitiatePaymentResponse {
  ref: string;
  method: PaymentMethodType;
  status: PaymentOrderStatus;
  redirectUrl: string | null;
  billReference: string | null;
}
