// Create a registration then immediately call approve endpoint to simulate auto-approval
async function run() {
  try {
    const createRes = await fetch('http://localhost:8081/api/tutor-registration/register-tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: 5, subjectId: 1, tutorId: 1 })
    });
    const createBody = await createRes.json();
    console.log('Create status', createRes.status, createBody);
    if (!createRes.ok) return process.exit(1);

    const registrationId = createBody.registrationId;
    if (!registrationId) {
      console.error('No registrationId returned');
      return process.exit(1);
    }

    const approveRes = await fetch(`http://localhost:8081/api/tutor-registration/${registrationId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tutorId: 1 })
    });
    const approveBody = await approveRes.text();
    console.log('Approve status', approveRes.status, approveBody);
    if (!approveRes.ok) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error('Error', err);
    process.exit(1);
  }
}

run();
