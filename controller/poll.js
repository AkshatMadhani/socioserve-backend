import Poll from "../models/poll.js";
import mongoose from "mongoose";

const createPoll = async (req, res) => {
  try {
    const { question, description, options, expiryDate, allowMultiple } = req.body;
    const createdBy = req.user.id;

    if (!question || !options || !expiryDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Question, options, and expiry date are required" 
      });
    }

    if (options.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: "At least 2 options are required" 
      });
    }

    const formattedOptions = options.map(opt => ({
      text: opt,
      votes: 0,
      voters: []
    }));

    const newPoll = await Poll.create({
      question,
      description,
      options: formattedOptions,
      createdBy,
      expiryDate,
      allowMultiple: allowMultiple || false,
      status: 'active'
    });

    await newPoll.populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: "Poll created successfully",
      poll: newPoll
    });
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

const getAllPolls = async (req, res) => {
  try {
    const userId = req.user.id;

    const polls = await Poll.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    const pollsWithVoteStatus = polls.map(poll => {
      const pollObj = poll.toObject();
      
      const userVotedOptions = poll.options
        .map((opt, index) => opt.voters.some(voter => voter.toString() === userId.toString()) ? index : -1)
        .filter(index => index !== -1);
      
      return { 
        ...pollObj, 
        userVoted: userVotedOptions.length > 0,
        userVotedOptions 
      };
    });

    res.status(200).json({
      success: true,
      polls: pollsWithVoteStatus
    });
  } catch (error) {
    console.error("Error fetching polls:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};
const votePoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionIndex, unvote } = req.body; 
    const userId = req.user.id;

    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({ 
        success: false, 
        message: "Poll not found" 
      });
    }

    if (poll.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        message: "This poll is closed" 
      });
    }
    if (unvote) {
      const hasVoted = poll.options[optionIndex].voters.some(
        voter => voter.toString() === userId.toString()
      );

      if (!hasVoted) {
        return res.status(400).json({ 
          success: false, 
          message: "You haven't voted on this option" 
        });
      }
      poll.options[optionIndex].votes -= 1;
      poll.options[optionIndex].voters = poll.options[optionIndex].voters.filter(
        voter => voter.toString() !== userId.toString()
      );

      await poll.save();

      return res.status(200).json({
        success: true,
        message: "Vote removed successfully",
        poll
      });
    }
    const hasVotedOnThisOption = poll.options[optionIndex].voters.some(
      voter => voter.toString() === userId.toString()
    );

    if (hasVotedOnThisOption) {
      return res.status(400).json({ 
        success: false, 
        message: "You have already voted on this option" 
      });
    }
    if (!poll.allowMultiple) {
      const hasVotedOnAny = poll.options.some(opt => 
        opt.voters.some(voter => voter.toString() === userId.toString())
      );

      if (hasVotedOnAny) {
        return res.status(400).json({ 
          success: false, 
          message: "You have already voted on this poll. You can unvote first to change your vote." 
        });
      }
    }
    poll.options[optionIndex].votes += 1;
    poll.options[optionIndex].voters.push(userId);

    await poll.save();

    res.status(200).json({
      success: true,
      message: "Vote recorded successfully",
      poll
    });
  } catch (error) {
    console.error("Error voting on poll:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

const closePoll = async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({ 
        success: false, 
        message: "Poll not found" 
      });
    }

    poll.status = 'closed';
    await poll.save();

    res.status(200).json({
      success: true,
      message: "Poll closed successfully",
      poll
    });
  } catch (error) {
    console.error("Error closing poll:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

const deletePoll = async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findByIdAndDelete(pollId);

    if (!poll) {
      return res.status(404).json({ 
        success: false, 
        message: "Poll not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Poll deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting poll:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export { createPoll, getAllPolls, votePoll, closePoll, deletePoll };