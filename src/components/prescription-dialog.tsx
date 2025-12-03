
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import type { Product, Prescription } from "@/lib/types";

const singleVisionSchema = z.object({
    prescriptionFile: z.any().optional(),
    leftDV: z.string().optional(),
    rightDV: z.string().optional(),
}).refine(data => data.prescriptionFile || (data.leftDV && data.rightDV), {
    message: "Either upload a prescription or enter values for both eyes.",
    path: ["leftDV"], 
});

const multiFocalSchema = z.object({
    prescriptionFile: z.any().optional(),
    leftDV: z.string().optional(),
    rightDV: z.string().optional(),
    leftNV: z.string().optional(),
    rightNV: z.string().optional(),
}).refine(data => data.prescriptionFile || (data.leftDV && data.rightDV && data.leftNV && data.rightNV), {
    message: "Either upload a prescription or fill all vision fields.",
    path: ["leftDV"],
});


interface PrescriptionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lens: Product;
  onProceed: (prescription: Prescription) => void;
}

export function PrescriptionDialog({ isOpen, onOpenChange, lens, onProceed }: PrescriptionDialogProps) {
  const [fileName, setFileName] = useState("");

  const isMultiFocal = lens.name.toLowerCase().includes('progressive') || lens.name.toLowerCase().includes('bifocal');
  const schema = isMultiFocal ? multiFocalSchema : singleVisionSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
        leftDV: "",
        rightDV: "",
        ...(isMultiFocal && { leftNV: "", rightNV: "" }),
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("prescriptionFile", reader.result as string);
        form.clearErrors();
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: z.infer<typeof schema>) => {
    onProceed({
        file: values.prescriptionFile,
        manual: {
            leftDV: values.leftDV,
            rightDV: values.rightDV,
            leftNV: 'leftNV' in values ? values.leftNV : undefined,
            rightNV: 'rightNV' in values ? values.rightNV : undefined,
        },
    });
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Prescription for {lens.name}</DialogTitle>
          <DialogDescription>
            Upload a prescription or manually enter your eye vision details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                <div>
                    <Label htmlFor="prescription-file">Upload Prescription</Label>
                    <div className="flex items-center gap-2 mt-2">
                        <Input id="prescription-file" type="file" onChange={handleFileChange} className="hidden" />
                        <Button type="button" variant="outline" onClick={() => document.getElementById('prescription-file')?.click()}>
                            Choose File
                        </Button>
                        <span className="text-sm text-muted-foreground truncate">{fileName || "No file chosen"}</span>
                    </div>
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                    <div className="flex-1 border-t"></div>
                    <span className="px-4">OR</span>
                    <div className="flex-1 border-t"></div>
                </div>

                <div className="space-y-4">
                    <p className="font-medium text-center">Manually Enter Eye Vision</p>
                    <div className="space-y-1">
                        <p className="font-medium text-sm text-center text-muted-foreground">Distance Vision (DV)</p>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="leftDV"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Left Eye (OD)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., -2.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="rightDV"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Right Eye (OS)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., -1.75" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {isMultiFocal && (
                        <div className="space-y-1">
                            <p className="font-medium text-sm text-center text-muted-foreground">Addition (ADD)</p>
                             <div className="grid grid-cols-2 gap-4">
                               <FormField
                                    control={form.control}
                                    name="leftNV"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Left Eye (OD)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., +1.50" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="rightNV"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Right Eye (OS)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., +1.50" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit">Proceed to Buy</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
