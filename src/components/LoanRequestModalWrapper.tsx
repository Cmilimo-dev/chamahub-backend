
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import LoanRequestModal from './LoanRequestModal';

interface LoanRequestModalWrapperProps {
  children: React.ReactNode;
  groupId?: string;
}

const LoanRequestModalWrapper = ({ children, groupId }: LoanRequestModalWrapperProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Loan</DialogTitle>
        </DialogHeader>
        <LoanRequestModal />
      </DialogContent>
    </Dialog>
  );
};

export default LoanRequestModalWrapper;
