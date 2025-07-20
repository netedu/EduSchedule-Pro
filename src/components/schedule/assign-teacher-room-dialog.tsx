// src/components/schedule/assign-teacher-room-dialog.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Teacher, Room } from '@/lib/types';

interface AssignTeacherRoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { teacher_id: string; room_id: string }) => void;
  teachers: Teacher[];
  rooms: Room[];
}

export function AssignTeacherRoomDialog({ isOpen, onClose, onSave, teachers, rooms }: AssignTeacherRoomDialogProps) {
  const [teacherId, setTeacherId] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');

  const handleSave = () => {
    if (teacherId && roomId) {
      onSave({ teacher_id: teacherId, room_id: roomId });
      setTeacherId('');
      setRoomId('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tetapkan Guru dan Ruangan</DialogTitle>
          <DialogDescription>
            Pilih guru yang akan mengajar dan ruangan yang akan digunakan.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="teacher">Guru</Label>
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger id="teacher">
                <SelectValue placeholder="Pilih Guru" />
              </SelectTrigger>
              <SelectContent>
                {teachers.length > 0 ? (
                  teachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="-" disabled>Tidak ada guru yang tersedia</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="room">Ruangan</Label>
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger id="room">
                <SelectValue placeholder="Pilih Ruangan" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map(room => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSave} disabled={!teacherId || !roomId}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
