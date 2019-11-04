const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const _ = require("lodash");
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
const Story = require("../../../models/stories");
const mongoose = require("mongoose");

let server;
let mongod;
let db, validID;

describe('Stories',  () => {
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
            let story = new Story();
            story.username = "shaelyn";
            story.title = "a weird baby";
            story.upvotes = 0;
            story.downvotes = 0;
            story.content = "the baby has 3 heads.";
            story.written_times = 0;
            story.type = "Chinese";
            story.class = "myth";
            await story.save();
            story = new Story();
            story.username = "demo";
            story.title = "delete demo";
            story.upvotes = 0;
            story.content = "this is a sample to delete.";
            story.written_times = 0;
            story.type = "Japanese";
            story.class = "song";
            await story.save();
            story = await Story.findOne({title: "delete demo"});
            validID = story._id;
        } catch (error) {
            console.log(error);
        }
    });

    describe("GET /stories", () => {
        it("should return all the stories", done => {
            request(server)
                .get("/stories")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200)
                .end((err, res) => {
                    try {
                        expect(res.body).to.be.a("array");
                        expect(res.body.length).to.equal(2);
                        let result = _.map(res.body, story => {
                            return {
                                title: story.title,
                                content: story.content
                            };
                        });
                        expect(result).to.deep.include({
                            title: "a weird baby",
                            content: "the baby has 3 heads."
                        });
                        expect(result).to.deep.include({
                            title: "delete demo",
                            content: "this is a sample to delete."
                        });
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
        });
    }); // end-GET all stories
    describe("GET /stories/:id", () => {
            describe("when the id is valid", () => {
                it("should return the matching story", done => {
                    request(server)
                        .get(`/stories/${validID}`)
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end((err, res) => {
                            expect(res.body[0]).to.have.property("title", "delete demo");
                            expect(res.body[0]).to.have.property("content", "this is a sample to delete.");
                            done(err);
                        });
                });
            });
            describe("when the id is invalid", () => {
                it("should return the NOT found message", done => {
                    request(server)
                        .get("/stories/9999")
                        .set("Accept", "application/json")
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .expect({message: "Story NOT Found!"}, (err) => {
                            done(err);
                        });
                });
            });
        }); // end-GET a specific story
    describe("GET /stories/find/:keyword", () => {
        describe("when the stories contain the keyword", () => {
            it("should return the matching stories", done => {
                request(server)
                    .get(`/stories/find/weird`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body[0]).to.have.property("title", "a weird baby");
                        done(err);
                    });
            });
        });
        // describe("when the stories not contain the keyword", () => {
        //     it("should return the NOT found message", done => {
        //         request(server)
        //             .get("/stories/find/zzzz")
        //             .set("Accept", "application/json")
        //             .expect("Content-Type", /json/)
        //             .expect(404)
        //     });
        // });
    }); // end-GET fuzzy search
    describe("POST /stories", () => {
        it("should return confirmation message and update datastore", () => {
            const story = {
                username:"Archie",
                title:"66",
                type:"song",
                class:"Chinese",
                content:"1234"
            };
            return request(server)
                .post("/stories")
                .send(story)
                .expect(200)
                .then(res => {
                    expect(res.body.message).equals("Story Added Successfully!");
                    ID = res.body.data._id;
                });
        });
        after(() => {
            return request(server)
                .get(`/stories/${ID}`)
                .expect(200)
                .then(res => {
                    expect(res.body[0]).to.have.property("username", "Archie");
                    expect(res.body[0]).to.have.property("title", "66");
                });
        });
    }); // end-POST a new story
    describe("PUT /stories/:id/upvote", () => {
    describe("when the id is valid", () => {
        it("should return a message and the story upvoted by 1", () => {
            return request(server)
                .put(`/stories/${validID}/upvote`)
                .expect(200)
                .then(resp => {
                    expect(resp.body).to.include({
                        message: "UpVote Successful"
                    });
                    expect(resp.body.data).to.include({
                        upvotes: 1
                    });
                });
        });
        after(() => {
            return request(server)
                .get(`/stories/${validID}`)
                .expect(200)
                .then((resp) => {
                    expect(resp.body[0]).to.have.property("upvotes", 1);
                });
        });
    });
    describe("when the id is invalid", () => {
        it("should return a message for NOT found", () => {
            return request(server)
                .put("/stories/1100001/upvote")
                .then(res => {
                    expect(res.body).to.include({ message: 'Story NOT Found - UpVote NOT Successful!!'});
                });
        });
    });
});  // end-PUT update a story's up-votes
    describe("PUT /stories/:id/downvote", () => {
        describe("when the id is valid", () => {
            it("should return a message and the story downvoted by 1", () => {
                return request(server)
                    .put(`/stories/${validID}/downvote`)
                    .expect(200)
                    .then(resp => {
                        expect(resp.body).to.include({
                            message: "DownVote Successful"
                        });
                        expect(resp.body.data).to.include({
                            downvotes: 1
                        });
                    });
            });
            after(() => {
                return request(server)
                    .get(`/stories/${validID}`)
                    .expect(200)
                    .then((resp) => {
                        expect(resp.body[0]).to.have.property("downvotes", 1);
                    });
            });
        });
        describe("when the id is invalid", () => {
            it("should return a message for NOT found", () => {
                return request(server)
                    .put("/stories/1100001/downvote")
                    .then(res => {
                        expect(res.body).to.include({ message: 'Story NOT Found - DownVote NOT Successful!!'});
                    });
            });
        });
    });  // end-PUT update a story's down-votes
    describe("DELETE /stories/:id",  () => {
        describe("when the id is valid", () => {
            it("should return a message and the story has been deleted", () => {
                return request(server)
                    .delete(`/stories/${validID}`)
                    .expect(200)
                    .then(resp => {
                        expect(resp.body.message).equals("Story Successfully Deleted!");
                    });
            });
            after(() => {
                return request(server)
                    .get("/stories")
                    .expect(200)
                    .then((res) => {
                        expect(res.body).to.be.a("array");
                        expect(res.body.length).to.equal(1);
                        const result = _.map(res.body, story => {
                            return {title: story.title, content: story.content};
                        });
                        expect(result).to.deep.include({
                            title: 'a weird baby',
                            content: 'the baby has 3 heads.'
                        });
                    });
            });
        });
        describe("when the id is invalid", () => {
            it("should return a message for invalid story id is not deleted", () => {
                return request(server)
                    .delete("/stories/1100001")
                    .then(resp => {
                        expect(resp.body).to.include({message: 'Story NOT Deleted!' });
                    });
            });
        });
    });// end-DELETE the specific story
    describe("POST /edit/:id", () => {
        it("should return confirmation message and update the previous story", () => {
            const story = {
                title:"not for delete",
                content:"the demo's been edited."
            };
            return request(server)
                .post(`/edit/${validID}`)
                .send(story)
                .expect(200)
                .then(res => {
                    expect(res.body.message).equals("Story Successfully Edited!");
                });
        });
        after(() => {
            return request(server)
                .get(`/stories/${validID}`)
                .expect(200)
                .then(res => {
                    expect(res.body[0]).to.have.property("title", "not for delete");
                    expect(res.body[0]).to.have.property("content", "the demo's been edited.");
                });
        });
    }); // end-POST edit a previous story
});