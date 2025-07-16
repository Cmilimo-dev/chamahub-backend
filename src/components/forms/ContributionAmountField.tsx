
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Group } from "@/types";

interface ContributionAmountFieldProps {
  amount: number;
  selectedGroup: Group | undefined;
  onChange: (amount: number) => void;
}

const ContributionAmountField = ({ amount, selectedGroup, onChange }: ContributionAmountFieldProps) => {
  const minAmount = selectedGroup?.minContributionAmount || 0;
  const maxAmount = selectedGroup?.maxContributionAmount;

  return (
    <div>
      <Label htmlFor="amount">Amount (KES)</Label>
      <Input
        id="amount"
        type="number"
        min={minAmount || 0}
        max={maxAmount && maxAmount > 0 ? maxAmount : undefined}
        value={amount}
        onChange={(e) => onChange(Number(e.target.value))}
        required
      />
      {(minAmount || maxAmount) && (
        <p className="text-xs text-gray-500 mt-1">
          {minAmount && maxAmount 
            ? `Range: KES ${minAmount.toLocaleString()} - ${maxAmount.toLocaleString()}`
            : minAmount 
              ? `Minimum: KES ${minAmount.toLocaleString()}`
              : `Maximum: KES ${maxAmount?.toLocaleString()}`
          }
        </p>
      )}
    </div>
  );
};

export default ContributionAmountField;
