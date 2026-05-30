const express = require("express");
const { PrismaClient } = require("@prisma/client");
const {
  authenticate,
  authorize,
} = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/patients
 * Retrieve paginated patient directory with search and gender filtering.
 * Restricted to ADMIN and RECEPTIONIST roles.
 */
router.get("/", authenticate, authorize(['ADMIN', 'RECEPTIONIST']), async (req, res) => {
  try {
    const { search, gender } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (gender && gender !== "All") {
      where.gender = { equals: gender, mode: 'insensitive' };
    }

    const [patients, totalCount] = await Promise.all([
      prisma.patient.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.patient.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        patients,
        pagination: {
          page,
          limit,
          totalPatients: totalCount,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error('[PATIENTS] Fetch error:', error);
    res.status(500).json({ success: false, error: "Failed to fetch patients" });
  }
});

/**
 * GET /api/patients/:id
 * Retrieve specific patient details including appointment history.
 */
router.get("/:id", authenticate, async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          include: { doctor: true }
        },
      },
    });

    if (!patient) {
      return res.status(404).json({ success: false, error: "Patient not found" });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    console.error('[PATIENTS] Lookup error:', error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

/**
 * POST /api/patients
 * Register a new patient record.
 */
router.post("/", authenticate, authorize(['ADMIN', 'RECEPTIONIST']), async (req, res) => {
  try {
    const { name, email, phoneNumber, age, gender, medicalHistory } = req.body;

    // Input Validation
    if (!name || !phoneNumber || !age || !gender) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields: name, phoneNumber, age, and gender are required." 
      });
    }

    // Phone validation (basic)
    const phoneRegex = /^\+?[\d\s-]{8,20}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ success: false, error: "Invalid phone number format." });
    }

    // Email validation if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, error: "Invalid email format." });
      }
    }

    // Age validation
    const ageInt = parseInt(age);
    if (isNaN(ageInt) || ageInt < 0 || ageInt > 150) {
      return res.status(400).json({ success: false, error: "Invalid age value." });
    }

    const patient = await prisma.patient.create({
      data: {
        name,
        email: email || null,
        phoneNumber,
        age: ageInt,
        gender,
        medicalHistory: medicalHistory || null,
      },
    });

    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    console.error('[PATIENTS] Registration error:', error);
    res.status(500).json({ success: false, error: "Failed to register patient" });
  }
});

/**
 * DELETE /api/patients/:id
 * Remove a patient record. Restricted to ADMIN only.
 */
router.delete(
  "/:id",
  authenticate,
  authorize('ADMIN'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const patient = await prisma.patient.findUnique({ where: { id } });
      if (!patient) {
        return res.status(404).json({ success: false, error: "Patient not found" });
      }

      await prisma.patient.delete({ where: { id } });

      res.json({ success: true, message: `Successfully deleted patient ${patient.name}` });
    } catch (error) {
      console.error('[PATIENTS] Delete error:', error);

      if (error.code === 'P2003') {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete patient because linked records (appointments/tokens) exist.',
        });
      }

      res.status(500).json({ success: false, error: 'Failed to delete patient' });
    }
  },
);

module.exports = router;
