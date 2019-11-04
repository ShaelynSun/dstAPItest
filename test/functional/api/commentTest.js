const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const _ = require("lodash");
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
const Story = require("../../../models/stories");
const Comment = require("../../../models/comments");
const mongoose = require("mongoose");

let server;
let mongod;
let db, storyID, commentID;

describe('Comment',  () => {
    before(async () => {
        try {
            mongod = new MongoMemoryServer({
                instance: {
                    port: 27017,
                    dbPath: "./test/database",
                    dbName: "dstdb" // by default generate random dbName
                }
            });
            // Async Trick - this ensures the database is created before
            // we try to connect to it or start the server
            // await mongod.getConnectionString();
            await mongoose.connect("mongodb://localhost:27017/dstdb", {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            server = require("../../../bin/www");
            db = mongoose.connection;
        } catch (error) {
            console.log(error);
        }
    });

    after(async () => {
        try {
            await db.dropDatabase();
        } catch (error) {
            console.log(error);
        }
    });

    beforeEach(async () => {
        try {
            await Story.deleteMany({});
            await Comment.deleteMany({});
            let story = new Story();
            story.username = "shaelyn";
            story.title = "a weird baby";
            story.upvotes = 0;
            story.content = "the baby has 3 heads.";
            story.written_times = 1;
            story.type = "Chinese";
            story.class = "myth";
            await story.save();
            story = await Story.findOne({title: "a weird baby"});
            storyID = story._id;
            let comment = new Comment();
            comment.username = "sxy";
            comment.com_content = "qqqqqqq";
            comment.story = `${storyID}`;
            comment.com_upvotes = 0;
            await comment.save();
            comment = await Comment.findOne({username: "sxy"});
            commentID = comment._id;
        } catch (error) {
            console.log(error);
        }
    });

    describe("PUT /stories/:id/addComment", () => {
        const comment = {
            username: "aha",
            com_content: "the baby had two weapons."
        };
        describe("when the id is valid", () => {
            it("should return a message and the comment added", () => {
                return request(server)
                    .put(`/stories/${storyID}/addComment`)
                    .send(comment)
                    .expect(200)
                    .then(resp => {
                        expect(resp.body.message).equals("Comment Added Successfully!");
                        expect(resp.body.data).to.include({
                            username: "aha",
                            com_content: "the baby had two weapons."
                        });
                    });
            });
            after(() => {
                return request(server)
                    .get(`/stories/${storyID}`)
                    .expect(200)
                    .then((res) => {
                        expect(res.body[0]).to.have.property("written_times", 2);
                    });
            });
        });
        describe("when the id is invalid", () => {
            it("should return a message for invalid story id cannot add a comment", () => {
                return request(server)
                    .put("/stories/1100001/addComment")
                    .send(comment)
                    .expect(200);
            });
        });
    });// end-PUT add a new comment to the specific story
    describe("GET /comments/:id", () => {
        describe("when the id is valid", () => {
            it("should return the comments with specific storyID", done => {
                request(server)
                    .get(`/comments/${storyID}`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body[0]).to.have.property("username", "sxy");
                        expect(res.body[0]).to.have.property("story", `${storyID}`);
                        done(err);
                    });
            });
        });
        describe("when the id is invalid", () => {
            it("should return a not found message", done => {
                request(server)
                    .get("/comments/1100001")
                    .set("Accept", "application/json")
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body.message).equals("Comment not Found!");
                        done(err);
                    });
            });
        });
    });// end-GET a specific story's comments
    describe("PUT /comments/:id/upvote", () => {
        describe("when the id is valid", () => {
            it("should return a message and the comment upvoted by 1", () => {
                return request(server)
                    .put(`/comments/${commentID}/upvote`)
                    .expect(200)
                    .then(resp => {
                        expect(resp.body).to.include({
                            message: "UpVote Successful"
                        });
                        expect(resp.body.data).to.include({
                            com_upvotes: 1
                        });
                    });
            });
            after(() => {
                return request(server)
                    .get(`/comments/${storyID}`)
                    .expect(200)
                    .then((resp) => {
                        expect(resp.body[0]).to.have.property("com_upvotes", 1);
                    });
            });
        });
        describe("when the id is invalid", () => {
            it("should return a message for NOT found", () => {
                return request(server)
                    .put("/comments/1100001/upvote")
                    .then(res => {
                        expect(res.body).to.include({ message: 'Comment NOT Found - UpVote NOT Successful!!'});
                    });
            });
        });
    });  // end-PUT update a comment's up-votes (same as down-votes)
    describe("DELETE /comments/:story_id/:comment_id",  () => {
        describe("when the id is valid", () => {
            it("should return a message and the comment has been deleted", () => {
                return request(server)
                    .delete(`/comments/${storyID}/${commentID}`)
                    .expect(200)
                    .then(resp => {
                        expect(resp.body.message).equals("Comment Successfully Deleted!");
                    });
            });
            after(() => {
                return request(server)
                    .get(`/stories/${storyID}`)
                    .expect(200)
                    .then((res) => {
                        expect(res.body[0]).to.have.property("written_times", 0);
                    });
            });
        });
        describe("when the id is invalid", () => {
            it("should return a message for invalid story id is not deleted", () => {
                return request(server)
                    .delete("/comments/1100001/11111")
                    .then(resp => {
                        expect(resp.body).to.include({message: 'Story NOT Found' });
                    });
            });
        });
    });// end-DELETE the specific comment
});