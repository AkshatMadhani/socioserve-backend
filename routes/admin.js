import express from 'express';
import { getuser,deleteuser } from '../controller/admin.js';
import isAdmin from '../middlewares/isadmin.js';
import { login,logout } from '../controller/auth.js';

const adminrouter = express.Router();

adminrouter.post('/login', login);
adminrouter.post('/logout', logout);
adminrouter.get('/getuser', isAdmin, getuser);
adminrouter.delete('/delete/:id', isAdmin, deleteuser);

export default adminrouter;