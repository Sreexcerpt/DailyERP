// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json({ limit: "10mb" }));

// // Connect to MongoDB
// mongoose.connect("mongodb+srv://excerpttech:excerpttech2021@cluster0.5vdeszu.mongodb.net/Excerpt", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => console.log("✅ MongoDB connected"))
//   .catch(err => console.error("❌ MongoDB error:", err));

// // ====== Schemas ======

// const employeeSchema = new mongoose.Schema({
//   name: String,
//   descriptor: [Number], // 128-d face descriptor
//   image: String // base64 (optional)
// });

// const attendanceSchema = new mongoose.Schema({
//   employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
//   date: { type: Date, default: Date.now }
// });

// const Employee = mongoose.model("Employee", employeeSchema);
// const Attendance = mongoose.model("Attendance", attendanceSchema);

// // ====== Routes ======

// // Register employee with face descriptor
// app.post("/api/employee/register", async (req, res) => {
//   const { name, descriptor, image } = req.body;
//   try {
//     const employee = new Employee({ name, descriptor, image });
//     await employee.save();
//     res.json({ message: "✅ Employee registered", employee });
//   } catch (error) {
//     res.status(500).json({ error: "❌ Error registering employee" });
//   }
// });

// // Get all registered employees (for face matching)
// app.get("/api/employees", async (req, res) => {
//   try {
//     const employees = await Employee.find();
//     res.json(employees);
//   } catch (err) {
//     res.status(500).json({ error: "❌ Error fetching employees" });
//   }
// });

// // Mark attendance
// app.post("/api/attendance", async (req, res) => {
//   const { employeeId } = req.body;
//   try {
//     const attendance = new Attendance({ employeeId });
//     await attendance.save();
//     res.json({ message: "✅ Attendance marked", attendance });
//   } catch (error) {
//     res.status(500).json({ error: "❌ Error marking attendance" });
//   }
// });

// // Get attendance records (optional)
// app.get("/api/attendance", async (req, res) => {
//   try {
//     const records = await Attendance.find().populate("employeeId", "name");
//     res.json(records);
//   } catch (err) {
//     res.status(500).json({ error: "❌ Error fetching attendance" });
//   }
// });

// // ====== Start Server ======

// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path=require('path')
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Connect to MongoDB
mongoose.connect("mongodb+srv://excerpttech:excerpttech2021@cluster0.5vdeszu.mongodb.net/Excerpt", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ====== Schemas ======

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  descriptor: { type: [Number], required: true }, // Array of numbers for face descriptor
  image: { type: String } // base64 image (optional)
}, {
  timestamps: true // Add createdAt and updatedAt
});

const attendanceSchema = new mongoose.Schema({
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Employee",
    required: true 
  },
  date: { type: Date, default: Date.now },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Employee = mongoose.model("Employee", employeeSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);

// ====== Routes ======

// Register employee with face descriptor
app.post("/api/employee/register", async (req, res) => {
  const { name, descriptor, image } = req.body;
  
  try {
    // Validation
    if (!name || !descriptor) {
      return res.status(400).json({ 
        error: "Name and face descriptor are required" 
      });
    }

    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
      return res.status(400).json({ 
        error: "Invalid face descriptor format. Expected array of 128 numbers." 
      });
    }

    console.log(`Registering employee: ${name}`);
    console.log(`Descriptor length: ${descriptor.length}`);
    console.log(`Descriptor sample:`, descriptor.slice(0, 5));

    // Check if employee with same name already exists
    const existingEmployee = await Employee.findOne({ name: name.trim() });
    if (existingEmployee) {
      return res.status(400).json({ 
        error: "Employee with this name already exists" 
      });
    }

    // Create new employee
    const employee = new Employee({ 
      name: name.trim(), 
      descriptor: descriptor.map(num => parseFloat(num)), // Ensure numbers are floats
      image 
    });
    
    await employee.save();
    
    console.log(`✅ Employee registered successfully: ${employee._id}`);
    
    res.json({ 
      message: "✅ Employee registered successfully", 
      employee: {
        _id: employee._id,
        name: employee.name,
        createdAt: employee.createdAt
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      error: "❌ Error registering employee",
      details: error.message 
    });
  }
});

// Get all registered employees (for face matching)
app.get("/api/employees", async (req, res) => {
  try {
    const employees = await Employee.find({}, 'name descriptor image createdAt').lean();
    
    console.log(`📋 Fetching ${employees.length} employees`);
    
    // Filter out employees with invalid descriptors and process valid ones
    const processedEmployees = employees
      .filter(emp => {
        if (!emp.descriptor || !Array.isArray(emp.descriptor) || emp.descriptor.length !== 128) {
          console.warn(`⚠️ Employee ${emp.name} (${emp._id}) has invalid descriptor:`, {
            hasDescriptor: !!emp.descriptor,
            isArray: Array.isArray(emp.descriptor),
            length: emp.descriptor ? emp.descriptor.length : 'N/A'
          });
          return false;
        }
        return true;
      })
      .map(emp => ({
        ...emp,
        descriptor: emp.descriptor.map(num => parseFloat(num))
      }));
    
    console.log(`✅ Returning ${processedEmployees.length} valid employees out of ${employees.length} total`);
    
    if (processedEmployees.length === 0 && employees.length > 0) {
      console.warn("⚠️ All employees have invalid descriptors. You may need to re-register them.");
    }
    
    res.json(processedEmployees);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ 
      error: "❌ Error fetching employees",
      details: err.message 
    });
  }
});

// Mark attendance
app.post("/api/attendance", async (req, res) => {
  const { employeeId } = req.body;
  
  try {
    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    // Verify employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Check if attendance already marked today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await Attendance.findOne({
      employeeId: employeeId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (existingAttendance) {
      return res.status(400).json({ 
        error: "Attendance already marked for today",
        attendance: existingAttendance 
      });
    }

    // Mark new attendance
    const attendance = new Attendance({ employeeId });
    await attendance.save();
    
    console.log(`✅ Attendance marked for ${employee.name}`);
    
    res.json({ 
      message: "✅ Attendance marked successfully", 
      attendance: {
        _id: attendance._id,
        employeeId: attendance.employeeId,
        date: attendance.date,
        employeeName: employee.name
      }
    });
  } catch (error) {
    console.error("Attendance error:", error);
    res.status(500).json({ 
      error: "❌ Error marking attendance",
      details: error.message 
    });
  }
});

// Get attendance records with employee details
app.get("/api/attendance", async (req, res) => {
  try {
    const { date, employeeId } = req.query;
    let query = {};

    // Filter by date if provided
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = { $gte: targetDate, $lt: nextDay };
    }

    // Filter by employee if provided
    if (employeeId) {
      query.employeeId = employeeId;
    }

    const records = await Attendance.find(query)
      .populate("employeeId", "name")
      .sort({ date: -1 })
      .lean();
    
    console.log(`📊 Fetching ${records.length} attendance records`);
    res.json(records);
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ 
      error: "❌ Error fetching attendance",
      details: err.message 
    });
  }
});

// Get today's attendance
app.get("/api/attendance/today", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const records = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    })
    .populate("employeeId", "name")
    .sort({ date: -1 })
    .lean();
    
    res.json({
      date: today.toISOString().split('T')[0],
      count: records.length,
      records: records
    });
  } catch (err) {
    console.error("Error fetching today's attendance:", err);
    res.status(500).json({ 
      error: "❌ Error fetching today's attendance",
      details: err.message 
    });
  }
});

// Delete employee (for testing)
app.delete("/api/employee/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByIdAndDelete(id);
    
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Also delete their attendance records
    await Attendance.deleteMany({ employeeId: id });
    
    res.json({ message: "Employee and attendance records deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Error deleting employee" });
  }
});

// Clean up invalid employees (employees without proper descriptors)
app.post("/api/cleanup/invalid-employees", async (req, res) => {
  try {
    const employees = await Employee.find({}).lean();
    
    const invalidEmployees = employees.filter(emp => 
      !emp.descriptor || 
      !Array.isArray(emp.descriptor) || 
      emp.descriptor.length !== 128
    );
    
    if (invalidEmployees.length === 0) {
      return res.json({ 
        message: "No invalid employees found",
        totalEmployees: employees.length,
        validEmployees: employees.length
      });
    }
    
    // Delete invalid employees
    const deleteResult = await Employee.deleteMany({
      _id: { $in: invalidEmployees.map(emp => emp._id) }
    });
    
    // Delete their attendance records too
    await Attendance.deleteMany({
      employeeId: { $in: invalidEmployees.map(emp => emp._id) }
    });
    
    console.log(`🧹 Cleaned up ${deleteResult.deletedCount} invalid employees`);
    
    res.json({
      message: `Cleaned up ${deleteResult.deletedCount} invalid employees`,
      invalidEmployees: invalidEmployees.map(emp => ({
        name: emp.name,
        id: emp._id,
        descriptorIssue: !emp.descriptor ? "Missing descriptor" : 
                         !Array.isArray(emp.descriptor) ? "Descriptor not array" :
                         `Wrong length: ${emp.descriptor.length} (should be 128)`
      })),
      totalEmployees: employees.length,
      validEmployees: employees.length - invalidEmployees.length
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    res.status(500).json({ error: "Error during cleanup" });
  }
});

// Get database statistics
app.get("/api/stats", async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalAttendance = await Attendance.countDocuments();
    
    // Check for invalid employees
    const allEmployees = await Employee.find({}, 'name descriptor').lean();
    const validEmployees = allEmployees.filter(emp => 
      emp.descriptor && 
      Array.isArray(emp.descriptor) && 
      emp.descriptor.length === 128
    );
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: todayStart, $lte: todayEnd }
    });
    
    res.json({
      employees: {
        total: totalEmployees,
        valid: validEmployees.length,
        invalid: totalEmployees - validEmployees.length
      },
      attendance: {
        total: totalAttendance,
        today: todayAttendance
      },
      database: {
        status: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
        name: mongoose.connection.name
      }
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Error fetching statistics" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "✅ Server is running", 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// ====== Start Server ======
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback route for SPA (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

