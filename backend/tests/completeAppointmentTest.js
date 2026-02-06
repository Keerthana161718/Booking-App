/*
 Simple integration test: sends a PUT to /api/appointments/completed/:id
 Usage (from project root or backend folder):

  API_BASE=http://localhost:8080/api TOKEN=<your_jwt> APPOINTMENT_ID=<id> npm run test:integration

 The script exits with code 0 on success, 1 on failure, and 2 when required env vars are missing.
*/

const axios = require('axios');

(async function(){
  const API_BASE = process.env.API_BASE || 'http://localhost:8080/api';
  const TOKEN = process.env.TOKEN || process.env.APITOKEN;
  const APPT = process.env.APPOINTMENT_ID || process.env.APPOINTMENT || process.argv[2];

  if(!TOKEN || !APPT){
    console.error('Missing required env vars. Example:');
    console.error('  API_BASE=http://localhost:8080/api TOKEN=<jwt> APPOINTMENT_ID=<id> npm run test:integration');
    process.exit(2);
  }

  const url = `${API_BASE}/appointments/completed/${APPT}`;
  console.log('[test] Calling', url);

  try{
    const res = await axios.put(url, {}, { headers: { Authorization: `Bearer ${TOKEN}` }, timeout: 10000 });
    console.log('[test] status:', res.status);
    console.log('[test] response data:', res.data);

    if(res.status === 200){
      console.log('[test] SUCCESS: Appointment completed');
      process.exit(0);
    }

    console.error('[test] Unexpected status:', res.status);
    process.exit(1);
  }catch(e){
    if(e.response){
      console.error('[test] Error response:', e.response.status, e.response.data);
    }else{
      console.error('[test] Request error:', e.message);
    }
    process.exit(1);
  }
})();