import express from 'express';
import dotenv from 'dotenv';
import dbcon from './utils/db.js';
import router from './routes/auth.js';
import cookieParser from 'cookie-parser';
import adminrouter from './routes/admin.js';
import complaintRouter from './routes/complaint.js';
import announcementRouter from './routes/announcement.js';
import billRouter from './routes/bill.js';
import pollRouter from './routes/poll.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import paymentRouter from './routes/payment.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Define allowed origins
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://socioserve-frontend.vercel.app'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, Set-Cookie, X-Requested-With, Accept');
  res.header('Access-Control-Expose-Headers', 'Set-Cookie, Authorization');
  
  if (req.method === 'OPTIONS') {
    console.log('🔄 Handling preflight request for:', req.url);
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  console.log(`\n📡 ${req.method} ${req.url}`);
  console.log(` Origin: ${req.headers.origin || 'No origin'}`);
  console.log(` Cookies: ${req.headers.cookie ? 'Present ✅' : 'None ❌'}`);
  console.log(` Request headers:`, {
    'content-type': req.headers['content-type'],
    'authorization': req.headers.authorization ? 'Present' : 'None'
  });
  next();
});

app.use('/auth', router);
app.use('/admin', adminrouter);
app.use('/complaint', complaintRouter);
app.use('/announcement', announcementRouter);
app.use('/bill', billRouter);
app.use('/poll', pollRouter);
app.use('/payment', paymentRouter);
app.get('/api', (req, res) => {
  res.send('Welcome to the backend server');
});

app.get('/api/test-cors', (req, res) => {
  console.log(' Test CORS endpoint called');
  res.json({
    success: true,
    message: 'CORS is working correctly!',
    origin: req.headers.origin,
    cookiesReceived: !!req.headers.cookie,
    timestamp: new Date().toISOString()
  });
});
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});
dbcon().then(() => {
  app.listen(PORT, () => {
    console.log(`\n Server running on port ${PORT}`);
    console.log(` CORS configured for: http://localhost:5173`);
    console.log(` Credentials mode: Enabled`);
    console.log(`\n Test CORS: http://localhost:3000/api/test-cors`);
    console.log(` Frontend should connect to: http://localhost:3000\n`);
  });
}).catch(err => {
  console.error(' Database connection failed:', err);
  process.exit(1);
});