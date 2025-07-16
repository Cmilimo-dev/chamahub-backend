
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CreateGroupModal from './CreateGroupModal';

interface CreateGroupModalWrapperProps {
  children: React.ReactNode;
  groups?: any[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CreateGroupModalWrapper = ({ children, groups, open, onOpenChange }: CreateGroupModalWrapperProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const dialogProps = open !== undefined ? { open, onOpenChange } : { open: internalOpen, onOpenChange: setInternalOpen };

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <CreateGroupModal />
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModalWrapper;
