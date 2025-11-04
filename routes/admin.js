import express from 'express';
import { getuser, deleteuser } from '../controller/admin.js';
import isadmin from '../middlewares/isadmin.js';
import { login, logout } from '../controller/auth.js';

const adminrouter = express.Router();

adminrouter.post('/login', login);
adminrouter.post('logout',logout);
adminrouter.get('/getuser', isadmin, getuser);
adminrouter.delete('/delete/:id', isadmin, deleteuser);

export default adminrouter;
