import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ConnectDomainDialog({ open, onOpenChange, onNext }) {
  const [domainInput, setDomainInput] = useState("");

  useEffect(() => {
    if (!open) setDomainInput("");
  }, [open]);

  const handleNext = () => {
    onNext?.(domainInput.trim());
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="pr-8 text-left">
            Connect existing domain
          </DialogTitle>
        </DialogHeader>
        <Input
          id="connect-domain"
          label="Domain"
          placeholder="example.com, shop.example.com"
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
          autoComplete="off"
        />
        <DialogFooter className="gap-2 sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleNext}>
            Next
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
