// src/components/master-data/master-data-form.tsx
"use client";

import * as React from "react";
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
import { MultiSelect } from "@/components/ui/multi-select";

type Field = {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "checkbox" | "time" | "multiselect";
  options?: any[];
  dependsOn?: string;
  placeholder?: string;
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
  const { register, handleSubmit, control, watch, reset } = useForm({
    defaultValues: defaultValues || {},
  });
  
  const onSubmit = (data: any) => {
    // Process data before saving if necessary
    const processedData = { ...data };
    fields.forEach(field => {
        if (field.type === 'number') {
            processedData[field.name] = Number(processedData[field.name]);
        }
    });
    onSave(processedData);
  };
  
  React.useEffect(() => {
    if (isOpen) {
        const initialValues = defaultValues ? { ...defaultValues } : {
          subject_ids: [],
          class_ids: [],
          available_time_slot_ids: [],
          combined_class_ids: [],
        };
        if (initialValues.is_combined === undefined) {
            initialValues.is_combined = false;
        }
        reset(initialValues);
    }
  }, [defaultValues, reset, isOpen]);

  const isCombined = watch("is_combined");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {fields.map((field) => {
            if (field.dependsOn === 'is_combined' && !isCombined) {
                return null;
            }

            return (
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
                                      <SelectItem key={option.value || option} value={option.value || option}>
                                          {option.label || option}
                                      </SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      )}
                  />
                ) : field.type === "checkbox" ? (
                  <div className="flex items-center space-x-2">
                    <Controller
                        name={field.name}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Checkbox
                              checked={value}
                              onCheckedChange={onChange}
                              id={field.name}
                            />
                        )}
                      />
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                       {field.label}
                    </label>
                  </div>
                 ) : field.type === "multiselect" ? (
                  <Controller
                    control={control}
                    name={field.name}
                    render={({ field: { onChange, value } }) => (
                      <MultiSelect
                        options={field.options || []}
                        selected={value || []}
                        onChange={onChange}
                        placeholder={field.placeholder}
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
            )
           })}
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
