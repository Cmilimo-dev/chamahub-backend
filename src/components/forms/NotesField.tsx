
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NotesFieldProps {
  notes: string;
  onChange: (notes: string) => void;
}

const NotesField = ({ notes, onChange }: NotesFieldProps) => {
  return (
    <div>
      <Label htmlFor="notes">Notes (Optional)</Label>
      <Textarea
        id="notes"
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add any notes about this contribution..."
        rows={3}
      />
    </div>
  );
};

export default NotesField;
