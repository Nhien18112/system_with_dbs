import './App.css';
//import RegisterTutor from './RegisterTutor';
//import Layout from './Layout';
import TutorFreeSlot from './TutorFreeSlot'; 
import AppointmentBooking from './AppointmentBooking';

function App() {
  return (
    //<Layout>
      //<TutorFreeSlot/>
      <AppointmentBooking studentId={1} tutorId={1} />
    //</Layout>
  );
}

export default App;