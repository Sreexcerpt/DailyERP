const express = require("express");
const router = express.Router();
const facultyController = require("../../controllers/hrms/employeecontroller");
//const upload = require("../middleware/uploadMiddleware"); // Your multer config

// router.post("/", upload.single("profilePhoto"), facultyController.createFaculty);
// router.put("/:id", upload.single("profilePhoto"), facultyController.updateFaculty);
router.post("/",  facultyController.createFaculty);
router.put("/:id",  facultyController.updateFaculty);
router.get("/", facultyController.getAllFaculties);
router.get("/:userId", facultyController.getFacultyById);
router.delete("/:id", facultyController.deleteFaculty);

module.exports = router;
