'use strict';
const Project = require('../models/project')
const Issue = require('../models/issue')

module.exports = function(app) {

  app.route('/api/issues/:project')

    .get(async (req, res) => {
      const projectName = req.params.project;
      try {
        let issues = []
        const project = await Project.findOne({ name: projectName }).exec()
        if (!project) return res.json(issues)

        let query = {}

        if (req.query._id)
          query._id = req.query._id
        if (req.query.issue_title)
          query.issue_title = req.query.issue_title
        if (req.query.issue_text)
          query.issue_text = req.query.issue_text
        if (req.query.created_by)
          query.created_by = req.query.created_by
        if (req.query.assigned_to)
          query.assigned_to = req.query.assigned_to
        if (req.query.open)
          query.open = req.query.open
        if (req.query.status_text)
          query.status_text = req.query.status_text
        if (req.query.created_on)
          query.createdAt = new Date(req.query.created_on)
        if (req.query.updated_on)
          query.updatedAt = new Date(req.query.updated_on)

        issues = await Issue.find({ projectId: project._id }).where(query).exec()
        res.json(issues.map(issue => ({
          assigned_to: issue.assigned_to,
          status_text: issue.status_text,
          open: issue.open,
          _id: issue._id,
          issue_title: issue.issue_title,
          issue_text: issue.issue_text,
          created_by: issue.created_by,
          created_on: issue.createdAt,
          updated_on: issue.updatedAt
        })))

      } catch (error) {
        res.json({ error: error.message })
      }
    })

    .post(async (req, res) => {
      const projectName = req.params.project
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body

      try {
        if ((!issue_title || issue_title === "")
            || (!issue_text || issue_text === "")
            || (!created_by || created_by === ""))
          throw new Error('required field(s) missing')

        let project = await Project.findOne({ name: projectName }).exec()
        if (!project) {
          project = new Project({
            name: projectName
          })
          await project.save()
        }

        const issue = new Issue({
          projectId: project.id,
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to ? assigned_to : "",
          status_text: status_text ? status_text : ""
        })

        const newIssue = await issue.save()
        res.json({
          _id: newIssue.id,
          issue_title: newIssue.issue_title,
          issue_text: newIssue.issue_text,
          created_on: newIssue.createdAt,
          updated_on: newIssue.updatedAt,
          created_by: newIssue.created_by,
          assigned_to: newIssue.assigned_to,
          open: newIssue.open,
          status_text: newIssue.status_text
        })

      } catch (error) {
        res.json({ error: error.message })
      }
    })

    .put(async (req, res) => {
      const projectName = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body
      try {
        if (_id === "" || !_id) throw new Error("missing _id")
        
        if ((issue_title === '' || !issue_title)
          && (issue_text === '' || !issue_text)
          && (created_by === '' || !created_by)
          && (assigned_to === '' || !assigned_to)
          && (status_text === '' || !status_text)
          && open === undefined)
          throw new Error('no update field(s) sent')

        const project = await Project.findOne({ name: projectName }).exec()
        if (!project) throw new Error('could not update')

        if(!(/^\w{24}$/).test(_id)) throw new Error('could not update')
        const issue = await Issue.findById(_id)
        if (!issue) throw new Error('could not update')

        const updateQuery = {}
        if (issue_title && issue_title !== '')
          updateQuery.issue_title = issue_title
        if (issue_text && issue_text !== '')
          updateQuery.issue_text = issue_text
        if (created_by && created_by !== '')
          updateQuery.created_by = created_by
        if (assigned_to && assigned_to !== '')
          updateQuery.assigned_to = assigned_to
        if (status_text && status_text !== '')
          updateQuery.status_text = status_text
        if (open !== undefined) updateQuery.open = false
        if (open === undefined) updateQuery.open = true

        const updatedIssue = await Issue.findByIdAndUpdate(_id, updateQuery, {
          new: true, runValidators: true
        })
        if (updatedIssue) res.json({ result: 'successfully updated', _id })

      } catch (error) {
        const response = { error: error.message }
        if (error.message === "no update field(s) sent" || error.message === "could not update") response._id = _id
        res.json(response)
      }
    })

    .delete(async (req, res) => {
      const projectName = req.params.project;
      const { _id } = req.body
      try {
        if (_id === "" || !_id) throw new Error("missing _id")

        const project = await Project.findOne({ name: projectName }).exec()
        if (!project) throw new Error('could not delete')

        if(!(/^\w{24}$/).test(_id)) throw new Error('could not delete')
        const issue = await Issue.findById(_id)
        if (!issue) throw new Error('could not delete')

        await Issue.findByIdAndDelete(_id)
        res.json({ result: 'successfully deleted', _id })

      } catch (error) {
        const response = { error: error.message }
        if (error.message === "could not delete") response._id = _id
        res.json(response)
      }
    });

};
