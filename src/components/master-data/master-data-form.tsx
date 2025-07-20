// src/components/master-data/master-data-form.tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type Field = {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "checkbox" | "time";
  options?: string[];
};

interface MasterDataFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  defaultValues?: any | null;
  fields: Field[];
  title: string;
}

export function MasterDataForm({
  isOpen,
  onClose,
  onSave,
  defaultValues,
  fields,
  title,
}: MasterDataFormProps) {
  const { register, handleSubmit, control, watch } = useForm({
    defaultValues: defaultValues || {},
  });
  
  const onSubmit = (data: any) => {
    // Process data before saving if necessary
    const processedData = { ...data };
    fields.forEach(field => {
        if (field.type === 'number') {
            processedData[field.name] = Number(processedData[field.name]);
        }
        if (field.name === 'subject_ids' && typeof processedData[field.name] === 'string') {
            processedData[field.name] = processedData[field.name].split(',').map(s => s.trim());
        }
    });
    onSave(processedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.type === "select" ? (
                <Controller
                    control={control}
                    name={field.name}
                    render={({ field: { onChange, value } }) => (
                        <Select onValueChange={onChange} defaultValue={value}>
                            <SelectTrigger>
                                <SelectValue placeholder={`Pilih ${field.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options?.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
              ) : field.type === "checkbox" ? (
                 <Controller
                    name={field.name}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                         <Checkbox
                            checked={value}
                            onCheckedChange={onChange}
                          />
                    )}
                  />
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  {...register(field.name)}
                />
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
