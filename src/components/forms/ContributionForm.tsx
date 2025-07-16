
import { Button } from "@/components/ui/button";
import { useContributionForm } from "@/hooks/useContributionForm";
import ContributionAmountField from "./ContributionAmountField";
import ContributionDateField from "./ContributionDateField";
import GroupSelector from "./GroupSelector";
import NotesField from "./NotesField";
import PaymentMethodSelector from "./PaymentMethodSelector";
import type { Group } from "@/types";

interface ContributionFormProps {
  groups: Group[];
  initialGroupId?: string;
  initialAmount?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const ContributionForm = ({ 
  groups, 
  initialGroupId, 
  initialAmount, 
  onSuccess, 
  onCancel 
}: ContributionFormProps) => {
  const {
    formData,
    selectedGroup,
    loading,
    updateFormData,
    handleGroupChange,
    submitContribution
  } = useContributionForm({
    groups,
    initialGroupId,
    initialAmount,
    onSuccess
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitContribution();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <GroupSelector
        groups={groups}
        selectedGroupId={formData.selectedGroup}
        onChange={handleGroupChange}
      />

      <ContributionAmountField
        amount={formData.amount}
        selectedGroup={selectedGroup}
        onChange={(amount) => updateFormData({ amount })}
      />

      <ContributionDateField
        date={formData.contribution_date}
        onChange={(date) => updateFormData({ contribution_date: date })}
      />

      <PaymentMethodSelector
        paymentMethod={formData.payment_method}
        paymentMethodId={formData.payment_method_id}
        phoneNumber={formData.phone_number}
        onPaymentMethodChange={(method) => updateFormData({ payment_method: method })}
        onPaymentMethodIdChange={(id) => updateFormData({ payment_method_id: id })}
        onPhoneNumberChange={(phone) => updateFormData({ phone_number: phone })}
      />

      <NotesField
        notes={formData.notes}
        onChange={(notes) => updateFormData({ notes })}
      />

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Recording..." : "Record Contribution"}
        </Button>
      </div>
    </form>
  );
};

export default ContributionForm;
