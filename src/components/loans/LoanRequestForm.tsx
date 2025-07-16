
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Group {
  id: string;
  name: string;
  role?: string;
}

interface LoanFormData {
  groupId: string;
  amount: string;
  purpose: string;
  durationMonths: string;
}

interface LoanRequestFormProps {
  formData: LoanFormData;
  setFormData: (data: LoanFormData | ((prev: LoanFormData) => LoanFormData)) => void;
  eligibleGroups: Group[];
}

const LoanRequestForm = ({ formData, setFormData, eligibleGroups }: LoanRequestFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="group">Select Group</Label>
        <Select 
          value={formData.groupId} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, groupId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a group" />
          </SelectTrigger>
          <SelectContent>
            {eligibleGroups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name} ({group.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="amount">Loan Amount (KES)</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          placeholder="Enter amount"
          min="1000"
          max="500000"
          step="100"
          required
        />
      </div>

      <div>
        <Label htmlFor="duration">Duration (Months)</Label>
        <Select 
          value={formData.durationMonths} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, durationMonths: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">6 months</SelectItem>
            <SelectItem value="12">12 months</SelectItem>
            <SelectItem value="18">18 months</SelectItem>
            <SelectItem value="24">24 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="purpose">Purpose of Loan</Label>
        <Textarea
          id="purpose"
          value={formData.purpose}
          onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
          placeholder="Describe why you need this loan..."
          required
        />
      </div>
    </div>
  );
};

export default LoanRequestForm;
