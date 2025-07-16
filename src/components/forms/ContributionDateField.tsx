
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ContributionDateFieldProps {
  date: Date;
  onChange: (date: Date) => void;
}

const ContributionDateField = ({ date, onChange }: ContributionDateFieldProps) => {
  return (
    <div>
      <Label>Contribution Date</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => selectedDate && onChange(selectedDate)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ContributionDateField;
