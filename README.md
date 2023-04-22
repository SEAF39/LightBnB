# LightBnb Project

LightBnb is an application that runs on SQL database, it is a simulated app where a user can view properties for rent, register as a new user and add their own property listings.

Powered by SQL queries a user can search for a property filtering through desired parameters such as city, rating and price


## Dependencies
- Bcrypt
- Cookie-session
- Express
- Nodemon
- pg

## Getting Started

- Install all dependencies (using the `npm install` command).
- In ./migrations/01_schema.sql check the instructions in the file and run that file accordingly
- In ./seeds/02_seeds.sql check the instructions in the file and run that file accordingly
- In ./LightBnB_WebApp-master/db/database.js file on lines from 6 to 9, make sure the correct database is created as well as user, password and host
- Run the development web server using the `npm start` command from within the folder ./LightBnB_WebApp-master
- In the browser type(into the url bar): http://localhost:3000/
