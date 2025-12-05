// Use global fetch (Node 18+) to avoid external deps
async function test() {
  try {
    const res = await fetch('http://localhost:8081/api/tutor-registration/register-tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: 5, subjectId: 1, tutorId: 1 })
    });

    const text = await res.text();
    console.log('Status:', res.status);
    try {
      console.log('Body:', JSON.parse(text));
    } catch (e) {
      console.log('Body (raw):', text);
    }
    if (!res.ok) process.exit(1);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

test();
