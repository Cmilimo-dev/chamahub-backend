// M-Pesa Payment Integration
// This will integrate with M-Pesa API for seamless payments

export interface MpesaPaymentRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string; // Group ID or contribution reference
  transactionDesc: string;
}

export interface MpesaPaymentResponse {
  merchantRequestID: string;
  checkoutRequestID: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
}

export class MpesaService {
  private readonly consumerKey: string;
  private readonly consumerSecret: string;
  private readonly environment: 'sandbox' | 'production';
  private readonly baseUrl: string;

  constructor() {
    this.consumerKey = import.meta.env.VITE_MPESA_CONSUMER_KEY || '';
    this.consumerSecret = import.meta.env.VITE_MPESA_CONSUMER_SECRET || '';
    this.environment = import.meta.env.VITE_MPESA_ENVIRONMENT || 'sandbox';
    this.baseUrl = this.environment === 'sandbox' 
      ? 'https://sandbox.safaricom.co.ke' 
      : 'https://api.safaricom.co.ke';
  }

  private async getAccessToken(): Promise<string> {
    const auth = btoa(`${this.consumerKey}:${this.consumerSecret}`);
    
    const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data.access_token;
  }

  async initiateSTKPush(request: MpesaPaymentRequest): Promise<MpesaPaymentResponse> {
    const accessToken = await this.getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const shortCode = import.meta.env.VITE_MPESA_SHORTCODE || '174379';
    const passkey = import.meta.env.VITE_MPESA_PASSKEY || '';
    
    const password = btoa(`${shortCode}${passkey}${timestamp}`);

    const stkPushData = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: request.amount,
      PartyA: request.phoneNumber,
      PartyB: shortCode,
      PhoneNumber: request.phoneNumber,
      CallBackURL: `${import.meta.env.VITE_APP_URL}/api/mpesa/callback`,
      AccountReference: request.accountReference,
      TransactionDesc: request.transactionDesc
    };

    const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stkPushData)
    });

    return response.json();
  }

  async queryTransactionStatus(checkoutRequestID: string): Promise<any> {
    const accessToken = await this.getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const shortCode = import.meta.env.VITE_MPESA_SHORTCODE || '174379';
    const passkey = import.meta.env.VITE_MPESA_PASSKEY || '';
    
    const password = btoa(`${shortCode}${passkey}${timestamp}`);

    const queryData = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID
    };

    const response = await fetch(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(queryData)
    });

    return response.json();
  }
}

export const mpesaService = new MpesaService();
