const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection configuration
const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root12',
  database: 'medshyne_pro'
});


// Function to convert image to base64
  const convertImageToBase64new = (filename, imageType = 'png' ) => {
    try{
      const buffer = fs.readFileSync(filename);
      const base64String = Buffer.from(buffer).toString('base64');
      return `data:image/${imageType};base64,${base64String}`;
    } catch (error) {
      throw new Error (`file ${filename} no exist`)
    }
  }

// Connect to MySQL
con.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + con.threadId);
});

// // Login Token
// app.post('/login', (req, res) => {
//     res.header('Content-Type', 'application/json');

//     // Check if organization_name is provided
//     if (!req.body.organization_name) {
//         return res.status(400).json({
//             Result: "Failure",
//             message: "Organization name is mandatory."
//         });
//     }

//     try {
//         const { organization_name, id_number, password } = req.body;

//         con.connect(function (err) {
//             if (err) {
//                 console.error('Error connecting to the database:', err);
//                 return res.status(500).json({
//                     Result: "Failure",
//                     message: "Error connecting to the database"
//                 });
//             }

//             console.log("Connected!");

//             // Check in tblstaff if not found in tbldoctor
//             const staffSql = `
//                 SELECT * FROM tblstaff 
//                 WHERE organization_name = ? AND id_number = ? AND hcr = 1
//             `;

//             con.query(
//                 staffSql,
//                 [organization_name, id_number],
//                 function (err, staffResult) {
//                     if (err) {
//                         console.error('Error executing SQL query:', err);
//                         return res.status(500).json({
//                             Result: "Failure",
//                             message: "Error executing SQL query"
//                         });
//                     }

//                     if (staffResult.length > 0 && password === staffResult[0].password) {
//                         // Successful login for staff
//                         const { name, profile, organization_name, designation, department } = staffResult[0]; 
                        
//                         // Generate JWT token
//                         const token = jwt.sign({ id_number: id_number }, '605001',{ expiresIn: '1h' });

//                         return res.status(200).json({
//                             Result: "Success",
//                             message: "Login Successful",
//                             id_number:id_number,
//                             name: name,
//                             profile: profile,
//                             organization_name: organization_name,
//                             designation: designation,
//                             department: department,
//                             token: token
//                         });
//                     }

//                     // Invalid credentials
//                     return res.status(401).json({
//                         Result: "Failure",
//                         message: "Invalid credentials. Please check your username, organization name, and password."
//                     });
//                 }
//             );
//         });
//     } catch (ex) {
//         console.error('Error:', ex);
//         return res.status(500).json({
//             Result: "Failure",
//             message: ex.message
//         });
//     }
// });


// Login 
app.post('/login', (req, res) => {
    res.header('Content-Type', 'application/json');

    // Check if organization_name is provided
    if (!req.body.organization_name) {
        return res.status(400).json({
            Result: "Failure",
            message: "Organization name is mandatory."
        });
    }

    try {
        const { organization_name, id_number, password } = req.body;
        console.log(organization_name);
        console.log(id_number);
        console.log(password);

        con.connect(function (err) {
            if (err) {
                console.error('Error connecting to the database:', err);
                return res.status(500).json({
                    Result: "Failure",
                    message: "Error connecting to the database"
                });
            }

            console.log("Connected!");

            // Check in tblstaff if not found in tbldoctor and hcr is 1
            const staffSql = `
                SELECT * FROM tblstaff 
                WHERE organization_name = ? AND id_number = ? AND hcr = 1
            `;

            con.query(
                staffSql,
                [organization_name, id_number],
                function (err, staffResult) {
                    if (err) {
                        console.error('Error executing SQL query:', err);
                        return res.status(500).json({
                            Result: "Failure",
                            message: "Error executing SQL query"
                        });
                    }

                    if (staffResult.length > 0 && password === staffResult[0].password) {
                        // Successful login for staff;
                        const { name, profile, organization_name, designation, department } = staffResult[0]; // Assuming your database schema includes 'name' and 'profile' fields
                        return res.status(200).json({
                            Result: "Success",
                            message: "Login Successful",
                            id_number: id_number,
                            name: name,
                            profile: profile,
                            organization_name: organization_name,
                            designation: designation,
                            department: department
                        });
                    }

                    // Invalid credentials
                    return res.status(401).json({
                        Result: "Failure",
                        message: "Invalid credentials. Please check your username, organization name, and password."
                    });
                }
            );
        });
    } catch (ex) {
        console.error('Error:', ex);
        return res.status(500).json({
            Result: "Failure",
            message: ex.message
        });
    }
});  

//Our Doctor home slide 
app.get('/our_doctor', (req, res) => {
    res.header('Content-Type', 'application/json');

    try {
        con.connect(function (err) {
            if (err) {
                console.error('Error connecting to the database:', err);
                return res.status(500).json({
                    Result: "Failure",
                    message: "Error connecting to the database"
                });
            }

            console.log("Connected!");

            // Fetch specific fields from tbldoctor
            const doctorSql = `
                SELECT 
                    profile,
                    doctor_name,
                    work_experience,
                    CONCAT(dr_bachelor, ' ', dr_master) AS qualification
                FROM tbldoctor
            `;

            con.query(
                doctorSql,
                function (err, doctorResult) {
                    if (err) {
                        console.error('Error executing SQL query:', err);
                        return res.status(500).json({
                            Result: "Failure",
                            message: "Error executing SQL query"
                        });
                    }

                    return res.status(200).json({
                        Result: "Success",
                        doctors: doctorResult
                    });
                }
            );
        });
    } catch (ex) {
        console.error('Error:', ex);
        return res.status(500).json({
            Result: "Failure",
            message: ex.message
        });
    }
});



  
// Selected Doctor
app.get('/selected_doctor', (req, res) => {
    const { doctorId } = req.query;

    // Check if doctorId is provided
    if (!doctorId) {
        return res.status(400).json({
            Result: "Failure",
            message: "Doctor ID is required"
        });
    }

    res.header('Content-Type', 'application/json');

    try {
        con.connect(function (err) {
            if (err) {
                console.error('Error connecting to the database:', err);
                return res.status(500).json({
                    Result: "Failure",
                    message: "Error connecting to the database"
                });
            }

            console.log("Connected!");

            // Fetch specific fields from tbldoctor and inner join with tblparent_available and tblchild_available
            const doctorSql = 
                `SELECT 
                    d.doctor_id,
                    d.profile,
                    d.doctor_name,
                    d.work_experience,
                    CONCAT(d.dr_bachelor, ' ', d.dr_master) AS qualification,
                    GROUP_CONCAT(c.from_time) AS from_times
                FROM tbldoctor AS d
                INNER JOIN tblparent_available AS p ON d.doctor_id = p.doctor_id
                INNER JOIN tblchild_available AS c ON p.parent_available_id = c.parent_available_id
                WHERE d.doctor_id = ?
                GROUP BY d.doctor_id
            `;

            con.query(
                doctorSql, [doctorId], // Passing doctorId as a parameter
                function (err, doctorResult) {
                    if (err) {
                        console.error('Error executing SQL query:', err);
                        return res.status(500).json({
                            Result: "Failure",
                            message: "Error executing SQL query"
                        });
                    }

                    // Parse the from_time values into arrays
                    doctorResult.forEach(doctor => {
                        doctor.from_times = doctor.from_times.split(',');
                    });

                    return res.status(200).json({
                        Result: "Success",
                        doctor: doctorResult[0] // Assuming there's only one doctor per ID
                    });
                }
            );
        });
    } catch (ex) {
        console.error('Error:', ex);
        return res.status(500).json({
            Result: "Failure",
            message: ex.message
        });
    }
});

  //Booking Appointment
  app.post('/book_appointment', (req, res) => {
    const { id_number, sick_type, health_problem, from_time } = req.body;

    // Check if all required fields are provided
    if (!id_number || !sick_type || !health_problem) {
        return res.status(400).json({
            Result: "Failure",
            message: "All fields are required"
        });
    }

    try {
        con.connect(function (err) {
            if (err) {
                console.error('Error connecting to the database:', err);
                return res.status(500).json({
                    Result: "Failure",
                    message: "Error connecting to the database"
                });
            }

            console.log("Connected!");

            // Query to fetch patient details
            const patientLookupSql = `
                SELECT name AS patient_name, classes, division
                FROM tblstudent
                WHERE id_number = ?
            `;

            // Execute the patient lookup query
            con.query(
                patientLookupSql, [id_number],
                function (err, patientResult) {
                    if (err) {
                        console.error('Error executing patient lookup query:', err);
                        return res.status(500).json({
                            Result: "Failure",
                            message: "Error executing patient lookup query"
                        });
                    }

                    // If patient data is found, use it to insert into tblconsulting
                    if (patientResult.length > 0) {
                        const { patient_name, classes, division } = patientResult[0];
                        insertIntoConsulting(res, patient_name, id_number, classes, division, sick_type, health_problem, from_time);
                    } else {
                        // If patient data is not found, return a failure response
                        return res.status(404).json({
                            Result: "Failure",
                            message: "No record found with the provided id_number"
                        });
                    }
                }
            );
        });
    } catch (ex) {
        console.error('Error:', ex);
        return res.status(500).json({
            Result: "Failure",
            message: ex.message
        });
    }
});

// Function to insert data into tblconsulting
function insertIntoConsulting(res, patient_name, id_number, classes, division, sick_type, health_problem, from_time) {
    const insertSql = `
        INSERT INTO tblconsulting (patient_name, id_number, classes, division, sick_type, health_problem, from_time, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [patient_name, id_number, classes, division, sick_type, health_problem, from_time, 'New'];

    con.query(
        insertSql, values,
        function (err, insertResult) {
            if (err) {
                console.error('Error executing insert query:', err);
                return res.status(500).json({
                    Result: "Failure",
                    message: "Error executing insert query"
                });
            }

            return res.status(201).json({
                Result: "Success",
                message: "Consulting record inserted successfully",
                insertedId: insertResult.insertId
            });
        }
    );
}





//Registered
// app.get('/registered', (req, res) => {
//     res.header('Content-Type', 'application/json');
//     try {
//         con.connect(function (err) {
//             if (err) {
//                 console.error('Error connecting to the database:', err);
//                 return res.status(500).json({
//                     Result: "Failure",
//                     message: "Error connecting to the database"
//                 });
//             }

//             console.log("Connected!");

            
//             const regSql = 
//             `SELECT c.id_number, c.patient_name, c.classes, c.division, c.consult_id, c.reason,
//             COALESCE(s.profile, st.profile) AS profile_pic
//             FROM tblconsulting c
//             LEFT JOIN tblstudent s ON c.id_number = s.id_number
//             LEFT JOIN tblstaff st ON c.id_number = st.id_number
//             WHERE c.status IN ('completed', 'cancelled');`
//             ;

//             con.query(
//                 regSql,
//                 function (err, regResult) {
//                     if (err) {
//                         console.error('Error executing SQL query:', err);
//                         return res.status(500).json({
//                             Result: "Failure",
//                             message: "Error executing SQL query"
//                         });
//                     }

//                     return res.status(200).json({
//                         Result: "Success",
//                         Staff: regResult
//                     });
//                 }
//             );
//         });
//     } catch (ex) {
//         console.error('Error:', ex);
//         return res.status(500).json({
//             Result: "Failure",
//             message: ex.message
//         });
//     }

// });



// appointment List
app.get('/appointment_list', (req, res) => {
    res.header('Content-Type', 'application/json');

    try {
        const StudentAppointmentQuery = `
            SELECT s.profile, ct.patient_name, ct.consult_id, ct.sick_type, ct.from_time AS start_on
            FROM tblstudent s
            INNER JOIN tblconsulting ct ON s.id_number = ct.id_number
            WHERE ct.status IN ('new', 'waiting');
        `;

        con.query(StudentAppointmentQuery, function (err, studentResult) {
            if (err) {
                console.error('Database Error:', err);
                return res.status(500).json({
                    result: "failure",
                    message: "Internal Server Error"
                });
            }

            if (studentResult.length > 0) {
                console.log("Retrieved Appointment List for students: ");
                res.status(200).json({
                    result: "success",
                    message: "Appointment List Retrieved Successfully",
                    data: studentResult
                });
            } else {
                // If no appointments found for students, check staff appointments
                const StaffAppointmentQuery = `
                    SELECT st.profile, ct.patient_name, ct.consult_id, ct.sick_type, ct.from_time AS start_on
                    FROM tblstaff st
                    INNER JOIN tblconsulting ct ON st.id_number = ct.id_number
                    WHERE ct.status IN ('new', 'waiting');
                `;
                con.query(StaffAppointmentQuery, function (staffErr, staffResult) {
                    if (staffErr) {
                        console.error('Database Error:', staffErr);
                        return res.status(500).json({
                            result: "failure",
                            message: "Internal Server Error"
                        });
                    }

                    if (staffResult.length > 0) {
                        console.log("Retrieved Appointment List for staff: ");
                        res.status(200).json({
                            result: "success",
                            message: "Appointment List Retrieved Successfully",
                            data: staffResult
                        });
                    } else {
                        res.status(404).json({
                            result: "failure",
                            message: "No appointments found for students or staff"
                        });
                    }
                });
            }
        });
    } catch (ex) {
        console.error('Error:', ex);
        res.status(500).json({
            result: "failure",
            message: "Internal Server Error"
        });
    }
});


//Follow Back 
app.get('/follow_back_list', (req, res) => {
    res.header('Content-Type', 'application/json');

    const StudentReportQuery = `
        SELECT s.profile, ct.patient_name, ct.consult_id, ct.sick_type, ct.from_time AS start_on, ct.follow_back,ct.division,ct.classes,ct.health_problem,td.doctor_name
        FROM tblstudent s
        INNER JOIN tblconsulting ct ON s.id_number = ct.id_number
        INNER JOIN 
        tbldoctor td ON ct.doctor_id = td.doctor_id  
        WHERE ct.follow_back IS NOT NULL;   
   ` ;

    const StaffReportQuery = `
        SELECT st.profile, ct.patient_name, ct.consult_id, ct.sick_type, ct.from_time AS start_on, ct.follow_back,ct.division,ct.classes,ct.health_problem,td.doctor_name
        FROM tblstaff st
        INNER JOIN tblconsulting ct ON st.id_number = ct.id_number
        INNER JOIN 
        tbldoctor td ON ct.doctor_id = td.doctor_id  
        WHERE ct.follow_back IS NOT NULL;
   ` ;

    try {
        const studentQueryPromise = new Promise((resolve, reject) => {
            con.query(StudentReportQuery, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        const staffQueryPromise = new Promise((resolve, reject) => {
            con.query(StaffReportQuery, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        Promise.all([studentQueryPromise, staffQueryPromise])
            .then(([studentResults, staffResults]) => {
                const combinedResults = [...studentResults, ...staffResults];

                if (combinedResults.length > 0) {
                    console.log("Retrieved Follow Back Report for students and staff.");
                    return res.status(200).json({
                        result: "success",
                        message: "Follow Back Report Retrieved Successfully",
                        data: combinedResults
                    });
                } else {
                    return res.status(404).json({
                        result: "failure",
                        message: "No Follow Back Reports found for Students or Staff"
                    });
                }
            })
            .catch((error) => {
                console.error('Database Error:', error);
                res.status(500).json({
                    result: "failure",
                    message: "Internal Server Error"
                });
            });
    } catch (ex) {
        console.error('Error:', ex);
        res.status(500).json({
            result: "failure",
            message: "Internal Server Error"
        });
    }
});


// Function to execute database queries
function queryDatabase(sql) {
    return new Promise((resolve, reject) => {
        con.query(sql, function (err, result) {
            if (err) {
                console.error('Database Error:', err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}




// Route to Consulting_details
app.get('/consulting_details', (req, res) => {
    res.header('Content-Type', 'application/json');

    try {
        const { consult_id } = req.query;

        // Check if consult_id is provided
        if (!consult_id) {
            return res.status(400).json({
                result: "failure",
                message: "Please provide a valid consult_id"
            });
        }

        const studentQuery = `
            SELECT s.profile AS profile, 
                   ct.id_number, ct.consult_id, ct.patient_name, ct.classes, ct.division, ct.sick_type, 
                   ct.health_problem AS about_sick, ct.from_time, d.profile AS doctor_profile, d.doctor_name, 
                   CONCAT(d.dr_bachelor, ' ', d.dr_master) AS qualifications, d.work_experience
            FROM tblconsulting ct
            LEFT JOIN tblstudent s ON s.id_number = ct.id_number
            LEFT JOIN tbldoctor d ON d.doctor_id = ct.doctor_id
            WHERE ct.consult_id = ?;
        `;

        const staffQuery = `
            SELECT st.profile AS profile, 
                   ct.id_number, ct.consult_id, ct.patient_name, ct.classes, ct.division, ct.sick_type, 
                   ct.health_problem AS about_sick, ct.from_time, d.profile AS doctor_profile, d.doctor_name, 
                   CONCAT(d.dr_bachelor, ' ', d.dr_master) AS qualifications, 
                   d.work_experience
            FROM tblconsulting ct
            INNER JOIN tblstaff st ON st.id_number = ct.id_number
            LEFT JOIN tbldoctor d ON d.doctor_id = ct.doctor_id 
            WHERE ct.consult_id = ?;
        `;

        con.query(studentQuery, [consult_id], function (err, studentResult) {
            if (err) {
                console.error('Database Error:', err);
                return res.status(500).json({
                    result: "failure",
                    message: "Internal Server Error"
                });
            }

            if (studentResult.length > 0) {
                console.log("Booking Appointment Report Retrieved for student with consult_id: ", consult_id);
                return res.status(200).json({
                    result: "success",
                    message: "Booking Appointment Report Retrieved Successfully",
                    data: studentResult[0]
                });
            } else {
                // If no result found for student, try staff
                con.query(staffQuery, [consult_id], function (err, staffResult) {
                    if (err) {
                        console.error('Database Error:', err);
                        return res.status(500).json({
                            result: "failure",
                            message: "Internal Server Error"
                        });
                    }

                    if (staffResult.length > 0) {
                        console.log("Booking Appointment Report Retrieved for staff with consult_id: ", consult_id);
                        return res.status(200).json({
                            result: "success",
                            message: "Booking Appointment Report Retrieved Successfully",
                            data: staffResult[0]
                        });
                    } else {
                        return res.status(404).json({
                            result: "failure",
                            message: "Booking Appointment not found"
                        });
                    }
                });
            }
        });
    } catch (ex) {
        console.error('Error:', ex);
        res.status(500).json({
            result: "failure",
            message: "Internal Server Error"
        });
    }
});


//Consulting Done Slide
app.get('/Consulting_done', (req, res) => {
    req.header('Content-Type', 'application/json');
    try {
        const { consult_id } = req.query;

        // Check if consulting id provided
        if (!consult_id) {
            return res.status(400).json({
                result: 'Failure',
                message: "Please provide valid consult_id"
            });
        }

        const studentQuery = `
            SELECT st.profile, st.name, c.id_number, c.classes, c.division, c.consult_id, c.sick_type, c.health_problem,
            CONCAT(DATE_FORMAT(c.date, '%Y-%m-%d'), '        ', DATE_FORMAT(c.from_time, '%h:%i %p'), ' - ', DATE_FORMAT(c.to_time, '%h:%i %p')) AS date_time
            FROM tblconsulting c
            INNER JOIN tblstudent st ON st.id_number = c.id_number
            WHERE c.consult_id = ?;
        `;
        const staffQuery = `
            SELECT sf.profile, sf.name, c.id_number, c.classes, c.division, c.consult_id, c.sick_type, c.health_problem,
            CONCAT(DATE_FORMAT(c.date, '%Y-%m-%d'), '        ', DATE_FORMAT(c.from_time, '%h:%i %p'), ' - ', DATE_FORMAT(c.to_time, '%h:%i %p')) AS date_time
            FROM tblconsulting c
            INNER JOIN tblstaff sf ON sf.id_number = c.id_number
            WHERE c.consult_id = ?;
        `;

        con.query(studentQuery, [consult_id], function (err, studentResult) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    result: 'failure',
                    message: 'Internal server error'
                });
            }
            if (studentResult.length > 0) {
                console.log("Consulting done Retrieved for student with consult_id");
                return res.status(200).json({
                    result: "success",
                    message: "Consulting done Report Retrieved Successfully",
                    data: studentResult[0]
                });
            } else {
                // If no result found for student, try staff
                con.query(staffQuery, [consult_id], function (err, staffResult) {
                    if (err) {
                        console.error('Database Error:', err);
                        return res.status(500).json({
                            result: "failure",
                            message: "Internal Server Error"
                        });
                    }
                    if (staffResult.length > 0) {
                        console.log("Consulting done Report Retrieved for staff with consult_id: ", consult_id);
                        return res.status(200).json({
                            result: "success",
                            message: "Consulting done Report Retrieved Successfully",
                            data: staffResult[0]
                        });
                    } else {
                        return res.status(404).json({
                            result: "failure",
                            message: "Consulting done not found"
                        });
                    }
                });
            }
        });
    } catch (ex) {
        console.error('Error:', ex);
        res.status(500).json({
            result: "failure",
            message: "Internal Server Error"
        });
    }
});
//Done
app.get('/done', (req, res) => {
    res.header('Content-Type', 'application/json');
    const {id_number} = req.query; // Assuming id_number is sent as a query parameter
    try {
        con.connect(function (err) {
            if (err) {
                console.error('Error connecting to the database:', err);
                return res.status(500).json({
                    Result: "Failure",
                    message: "Error connecting to the database"
                });
            }

            console.log("Connected!");
            const doneSql = `
            SELECT 
            c.classes_name,
            c.division,
            cl.consult_id,
            cl.patient_name,
            cl.status,
            cl.id_number,
            COALESCE(st.profile, s.profile) AS profile
        FROM 
            tblclasses c
        INNER JOIN 
            tblconsulting cl ON cl.classes = c.classes_name 
                             AND cl.division = c.division 
                             AND cl.hcr_name = c.HCR
        left JOIN 
            tblstudent st ON st.id_number = cl.id_number  
        left JOIN 
            tblstaff s ON s.id_number = cl.id_number 
        
        WHERE 
            c.id_number = 10011 
            AND (s.organization_name = 'college' OR st.organization_name='college')
            AND cl.status IN ('completed')
            `;

            con.query(
                doneSql,
                [id_number],
                function (err, doneResult) {
                    if (err) {
                        console.error('Error executing SQL query:', err);
                        return res.status(500).json({
                            Result: "Failure",
                            message: "Error executing SQL query"
                        });
                    }

                    return res.status(200).json({
                        Result: "Success",
                        done: doneResult
                    });
                }
            );
        });
    } catch (ex) {
        console.error('Error:', ex);
        return res.status(500).json({
            Result: "Failure",
            message: ex.message
        });
    }
});

//classview
// app.get('/classview',(req,res) => {

//  res.header('Content-Type', 'application/json');
//     const {id_number} = req.query; // Assuming id_number is sent as a query parameter
//     try {
//         con.connect(function (err) {
//             if (err) {
//                 console.error('Error connecting to the database:', err);
//                 return res.status(500).json({
//                     Result: "Failure",
//                     message: "Error connecting to the database"
//                 });
//             }
            
//             console.log("Connected!");
//             const classviewSql = `
//             SELECT DISTINCT 
//     c.classes_name, c.division, c.department, c.strength, COALESCE(s.name, st.name) AS name
// FROM 
//     tblclasses c
// LEFT JOIN 
//     tblstaff s ON s.id_number = c.id_number AND s.division = c.division
// LEFT JOIN 
//     tblstudent st ON st.id_number = c.id_number AND st.division = c.division WHERE s.id_number = ? 
//     `;
            
// }
//Student 
app.get('/student', (req, res) => {
    res.header('Content-Type', 'application/json');
    const { id_number } = req.query;

    if (!id_number) {
        return res.status(400).json({
            Result: "Failure",
            message: "id_number query parameter is required"
        });
    }

    const studentSql = `
    SELECT 
    c.classes_name,
    c.division,
    s.profile,
    s.name,
    s.id_number
        FROM 
            tblclasses c 
        INNER JOIN 
            tblstudent s ON s.classes = c.classes_name AND s.division = c.division
        WHERE 
            c.id_number = ?;
    `;

    con.query(studentSql, [id_number], function (err, studentResult) {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({
                Result: "Failure",
                message: "Error executing SQL query"
            });
        }

        return res.status(200).json({
            Result: "Success",
            Student: studentResult
        });
    });
});
//Student Details
app.get('/studentprofile', (req, res) => {
    res.header('Content-Type', 'application/json');
  
    try {
      const { id_number } = req.query;
  
      if (!id_number) {
        return res.status(400).json({
          result: "failure",
          message: "Please provide a valid id_number"
        });
      }
  
      const specificStudentQuery = `
        SELECT s.profile, s.name, DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(), s.dob)), '%Y') + 0 AS age, 
        s.classes, s.division, c.department, s.gender, s.blood_group, s.current_health_report, s.past_health_report,
        s.allergies_define, s.any_disease_define, CONCAT(s.address, ', ', s.state, ',', s.pincode) AS address,  
        father.parent_name AS father_name, father.mobile_number AS father_mobile_number,
        mother.parent_name AS mother_name, mother.mobile_number AS mother_mobile_number
        FROM tblstudent s
        LEFT JOIN tblparent father ON s.id_number = father.id_number AND father.relation = 'father'
        LEFT JOIN tblparent mother ON s.id_number = mother.id_number AND mother.relation = 'mother'
        LEFT JOIN tblclasses c ON s.id_number = c.id_number
        WHERE s.id_number = ?;
      `;
  
      con.query(specificStudentQuery, [id_number], function (err, result) {
        if (err) {
          console.error('Error:', err);
          return res.status(500).json({
            result: "failure",
            message: "Internal Server Error"
          });
        }
  
        if (result.length > 0) {
          console.log("Retrieved specific student record with parent information");
          return res.status(200).json({
            result: "success",
            message: "Specific Student Data Retrieved Successfully",
            data: result[0]  
          });
        } else {
          return res.status(404).json({
            result: "failure",
            message: "Student record not found"
          });
        }
      });
    } catch (ex) {
      console.error('Error:', ex);
      res.status(500).json({
        result: "failure",
        message: "Internal Server Error"
      });
    }
  });



  // Endpoint to view a specific student profile by id_number
  app.get('/viewall_student', (req, res) => {
    res.header('Content-Type', 'application/json');
    const { id_number, organization_name } = req.query;

    // Validate input
    if (!id_number || isNaN(id_number)) {
        return res.status(400).json({
            Result: "Failure",
            message: "A valid id_number is required"
        });
    }

    if (!organization_name) {
        return res.status(400).json({
            Result: "Failure",
            message: "An organization_name is required"
        });
    }

    // SQL query to fetch student profile
    const studentProfileSql = `
        SELECT DISTINCT
            c.name,
            c.id_number,
            c.profile,
            c.classes,
            c.division,
            c.organization_name
        FROM 
            tblstudent c
        INNER JOIN
            tblstaff s ON s.organization_name = c.organization_name
        INNER JOIN
            tblclasses t ON t.classes_name = s.classes 
            AND t.classes_name = c.classes
            AND t.division = s.division 
            AND t.division = c.division
        WHERE 
            s.id_number = ?
        AND
            c.organization_name = ?
    `;

    // Execute the SQL query
    con.query(studentProfileSql, [id_number, organization_name], (err, studentProfileResult) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({
                Result: "Failure",
                message: "Internal Server Error"
            });
        }

        if (studentProfileResult.length === 0) {
            return res.status(404).json({
                Result: "Failure",
                message: "No student found for the provided id"
            });
        }

        return res.status(200).json({
            Result: "Success",
            StudentProfile: studentProfileResult[0]
        });
    });
});


// //Consulting details edit
// app.put('/edit', (req, res) => {
//     res.header('Content-type','application/jason');
//     const { from_time, sick_type, health_problem, consult_id } = req.body;

//     // Update data in MySQL
//     const sql = `UPDATE tblconsulting SET from_time = ?, sick_type = ?, health_problem = ? WHERE consult_id = ? `;

//     con.query(sql, [from_time, sick_type, health_problem, consult_id], (err, result) => {
//         if (err) {
//             console.error("Error updating data:", err);
//             return res.status(500).json({ message: "Internal server error" });
//         }
//         // Check if any rows were affected
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ message: "Data not found" });
//         }
//         return res.status(200).json({ message: "Data updated successfully" });
//     });
// });



//Consulting details edit
app.put('/edit', (req, res) => {
    const { id_number, sick_type, health_problem, from_time } = req.body;

    // Check if all required fields are provided
    if (!id_number || !sick_type || !health_problem || !from_time) {
        return res.status(400).json({
            Result: "Failure",
            message: "All fields are required"
        });
    }

    try {
        con.connect(function (err) {
            if (err) {
                console.error('Error connecting to the database:', err);
                return res.status(500).json({
                    Result: "Failure",
                    message: "Error connecting to the database"
                });
            }

            console.log("Connected!");

            // Query to fetch patient details
            const patientLookupSql = `
                SELECT name AS patient_name, classes, division
                FROM tblstudent
                WHERE id_number = ?
            `;

            // Execute the patient lookup query
            con.query(
                patientLookupSql, [id_number],
                function (err, patientResult) {
                    if (err) {
                        console.error('Error executing patient lookup query:', err);
                        return res.status(500).json({
                            Result: "Failure",
                            message: "Error executing patient lookup query"
                        });
                    }

                    // If patient data is found, use it to update tblconsulting
                    if (patientResult.length > 0) {
                        const { patient_name, classes, division } = patientResult[0];

                        // Query to update the appointment in tblconsulting
                        const updateAppointmentSql = `
                            UPDATE tblconsulting
                            SET sick_type = ?, health_problem = ?, from_time = ?
                            WHERE id_number = ?
                        `;

                        con.query(
                            updateAppointmentSql, [sick_type, health_problem, from_time, id_number],
                            function (err, updateResult) {
                                if (err) {
                                    console.error('Error executing update appointment query:', err);
                                    return res.status(500).json({
                                        Result: "Failure",
                                        message: "Error executing update appointment query"
                                    });
                                }

                                // Check if any row was updated
                                if (updateResult.affectedRows > 0) {
                                    return res.status(200).json({
                                        Result: "Success",
                                        message: "Appointment updated successfully"
                                    });
                                } else {
                                    return res.status(404).json({
                                        Result: "Failure",
                                        message: "No appointment found to update"
                                    });
                                }
                            }
                        );
                    } else {
                        // If patient data is not found, return a failure response
                        return res.status(404).json({
                            Result: "Failure",
                            message: "No record found with the provided id_number"
                        });
                    }
                }
            );
        });
    } catch (ex) {
        console.error('Error:', ex);
        return res.status(500).json({
            Result: "Failure",
            message: ex.message
        });
    }
});

//classesview
app.get('/classes_details', (req, res) => {
    res.header('Content-Type', 'application/json');

    const { classes_name, division, organization_name } = req.query;

    try {
        const selectClassesQuery = `
            SELECT c.classes_name, c.division, c.department, c.strength, st.name AS class_incharge
            FROM tblclasses c 
            INNER JOIN tblstaff st 
                ON st.classes = c.classes_name
                AND st.division = c.division 
            WHERE c.classes_name = ? 
            AND c.division = ?
            AND st.organization_name = ?
        `;

        con.query(selectClassesQuery, [classes_name, division, organization_name], (err, results) => {
            if (err) {
                console.error('Error fetching class details:', err);
                return res.status(500).json({
                    result: 'failure',
                    message: 'Internal Server Error'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    result: 'failure',
                    message: 'Class not found'
                });
            }

            console.log('Class details fetched successfully');
            res.status(200).json({
                result: 'success',
                message: 'Class Details Fetched Successfully',
                data: results
            });
        });
    } catch (ex) {
        console.error('Exception:', ex);
        res.status(500).json({
            result: 'failure',
            message: 'Internal Server Error'
        });
    }
});

//classstudentDetails

app.get('/classes_studentdetails', (req, res) => {
    res.header('Content-Type', 'application/json');

    const { classes, division, organization_name } = req.query;

    if (!classes || !division || !organization_name) {
        return res.status(400).json({
            result: 'failure',
            message: 'classes, division, and organization_name are required'
        });
    }

    try {
        const selectClassesstudentdetailsQuery = `
            SELECT profile, name, id_number, classes, division 
            FROM tblstudent 
            WHERE classes = ? AND division = ? AND organization_name = ?
        `;

        con.query(selectClassesstudentdetailsQuery, [classes, division, organization_name], (err, results) => {
            if (err) {
                console.error('Error fetching class details:', err);
                return res.status(500).json({
                    result: 'failure',
                    message: 'Internal Server Error'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    result: 'failure',
                    message: 'Class not found'
                });
            }

            console.log('Class details fetched successfully');
            res.status(200).json({
                result: 'success',
                message: 'Class Details Fetched Successfully',
                data: results
            });
        });
    } catch (ex) {
        console.error('Exception:', ex);
        res.status(500).json({
            result: 'failure',
            message: 'Internal Server Error'
        });
    }
});




//Registered
app.get('/registered', (req, res) => {
    res.header('Content-Type', 'application/json');
    const {id_number,organization_name} = req.query; // Assuming id_number is sent as a query parameter
    try {
        con.connect(function (err) {
            if (err) {
                console.error('Error connecting to the database:', err);
                return res.status(500).json({
                    Result: "Failure",
                    message: "Error connecting to the database"
                });
            }

            console.log("Connected!");
            const regSql = `
            SELECT 
            c.classes_name,
            c.division,
            cl.consult_id,
            cl.patient_name,
            cl.reason,
            cl.status,
            cl.id_number,
            COALESCE(st.profile, s.profile) AS profile
        FROM 
            tblclasses c
        INNER JOIN 
            tblconsulting cl ON cl.classes = c.classes_name 
                             AND cl.division = c.division 
                             AND cl.hcr_name = c.HCR
        left JOIN 
            tblstudent st ON st.id_number = cl.id_number  
        left JOIN 
            tblstaff s ON s.id_number = cl.id_number 
        
        WHERE 
            c.id_number = ?
            AND (s.organization_name = ? OR st.organization_name= ?)
            AND cl.status IN ('completed', 'cancelled');
            `;

            con.query(
                regSql,
                [id_number,organization_name,organization_name],
                function (err, regResult) {
                    if (err) {
                        console.error('Error executing SQL query:', err);
                        return res.status(500).json({
                            Result: "Failure",
                            message: "Error executing SQL query"
                        });
                    }

                    return res.status(200).json({
                        Result: "Success",
                        Staff: regResult
                    });
                }
            );
        });
    } catch (ex) {
        console.error('Error:', ex);
        return res.status(500).json({
            Result: "Failure",
            message: ex.message
        });
    }
});

//Registered consulting details 
app.get('/registered_consulting_details', (req, res) => {
    res.header('Content-Type', 'application/json');
    try {
        con.connect(function (err) {
            if (err) {
                console.error('Error connecting to the database:', err);
                return res.status(500).json({
                    Result: "Failure",
                    message: "Error connecting to the database: " + err.message
                });
            }

            console.log("Connected!");

            const {consult_id} = req.query; // Assuming consult_id is passed as a query parameter
            if (!consult_id) {
                return res.status(400).json({
                    Result: "Failure",
                    message: "consult_id parameter is required"
                });
            }

            const reg_conSql = `
            SELECT c.id_number, 
                   c.patient_name, 
                   c.classes, 
                   c.division, 
                   c.sick_type, 
                   c.date, 
                   c.from_time, 
                   c.to_time, 
                   c.health_problem, 
                   c.consult_id,
                   COALESCE(t.profile, s.profile) AS profile
            FROM tblconsulting c
            LEFT JOIN tblstudent s ON c.id_number = s.id_number
            LEFT JOIN tblstaff t ON c.id_number = t.id_number
            WHERE c.consult_id = ?;
            `;

            con.query(
                reg_conSql, [consult_id],
                function (err, reg_conResult) {
                    if (err) {
                        console.error('Error executing SQL query:', err);
                        return res.status(500).json({
                            Result: "Failure",
                            message: "Error executing SQL query: " + err.message
                        });
                    }

                    if (reg_conResult.length === 0) {
                        return res.status(404).json({
                            Result: "Failure",
                            message: "No consulting details found for the provided consult_id"
                        });
                    }

                    return res.status(200).json({
                        Result: "Success",
                        Registered: reg_conResult
                    });
                }
            );
        });
    } catch (ex) {
        console.error('Error:', ex);
        return res.status(500).json({
            Result: "Failure",
            message: "Unexpected error: " + ex.message
        });
    }

});
//Prescription Medicines 
app.get('/prescription_medicines', (req, res) => {
    res.header('Content-Type', 'application/json');
    const {consult_id} = req.query;

    if (!consult_id) {
        return res.status(400).json({
            Result: "Failure",
            message: "consult_id parameter is required"
        });
    }

    const prescription_medicinesSql = `
        SELECT 
            c.consult_id,
            c.id_number,
            c.patient_name,
            c.classes,
            c.division,
            p.medicine_name,
            CONCAT_WS('-',
                CASE WHEN p.period = 'morning' THEN '1' ELSE '0' END,
                CASE WHEN p.period = 'afternoon' THEN '1' ELSE '0' END,
                CASE WHEN p.period = 'evening' THEN '1' ELSE '0' END,
                CASE WHEN p.period = 'night' THEN '1' ELSE '0' END
            ) AS period,
            p.count,
            p.food,
            p.days
        FROM 
            tblconsulting c
        JOIN 
            tblprescriptiondetails p ON c.consult_id = p.consult_id
        WHERE 
            c.consult_id = ?;
    `;

    con.query(
        prescription_medicinesSql, [consult_id],
        function (err, prescription_medicinesResult) {
            if (err) {
                console.error('Error executing SQL query:', err);
                return res.status(500).json({
                    Result: "Failure",
                    message: "Error executing SQL query"
                });
            }

            if (prescription_medicinesResult.length === 0) {
                return res.status(404).json({
                    Result: "Failure",
                    message: "No prescription medicines found for the provided consult_id"
                });
            }

            return res.status(200).json({
                Result: "Success",
                Medicines: prescription_medicinesResult
            });
        }
    );
});


    // For Provider check box
    app.put('/provided', (req, res) => {
        const checkboxUpdates = req.body;
      
        const promises = checkboxUpdates.map(update => {
            const { prescriptiondetails_id, provided } = update;
            return new Promise((resolve, reject) => {
                // Adjusting the checkboxValue based on provided value
                let checkboxValue = provided ? 2 : 0; // If provided is 1, set both provided and prescription_status as 2, else set both as 0
      
                const sql = 'UPDATE tblprescriptiondetails SET provided = ?, prescription_status = ? WHERE prescription_id = ?';
                con.query(sql, [checkboxValue, checkboxValue, prescriptiondetails_id], (err, result) => {
                    if (err) {
                        console.error(`Error updating checkbox ${prescriptiondetails_id} state:`, err);
                        reject(err);
                    } else {
                        console.log(`Checkbox state updated for ID ${prescriptiondetails_id}`);
                        resolve(result);
                    }
                });
            });
        });
      
        Promise.all(promises)
            .then(() => {
                res.status(200).json({ message: 'Checkbox states updated successfully' });
            })
            .catch((err) => {
                res.status(500).json({ error: 'Internal server error' });
            });
      });

//Cancelled reason      
      app.put('/cancelled_reason', (req, res) => {
        res.header('Content-Type', 'application/json');
      
        try {
          const { consult_id } = req.body;
          const status = 'cancelled';
          const reason = 'cancelled by HCR';
      
          const sql = `
        UPDATE tblconsulting AS c
        INNER JOIN tblparent_available AS p ON c.doctor_id = p.doctor_id
        INNER JOIN tblchild_available AS ch ON p.parent_available_id = ch.parent_available_id
        SET c.status = ?, c.reason = ?, p.days = CASE WHEN p.days IS NULL OR p.days = '' THEN DAYNAME(c.date) ELSE p.days END, ch.disable_bts = 0
        WHERE c.consult_id = ? AND c.from_time = ch.from_time;
      `;
      
      
          con.query(sql, [status, reason, consult_id], function(err, result) {
            if (err) {
              console.error('Appointment cancellation error:', err);
              res.status(500).json({
                Result: 'Failure',
                message: 'Appointment cancellation failed'
              });
            } else {
              console.log('Appointment Cancelled:', result);
              res.status(200).json({
                Result: 'Success',
                message: 'Appointment cancelled successfully'
              });
            }
          });
        } catch (ex) {
          console.error('Error:', ex);
          res.status(500).json({
            Result: 'Failure',
            message: ex.message
          });
        }
      });
 // GET HCR Profile
app.get('/profile', (req, res) => {
    const {id_number} = req.query;

    try {
        con.connect(function (err) {
            if (err) {
                console.error('Error connecting to the database:', err);
                return res.status(500).json({
                    Result: "Failure",
                    message: "Error connecting to the database"
                });
            }

            console.log("Connected!");

            // Query to fetch profile information based on id_number
            const profileLookupSql = `
                SELECT id_number,profile, name, department, designation, dob, blood_group, gender
                FROM tblstaff
                WHERE id_number = ?
            `;

            // Execute the profile lookup query
            con.query(
                profileLookupSql, [id_number],
                function (err, profileResult) {
                    if (err) {
                        console.error('Error executing profile lookup query:', err);
                        return res.status(500).json({
                            Result: "Failure",
                            message: "Error executing profile lookup query"
                        });
                    }

                    // If profile data is found, return it
                    if (profileResult.length > 0) {
                        return res.status(200).json({
                            Result: "Success",
                            profile: profileResult[0]
                        });
                    } else {
                        // If no profile data is found for the provided id_number, return a failure response
                        return res.status(404).json({
                            Result: "Failure",
                            message: "No profile found with the provided id_number"
                        });
                    }
                }
            );
        });
    } catch (ex) {
        console.error('Error:', ex);
        return res.status(500).json({
            Result: "Failure",
            message: ex.message
        });
    }
});

// Update HCR Image Data
app.put('/updateprofile', (req, res) => {
    res.header('Content-Type', 'application/json');
  
      const { id_number, image_url } = req.body;

       try{
     var base64Image=  convertImageToBase64new(image_url, "png");
        con.connect(function (err) {
          if (err) throw err;
          console.log("Connected!");
  
          const sql = `
            UPDATE tblstaff 
            SET profile = ?
            WHERE id_number = ?
          `;
  
          con.query(
            sql,
            [base64Image, id_number],
            function (err, result) {
              if (err) throw err;
              console.log("HCR image updated:", result);
              res.status(200).json({
                Result: "Success",
                message: "HCR Profile Image Updated Successfully"
              });
            }
          );
        });
      
    } catch (ex) {
      console.error('Error:', ex);
      res.status(500).json({
        Result: "Failure",
        message: ex.message
      });
    }
  });   

//staff profile 
app.get('/staff_profile', (req, res) => {
    res.header('Content-Type', 'application/json');
    const id_number = req.query.id_number;

    if (!id_number) {
        return res.status(400).json({
            Result: "Failure",
            message: "valid id_number is required"
        });
    }

    const staff_profileSql = `
    SELECT 
    s.name,
    s.id_number,
    s.profile,
    s.designation,
    c.classes,
    c.division,
    c.consult_id
    FROM 
        tblstaff s
    INNER JOIN 
        tblconsulting c ON s.id_number = c.id_number
    WHERE 
        s.id_number = ?;
    `;

    con.query(
        staff_profileSql, [id_number],
        function (err, staff_profileResult) {
            if (err) {
                console.error('Error executing SQL query:', err);
                return res.status(500).json({
                    Result: "Failure",
                    message: "Error executing SQL query"
                });
            }

            if (staff_profileResult.length === 0) {
                return res.status(404).json({
                    Result: "Failure",
                    message: "No staff found for the provided id"
                });
            }

            return res.status(200).json({
                Result: "Success",
                Medicines: staff_profileResult
            });
        }
    );
});

// Staffs endpoint
app.get('/staffs', (req, res) => {
    res.header('Content-Type', 'application/json');
    const { id_number } = req.query;

    if (!id_number) {
        return res.status(400).json({
            Result: "Failure",
            message: "id_number query parameter is required"
        });
    }

    const staffSql = `
        SELECT 
            c.classes_name,
            c.division,
            s.profile,
            s.name,
            s.id_number,
            s.designation
        FROM 
            tblclasses c 
        INNER JOIN 
            tblstaff s ON s.classes = c.classes_name AND s.division = c.division
        WHERE 
            c.id_number = ?;
            `
    ;

    con.query(staffSql, [id_number], function (err, staffResult) {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({
                Result: "Failure",
                message: "Error executing SQL query"
            });
        }

        return res.status(200).json({
            Result: "Success",
            Staff: staffResult
        });
    });
});
//Staff Details
app.get('/staff_details', (req, res) => {
    res.header('Content-Type', 'application/json');
  
    try {
      const { id_number } = req.query;
  
      if (!id_number) {
        return res.status(400).json({
          result: "failure",
          message: "Please provide a valid id_number"
        });
      }
  
      const specificStaffQuery = `
      SELECT st.profile, st.name, st.designation, 
       DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(), st.dob)), '%Y') + 0 AS age, 
       st.current_health_report, st.past_health_report,
       st.gender, st.blood_group, st.allergies_define, st.any_disease_define, 
       CONCAT(st.address, ', ', st.state, ', ', st.pincode) AS address, 
       st.mobile_number
        FROM tblstaff st
        WHERE st.id_number = ?;
      `
        
      ;
  
      con.query(specificStaffQuery, [id_number], function (err, result) {
        if (err) {
          console.error('Error:', err);
          return res.status(500).json({
            result: "failure",
            message: "Internal Server Error"
          });
        }
  
        if (result.length > 0) {
          console.log("Retrieved specific staff record");
          return res.status(200).json({
            result: "success",
            message: "Staff Data Retrieved Successfully",
            data: result[0] 
          });
        } else {
          return res.status(404).json({
            result: "failure",
            message: "Staff record not found"
          });
        }
      });
    } catch (ex) {
      console.error('Error:', ex);
      res.status(500).json({
        result: "failure",
        message: "Internal Server Error"
      });
    }
  });



// Classes endpoint
app.get('/classes', (req, res) => {
    res.header('Content-Type', 'application/json');
    const { id_number } = req.query;

    if (!id_number) {
        return res.status(400).json({
            Result: "Failure",
            message: "id_number query parameter is required"
        });
    }

    const classSql =`
        SELECT classes_name, division, department
        FROM tblclasses
        WHERE id_number = ?;
        `
    ;

    con.query(classSql, [id_number], function (err, classResult) {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({
                Result: "Failure",
                message: "Error executing SQL query"
            });
        }

        return res.status(200).json({
            Result: "Success",
            Class: classResult
        });
    });
});

//Follow Back 
app.get('/follow_back_list', (req, res) => {
    res.header('Content-Type', 'application/json');

    const StudentReportQuery =`
        SELECT s.profile, ct.patient_name, ct.consult_id, ct.sick_type, ct.from_time AS start_on, ct.follow_back
        FROM tblstudent s
        INNER JOIN tblconsulting ct ON s.id_number = ct.id_number
        WHERE ct.follow_back IS NOT NULL;
        `
    ;

    const StaffReportQuery = `
        SELECT st.profile, ct.patient_name, ct.consult_id, ct.sick_type, ct.from_time AS start_on, ct.follow_back
        FROM tblstaff st
        INNER JOIN tblconsulting ct ON st.id_number = ct.id_number
        WHERE ct.follow_back IS NOT NULL;
        `
    ;

    try {
        const studentQueryPromise = new Promise((resolve, reject) => {
            con.query(StudentReportQuery, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        const staffQueryPromise = new Promise((resolve, reject) => {
            con.query(StaffReportQuery, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        Promise.all([studentQueryPromise, staffQueryPromise])
            .then(([studentResults, staffResults]) => {
                const combinedResults = [...studentResults, ...staffResults];

                if (combinedResults.length > 0) {
                    console.log("Retrieved Follow Back Report for students and staff.");
                    return res.status(200).json({
                        result: "success",
                        message: "Follow Back Report Retrieved Successfully",
                        data: combinedResults
                    });
                } else {
                    return res.status(404).json({
                        result: "failure",
                        message: "No Follow Back Reports found for Students or Staff"
                    });
                }
            })
            .catch((error) => {
                console.error('Database Error:', error);
                res.status(500).json({
                    result: "failure",
                    message: "Internal Server Error"
                });
            });
    } catch (ex) {
        console.error('Error:', ex);
        res.status(500).json({
            result: "failure",
            message: "Internal Server Error"
        });
    }
});  
//Inventory
// Route to get the InStock Medicine Count
app.get('/instock_medicine', (req, res) => {
    res.header('Content-Type', 'application/json');
    con.connect(function (err) {
      if (err) throw err;
      console.log("Connected!");
      var sql = `SELECT COUNT(*) AS instock FROM tblmedicine_list WHERE quantity > 10`;
      con.query(sql, function (err, result){
        if (err) throw err;
        const instock = result[0].instock;
        console.log(`Total records count: ${instock}`);
        res.status(200).json({ Result: "Success", instock });
      });   
    });
  });


// Route to get the OutStock Medicine Count
  app.get('/outofstock_medicine', (req, res) => {
    res.header('Content-Type', 'application/json');
    con.connect(function (err) {
      if (err) throw err;
      console.log("Connected!");
      var sql = "SELECT count(*) AS outofstock FROM tblmedicine_list WHERE quantity < 10";
      con.query(sql, function (err, result) {
        if (err) throw err;
        const outofstock = result[0].outofstock;
        console.log(`Out of stock medicine count: ${outofstock}`);
        res.status(200).json({ Result: "Success", outofstock });
      });
    });
  });
  
  

 // View All Medicine Inventory
app.get('/viewall_medicineinventory', (req, res) => {
    res.header('Content-Type', 'application/json');
    const sql = `
    SELECT distinct
    p.medicine_name,
    m.hsn_code,
    m.quantity   
    FROM 
        tblconsulting c 
    INNER JOIN 
        tblprescriptiondetails p 
    ON 
        p.consult_id = c.consult_id 
    INNER JOIN 
        tblmedicine_list m 
    ON 
        m.medicine = p.medicine_name
    WHERE 
        p.provided = 1 `
  
    con.query(sql, (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ result: 'failure', message: 'Internal Server Error' });
        }
        const medicineDetailsSet = new Set();
  
        result.forEach(row => {
            medicineDetailsSet.add({
                medicine_name: row.medicine_name,
                hsn_code: row.hsn_code,        
                quantity: row.quantity,
            });
        });
    
        const medicineDetailsArray = Array.from(medicineDetailsSet);
  
        res.status(200).json({
            result: 'success',
            message: 'Prescription Details Retrieved Successfully',
            medicine_details: medicineDetailsArray
        });
    });    
});


// Search Medicine Inventory
app.get('/search_medicineinventory', (req, res) => {
    res.header('Content-Type', 'application/json');
    
    // Extracting keyword from query parameters
    const keyword = req.query.keyword || '';
    const searchString = `%${keyword}%`;

    // SQL query to search for medicine inventory
    let sql = `
        SELECT 
            p.medicine_name,
            m.hsn_code,
            m.quantity   
        FROM 
            tblconsulting c 
        INNER JOIN 
            tblprescriptiondetails p 
        ON 
            p.consult_id = c.consult_id 
        INNER JOIN 
            tblmedicine_list m 
        ON 
            m.medicine = p.medicine_name
        WHERE 
            p.provided = 1 AND 
            (
                p.medicine_name LIKE ? OR
                m.hsn_code LIKE ? OR
                p.count LIKE ?
            )`;

    // Execute the SQL query
    con.query(sql, [searchString, searchString, searchString], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ result: 'failure', message: 'Internal Server Error' });
        }

        // Format the response 
        const medicineDetailsSet = new Set();

        result.forEach(row => {
            medicineDetailsSet.add(JSON.stringify({
                medicine_name: row.medicine_name,
                hsn_code: row.hsn_code,        
                quantity: row.count,
            }));
        });
      
        const medicineDetailsArray = Array.from(medicineDetailsSet).map(JSON.parse);

        res.status(200).json({
            result: 'success',
            message: 'Prescription Details Retrieved Successfully',
            medicine_details: medicineDetailsArray
        });
    });    
});
//Tickets
//Create a POST route to Ticket Booking
app.post('/ticket_rise', (req, res) => {
    res.header('Content-Type', 'application/json');

    try {
        let { ticket_status, subject, issue } = req.body;

        // Check if required fields are provided
        if (!subject || !issue) {
            return res.status(400).json({
                result: 'failure',
                message: 'Please provide valid details'
            });
        }

        // Set default value for ticket_status if not provided
        if (!ticket_status) {
            ticket_status = 'open';
        }

        const insertTicketQuery = 'INSERT INTO tbltickets (ticket_status, subject, issue, submitted) VALUES (?, ?, ?, now())';

        con.query(insertTicketQuery, [ticket_status, subject, issue], (err, result) => {
            if (err) {
                console.error('Error inserting tickets details:', err);
                return res.status(500).json({
                    result: 'failure',
                    message: 'Internal Server Error'
                });
            }

            console.log('Tickets details inserted successfully');
            res.status(200).json({
                result: 'success',
                message: 'Tickets Details Inserted Successfully',
                data: result
            });
        });
    } catch (ex) {
        console.error('Exception:', ex);
        res.status(500).json({
            result: 'failure',
            message: 'Internal Server Error'
        });
    }
});


// GET Route to Fetch Ticket Details
app.get('/ticket_alldetails', (req, res) => {
    res.header('Content-Type', 'application/json');

    try {
        const selectTicketsQuery = `
            SELECT 
                ticket_id, 
                subject, 
                CASE 
                    WHEN ticket_status = 'open' THEN DATE_FORMAT(submitted, "%b %e, %Y")
                    WHEN ticket_status = 'solved' THEN DATE_FORMAT(submitted, "%b %e, %Y %H:%i")
                END AS submitted,
                ticket_status 
            FROM tbltickets`;

        con.query(selectTicketsQuery, (err, results) => {
            if (err) {
                console.error('Error fetching tickets details:', err);
                return res.status(500).json({
                    result: 'failure',
                    message: 'Internal Server Error'
                });
            }

            console.log('Tickets details fetched successfully');
            res.status(200).json({
                result: 'success',
                message: 'Tickets Details Fetched Successfully',
                data: results
            });
        });
    } catch (ex) {
        console.error('Exception:', ex);
        res.status(500).json({
            result: 'failure',
            message: 'Internal Server Error'
        });
    }
});




// GET Route to Fetch Ticket Details
app.get('/ticket_details', (req, res) => {
    res.header('Content-Type', 'application/json');
    
    const { ticket_id } = req.query;
    
    try {
        const selectTicketsQuery = `
            SELECT 
                subject, 
                CASE 
                    WHEN ticket_status = 'open' THEN DATE_FORMAT(submitted, "%b %e, %Y")
                    WHEN ticket_status = 'solved' THEN DATE_FORMAT(submitted, "%b %e, %Y %H:%i")
                END AS submitted,
                ticket_id,
                ticket_status 
            FROM tbltickets 
            WHERE ticket_id = ?`;

        con.query(selectTicketsQuery, [ticket_id], (err, results) => {
            if (err) {
                console.error('Error fetching ticket details:', err);
                return res.status(500).json({
                    result: 'failure',
                    message: 'Internal Server Error'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    result: 'failure',
                    message: 'Ticket not found'
                });
            }

            console.log('Ticket details fetched successfully');
            res.status(200).json({
                result: 'success',
                message: 'Ticket Details Fetched Successfully',
                data: results[0] 
            });
        });
    } catch (ex) {
        console.error('Exception:', ex);
        res.status(500).json({
            result: 'failure',
            message: 'Internal Server Error'
        });
    }
});




// PUT Route to Update Ticket Status
app.put('/update_ticket_status', (req, res) => {
    res.header('Content-Type', 'application/json');
    
    const { ticket_id, ticket_status } = req.body; 

    // Set default value for ticket_status to "solved" if not provided
    const updatedTicketStatus = ticket_status || 'solved';

    try {
        const updateTicketQuery = 'UPDATE tbltickets SET ticket_status = ? WHERE ticket_id = ?';
        
        con.query(updateTicketQuery, [updatedTicketStatus, ticket_id], (err, results) => {
            if (err) {
                console.error('Error updating ticket status:', err);
                return res.status(500).json({
                    result: 'failure',
                    message: 'Internal Server Error'
                });
            }
            
            if (results.affectedRows === 0) {
                return res.status(404).json({
                    result: 'failure',
                    message: 'Ticket not found'
                });
            }
            
            console.log('Ticket status updated successfully');
            res.status(200).json({
                result: 'success',
                message: 'Ticket Status Updated Successfully'
            });
        });
    } catch (ex) {
        console.error('Exception:', ex);
        res.status(500).json({
            result: 'failure',
            message: 'Internal Server Error'
        });
    }
});


//ConsultingSearch


app.get('/Consulting_Search', (req, res) => {
    res.header('Content-Type', 'application/json');

    const keyword = req.query.keyword || '';
    const searchString = `%${keyword}%`;
    const organizationName = req.query.organization_name || '';

    const Consulting_SearchQuery = `
        SELECT 
            name, 
            classes, 
            division, 
            profile,
            id_number
        FROM 
            tblstudent
        WHERE 
            (classes LIKE ?
             OR id_number LIKE ?
             OR name LIKE ?)
            AND organization_name = ?
        
        UNION
        
        SELECT 
            name, 
            NULL AS classes, 
            NULL AS division, 
            profile,
            id_number
        FROM 
            tblstaff
        WHERE 
            (id_number LIKE ?   
             OR name LIKE ?)
            AND organization_name = ?`;

    // Correct number of parameters in the correct order
    con.query(Consulting_SearchQuery, [searchString, searchString, searchString, organizationName, searchString, searchString, organizationName], (err, results) => {
        if (err) {
            console.error('Error fetching consulting search details:', err);
            return res.status(500).json({
                result: 'failure',
                message: 'Internal Server Error'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                result: 'failure',
                message: 'No results found'
            });
        }

        console.log('Consulting search details fetched successfully');
        res.status(200).json({
            result: 'success',
            message: 'Consulting Search Details Fetched Successfully',
            data: results
        });
    });
});





// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});