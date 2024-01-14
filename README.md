# Sesami-Task

This is a Node.js Express.js project named Sesami-Task. It includes the usage of Docker Compose, Morgan for logging, Mongoose as ORM for storing data, and Swagger for API documentation.

## Setup and Run

To start the project, make sure you have Docker installed. Then, run the following command:

docker-compose up

This will build and run the containers for the project.

## Logging

The project uses Morgan for logging. All logs are stored in the “morganLogs” file.

## Data Storage

Mongoose is used as the ORM for data storage in this project. It provides an easy way to interact with MongoDB.

## API Documentation

Swagger is integrated into the project, and the API documentation can be accessed at the “/api-docs” endpoint. The Swagger UI will provide information about the available routes and their parameters.

## Port

The project is configured to run on port 3000.
