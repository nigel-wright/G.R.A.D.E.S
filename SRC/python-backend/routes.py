from flask import Flask, request, Blueprint, jsonify
from db_connection import DBConnection
import os
import jwt
import datetime
from models import CalendarEvent
from datetime import timedelta

# Create a Blueprint for your routes
routes = Blueprint('routes', __name__)

# Initialize the DB connection with environment variables
db = DBConnection(
    host="localhost",
    user='root',
    password=os.getenv("PASSWORD"),
    database=os.getenv("DATABASE")
)

# Secret key for JWT (kept for potential future use)
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")

# Example route (now unprotected)
@routes.route('/api/example', methods=['GET'])
def get_data():
    conn = db.get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Student WHERE studentId = 10")
    result = cursor.fetchall()

    cursor.close()
    db.close_connection()

    return jsonify(result)

# Login route (unchanged)
@routes.route('/api/login', methods=['POST'])
def login():
    print("\n=== Starting Login Request ===")
    conn = db.get_connection()
    if conn is None:
        print("Error: Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    print(f"Login attempt for email: {email}")

    if not email or not password:
        print("Error: Missing email or password")
        return jsonify({"error": "Email and password are required"}), 400

    query = """
        SELECT studentID, email, fullName, yearInProgram, 
               graduationYear, program, departmentID 
        FROM Student 
        WHERE email = %s AND password = %s
    """
    cursor.execute(query, (email, password))
    user = cursor.fetchone()

    cursor.close()
    db.close_connection()

    if user:
        print(f"Success: User found - {user['email']}")
        token = jwt.encode(
            {'user_id': user['studentID'], 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)},
            SECRET_KEY,
            algorithm='HS256'
        )
        print("=== Login Request Completed Successfully ===\n")
        return jsonify({'token': token, 'user': user}), 200
    else:
        print("Error: Invalid credentials")
        print("=== Login Request Failed ===\n")
        return jsonify({"error": "Invalid credentials"}), 401

# Faculty Member Login route
# TESTING ID: 6, PASSWORD LBp9F7jQ, EMAIL: faculty6@example.com
@routes.route('/api/faculty/login', methods=['POST'])
def faculty_login():
    print("\n=== Starting Faculty Login Request ===")
    conn = db.get_connection()
    if conn is None:
        print("Error: Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    print(f"Faculty login attempt for email: {email}")

    if not email or not password:
        print("Error: Missing email or password")
        return jsonify({"error": "Email and password are required"}), 400

    query = """
        SELECT facultyID, email, fullName, role, 
               officeNo, contactInfo, departmentID 
        FROM FacultyMember 
        WHERE email = %s AND password = %s
    """
    cursor.execute(query, (email, password))
    user = cursor.fetchone()

    cursor.close()
    db.close_connection()

    if user:
        print(f"Success: Faculty user found - {user['email']}")
        # Create a standardized user object similar to student login
        formatted_user = {
            'facultyID': user['facultyID'],
            'email': user['email'],
            'fullName': user['fullName'],
            'role': 'Admin' if user['role'] == 'Admin' else 'Faculty',  # Explicitly set role
            'officeNo': user['officeNo'],
            'contactInfo': user['contactInfo'],
            'departmentID': user['departmentID']
        }
        
        token = jwt.encode(
            {'user_id': user['facultyID'], 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)},
            SECRET_KEY,
            algorithm='HS256'
        )
        print("=== Faculty Login Request Completed Successfully ===\n")
        return jsonify({
            'token': token, 
            'user': formatted_user
        }), 200
    else:
        print("Error: Invalid credentials")
        print("=== Faculty Login Request Failed ===\n")
        return jsonify({"error": "Invalid credentials"}), 401

# Get a course for the student
@routes.route('/api/student/search', methods=['GET'])
def get_student_search(): 
    print("\n=== Starting Course Search Request ===")
    search = request.args.get('search')
    print(f"Search query: {search}")
    
    if not search:
        print("Error: Missing search parameter")
        return jsonify({"error": "Missing 'search' parameter"}), 400
    
    search = f"%{search.lower()}%"
    
    conn = db.get_connection()
    if conn is None: 
        print("Error: Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
        SELECT * 
        FROM CourseDetails
        WHERE LOWER(courseName) like %s OR LOWER(courseCode) like %s
        """
        print(f"Executing search query...")
        cursor.execute(query, (search, search))
        result = cursor.fetchall()
        print(f"Found {len(result)} matching courses")
    except Exception as e:
        print(f"Error executing search: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        cursor.close()
        db.close_connection()
        print("Database connection closed")

    if not result:
        print("No courses found")
        return jsonify({"error": "Could not find any course."}), 404

    print("=== Course Search Completed Successfully ===\n")
    return jsonify(result)

# Get a course for the student
@routes.route('/api/student/view-course', methods=['GET'])
def get_courses():
    print("\n=== Starting View Courses Request ===")
    studentID = request.args.get('studentID')
    print(f"Requesting courses for student ID: {studentID}")
   
    if not studentID:
        print("Error: Missing studentID parameter")
        return jsonify({"error": "Missing 'studentID' parameter"}), 400
   
    conn = db.get_connection()
    if conn is None:
        print("Error: Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500
   
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
        SELECT sc.courseCode, sc.cyear, sc.grade, c.courseName, c.courseDescription, c.credits
        FROM StudentCourse sc
        JOIN CourseDetails c ON sc.courseCode = c.courseCode
        WHERE sc.studentID = %s;
        """
        print("Executing query for student courses...")
        cursor.execute(query, (studentID,))
        result = cursor.fetchall()
        print(f"Found {len(result)} courses for student")
    except Exception as e:
        print(f"Error retrieving courses: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        cursor.close()
        db.close_connection()
        print("Database connection closed")
 
    if not result:
        print("No courses found for student")
        return jsonify({"error": "Could not find any course."}), 404
 
    print("=== View Courses Request Completed Successfully ===\n")
    return jsonify(result)

@routes.route('/api/student/prof-info', methods=['GET'])
def see_prof(): 
    print("\n=== Starting Prof Info Request ===")
    courseCode = request.args.get('courseCode')
    print(f"Requesting courses for Course Code: {courseCode}")
    
    if not courseCode:
        print("Error: Missing courseCode parameter")
        return jsonify({"error": "Missing 'courseCode' parameter"}), 400
    
    try:
        cyear = int(request.args.get('cyear'))
    except (TypeError, ValueError):
        print("Error: Invalid or missing 'cyear' parameter.")
        return jsonify({"error": "Invalid 'cyear' parameter. It must be a valid integer."}), 400
    
    conn = db.get_connection()
    if conn is None: 
        print("Error: Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
        SELECT 
            f.fullName AS instructorName,
            f.officeNo AS instructorOffice,
            f.contactInfo AS instructorContact,
            d.departmentName AS departmentName
        FROM CourseDetails cd
        JOIN Course c ON cd.courseCode = c.courseCode
        JOIN FacultyMember f ON f.facultyID = c.instructor
        JOIN Department d ON f.departmentID = d.departmentID
        WHERE c.courseCode = %s and c.cyear = %s;
        """
        print("Executing query for prof info...")
        cursor.execute(query, (courseCode, cyear,))
        result = cursor.fetchall()
        print(f"Found {len(result)} profs for course")
    except Exception as e:
        print(f"Error retrieving courses: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        cursor.close()
        db.close_connection()
        print("Database connection closed")

    if not result:
        print(f"No professor information found for courseCode: {courseCode} and cyear: {cyear}")
        return jsonify({"error": f"No professor information found for courseCode: {courseCode} and cyear: {cyear}"}), 404

    print("=== View Courses Request Completed Successfully ===\n")
    return jsonify(result)

@routes.route('/api/student/unregister', methods=['DELETE'])
def course_unregister():
    return

# Get calendar events (now unprotected)
@routes.route('/api/events/<int:student_id>', methods=['GET'])
def get_calendar_events(student_id):
    print("\n=== Starting Calendar Events Request ===")
    print(f"Requesting events for student ID: {student_id}")
    
    conn = db.get_connection()
    if conn is None:
        print("Error: Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        query = """
        SELECT * 
        FROM CalendarEvent
        WHERE studentId = %s 
           OR courseCode IN (
               SELECT courseCode
               FROM StudentCourse
               WHERE studentId = %s 
                 AND cyear = 2024
           )
        """
        print("Executing query for calendar events...")
        cursor.execute(query, (student_id, student_id))
        result = cursor.fetchall()
        print(f"Found {len(result)} events")

        if not result:
            print("No events found for student")
            return jsonify({"error": "No events found for this student."}), 404

        # Serialize event duration if needed
        for event in result:
            if isinstance(event['eventDuration'], timedelta):
                event['eventDuration'] = event['eventDuration'].total_seconds()

        print("=== Calendar Events Request Completed Successfully ===\n")
        return jsonify(result)
    except Exception as e:
        print(f"Error retrieving events: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        cursor.close()
        db.close_connection()
        print("Database connection closed")

# Add a calendar event (now unprotected)
@routes.route('/api/events', methods=['POST'])
def add_calendar_event():
    print("\n=== Starting Add Calendar Event Request ===")
    
    # Database connection
    conn = db.get_connection()
    if conn is None:
        print("Error: Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500
    print("Database connection established successfully")

    try:
        cursor = conn.cursor(dictionary=True)
        
        # Get event data from request
        event_data = request.get_json()
        print(f"Received event data: {event_data}")

        # Extract event details
        event_name = event_data.get('eventName')
        event_description = event_data.get('eventDescription')
        event_start = event_data.get('eventStart')
        event_duration = event_data.get('eventDuration')
        course_code = event_data.get('courseCode')
        cyear = event_data.get('cyear')
        student_id = event_data.get('studentId')

        print(f"Extracted event details:\nName: {event_name}\nDescription: {event_description}\nStart: {event_start}\nDuration: {event_duration}\nCourse Code: {course_code}\nAcademic Year: {cyear}\nStudent ID: {student_id}")

        # Check for required fields
        if not all([event_name, event_start, event_duration]):
            print("Error: Missing required fields")
            return jsonify({"error": "Missing required fields"}), 400

        print("All required fields are present. Proceeding with database insert.")

        # Prepare the query to insert event data into the database
        query = """
        INSERT INTO CalendarEvent (eventName, eventDescription, eventStart, eventDuration, courseCode, cyear, studentID)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        print("Executing insert query...")
        print(f"Query: {query}")
        
        # Execute the query with provided data
        cursor.execute(query, (event_name, event_description, event_start, event_duration, course_code, cyear, student_id))
        
        # Commit the transaction
        conn.commit()
        print("Event added successfully")

        print("=== Add Calendar Event Request Completed Successfully ===\n")
        return jsonify({"message": "Event added successfully!"}), 201

    except Exception as e:
        print(f"Error adding event: {str(e)}")
        conn.rollback()
        return jsonify({"error": f"Failed to add event: {str(e)}"}), 500
    finally:
        # Close cursor and connection
        cursor.close()
        db.close_connection()
        print("Database connection closed")

# Delete a calendar event (now unprotected)
@routes.route('/api/events/<int:event_id>', methods=['DELETE'])
def delete_calendar_event(event_id):
    print("\n=== Starting Delete Calendar Event Request ===")
    print(f"Attempting to delete event ID: {event_id}")
    
    conn = db.get_connection()
    if conn is None:
        print("Error: Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        query = "DELETE FROM CalendarEvent WHERE eventID = %s"
        print("Executing delete query...")
        cursor.execute(query, (event_id,))
        conn.commit()
        
        if cursor.rowcount == 0:
            print(f"No event found with ID: {event_id}")
            return jsonify({"error": "Event not found"}), 404
            
        print(f"Successfully deleted event ID: {event_id}")
        print("=== Delete Calendar Event Request Completed Successfully ===\n")
        return jsonify({"message": "Event deleted successfully!"}), 200
    except Exception as e:
        print(f"Error deleting event: {str(e)}")
        conn.rollback()
        return jsonify({"error": f"Failed to delete event: {str(e)}"}), 500
    finally:
        cursor.close()
        db.close_connection()
        print("Database connection closed")

@routes.route('/api/transcript/<int:student_id>', methods=['GET'])
def get_transcript(student_id):
    print("\n=== Starting Transcript Request ===")
    print(f"Requesting transcript for student ID: {student_id}")
    
    conn = db.get_connection()
    if conn is None:
        print("Error: Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        query = """
        SELECT sc.courseCode, sc.cyear, sc.grade, 
               cd.courseName, cd.courseDescription, cd.credits
        FROM StudentCourse sc
        JOIN CourseDetails cd ON sc.courseCode = cd.courseCode
        WHERE sc.studentID = %s
        ORDER BY sc.cyear DESC, sc.courseCode
        """
        print(f"Executing query for student courses...")
        cursor.execute(query, (student_id,))
        courses = cursor.fetchall()
        print(f"Found {len(courses)} courses for student")

        # Calculate GPA and total credits
        total_credits = 0
        total_grade_points = 0
        grade_points = {'A+': 4.0, 'A': 4.0, 'A-': 3.7,
                       'B+': 3.3, 'B': 3.0, 'B-': 2.7,
                       'C+': 2.3, 'C': 2.0, 'C-': 1.7,
                       'D+': 1.3, 'D': 1.0, 'F': 0.0}

        print("\nCalculating GPA...")
        for course in courses:
            print(f"Processing course: {course['courseCode']} - Grade: {course['grade']}")
            if course['grade'] in grade_points:
                credits = float(course['credits'])
                total_credits += credits
                grade_point = grade_points[course['grade']]
                course_points = credits * grade_point
                total_grade_points += course_points
                print(f"  Credits: {credits}, Grade Points: {grade_point}, Course Points: {course_points}")

        gpa = round(total_grade_points / total_credits, 2) if total_credits > 0 else 0.0
        print(f"\nFinal calculations:")
        print(f"Total Credits: {total_credits}")
        print(f"Total Grade Points: {total_grade_points}")
        print(f"GPA: {gpa}")

        response_data = {
            "courses": courses,
            "gpa": gpa,
            "totalCredits": total_credits
        }
        print("\n=== Completing Transcript Request Successfully ===")
        return jsonify(response_data)

    except Exception as e:
        print(f"\nError in transcript processing:")
        print(f"Exception type: {type(e).__name__}")
        print(f"Exception message: {str(e)}")
        print(f"=== Transcript Request Failed ===")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        cursor.close()
        db.close_connection()
        print("Database connection closed")

@routes.route('/api/students', methods=['GET'])
def get_students_with_contacts():
    conn = db.get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    search_query = request.args.get('student', '')

    try:
        cursor = conn.cursor(dictionary=True)

        # Search query
        query = """
        SELECT 
            s.studentID,
            s.email,
            s.fullName,
            s.yearInProgram,
            s.graduationYear,
            s.program,
            c.phoneNumber,
            c.cName AS contactName,
            c.address,
            c.postalCode
        FROM 
            Student s
        LEFT JOIN 
            EmergencyContact ec ON s.studentID = ec.studentID
        LEFT JOIN 
            Contact c ON ec.phoneNumber = c.phoneNumber
        WHERE 
            s.fullName LIKE %s OR s.studentID = %s
        """
        cursor.execute(query, (f"%{search_query}%", search_query))

        # Fetch and organize results
        rows = cursor.fetchall()
        students = {}

        # Organize data
        for row in rows:
            student_id = row['studentID']
            if student_id not in students:
                students[student_id] = {
                    "studentID": student_id,
                    "email": row["email"],
                    "fullName": row["fullName"],
                    "yearInProgram": row["yearInProgram"],
                    "graduationYear": row["graduationYear"],
                    "program": row["program"],
                    "emergencyContacts": []
                }
            if row["phoneNumber"]:  # Add contact info if available
                students[student_id]["emergencyContacts"].append({
                    "phoneNumber": row["phoneNumber"],
                    "contactName": row.get("contactName"),
                    "address": row.get("address"),
                    "postalCode": row.get("postalCode")
                })

        return jsonify(list(students.values())), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        cursor.close()
        db.close_connection()



@routes.route('/api/students', methods=['POST'])
def create_student():
    data = request.get_json()
    full_name = data.get('fullName')
    email = data.get('email')
    year_in_program = data.get('yearInProgram')
    graduation_year = data.get('graduationYear')
    program = data.get('program')

    if not all([full_name, email, year_in_program, graduation_year, program]):
        return jsonify({"error": "All fields are required"}), 400

    conn = db.get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        query = """
        INSERT INTO Student (fullName, email, yearInProgram, graduationYear, program)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (full_name, email, year_in_program, graduation_year, program))
        conn.commit()
        return jsonify({"message": "Student created successfully!"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Failed to create student: {str(e)}"}), 500
    finally:
        cursor.close()
        db.close_connection()

@routes.route('/api/students/<int:student_id>', methods=['PUT'])
def edit_student(student_id):
    print(f"Route matched for student ID: {student_id}")
    data = request.get_json()
    full_name = data.get('fullName')
    email = data.get('email')
    year_in_program = data.get('yearInProgram')
    graduation_year = data.get('graduationYear')
    program = data.get('program')

    if not all([full_name, email, year_in_program, graduation_year, program]):
        return jsonify({"error": "All fields are required"}), 400

    conn = db.get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        # Check if student exists
        cursor.execute("SELECT * FROM Student WHERE studentID = %s", (student_id,))
        existing_student = cursor.fetchone()

        if not existing_student:
            return jsonify({"error": "Student not found"}), 404

        # Debug: Print values and types
        print("Existing student data:")
        for key, value in existing_student.items():
            print(f"{key}: {value} (type: {type(value)})")

        print("New data from request:")
        print(f"fullName: {full_name} (type: {type(full_name)})")
        print(f"email: {email} (type: {type(email)})")
        print(f"yearInProgram: {year_in_program} (type: {type(year_in_program)})")
        print(f"graduationYear: {graduation_year} (type: {type(graduation_year)})")
        print(f"program: {program} (type: {type(program)}) \n")

        # Convert data types if necessary
        year_in_program = int(year_in_program)
        graduation_year = int(graduation_year)

        # Check for identical data
        if (existing_student['fullName'] == full_name and
            existing_student['email'] == email and
            existing_student['yearInProgram'] == year_in_program and
            existing_student['graduationYear'] == graduation_year and
            existing_student['program'] == program):
            return jsonify({"message": "No changes were made to the student."}), 200

        # Update the student
        query = """
        UPDATE Student
        SET fullName = %s, email = %s, yearInProgram = %s, graduationYear = %s, program = %s
        WHERE studentID = %s
        """
        cursor.execute(query, (full_name, email, year_in_program, graduation_year, program, student_id))
        conn.commit()

        print(f"Rows affected: {cursor.rowcount}")
        return jsonify({"message": "Student updated successfully!"}), 200
    except Exception as e:
        conn.rollback()
        print(f"Exception occurred: {e}")
        return jsonify({"error": f"Failed to update student: {str(e)}"}), 500
    finally:
        cursor.close()
        db.close_connection()




@routes.route('/api/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    conn = db.get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        query = "DELETE FROM Student WHERE studentID = %s"
        cursor.execute(query, (student_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Student not found"}), 404
        return jsonify({"message": "Student deleted successfully!"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Failed to delete student: {str(e)}"}), 500
    finally:
        cursor.close()
        db.close_connection()

@routes.route('/api/contacts/<string:phone_number>', methods=['PUT'])
def update_contact(phone_number):
    conn = db.get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    # Get the request JSON data
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid or missing JSON data"}), 400

    # Extract fields to be updated
    contact_name = data.get('contactName')
    address = data.get('address')
    postal_code = data.get('postalCode')

    # Ensure at least one field is provided
    if not any([contact_name, address, postal_code]):
        return jsonify({"error": "No fields to update provided"}), 400

    try:
        cursor = conn.cursor()
        
        # Build the update query dynamically based on the provided fields
        update_fields = []
        params = []

        if contact_name is not None:
            update_fields.append("cName = %s")
            params.append(contact_name)
        if address is not None:
            update_fields.append("address = %s")
            params.append(address)
        if postal_code is not None:
            update_fields.append("postalCode = %s")
            params.append(postal_code)

        # Add the phone number as the final parameter
        params.append(phone_number)

        # Construct the SQL query
        query = f"""
        UPDATE Contact
        SET {', '.join(update_fields)}
        WHERE phoneNumber = %s
        """
        
        # Execute the query
        cursor.execute(query, params)
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Contact not found or no changes made"}), 404

        return jsonify({"message": "Contact updated successfully"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Failed to update contact: {str(e)}"}), 500

    finally:
        cursor.close()
        db.close_connection()

@routes.route('/api/emergency-contacts', methods=['DELETE'])
def delete_emergency_contact():
    conn = db.get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    # Get query parameters
    student_id = request.args.get('studentID')
    phone_number = request.args.get('phoneNumber')

    # Validate input
    if not student_id or not phone_number:
        return jsonify({"error": "Both studentID and phoneNumber are required"}), 400

    try:
        cursor = conn.cursor()

        # Construct the SQL query to delete the association
        query = """
        DELETE FROM EmergencyContact
        WHERE studentID = %s AND phoneNumber = %s
        """
        
        # Execute the query
        cursor.execute(query, (student_id, phone_number))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "No matching EmergencyContact found"}), 404

        return jsonify({"message": "EmergencyContact entry deleted successfully"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Failed to delete EmergencyContact: {str(e)}"}), 500

    finally:
        cursor.close()
        db.close_connection()

@routes.route('/api/faculty/<int:faculty_id>/courses', methods=['GET'])
def get_faculty_courses(faculty_id):
    print(f"\n=== Starting Get Faculty Courses Request for Faculty ID: {faculty_id} ===")
    conn = db.get_connection()
    if conn is None:
        print("Error: Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        
        # SQL query to fetch courses taught by a faculty member
        query = """
        SELECT 
            c.courseCode,
            cd.courseName,
            cd.courseDescription,
            cd.credits,
            c.cyear AS academicYear,
            d.departmentName AS department
        FROM 
            Course c
        INNER JOIN 
            CourseDetails cd ON c.courseCode = cd.courseCode
        INNER JOIN 
            FacultyMember f ON c.instructor = f.facultyID
        LEFT JOIN 
            Department d ON f.departmentID = d.departmentID
        WHERE 
            f.facultyID = %s
        ORDER BY 
            c.cyear
        """
        print(f"Executing query for faculty_id: {faculty_id}")
        print(f"Query: {query}")
        
        cursor.execute(query, (faculty_id,))
        
        # Fetch results
        rows = cursor.fetchall()
        print(f"Found {len(rows)} courses for faculty member")

        if not rows:
            print("No courses found for faculty member")
            return jsonify({
                "facultyID": faculty_id,
                "courses": {},
                "message": "No courses found for this faculty member"
            }), 200

        # Group courses by academic year
        courses_by_year = {}
        print("\nProcessing courses:")
        for row in rows:
            print(f"Processing course: {row['courseCode']} - {row['courseName']}")
            year = row["academicYear"]
            if year not in courses_by_year:
                courses_by_year[year] = []
            
            try:
                course_entry = {
                    "courseCode": row["courseCode"],
                    "courseName": row["courseName"],
                    "courseDescription": row.get("courseDescription"),
                    "credits": float(row["credits"]) if row["credits"] is not None else None,
                    "department": row.get("department")
                }
                courses_by_year[year].append(course_entry)
                print(f"Successfully added course to year {year}")
            except Exception as e:
                print(f"Error processing course {row['courseCode']}: {str(e)}")
                print(f"Raw row data: {row}")

        # Prepare the response
        response = {
            "facultyID": faculty_id,
            "courses": courses_by_year
        }

        print("=== Get Faculty Courses Request Completed Successfully ===\n")
        return jsonify(response), 200

    except Exception as e:
        print(f"Error in get_faculty_courses:")
        print(f"Exception type: {type(e).__name__}")
        print(f"Exception message: {str(e)}")
        print("=== Get Faculty Courses Request Failed ===\n")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        cursor.close()
        db.close_connection()
        print("Database connection closed")

@routes.route('/api/faculty/courses', methods=['POST'])
def add_faculty_course():
    print("\n=== Starting Add Faculty Course Request ===")
    conn = db.get_connection()
    if conn is None:
        print("Error: Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500

    data = request.get_json()
    print(f"Received course data: {data}")
    
    required_fields = ['courseCode', 'courseName', 'credits', 'instructor', 'cyear']
    
    # Validate required fields
    if not all(field in data for field in required_fields):
        missing_fields = [field for field in required_fields if field not in data]
        print(f"Error: Missing required fields - {missing_fields}")
        return jsonify({"error": "Missing required fields"}), 400

    try:
        cursor = conn.cursor()
        
        # Check if course details exist
        print(f"Checking if course {data['courseCode']} exists in CourseDetails")
        cursor.execute(
            "SELECT courseCode FROM CourseDetails WHERE courseCode = %s",
            (data['courseCode'],)
        )
        
        if not cursor.fetchone():
            print("Course details don't exist, creating new entry")
            cursor.execute("""
                INSERT INTO CourseDetails (courseCode, courseName, credits)
                VALUES (%s, %s, %s)
            """, (data['courseCode'], data['courseName'], data['credits']))
            print("Course details created successfully")

        # Insert into Course table
        print("Adding course to Course table")
        cursor.execute("""
            INSERT INTO Course (courseCode, instructor, cyear)
            VALUES (%s, %s, %s)
        """, (data['courseCode'], data['instructor'], data['cyear']))

        conn.commit()
        print("=== Add Faculty Course Request Completed Successfully ===\n")
        return jsonify({"message": "Course added successfully"}), 201

    except Exception as e:
        print(f"Error: Failed to add course - {str(e)}")
        conn.rollback()
        print("=== Add Faculty Course Request Failed ===\n")
        return jsonify({"error": f"Failed to add course: {str(e)}"}), 500

    finally:
        cursor.close()
        db.close_connection()

@routes.route('/api/faculty/courses/<course_code>', methods=['PUT'])
def update_faculty_course(course_code):
    print(f"\n=== Starting Update Faculty Course Request for {course_code} ===")
    conn = db.get_connection()
    if conn is None:
        print("Error: Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500

    data = request.get_json()
    print(f"Received update data: {data}")
    
    required_fields = ['courseName', 'credits']
    if not all(field in data for field in required_fields):
        missing_fields = [field for field in required_fields if field not in data]
        print(f"Error: Missing required fields - {missing_fields}")
        return jsonify({"error": "Missing required fields"}), 400

    try:
        cursor = conn.cursor()
        
        print("Updating CourseDetails")
        cursor.execute("""
            UPDATE CourseDetails 
            SET courseName = %s, credits = %s
            WHERE courseCode = %s
        """, (data['courseName'], data['credits'], course_code))

        if cursor.rowcount == 0:
            print(f"Error: Course {course_code} not found")
            return jsonify({"error": "Course not found"}), 404

        conn.commit()
        print("=== Update Faculty Course Request Completed Successfully ===\n")
        return jsonify({"message": "Course updated successfully"}), 200

    except Exception as e:
        print(f"Error: Failed to update course - {str(e)}")
        conn.rollback()
        print("=== Update Faculty Course Request Failed ===\n")
        return jsonify({"error": f"Failed to update course: {str(e)}"}), 500

    finally:
        cursor.close()
        db.close_connection()

@routes.route('/api/faculty/courses/<course_code>/<int:cyear>', methods=['DELETE'])
def delete_faculty_course(course_code, cyear):
    print(f"\n=== Starting Delete Faculty Course Request for {course_code}, Year {cyear} ===")
    conn = db.get_connection()
    if conn is None:
        print("Error: Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        
        print("Deleting course from Course table")
        cursor.execute("""
            DELETE FROM Course 
            WHERE courseCode = %s AND cyear = %s
        """, (course_code, cyear))

        if cursor.rowcount == 0:
            print(f"Error: Course {course_code} for year {cyear} not found")
            return jsonify({"error": "Course not found"}), 404

        # Check if this was the last instance
        print("Checking if this was the last instance of the course")
        cursor.execute(
            "SELECT COUNT(*) FROM Course WHERE courseCode = %s",
            (course_code,)
        )
        count = cursor.fetchone()[0]
        print(f"Remaining instances of course: {count}")

        # If last instance, delete from CourseDetails
        if count == 0:
            print("No instances remain, deleting from CourseDetails")
            cursor.execute(
                "DELETE FROM CourseDetails WHERE courseCode = %s",
                (course_code,)
            )

        conn.commit()
        print("=== Delete Faculty Course Request Completed Successfully ===\n")
        return jsonify({"message": "Course deleted successfully"}), 200

    except Exception as e:
        print(f"Error: Failed to delete course - {str(e)}")
        conn.rollback()
        print("=== Delete Faculty Course Request Failed ===\n")
        return jsonify({"error": f"Failed to delete course: {str(e)}"}), 500

    finally:
        cursor.close()
        db.close_connection()

@routes.route('/api/emergency-contacts', methods=['POST'])
def add_or_update_emergency_contact():
    """
    Add a new contact or update it if it already exists, 
    and associate it with a student as an emergency contact.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid data"}), 400

    phone_number = data.get('phoneNumber')
    contact_name = data.get('contactName')
    address = data.get('address')
    postal_code = data.get('postalCode')
    student_id = data.get('studentID')

    # Validate required fields
    if not all([phone_number, student_id]):
        return jsonify({"error": "Phone number and student ID are required"}), 400

    conn = db.get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()

        # Check if the contact already exists in the Contact table
        contact_exists_query = "SELECT COUNT(*) FROM Contact WHERE phoneNumber = %s"
        cursor.execute(contact_exists_query, (phone_number,))
        contact_exists = cursor.fetchone()[0] > 0

        if contact_exists:
            # Update the existing contact if it already exists
            update_contact_query = """
            UPDATE Contact
            SET cName = %s, address = %s, postalCode = %s
            WHERE phoneNumber = %s
            """
            cursor.execute(update_contact_query, (contact_name, address, postal_code, phone_number))
        else:
            # If the contact doesn't exist, create it
            create_contact_query = """
            INSERT INTO Contact (phoneNumber, cName, address, postalCode)
            VALUES (%s, %s, %s, %s)
            """
            cursor.execute(create_contact_query, (phone_number, contact_name, address, postal_code))

        # Link the contact to the student in the EmergencyContact table
        # Check to avoid duplicate entries
        emergency_contact_exists_query = """
        SELECT COUNT(*) FROM EmergencyContact WHERE studentID = %s AND phoneNumber = %s
        """
        cursor.execute(emergency_contact_exists_query, (student_id, phone_number))
        emergency_contact_exists = cursor.fetchone()[0] > 0

        if not emergency_contact_exists:
            create_emergency_contact_query = """
            INSERT INTO EmergencyContact (studentID, phoneNumber)
            VALUES (%s, %s)
            """
            cursor.execute(create_emergency_contact_query, (student_id, phone_number))

        conn.commit()
        return jsonify({"message": "Emergency contact added or updated successfully"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

    finally:
        cursor.close()
        db.close_connection()


@routes.route('/api/contacts', methods=['GET'])
def get_all_contacts():
    conn = db.get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT phoneNumber, cName AS contactName, address, postalCode FROM Contact"
        cursor.execute(query)
        contacts = cursor.fetchall()
        return jsonify(contacts), 200
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        cursor.close()
        db.close_connection()

@routes.route('/api/student/register-course', methods=['POST'])
def register_course_for_student():
    """
    Register a student for a course.
    """
    conn = db.get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    data = request.get_json()

    student_id = data.get('studentID')
    course_code = data.get('courseCode')
    cyear = data.get('cyear')

    if not all([student_id, course_code, cyear]):
        return jsonify({"error": "Missing required fields: studentID, courseCode, or cyear"}), 400

    try:
        cursor = conn.cursor()

        check_query = """
        SELECT * FROM StudentCourse
        WHERE studentID = %s AND courseCode = %s AND cyear = %s
        """
        cursor.execute(check_query, (student_id, course_code, cyear))
        if cursor.fetchone():
            return jsonify({"error": "Student is already registered for this course"}), 400

        query = """
        INSERT INTO StudentCourse (studentID, courseCode, cyear)
        VALUES (%s, %s, %s)
        """
        cursor.execute(query, (student_id, course_code, cyear))
        conn.commit()

        return jsonify({"message": "Student registered for the course successfully"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

    finally:
        cursor.close()
        db.close_connection()


@routes.route('/api/courses', methods=['GET'])
def get_available_courses():
    """
    Fetch all courses for the year 2025.
    """
    conn = db.get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT c.courseCode, cd.courseName, cd.courseDescription, cd.credits, c.cyear
            FROM Course c
            JOIN CourseDetails cd ON c.courseCode = cd.courseCode
            WHERE c.cyear = 2025
        """
        cursor.execute(query)
        courses = cursor.fetchall()
        return jsonify(courses), 200
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        cursor.close()
        db.close_connection()

@routes.route('/api/faculty/view', methods=['GET'])
def view_faculty():
    print("\n=== Starting View Faculty Request ===")
    search_query = request.args.get('search', '').strip()
    conn = db.get_connection()
 
    if conn is None:
        print("Error: Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500
 
    try:
        cursor = conn.cursor(dictionary=True)
        if search_query:
            query = """
                SELECT facultyID, fullName AS name, email,
                       (SELECT departmentName FROM department WHERE departmentID = f.departmentID) AS department
                FROM facultyMember f
                WHERE fullName LIKE %s OR facultyID LIKE %s
            """
            cursor.execute(query, (f"%{search_query}%", f"%{search_query}%"))
        else:
            query = """
                SELECT facultyID, fullName AS name, email,
                       (SELECT departmentName FROM department WHERE departmentID = f.departmentID) AS department
                FROM faculty f
            """
            cursor.execute(query)
 
        result = cursor.fetchall()
        print(f"Found {len(result)} faculty members")
    except Exception as e:
        print(f"Error fetching faculty: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        cursor.close()
        db.close_connection()
        print("Database connection closed")
 
    if not result:
        return jsonify([]), 200
 
    print("=== View Faculty Request Completed Successfully ===\n")
    return jsonify(result)
 
@routes.route('/api/faculty/<int:facultyID>', methods=['DELETE'])
def delete_faculty(facultyID):
    print("\n=== Starting Delete Faculty Request ===")
    conn = db.get_connection()
 
    if conn is None:
        print("Error: Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500
 
    try:
        cursor = conn.cursor()
        check_query = "SELECT * FROM FacultyMember WHERE facultyID = %s"
        cursor.execute(check_query, (facultyID,))
        faculty = cursor.fetchone()
        if not faculty:
            print(f"Faculty member with ID {facultyID} not found")
            return jsonify({"error": "Faculty member not found"}), 404
 
        delete_query = "DELETE FROM FacultyMember WHERE facultyID = %s"
        cursor.execute(delete_query, (facultyID,))
        conn.commit()
        print(f"Faculty member with ID {facultyID} deleted successfully")
    except Exception as e:
        print(f"Error deleting faculty: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        cursor.close()
        db.close_connection()
        print("Database connection closed")
 
    return jsonify({"message": f"Faculty member with ID {facultyID} deleted successfully"}), 200
 
@routes.route('/api/faculty', methods=['POST'])
def add_faculty():
    print("\n=== Starting Add Faculty Request ===")
    data = request.json
    print(f"Request Data: {data}")  # Debug: Print the incoming data
    conn = db.get_connection()
 
    if conn is None:
        print("Error: Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500
 
    try:
        cursor = conn.cursor()
 
        # Debug: Check if we received the expected department name
        if 'department' not in data:
            print("Error: department is missing in request data")
            return jsonify({"error": "Department is required"}), 400
        print(f"Looking for department: {data['department']}")  # Debug: Show the department being searched for
 
        # Fetch the departmentID based on departmentName
        department_query = """
            SELECT departmentID FROM Department WHERE departmentName = %s
        """
        cursor.execute(department_query, (data['department'],))
        department_result = cursor.fetchone()
 
        # Debug: Show the result of the department query
        if department_result is None:
            print(f"Error: Department '{data['department']}' not found")
            return jsonify({"error": "Department not found"}), 400
        print(f"Department found, departmentID: {department_result[0]}")  # Debug: Show the departmentID
 
        departmentID = department_result[0]  # Get the departmentID from the result
 
        # Debug: Show the query about to be executed for the insert
        insert_query = """
            INSERT INTO FacultyMember (fullName, email, departmentID, role, password, officeNo, contactInfo)
            VALUES (%s, %s, %s, 'Lecturer', 'default123', 'Office_0', 'N/A')
        """
        print(f"Executing insert query: {insert_query}")  # Debug: Show insert query
        print(f"With values: fullName={data['name']}, email={data['email']}, departmentID={departmentID}")  # Debug: Show values being inserted
 
        # Now insert the new FacultyMember record with the correct departmentID
        cursor.execute(insert_query, (data['name'], data['email'], departmentID))
        conn.commit()
 
        # Debug: Confirm the insertion was successful
        print("Faculty member added successfully")
    except Exception as e:
        print(f"Error adding faculty: {str(e)}")  # Debug: Print the actual error message
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        cursor.close()
        db.close_connection()
        print("Database connection closed")
 
    return jsonify({"message": "Faculty member added successfully"}), 201
 
 
@routes.route('/api/faculty/<int:facultyID>', methods=['PUT'])
def edit_faculty(facultyID):
    print("\n=== Starting Edit Faculty Request ===")
    data = request.json
    print(f"Request Data: {data}")  # Debug: Print the incoming data
    conn = db.get_connection()
 
    if conn is None:
        print("Error: Database connection failed")
        return jsonify({"error": "Database connection failed"}), 500
 
    try:
        cursor = conn.cursor()
 
        # Debug: Check if we received the expected department name
        if 'department' not in data:
            print("Error: departmentID is missing in request data")
            return jsonify({"error": "departmentID is required"}), 400
        print(f"Looking for department: {data['department']}")  # Debug: Show the department being searched for
 
        # Fetch the departmentID based on departmentName
        department_query = """
            SELECT departmentID FROM Department WHERE departmentName = %s
        """
        cursor.execute(department_query, (data['department'],))
        department_result = cursor.fetchone()
 
        # Debug: Show the result of the department query
        if department_result is None:
            print(f"Error: Department '{data['departmentID']}' not found")
            return jsonify({"error": "Department not found"}), 400
        print(f"Department found, departmentID: {department_result[0]}")  # Debug: Show the departmentID
 
        departmentID = department_result[0]  # Get the departmentID from the result
 
        # Debug: Show the query about to be executed for the update
        update_query = """
            UPDATE FacultyMember
            SET fullName = %s, email = %s, departmentID = %s
            WHERE facultyID = %s
        """
        print(f"Executing update query: {update_query}")  # Debug: Show update query
        print(f"With values: fullName={data['name']}, email={data['email']}, departmentID={departmentID}, facultyID={facultyID}")  # Debug: Show values being updated
 
        # Now update the FacultyMember record with the correct departmentID
        cursor.execute(update_query, (data['name'], data['email'], departmentID, facultyID))
        conn.commit()
 
        # Debug: Confirm the update was successful
        print(f"Faculty member with ID {facultyID} updated successfully")
    except Exception as e:
        print(f"Error updating faculty: {str(e)}")  # Debug: Print the actual error message
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        cursor.close()
        db.close_connection()
        print("Database connection closed")
 
    return jsonify({"message": f"Faculty member with ID {facultyID} updated successfully"}), 200

