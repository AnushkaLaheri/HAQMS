const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/appointments
 * List all appointments with optional doctor and status filtering.
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { doctorId, status } = req.query;

    const where = {};
    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;

    // RBAC: Doctors can only see their own appointments unless they are ADMIN/RECEPTIONIST
    if (req.user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
      if (doctor) {
        where.doctorId = doctor.id;
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: {
        appointmentDate: 'asc',
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            age: true,
            medicalHistory: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        count: appointments.length,
        appointments,
      },
    });
  } catch (error) {
    console.error('[APPOINTMENTS] Fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve appointments' });
  }
});

/**
 * POST /api/appointments
 * Book a new appointment.
 */
router.post('/', authenticate, authorize(['ADMIN', 'RECEPTIONIST']), async (req, res) => {
  try {
    const { patientId, doctorId, appointmentDate, reason } = req.body;

    if (!patientId || !doctorId || !appointmentDate) {
      return res.status(400).json({ success: false, error: 'Patient, Doctor, and Appointment Date are required.' });
    }

    const appDate = new Date(appointmentDate);

    // Check for double booking
    const existingBooking = await prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentDate: appDate,
        status: { not: 'CANCELLED' },
      },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        error: 'Doctor already has an appointment at this time.',
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        appointmentDate: appDate,
        reason: reason || '',
        status: 'PENDING',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment,
    });
  } catch (error) {
    console.error('[APPOINTMENTS] Booking error:', error);
    res.status(500).json({ success: false, error: 'Failed to book appointment' });
  }
});

/**
 * PATCH /api/appointments/:id
 * Update appointment status.
 */
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const updated = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('[APPOINTMENTS] Update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update appointment' });
  }
});

module.exports = router;
