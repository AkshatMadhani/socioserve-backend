import express from "express";
import isadmin from "../middlewares/isadmin.js";
import { getAnnouncements,newAnnouncement,deleteAnnouncement } from "../controller/announcement.js";
const announcementRouter = express.Router();
announcementRouter.get("/", getAnnouncements);
announcementRouter.post("/new", isadmin, newAnnouncement);
announcementRouter.delete("/delete/:id", isadmin, deleteAnnouncement);
export default announcementRouter;
