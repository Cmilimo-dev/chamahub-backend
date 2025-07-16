
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import type { PaymentMethod } from "@/types/banking";

interface PaymentMethodSelectorProps {
  paymentMethod: string;
  paymentMethodId: string;
  phoneNumber?: string;
  onPaymentMethodChange: (method: string) => void;
  onPaymentMethodIdChange: (id: string) => void;
  onPhoneNumberChange?: (phone: string) => void;
}

const PaymentMethodSelector = ({
  paymentMethod,
  paymentMethodId,
  phoneNumber = '',
  onPaymentMethodChange,
  onPaymentMethodIdChange,
  onPhoneNumberChange
}: PaymentMethodSelectorProps) => {
  const { paymentMethods } = usePaymentMethods();

  const getFilteredPaymentMethods = (): PaymentMethod[] => {
    if (paymentMethod === 'mobile_money') return paymentMethods.filter(pm => pm.method_type === 'mobile_money');
    if (paymentMethod === 'bank_transfer') return paymentMethods.filter(pm => pm.method_type === 'bank_account');  
    if (paymentMethod === 'card') return paymentMethods.filter(pm => pm.method_type === 'credit_card' || pm.method_type === 'debit_card');
    return [];
  };

  return (
    <>
      <div>
        <Label htmlFor="payment_method">Payment Method</Label>
        <Select 
          value={paymentMethod} 
          onValueChange={(value) => {
            onPaymentMethodChange(value);
            onPaymentMethodIdChange('');
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="mpesa">M-Pesa (Direct)</SelectItem>
            <SelectItem value="mobile_money">Mobile Money (Saved)</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="card">Card</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* M-Pesa Phone Number Field */}
      {paymentMethod === 'mpesa' && onPhoneNumberChange && (
        <div>
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            id="phone_number"
            type="tel"
            placeholder="254712345678"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter phone number in format: 254712345678
          </p>
        </div>
      )}

      {/* Saved Payment Methods */}
      {paymentMethod !== 'cash' && paymentMethod !== 'mpesa' && paymentMethods.length > 0 && (
        <div>
          <Label htmlFor="payment_method_id">Select Payment Method</Label>
          <Select 
            value={paymentMethodId} 
            onValueChange={onPaymentMethodIdChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose payment method" />
            </SelectTrigger>
            <SelectContent>
              {getFilteredPaymentMethods().map((method) => (
                <SelectItem key={method.id} value={method.id}>
                  {method.provider} - {method.account_identifier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
};

export default PaymentMethodSelector;
