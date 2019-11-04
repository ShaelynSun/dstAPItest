const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const _ = require("lodash");
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
const Usr = require("../../../models/usr");
const mongoose = require("mongoose");

let server;
let mongod;
let db, validID;

describe('User',  () => {
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
            await Usr.deleteMany({});
            let usr = new Usr();
            usr.name = "sxy";
            usr.pwd = "123";
            await usr.save();
            usr = await Usr.findOne({name: "sxy"});
            validID = usr._id;
        } catch (error) {
            console.log(error);
        }
    });

    describe("POST /reg", () => {
       describe("when the user hasn't been existed", () =>{
           it("should return confirmation message and user added", () => {
               const usr = {
                   name: "shaelyn",
                   pwd: "321"
               };
               return request(server)
                   .post("/reg")
                   .send(usr)
                   .expect(200)
                   .then(res => {
                       expect(res.body.message).equals("User Added!");
                   });
           });
       });
       describe("when the user has been existed", () =>{
           it("should return confirmation message the user not added", () => {
               const usr = {
                   name: "sxy",
                   pwd: "123"
               };
               return request(server)
                .post("/reg")
                .send(usr)
                .expect(200)
                .then(res => {
                    expect(res.body.message).equals("the user has already existed");
                    expect(res.body.data).to.have.property("name", "sxy");
                });
           });
       });

    });//end-POST a new user added
    describe("POST /login", () => {
        describe("when the user existed and password is right", () =>{
            it("should return confirmation message and login", () => {
                const usr = {
                    name: "sxy",
                    pwd: "123"
                };
                return request(server)
                    .post("/login")
                    .send(usr)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("login successfully");
                        expect(res.body.data).equals("sxy");
                    });
            });
        });
        describe("when the user existed but password is wrong", () =>{
            it("should return message that password is wrong", () => {
                const usr = {
                    name: "sxy",
                    pwd: "3333333"
                };
                return request(server)
                    .post("/login")
                    .send(usr)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("the password is wrong");
                    });
            });
        });
        describe("when the user not existed", () =>{
            it("should return message to advice register", () => {
                const usr = {
                    name: "123",
                    pwd: "123"
                };
                return request(server)
                    .post("/login")
                    .send(usr)
                    .expect(200)
                    .then(res => {
                        expect(res.body.message).equals("the user is not existed, go to register");
                    });
            });
        });

    });
});