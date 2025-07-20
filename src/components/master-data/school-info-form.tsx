// src/components/master-data/school-info-form.tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SchoolInfo } from "@/lib/types";
import Image from "next/image";
import { useState, useEffect } from "react";

interface SchoolInfoFormProps {
  schoolInfo: SchoolInfo | null;
  onSave: (data: SchoolInfo) => void;
  isLoading: boolean;
}

export function SchoolInfoForm({ schoolInfo, onSave, isLoading }: SchoolInfoFormProps) {
  const { register, handleSubmit, control, setValue, watch, formState: { isDirty } } = useForm<SchoolInfo>({
    values: schoolInfo || undefined,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const currentLogoUrl = watch("logo_url");

  useEffect(() => {
    if (currentLogoUrl) {
      setLogoPreview(currentLogoUrl);
    }
  }, [currentLogoUrl]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setLogoPreview(dataUrl);
        setValue("logo_url", dataUrl, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: SchoolInfo) => {
    onSave(data);
  };

  return (
    <Card className="max-w-2xl">
        <CardHeader>
            <CardTitle>Identitas Sekolah</CardTitle>
            <CardDescription>
                Kelola informasi dasar sekolah Anda di sini. Data ini akan digunakan saat membuat jadwal.
            </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="school_name">Nama Sekolah</Label>
                    <Input
                        id="school_name"
                        {...register("school_name")}
                        disabled={isLoading}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="headmaster_name">Nama Kepala Sekolah</Label>
                    <Input
                        id="headmaster_name"
                        {...register("headmaster_name")}
                        disabled={isLoading}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="address">Alamat Sekolah</Label>
                    <Textarea
                        id="address"
                        {...register("address")}
                        disabled={isLoading}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="academic_year">Tahun Ajaran</Label>
                        <Input
                            id="academic_year"
                            {...register("academic_year")}
                            placeholder="e.g. 2024/2025"
                            disabled={isLoading}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="semester">Semester</Label>
                        <Controller
                            control={control}
                            name="semester"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Ganjil">Ganjil</SelectItem>
                                        <SelectItem value="Genap">Genap</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo Sekolah</Label>
                  <div className="flex items-center gap-4">
                    {logoPreview ? (
                      <Image
                        src={logoPreview}
                        alt="Logo Preview"
                        width={64}
                        height={64}
                        className="rounded-md object-contain border"
                        data-ai-hint="school logo"
                      />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-md border text-xs text-muted-foreground">
                        No Logo
                      </div>
                    )}
                    <Input
                      id="logo_url"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      disabled={isLoading}
                      className="max-w-xs"
                    />
                  </div>
                </div>
            </CardContent>
            <CardFooter>
                 <Button type="submit" disabled={isLoading || !isDirty}>
                    {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
            </CardFooter>
        </form>
    </Card>
  );
}
