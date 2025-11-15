import React, { useEffect, useState } from "react";
import { Card, CardContent, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { motion } from "framer-motion";
import type { User } from "../../Users/type";
import type { Class } from "../../Class/type";
import type { Subject } from "../../Subject/type";


export default function TeachingAssignmentPage() {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  useEffect(() => {
    // mock fetch – replace with API call later
    setTeachers([
      {
        _id: "1",
        name: "Cikgu A",
        email: "a@example.com",
        gender: "male",
        ic: "12345",
        role: "guru",
      },
      {
        _id: "2",
        name: "Cikgu B",
        email: "b@example.com",
        gender: "female",
        ic: "54321",
        role: "guru",
      },
    ]);

    setClasses([
      { _id: "c1", name: "1 Amanah", level: 1, year: 2024 },
      { _id: "c2", name: "2 Bestari", level: 2, year: 2024 },
    ]);

    setSubjects([
      { _id: "s1", name: "Matematik", code: "MATH" },
      { _id: "s2", name: "Sains", code: "SCI" },
    ]);
  }, []);

  const handleSubmit = () => {
    if (!selectedTeacher || !selectedClass || !selectedSubject) {
      alert("Sila pilih semua data.");
      return;
    }

    const payload = {
      teacherId: selectedTeacher,
      classId: selectedClass,
      subjectId: selectedSubject,
      year: new Date().getFullYear(),
    };

    console.log("Teaching Assignment:", payload);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 grid place-items-center"
    >
      <Card className="w-full max-w-xl shadow-lg rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <h2 className="text-2xl font-bold">Create Teaching Assignment</h2>

          {/* Teacher Select */}
          <FormControl fullWidth>
            <InputLabel>Guru</InputLabel>
            <Select
              label="Guru"
              value={selectedTeacher?._id || ""}
              onChange={(e) =>
                setSelectedTeacher(
                  teachers.find((t) => t._id === e.target.value) || null
                )
              }
            >
              {teachers.map((t) => (
                <MenuItem key={t._id} value={t._id}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Class Select */}
          <FormControl fullWidth>
            <InputLabel>Kelas</InputLabel>
            <Select
              label="Kelas"
              value={selectedClass?._id || ""}
              onChange={(e) =>
                setSelectedClass(
                  classes.find((c) => c._id === e.target.value) || null
                )
              }
            >
              {classes.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Subject Select */}
          <FormControl fullWidth>
            <InputLabel>Subjek</InputLabel>
            <Select
              label="Subjek"
              value={selectedSubject?._id || ""}
              onChange={(e) =>
                setSelectedSubject(
                  subjects.find((s) => s._id === e.target.value) || null
                )
              }
            >
              {subjects.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            className="w-full mt-4 rounded-2xl"
            onClick={handleSubmit}
          >
            Simpan Tugasan
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}