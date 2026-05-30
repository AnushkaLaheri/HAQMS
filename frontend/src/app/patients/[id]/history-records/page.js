'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function PatientHistoryPage({ params }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:5000/api';

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await fetch(
          `${API_BASE_URL}/patients/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error('Failed to load patient history');
        }

        const data = await res.json();

        setPatient(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-8">
        Loading patient history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        {error}
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8">
        Patient not found
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 mb-6 text-teal-600 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="glass rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-6 w-6 text-teal-600" />
            <h1 className="text-2xl font-bold">
              Diagnostic History
            </h1>
          </div>

          <div className="space-y-2 mb-8">
            <p><strong>Name:</strong> {patient.name}</p>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <p><strong>Phone:</strong> {patient.phoneNumber}</p>
            <p>
              <strong>Medical History:</strong>{' '}
              {patient.medicalHistory ??
                'No medical history available'}
            </p>
          </div>

          <h2 className="text-lg font-bold mb-4">
            Appointments
          </h2>

          {patient.appointments?.length > 0 ? (
            <div className="space-y-3">
              {patient.appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-xl p-4"
                >
                  <p>
                    <strong>Date:</strong>{' '}
                    {new Date(
                      appointment.appointmentDate
                    ).toLocaleString()}
                  </p>

                  <p>
                    <strong>Status:</strong>{' '}
                    {appointment.status}
                  </p>

                  <p>
                    <strong>Reason:</strong>{' '}
                    {appointment.reason || 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No appointment records found.</p>
          )}
        </div>
      </div>
    </div>
  );
}