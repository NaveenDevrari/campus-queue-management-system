import Department from "../models/Department.js";
import Queue from "../models/Queue.js";
import User from "../models/User.js";

/* ======================================================
   CREATE DEPARTMENT (ADMIN)
====================================================== */
export const createDepartment = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const { name, description } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Department name is required" });
    }

    const existingDept = await Department.findOne({
      name: name.trim(),
    });

    if (existingDept) {
      return res.status(400).json({ message: "Department already exists" });
    }

    const department = await Department.create({
      name: name.trim(),
      description,
      createdBy: req.user.id,
    });

    // Auto-create queue for department
    await Queue.create({
      department: department._id,
    });

    res.status(201).json({
      message: "Department and queue created successfully",
      department,
    });
  } catch (error) {
    console.error("Create department error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   ASSIGN STAFF TO DEPARTMENT (ADMIN)
====================================================== */
export const assignStaffToDepartment = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const { staffId, departmentId } = req.body;

    if (!staffId || !departmentId) {
      return res
        .status(400)
        .json({ message: "Staff ID and Department ID are required" });
    }

    // Validate staff
    const staff = await User.findById(staffId);
    if (!staff || staff.role !== "staff") {
      return res.status(400).json({ message: "Invalid staff user" });
    }

    // Validate department
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // 🔴 Remove staff from any previous department
    await Department.updateMany(
      { staff: staffId },
      { $pull: { staff: staffId } }
    );

    // 🟢 Add staff to selected department
    await Department.findByIdAndUpdate(departmentId, {
      $addToSet: { staff: staffId },
    });

    // 🟢 Update staff document
    staff.department = departmentId;
    await staff.save();

    res.json({
      message: "Staff assigned to department successfully",
      staffId: staff._id,
      departmentId,
    });
  } catch (error) {
    console.error("Assign staff error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GET ALL DEPARTMENTS (ADMIN)
====================================================== */
export const getDepartments = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const departments = await Department.find()
      .populate("staff", "fullName email")
      .sort({ createdAt: -1 });

    res.json(departments);
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GET ALL STAFF USERS (ADMIN)
====================================================== */
export const getStaffUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const staff = await User.find({ role: "staff" })
      .select("_id fullName email department")
      .populate("department", "name");

    res.json(staff);
  } catch (error) {
    console.error("Get staff users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
