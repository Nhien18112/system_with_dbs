async function run() {
  try {
    const studentId = 5;
    const tutors = [1,13];

    console.log('Checking student my-tutor endpoint for studentId=', studentId);
    try {
      const r = await fetch(`http://localhost:8081/api/tutor-registration/student/${studentId}/my-tutor`);
      if (r.status === 200) {
        const b = await r.json();
        console.log('my-tutor:', b);
      } else if (r.status === 404) {
        console.log('my-tutor: not found (404) — student has no APPROVED tutor');
      } else {
        const t = await r.text();
        console.log('my-tutor returned', r.status, t);
      }
    } catch (err) {
      console.error('Error calling my-tutor:', err.message);
    }

    for (const tutorId of tutors) {
      console.log('\nChecking pending-registrations for tutorId=', tutorId);
      try {
        const r2 = await fetch(`http://localhost:8081/api/tutor-registration/pending-registrations?tutorId=${tutorId}`);
        const j2 = await r2.json();
        console.log('pending-registrations:', j2);
      } catch (err) {
        console.error('Error pending-registrations', err.message);
      }

      console.log('\nChecking approved-students for tutorId=', tutorId);
      try {
        const r3 = await fetch(`http://localhost:8081/api/tutor-registration/approved-students?tutorId=${tutorId}`);
        const j3 = await r3.json();
        console.log('approved-students:', j3);
      } catch (err) {
        console.error('Error approved-students', err.message);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Script error', err);
    process.exit(1);
  }
}

run();
