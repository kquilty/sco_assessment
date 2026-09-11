import { useState, useEffect, type SubmitEvent } from 'react'
import './App.css'

const SESSION_STATUSES = ['SCHEDULED', 'COMPLETED', 'CANCELLED'] as const;

function App() {
    const [patients, setPatients] = useState<any[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const [selectedSessionId, setSelectedSessionId] = useState<string>('');

    const [newSessionName, setNewSessionName] = useState<string>('');
    const [newTreatedAt, setNewTreatedAt] = useState<string>('');
    const [newClinicianId, setNewClinicianId] = useState<string>('');
    const [newStatus, setNewStatus] = useState<string>('SCHEDULED');
    const [newParameters, setNewParameters] = useState<string>('{}');
    const [newNotes, setNewNotes] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('http://localhost:3000/patients');

            if (!response.ok) {
                setError(`Unable to load patients: ${response.statusText}`);
                setLoading(false);
                return;
            }

            const data = await response.json();

            setPatients(data);
            setError(null);
            setLoading(false);
        };
        fetchData();
    }, []);

    const selectedPatient = patients?.find(
        (patient) => String(patient.id) === selectedPatientId
    );
    const treatmentPlans = selectedPatient?.treatment_plans ?? [];

    const selectedPlan = treatmentPlans?.find(
        (plan: any) => String(plan.id) === selectedPlanId
    );
    const treatmentSessions = selectedPlan?.treatment_sessions ?? [];
    const selectedSession = treatmentSessions.find(
        (session: any) => String(session.id) === selectedSessionId
    );

    // This was partly AI assisted for the sake of time (but read through carefully and modified where needed)
    const handleCreateSession = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedPlan) return;

        setSubmitError(null);

        let parameters: unknown;
        try {
            parameters = JSON.parse(newParameters);
        } catch {
            setSubmitError('Parameters must be valid JSON');
            return;
        }
        if (typeof parameters !== 'object' || parameters === null || Array.isArray(parameters)) {
            setSubmitError('Parameters must be a JSON object, e.g. {"intensity": 5}');
            return;
        }

        setSubmitting(true);

        try {
            // Sending the PATIENT ID instead of the plan ID (will add to the active plan)
            const response = await fetch(`http://localhost:3000/patients/${selectedPatientId}/sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_name: newSessionName.trim(),
                    // datetime-local has no timezone, so convert from the browser's local time to ISO (UTC)
                    treated_at: new Date(newTreatedAt).toISOString(),
                    clinician_id: newClinicianId.trim(),
                    status: newStatus,
                    parameters,
                    notes: newNotes.trim() || undefined,
                }),
            });

            if (!response.ok) {
                // Nest's ValidationPipe puts the failed rules in `message`
                const body = await response.json().catch(() => null);
                const details = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
                setSubmitError(`Unable to create session: ${details ?? response.statusText}`);
                return;
            }

            const createdSession = await response.json();

            // Add the new session to local state so it shows up in the session dropdown
            setPatients((prev) => prev?.map((patient) => ({
                ...patient,
                treatment_plans: patient.treatment_plans.map((plan: any) =>
                    plan.id === createdSession.treatment_plan_id
                        ? { ...plan, treatment_sessions: [...plan.treatment_sessions, createdSession] }
                        : plan
                ),
            })) ?? null);
            setNewSessionName('');
            setNewTreatedAt('');
            setNewClinicianId('');
            setNewStatus('SCHEDULED');
            setNewParameters('{}');
            setNewNotes('');
            setSelectedSessionId(String(createdSession.id));
        } catch {
            setSubmitError('Unable to create session: could not reach the server');
        } finally {
            setSubmitting(false);
        }
    };

    const canSubmit = newSessionName.trim() && newTreatedAt && newClinicianId.trim();


    return (
        <main>


            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && !patients && <p>No patients found.</p>}

            {/* If we found some patients... */}
            {patients && (
                <>
                    <div>
                        <label htmlFor="patient-select">Select a patient:</label>
                        &nbsp;
                        <select
                            id="patient-select"
                            value={selectedPatientId}
                            onChange={(event) => setSelectedPatientId(event.target.value)}
                        >
                            <option value="" disabled>
                                Choose a patient
                            </option>
                            {patients.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.name}
                                </option>
                            ))}
                        </select>
                    </div>


                    <div>
                        <label htmlFor="plan-select">Select a plan:</label>
                        &nbsp;
                        <select
                            id="plan-select"
                            value={selectedPlanId}
                            disabled={!selectedPatient}
                            onChange={(event) => setSelectedPlanId(event.target.value)}
                        >
                            <option value="" disabled>
                                Choose a plan
                            </option>
                            {treatmentPlans.map((plan: any) => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.plan_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="session-select">Select a session:</label>
                        &nbsp;
                        <select
                            id="session-select"
                            value={selectedSessionId}
                            disabled={!selectedPlanId}
                            onChange={(event) => setSelectedSessionId(event.target.value)}
                        >
                            <option value="" disabled>
                                Choose a session
                            </option>
                            {treatmentSessions.map((session: any) => (
                                <option key={session.id} value={session.id}>
                                    {session.session_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedSession && (
                        <div>
                            <hr />
                            <h2>Selected Treatment Session Details</h2>
                            <p>
                                <strong>Session name:</strong> {selectedSession.session_name ?? 'N/A'}
                            </p>
                            <p>
                                <strong>Session ID:</strong> {selectedSession.id ?? 'N/A'}
                            </p>
                            <p>
                                <strong>Treated at:</strong>{' '}
                                {selectedSession.treated_at ? new Date(selectedSession.treated_at).toLocaleString() : 'N/A'}
                            </p>
                            <p>
                                <strong>Clinician ID:</strong> {selectedSession.clinician_id ?? 'N/A'}
                            </p>
                            <p>
                                <strong>Status:</strong> {selectedSession.status ?? 'N/A'}
                            </p>
                            <p>
                                <strong>Parameters:</strong> {JSON.stringify(selectedSession.parameters ?? {})}
                            </p>
                            <p>
                                <strong>Notes:</strong> {selectedSession.notes || 'N/A'}
                            </p>
                        </div>
                    )}


                    {selectedPlan && (
                        <div>
                            <hr />
                            <h2>New Treatment Session</h2>
                            <form className="session-form" onSubmit={handleCreateSession}>
                                <div>
                                    <label htmlFor="session-name">Session name: </label>
                                    <input
                                        id="session-name"
                                        type="text"
                                        value={newSessionName}
                                        onChange={(event) => setNewSessionName(event.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="treated-at">Treated at: </label>
                                    <input
                                        id="treated-at"
                                        type="datetime-local"
                                        value={newTreatedAt}
                                        onChange={(event) => setNewTreatedAt(event.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="clinician-id">Clinician ID: </label>
                                    <input
                                        id="clinician-id"
                                        type="text"
                                        maxLength={64}
                                        value={newClinicianId}
                                        onChange={(event) => setNewClinicianId(event.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="status">Status: </label>
                                    <select
                                        id="status"
                                        value={newStatus}
                                        onChange={(event) => setNewStatus(event.target.value)}
                                    >
                                        {SESSION_STATUSES.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="parameters">Parameters (JSON): </label>
                                    <textarea
                                        id="parameters"
                                        rows={3}
                                        value={newParameters}
                                        onChange={(event) => setNewParameters(event.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="notes">Notes: </label>
                                    <textarea
                                        id="notes"
                                        rows={3}
                                        value={newNotes}
                                        onChange={(event) => setNewNotes(event.target.value)}
                                    />
                                </div>
                                <button type="submit" disabled={submitting || !canSubmit}>
                                    {submitting ? 'Saving...' : 'Create session'}
                                </button>
                                {submitError && <p>{submitError}</p>}
                            </form>

                        </div>
                    )}
                </>
            )}
        </main>
    )
}

export default App
