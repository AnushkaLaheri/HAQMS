const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/queue
 * List all active queue tokens.
 */
router.get("/", async (req, res) => {
  try {
    const { doctorId, status } = req.query;

    const where = {};
    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;

    const tokens = await prisma.queueToken.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({ success: true, data: tokens });
  } catch (error) {
    console.error("[QUEUE] Fetch error:", error);
    res.status(500).json({ success: false, error: "Failed to retrieve queue" });
  }
});

/**
 * POST /api/queue/checkin
 * Generate a new queue token for a patient.
 */
router.post("/checkin", authenticate, authorize(['ADMIN', 'RECEPTIONIST', 'DOCTOR']), async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId } = req.body;

    if (!patientId || !doctorId) {
      return res.status(400).json({
        success: false,
        error: "Patient and Doctor ID are required for check-in.",
      });
    }

    // Check for active token
    const existingToken = await prisma.queueToken.findFirst({
      where: {
        patientId,
        status: { in: ['WAITING', 'CALLING'] },
      },
    });

    if (existingToken) {
      return res.status(400).json({
        success: false,
        error: 'Patient already has an active queue token.',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate token in a transaction
    const newToken = await prisma.$transaction(async (tx) => {
      const maxTokenResult = await tx.queueToken.aggregate({
        where: {
          doctorId,
          checkinDate: today,
        },
        _max: {
          tokenNumber: true,
        },
      });

      const nextTokenNumber = (maxTokenResult._max.tokenNumber || 0) + 1;

      return tx.queueToken.create({
        data: {
          tokenNumber: nextTokenNumber,
          checkinDate: today,
          patientId,
          doctorId,
          appointmentId: appointmentId || null,
          status: "WAITING",
        },
        include: {
          patient: true,
          doctor: true,
        },
      });
    });

    res.status(201).json({
      success: true,
      message: "Checked in successfully.",
      data: newToken,
    });
  } catch (error) {
    console.error("[QUEUE] Check-in error:", error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        success: false, 
        error: "Conflict detected during token generation. Please try again." 
      });
    }

    res.status(500).json({ success: false, error: "Check-in failed" });
  }
});

/**
 * PATCH /api/queue/:id
 * Update token status.
 */
router.patch("/:id", authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: "Status is required" });
    }

    const updatedToken = await prisma.queueToken.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        patient: true,
        doctor: true,
      },
    });

    res.json({ success: true, data: updatedToken });
  } catch (error) {
    console.error("[QUEUE] Update error:", error);
    res.status(500).json({ success: false, error: "Failed to update queue token" });
  }
});

module.exports = router;
