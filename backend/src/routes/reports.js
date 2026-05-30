const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/reports/doctor-stats
 * Aggregated reporting for physicians performance.
 * Restricted to ADMIN and RECEPTIONIST roles.
 */
router.get('/doctor-stats', authenticate, authorize(['ADMIN', 'RECEPTIONIST']), async (req, res) => {
  try {
    const start = Date.now();

    const doctors = await prisma.doctor.findMany();

    const reportData = await Promise.all(doctors.map(async (doc) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        queueTokensCount,
        appointmentsList,
      ] = await Promise.all([
        prisma.appointment.count({
          where: { doctorId: doc.id },
        }),

        prisma.appointment.count({
          where: {
            doctorId: doc.id,
            status: 'COMPLETED',
          },
        }),

        prisma.appointment.count({
          where: {
            doctorId: doc.id,
            status: 'CANCELLED',
          },
        }),

        prisma.queueToken.count({
          where: {
            doctorId: doc.id,
            createdAt: { gte: today },
          },
        }),

        prisma.appointment.findMany({
          where: {
            doctorId: doc.id,
            status: 'COMPLETED',
          },
        }),
      ]);

      const revenue = appointmentsList.length * doc.consultationFee;

      return {
        id: doc.id,
        name: doc.name,
        specialization: doc.specialization,
        department: doc.department,
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        todayQueueSize: queueTokensCount,
        revenue,
      };
    }));

    const durationMs = Date.now() - start;

    res.json({
      success: true,
      data: {
        timeTakenMs: durationMs,
        report: reportData,
      },
    });
  } catch (error) {
    console.error('[REPORTS] Generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate report' });
  }
});

module.exports = router;
