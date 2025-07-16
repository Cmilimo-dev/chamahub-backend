import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, Trash2, CheckCircle } from 'lucide-react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useToast } from '@/components/ui/use-toast';

interface PaymentMethodsModalProps {
  children: React.ReactNode;
}

const PaymentMethodsModal = ({ children }: PaymentMethodsModalProps) => {
  const { paymentMethods, addPaymentMethod, deletePaymentMethod, loading } = usePaymentMethods();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    method_type: 'mobile_money' as const,
    provider: '',
    account_identifier: '',
    account_name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await addPaymentMethod({
      method_type: formData.method_type,
      provider: formData.provider,
      account_identifier: formData.account_identifier,
      account_name: formData.account_name,
      is_primary: paymentMethods.length === 0,
      is_verified: false
    });

    if (success) {
      toast({
        title: "Payment method added",
        description: "Your payment method has been added successfully.",
      });
      setFormData({
        method_type: 'mobile_money',
        provider: '',
        account_identifier: '',
        account_name: ''
      });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deletePaymentMethod(id);
    if (success) {
      toast({
        title: "Payment method removed",
        description: "Your payment method has been removed successfully.",
      });
    }
  };

  const getMethodIcon = (type: string) => {
    return <CreditCard className="h-5 w-5" />;
  };

  const getMethodTypeLabel = (type: string) => {
    switch (type) {
      case 'mobile_money': return 'Mobile Money';
      case 'bank_account': return 'Bank Account';
      case 'credit_card': return 'Credit Card';
      case 'debit_card': return 'Debit Card';
      default: return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payment Methods</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Existing Payment Methods */}
          <div>
            <h3 className="text-lg font-medium mb-3">Your Payment Methods</h3>
            {paymentMethods.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No payment methods added yet</p>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <Card key={method.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getMethodIcon(method.method_type)}
                          <div>
                            <p className="font-medium">{method.provider}</p>
                            <p className="text-sm text-gray-600">{method.account_identifier}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline">
                                {getMethodTypeLabel(method.method_type)}
                              </Badge>
                              {method.is_primary && (
                                <Badge>Primary</Badge>
                              )}
                              {method.is_verified && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(method.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Add New Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="method_type">Payment Type</Label>
                  <Select 
                    value={formData.method_type} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, method_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="bank_account">Bank Account</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Input
                    id="provider"
                    value={formData.provider}
                    onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                    placeholder={formData.method_type === 'mobile_money' ? 'M-Pesa, Airtel Money, etc.' : 'Bank name or card issuer'}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="account_identifier">
                    {formData.method_type === 'mobile_money' ? 'Phone Number' : 
                     formData.method_type === 'bank_account' ? 'Account Number' : 'Card Number'}
                  </Label>
                  <Input
                    id="account_identifier"
                    value={formData.account_identifier}
                    onChange={(e) => setFormData(prev => ({ ...prev, account_identifier: e.target.value }))}
                    placeholder={formData.method_type === 'mobile_money' ? '+254712345678' : 
                                formData.method_type === 'bank_account' ? '1234567890' : '**** **** **** 1234'}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="account_name">Account Name</Label>
                  <Input
                    id="account_name"
                    value={formData.account_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
                    placeholder="Account holder name"
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Adding..." : "Add Payment Method"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodsModal;
