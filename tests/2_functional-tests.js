"use strict"
const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

const route = '/api/issues/apitest'
const idRegex = /^\w{24}$/
const dateRegex = /^\d{4}[-]\d{2}[-]\d{2}T\d{2}[:]\d{2}[:]\d{2}[\.]\d{1,4}Z/

chai.use(chaiHttp);
//2017-01-08T06:35:14.240Z
suite('Functional Tests', function() {
  test("Create an issue with every field: POST request to /api/issues/{project}",
    () => {
      const request = {
        issue_title: "test_title",
        issue_text: "test_text",
        created_by: "test_creator",
        assigned_to: "test_assigned_to",
        status_text: "test_status_text"
      }
      chai.request(server)
        .post(route)
        .send(request)
        .end((err, res) => postTest(err, res, request))
    })

  test("Create an issue with only required fields: POST request to /api/issues/{project}",
    () => {
      const request = {
        issue_title: "test_title",
        issue_text: "test_text",
        created_by: "test_creator"
      }
      chai.request(server)
        .post(route)
        .send(request)
        .end((err, res) => postTest(err, res, request))
    })

  test("Create an issue with missing required fields: POST request to /api/issues/{project}",
    () => {
      const request = {}
      chai.request(server)
        .post(route)
        .send(request)
        .end((err, res) => {
          testBasics(err, res)
          testErrorResponse(res, "required field(s) missing")
        })
    })

  test("View issues on a project: GET request to /api/issues/{project}",
    () => {
      chai.request(server)
        .get(route)
        .end((err, res) => getTest(err, res))
    })

  test("View issues on a project with one filter: GET request to /api/issues/{project}",
    () => {
      const query = "?issue_title=test_title"
      chai.request(server)
        .get(route + query)
        .end((err, res) => getTest(err, res))
    })
  test("View issues on a project with multiple filters: GET request to /api/issues/{project}",
    () => {
      const query = '?issue_title=test_title&open=true'
      chai.request(server)
        .get(route + query)
        .end((err, res) => getTest(err, res))
    })
  test("Update one field on an issue: PUT request to /api/issues/{project}",
    () => {
      const postRequest = {
        issue_title: "test_put_title",
        issue_text: "test_put_text",
        created_by: "test_put_creator"
      }

      chai.request(server)
        .post(route)
        .send(postRequest)
        .end((err, res) => {
          testBasics(err, res)
          const postResponse = res.body

          const updateRequest = {
            _id: postResponse._id,
            open: false,
          }

          chai.request(server)
            .put(route)
            .send(updateRequest)
            .end((err,res) => putTest(err, res, postResponse))
        })
    })
  
  test("Update multiple fields on an issue: PUT request to /api/issues/{project}",
       () => {
      const postRequest = {
        issue_title: "test_put_title",
        issue_text: "test_put_text",
        created_by: "test_put_creator"
      }

      chai.request(server)
        .post(route)
        .send(postRequest)
        .end((err, res) => {
          testBasics(err, res)
          const postResponse = res.body

          const updateRequest = {
            _id: postResponse._id,
            open: false,
            issue_title: "test_put2_title",
            issue_text: "test_put2_text",
            created_by: "test_put2_creator",
            assigned_to: "test_put2_assigned-to",
            status_txt: "test_put2_status-text"            
          }
          
          chai.request(server)
            .put(route)
            .send(updateRequest)
            .end((err,res) => putTest(err, res, postResponse))
          })
      })
  
  test("Update an issue with missing _id: PUT request to /api/issues/{project}",
       () => {
         const request = { open: false }
         chai.request(server)
          .put(route)
          .send(request)
          .end((err,res) => putTestError(err, res, "missing _id"))
       })
  
  test("Update an issue with no fields to update: PUT request to /api/issues/{project}",
       () => {
      const postRequest = {
        issue_title: "test_put_title",
        issue_text: "test_put_text",
        created_by: "test_put_creator"
      }

      chai.request(server)
        .post(route)
        .send(postRequest)
        .end((err, res) => {
          testBasics(err, res)
          const postResponse = res.body

          const updateRequest = { _id: postResponse._id }
          chai.request(server)
            .put(route)
            .send(updateRequest)
            .end((err,res) => putTestError(err, res, "no update field(s) sent", postResponse))
          })
       })
  
  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}",
       () => {
          const updateRequests = [
            { _id: "not-a-proper-id", open: false },
            { _id: "629064e8ab553f784ae421", open: false },
            { _id: "629064e8ab553f784ae42abc", open: false }
          ]

         updateRequests.forEach(updateRequest => {           
            chai.request(server)
              .put(route)
              .send(updateRequest)
              .end((err,res) => putTestError(err, res, "could not update", updateRequest))
         })
       })
  
  test("Delete an issue: DELETE request to /api/issues/{project}",
       () => {
      const postRequest = {
        issue_title: "test_put_title",
        issue_text: "test_put_text",
        created_by: "test_put_creator"
      }

      chai.request(server)
        .post(route)
        .send(postRequest)
        .end((err, res) => {
          testBasics(err, res)
          const postResponse = res.body

          const deleteRequest = { _id: postResponse._id }
          chai.request(server)
            .delete(route)
            .send(deleteRequest)
            .end((err,res) => deleteTest(err, res, postResponse))
          })
       })
  
  test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}",
       () => {     

          const deleteRequests = [
            { _id: "not-a-proper-id" },
            { _id: "629064e8ab553f784ae421" },
            { _id: "629064e8ab553f784ae42abc" }
          ]
         
         deleteRequests.forEach(deleteRequest => {
            chai.request(server)
              .delete(route)
              .send(deleteRequest)
              .end((err,res) => deleteTestError(err, res, "could not delete",  deleteRequest))           
         })
      })
  
  test("Delete an issue with missing _id: DELETE request to /api/issues/{project}",
       () => {
          const deleteRequest = {}
          chai.request(server)
            .delete(route)
            .send(deleteRequest)
            .end((err,res) => deleteTestError(err, res, "missing _id"))
       })

  const testBasics = (err, res) => {
    assert.isNull(err)
    assert.equal(res.status, 200)
    assert.equal(res.type, 'application/json')
  }

  const testGetBody = (res) => res.body.forEach(issue => {
    assert.isObject(issue)
    assert.isString(issue._id)
    assert.match(issue._id, idRegex)
    assert.isString(issue.issue_title)
    assert.isString(issue.issue_text)
    assert.isString(issue.created_on)
    assert.match(issue.created_on, dateRegex)
    assert.isString(issue.updated_on)
    assert.match(issue.updated_on, dateRegex)
    assert.isString(issue.created_by)
    assert.isString(issue.assigned_to)
    assert.isString(issue.status_text)
    assert.isBoolean(issue.open)
  })

  const testErrorResponse = (res, errorMsg) => {
    assert.isString(res.body.error)
    assert.equal(res.body.error, errorMsg)
  }

  const testSuccessResponse = (res, successMsg) => {
    assert.isString(res.body.result)
    assert.equal(res.body.result, successMsg)
  }

  const testIdResponse = (res, postResponse) => {
    assert.isString(res.body._id)
    assert.equal(res.body._id, postResponse._id)
  }

  const testIssueObject = (res, request) => {
    assert.isString(res.body._id)
    assert.match(res.body._id, idRegex)
    assert.isString(res.body.issue_title)
    assert.equal(res.body.issue_title, request.issue_title)
    assert.isString(res.body.issue_text)
    assert.equal(res.body.issue_text, request.issue_text)
    assert.isString(res.body.created_on)
    assert.match(res.body.created_on, dateRegex)
    assert.isString(res.body.updated_on)
    assert.match(res.body.updated_on, dateRegex)
    assert.isString(res.body.created_by)
    assert.equal(res.body.created_by, request.created_by)
    if(!request.assigned_to) assert.isEmpty(res.body.assigned_to)
    if(request.assigned_to) assert.isString(res.body.assigned_to)
    assert.equal(res.body.assigned_to, request.assigned_to ? request.assigned_to : "")
    if(!request.status_text) assert.isEmpty(res.body.status_text)
    if(request.status_text) assert.isString(res.body.status_text)
    assert.equal(res.body.status_text, request.status_text ? request.status_text : "")
    assert.isBoolean(res.body.open)
    assert.isTrue(res.body.open)
  }

  const getTest = (err, res) => {
    testBasics(err, res)
    assert.isArray(res.body)
    if (res.body.length > 0) testGetBody(res)
  }

  const postTest = (err, res, request) => {
    testBasics(err, res)
    testIssueObject(res, request)
  }

  const putTest = (err, res, postResponse) => {
    testBasics(err, res)
    testSuccessResponse(res, 'successfully updated')
    testIdResponse(res, postResponse)       
  }

  const putTestError = (err, res, errorMsg, postResponse = null) => {
    testBasics(err, res)
    testErrorResponse(res, errorMsg)
    if(postResponse !== null) testIdResponse(res, postResponse)
  }

  const deleteTest = (err, res, postResponse) => {
    testBasics(err, res)
    testSuccessResponse(res, 'successfully deleted')
    testIdResponse(res, postResponse)
  }

  const deleteTestError = (err, res, errorMsg, postResponse = null) => {
    testBasics(err, res)
    testErrorResponse(res, errorMsg)
    if(postResponse !== null) testIdResponse(res, postResponse)
  }

});
