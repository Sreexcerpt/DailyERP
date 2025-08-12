const Employee = require("../../models/hrms/employee");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");


exports.createFaculty = async (req, res) => {
  try {
    let { email, password, branches, employeeId, ...otherData } = req.body;
    const plainPassword = password;
console.log('emp',req.body)
    if (typeof otherData.role === 'string') {
      try { otherData.role = JSON.parse(otherData.role); } catch {}
    }

    if (typeof otherData.subjects === 'string') {
      try { otherData.subjects = JSON.parse(otherData.subjects); } catch {}
    }

    const existingFaculty = await Employee.findOne({ email });
    if (existingFaculty) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Email already exists" });
    }

    if (password) {
      const saltRounds = 10;
      password = await bcrypt.hash(password, saltRounds);
    }

    const profilePhoto = req.file ? `profile/${req.file.filename}` : null;
    const branchId = branches;

    const faculty = new Employee({
      ...otherData,
      email,
      password,
      branchId,
      employeeId,
      profilePhoto
    });

    await faculty.save();

    // if (email && plainPassword && (otherData.name || otherData.firstName)) {
    //   try {
    //     await sendWelcomeEmail(email, plainPassword, otherData.name || otherData.firstName);
    //   } catch (emailError) {
    //     console.error("Email sending failed:", emailError.message);
    //   }
    // }

    res.status(201).json({ message: "Faculty added successfully", faculty });
  } catch (error) {
    console.error("Error creating faculty:", error); 
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateFaculty = async (req, res) => {
  try {
    const existingFaculty = await Employee.findById(req.params.id);
    if (!existingFaculty) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Faculty not found" });
    }

    let updateData = { ...req.body };

    if (updateData.branches) {
      updateData.branchId = updateData.branches;
      delete updateData.branches;
    }

    if (!updateData.MasterBranchID || updateData.MasterBranchID === "undefined") {
      delete updateData.MasterBranchID;
    }

    if (typeof updateData.role === "string") {
      try { updateData.role = JSON.parse(updateData.role); } catch {}
    }

    if (typeof updateData.subjects === "string") {
      try { updateData.subjects = JSON.parse(updateData.subjects); } catch {}
    }

    if (req.file) {
      if (existingFaculty.profilePhoto) {
        const oldPhotoPath = path.join("uploads", existingFaculty.profilePhoto);
        if (fs.existsSync(oldPhotoPath)) fs.unlinkSync(oldPhotoPath);
      }
      updateData.profilePhoto = `profile/${req.file.filename}`;
    }

    if (updateData.password && updateData.password.trim() !== '') {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password;
    }

    const faculty = await Employee.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ message: "Faculty updated successfully", faculty });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllFaculties = async (req, res) => {
  try {
    const { branchId } = req.query;
    const faculties = branchId ? await Employee.find({ branchId }) : await Employee.find();
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch faculties" });
  }
};

exports.getFacultyById = async (req, res) => {
  try {
    const faculty = await Employee.findById(req.params.userId);
    if (!faculty) return res.status(404).json({ success: false, message: "Faculty not found" });
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.deleteFaculty = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "Faculty deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete faculty" });
  }
};
