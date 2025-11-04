import express from "express";
import isadmin from "../middlewares/isadmin.js";
import isAuthenticated from "../middlewares/isauthenticated.js";
import { 
  createPoll, 
  getAllPolls, 
  votePoll, 
  closePoll, 
  deletePoll 
} from "../controller/poll.js";

const pollRouter = express.Router();
pollRouter.get("/", isAuthenticated, getAllPolls);
pollRouter.post("/vote/:pollId", isAuthenticated, votePoll);
pollRouter.post("/create", isadmin, createPoll);
pollRouter.put("/close/:pollId", isadmin, closePoll);
pollRouter.delete("/delete/:pollId", isadmin, deletePoll);

export default pollRouter;