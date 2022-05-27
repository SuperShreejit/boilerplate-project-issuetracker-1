const mongoose = require('mongoose')

const IssueSchema = new mongoose.Schema({
  project: {
    type: String,
    required: true
  },
  issue_title: {
    type: String,
    required: true
  },
  issue_text: {
    type: String,
    required: true
  },
  created_by: {
    type: String,
    required: true
  },
  assigned_to: String,
  open: {
    type: Boolean,
    default: true,
    required: true
  },
  status_text: String
}, { timestamps: true })

module.exports = mongoose.model("Issue", IssueSchema)