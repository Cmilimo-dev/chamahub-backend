
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface LoanDisbursementModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: {
    id: string;
    amount: number;
    purpose: string;
    chama_groups: { name: string };
  } | null;
  onDisburse: (loanId: string, amount: number, method: string, reference?: string, notes?: string) => Promise<boolean>;
}

const LoanDisbursementModal = ({ isOpen, onClose, loan, onDisburse }: LoanDisbursementModalProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loan || !amount || !method) return;

    setIsProcessing(true);
    
    try {
      const success = await onDisburse(
        loan.id,
        parseFloat(amount),
        method,
        reference || undefined,
        notes || undefined
      );

      if (success) {
        toast({
          title: "Loan Disbursed",
          description: `KES ${parseFloat(amount).toLocaleString()} has been successfully disbursed.`,
        });
        onClose();
        resetForm();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disburse loan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setMethod('');
    setReference('');
    setNotes('');
  };

  // Set default amount when loan changes
  useEffect(() => {
    if (loan && isOpen) {
      setAmount(loan.amount.toString());
    }
  }, [loan, isOpen]);

  if (!loan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Disburse Loan</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">{loan.chama_groups.name}</p>
            <p className="text-sm text-gray-600">Approved Amount: KES {loan.amount.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Purpose: {loan.purpose}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Disbursement Amount *</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to disburse"
                required
                min="1"
                max={loan.amount}
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum: KES {loan.amount.toLocaleString()}
              </p>
            </div>

            <div>
              <Label htmlFor="method">Disbursement Method *</Label>
              <Select value={method} onValueChange={setMethod} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select disbursement method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Transaction reference (optional)"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes (optional)"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing || !amount || !method}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : 'Disburse Loan'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoanDisbursementModal;
