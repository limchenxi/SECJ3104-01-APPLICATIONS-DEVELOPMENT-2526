import type { Class } from "../Class/type";
import type { Subject } from "../Subject/type";
import type { User } from "../Users/tyoe";


export interface TeachingAssignment {
    _id: string;
    teacherId: User;
    classId: Class;
    subjectId: Subject;
    year: number;
}
