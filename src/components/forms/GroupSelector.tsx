
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Group } from "@/types";

interface GroupSelectorProps {
  groups: Group[];
  selectedGroupId: string;
  onChange: (groupId: string) => void;
}

const GroupSelector = ({ groups, selectedGroupId, onChange }: GroupSelectorProps) => {
  if (groups.length === 0) return null;

  return (
    <div>
      <Label htmlFor="group">Select Group</Label>
      <Select value={selectedGroupId} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a group to contribute to" />
        </SelectTrigger>
        <SelectContent>
          {groups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default GroupSelector;
