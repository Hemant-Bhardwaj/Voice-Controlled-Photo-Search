# Voice-Controlled-Photo-Search
A photo album web application that is deployed on AWS. The application searches through photos using natural language through both text and voice. This application has been developed as a part of the project component for the course- Cloud Computing (CS-GY 9223, New York University)

# Introduction
It is a scalable application that allows users to: 
* Make search requests.
* Display the results (photos) resulting from the query. 
* Upload new photos.

The frontend user is also given the choice to use voice rather than text to perform the search.

* Using ElasticSearch service, a domain called ‘photos’ is created. Whenever a photo gets uploaded to the bucket, it triggers the Lambda function to index it.

* We also detect labels in the image, using Rekognition (“detectLabels” method). 

* We store a JSON object in an ElasticSearch index (“photos”) that references the S3 object and an array of string labels is, one for each label detected by Rekognition.

* A Lambda function called “search-photos” is used to interact with Amazon Lex and detect search keywords.

* An Amazon Lex bot is created to handle search queries. We create one intent named “SearchIntent” and add training utterances to the intent.

* In brief the user can visit the photo album application, search photos using natural language via voice and text, see relevant results based on what user searched and can upload new photos and see them appear in the search results.
