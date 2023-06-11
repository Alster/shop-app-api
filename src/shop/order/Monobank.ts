import { MonobankInvoiceStatusEnum } from '../../../shop-shared/dto/order/Monobank';

export interface IMonobankCreateInvoiceResponseDto {
  invoiceId: string;
  pageUrl: string;
}

export interface IMonobankErrorDto {
  errCode: string;
  errText: string;
}

export const isIMonobankError = (obj: any): obj is IMonobankErrorDto => {
  return obj.errCode && obj.errText;
};

export interface IMonobankWebhookDto {
  invoiceId: string;
  status: MonobankInvoiceStatusEnum;
  failureReason: string;
  amount: number;
  ccy: number;
  finalAmount: number;
  createdDate: string;
  modifiedDate: string;
  reference: string;
  cancelList: any[];
  walletData: {
    cardToken: string;
    walletId: string;
    status: 'new' | 'created' | 'failure';
  };
}
