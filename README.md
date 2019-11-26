# Assignment 1 - Agile Software Practice.
Name: Xinyue Sun (Shaelyn) 

Student Number: 20086486

GitHub link: https://github.com/ShaelynSun/DSTapiTestDemo

## Overview.
This is a dynamic story telling website. Everyone can post their own incomplete story. 
After uploaded, other users will post comments as the continuation of this story.
Comments are related to stories. One story has many comments. A user can post both stories and comments.
Users can find their interested stories(and comments) by fuzzy search, and update upvotes and downvotes.
Users must register to use this website, and the username should be unique.

## API endpoints.
 + GET /stories - Get all stories.
 + GET /stories/:id - Get story with a specific ID.
 + GET /stories/find/:keyword - Fuzzy search the stories' title and content with a keyword.
 + GET /comments/:id - Get all comments from one story.

 + PUT /stories/:id/upvote - Update specific story's upvotes.
 + PUT /stories/:id/downvote - Update specific story's downvotes.
 + PUT /stories/:id/downvote - Update specific story's downvotes.
 + PUT /comments/:id/upvote - Update specific comment's upvotes.
 + PUT /stories/:id/addcomment - Add the story's new comment, at the same time, the attribute 'written_times' of story should be increased by 1.

 + POST /stories - Add a new story.
 + POST /edit/:id - Edit the specific story's title and content.
 + POST /reg - Register a new user (the username should be unique).
 + POST /login - User login with username and password identification.

 + DELETE /stories/:id - Delete the specific story.
 + DELETE /comments/:story_id/:comment_id - Delete the specific story's a comment.

 ## Data model
 ![data_model](../../Downloads/DSTapiTest/public/images/data_model.jpg)

 ## Sample Test execution.

~~~
User
    POST /reg
      when the user hasn't been existed
        ✓ should return confirmation message and user added (42ms)
      when the user has been existed
        ✓ should return confirmation message the user not added
    POST /login
      when the user existed and password is right
        ✓ should return confirmation message and login
      when the user existed but password is wrong
        ✓ should return message that password is wrong
      when the user not existed
        ✓ should return message to advice register

Comment
    PUT /stories/:id/addComment
      when the id is valid
        ✓ should return a message and the comment added
      when the id is invalid
        ✓ should return a message for invalid story id cannot add a comment
    GET /comments/:id
      when the id is valid
        ✓ should return the comments with specific storyID
      when the id is invalid
        ✓ should return a not found message
    PUT /comments/:id/upvote
      when the id is valid
        ✓ should return a message and the comment upvoted by 1
      when the id is invalid
        ✓ should return a message for NOT found
    DELETE /comments/:story_id/:comment_id
      when the id is valid
        ✓ should return a message and the comment has been deleted
      when the id is invalid
        ✓ should return a message for invalid story id is not deleted

Stories
    GET /stories
        ✓ should return all the stories
    GET /stories/:id
      when the id is valid
        ✓ should return the matching story
      when the id is invalid
        ✓ should return the NOT found message
      when the stories contain the keyword
        ✓ should return the matching stories
    POST /stories
        ✓ should return confirmation message and update datastore
    PUT /stories/:id/upvote
      when the id is valid
        ✓ should return a message and the story upvoted by 1
      when the id is invalid
        ✓ should return a message for NOT found
    PUT /stories/:id/downvote
      when the id is valid
        ✓ should return a message and the story downvoted by 1
      when the id is invalid
        ✓ should return a message for NOT found

    DELETE /stories/:id
      when the id is valid
        ✓ should return a message and the story has been deleted
      when the id is invalid
        ✓ should return a message for invalid story id is not deleted
    POST /edit/:id
        ✓ should return confirmation message and update the previous story

  25 passing (5s)

=============================== Coverage summary ===============================
Statements   : 90.95% ( 201/221 )
Branches     : 68% ( 34/50 )
Functions    : 85.71% ( 36/42 )
Lines        : 91.36% ( 201/220 )
================================================================================

~~~
