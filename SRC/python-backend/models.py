from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy
db = SQLAlchemy()

# Department Table
class Department(db.Model):
    __tablename__ = "Department"
    departmentID = db.Column(db.Integer, primary_key=True)
    departmentName = db.Column(db.String(255), unique=True, nullable=False)
    address = db.Column(db.String(255))
    postalCode = db.Column(db.String(10))


# Student Table
class Student(db.Model):
    __tablename__ = "Student"
    studentID = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    fullName = db.Column(db.String(255), nullable=False)
    yearInProgram = db.Column(db.Integer)
    graduationYear = db.Column(db.Integer)
    program = db.Column(db.String(255))
    departmentID = db.Column(db.Integer, db.ForeignKey("Department.departmentID"))


# FacultyMember Table
class FacultyMember(db.Model):
    __tablename__ = "FacultyMember"
    facultyID = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    fullName = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(255))
    officeNo = db.Column(db.String(50))
    contactInfo = db.Column(db.String(255))
    departmentID = db.Column(db.Integer, db.ForeignKey("Department.departmentID"))


# CourseDetails Table
class CourseDetails(db.Model):
    __tablename__ = "CourseDetails"
    courseCode = db.Column(db.String(10), primary_key=True)
    courseName = db.Column(db.String(255))
    courseDescription = db.Column(db.Text)
    credits = db.Column(db.Integer)


# Course Table
class Course(db.Model):
    __tablename__ = "Course"
    courseCode = db.Column(db.String(10), db.ForeignKey("CourseDetails.courseCode"), primary_key=True)
    instructor = db.Column(db.Integer, db.ForeignKey("FacultyMember.facultyID"), nullable=False)
    cyear = db.Column(db.Integer, primary_key=True)


# StudentCourse Table
class StudentCourse(db.Model):
    __tablename__ = "StudentCourse"
    courseCode = db.Column(db.String(10), primary_key=True)
    studentID = db.Column(db.Integer, db.ForeignKey("Student.studentID"), primary_key=True)
    cyear = db.Column(db.Integer, primary_key=True)
    grade = db.Column(db.String(2))


# CalendarEvent Table
class CalendarEvent(db.Model):
    __tablename__ = "CalendarEvent"
    eventID = db.Column(db.Integer, primary_key=True)
    eventName = db.Column(db.String(255))
    eventDescription = db.Column(db.Text)
    eventStart = db.Column(db.DateTime)
    eventDuration = db.Column(db.Time)
    courseCode = db.Column(db.String(10), db.ForeignKey("Course.courseCode"), nullable=True)
    cyear = db.Column(db.Integer, db.ForeignKey("Course.cyear"), nullable=True)
    studentID = db.Column(db.Integer, db.ForeignKey("Student.studentID"), nullable=True)


# Contact Table
class Contact(db.Model):
    __tablename__ = "Contact"
    phoneNumber = db.Column(db.String(15), primary_key=True)
    cName = db.Column(db.String(255))
    address = db.Column(db.String(255))
    postalCode = db.Column(db.String(10))


# EmergencyContact Table
class EmergencyContact(db.Model):
    __tablename__ = "EmergencyContact"
    studentID = db.Column(db.Integer, db.ForeignKey("Student.studentID"), primary_key=True)
    phoneNumber = db.Column(db.String(15), db.ForeignKey("Contact.phoneNumber"), primary_key=True)