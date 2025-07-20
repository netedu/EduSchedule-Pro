// src/components/schedule/assign-item-dialog.tsx
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Teacher, Room, Subject, Class } from '@/lib/types';

interface AssignItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { subject_id: string; teacher_id: string; room_id: string }) => void;
  masterData: {
    subjects: Subject[];
    teachers: Teacher[];
    rooms: Room[];
    classes: Class[];
  };
  target: {
    class_id: string;
  }
}

export function AssignItemDialog({ isOpen, onClose, onSave, masterData, target }: AssignItemDialogProps) {
  const [subjectId, setSubjectId] = useState<string>('');
  const [teacherId, setTeacherId] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  
  useEffect(() => {
    // Reset state when dialog opens or master data changes
    setSubjectId('');
    setTeacherId('');
    setRoomId('');
  }, [isOpen, masterData]);


  const handleSave = () => {
    if (subjectId && teacherId && roomId) {
      onSave({ subject_id: subjectId, teacher_id: teacherId, room_id: roomId });
    }
  };

  const targetClass = useMemo(() => {
    return masterData.classes.find(c => c.id === target.class_id);
  }, [masterData.classes, target.class_id]);

  const availableSubjects = useMemo(() => {
    if (!targetClass) return [];
    // Filter subjects that match the class level
    return masterData.subjects.filter(s => s.level_target === targetClass.level);
  }, [masterData.subjects, targetClass]);

  const availableTeachers = useMemo(() => {
    if (!subjectId) return [];
    // Filter teachers who can teach the selected subject
    return masterData.teachers.filter(t => t.subject_ids.includes(subjectId));
  }, [masterData.teachers, subjectId]);
  
  // Reset teacher selection if subject changes and the current teacher is no longer valid
  useEffect(() => {
    if (teacherId && !availableTeachers.some(t => t.id === teacherId)) {
        setTeacherId('');
    }
  }, [subjectId, teacherId, availableTeachers]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Jadwal Pelajaran</DialogTitle>
          <DialogDescription>
            Pilih mata pelajaran, guru, dan ruangan untuk slot ini.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="subject">Mata Pelajaran</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Pilih Mata Pelajaran" />
              </SelectTrigger>
              <SelectContent>
                {availableSubjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="teacher">Guru</Label>
            <Select value={teacherId} onValueChange={setTeacherId} disabled={!subjectId}>
              <SelectTrigger id="teacher">
                <SelectValue placeholder="Pilih Guru" />
              </SelectTrigger>
              <SelectContent>
                {availableTeachers.length > 0 ? (
                  availableTeachers.map(teacher => (
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
                {masterData.rooms.map(room => (
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
          <Button onClick={handleSave} disabled={!subjectId || !teacherId || !roomId}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
