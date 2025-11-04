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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

const PORT = process.env.PORT || 3000;

app.use(express.json()); 
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/auth', router);
app.use('/admin', adminrouter);
app.use('/complaint', complaintRouter);
app.use('/announcement', announcementRouter);
app.use('/bill', billRouter);
app.use('/poll', pollRouter);

app.get('/api', (req, res) => res.send('Welcome to the backend server'));

dbcon();
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
