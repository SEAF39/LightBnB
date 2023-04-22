const { Pool } = require('pg');
const properties = require("./json/properties.json");

const pool = new Pool({
  user: 'labber',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  const queryString = `
    SELECT *
    FROM users
    WHERE email = $1;
  `;
  const values = [email];
  return pool.query(queryString, values)
    .then(res => res.rows[0])
    .catch(err => console.error('Error executing query', err.stack));
};


/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  const queryString = `
    SELECT *
    FROM users
    WHERE id = $1;
  `;
  const values = [id];
  return pool.query(queryString, values)
    .then(res => res.rows[0])
    .catch(err => console.error('Error executing query', err.stack));
};


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {
  return pool.query(`
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *
  `, [user.name, user.email, user.password])
    .then(res => res.rows[0])
    .catch(err => console.log(err.message));
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  const queryString = `
    SELECT properties.*, reservations.*, avg(rating) as average_rating
    FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    JOIN property_reviews ON properties.id = property_reviews.property_id
    WHERE reservations.guest_id = $1
    AND reservations.end_date < now()::date
    GROUP BY properties.id, reservations.id
    ORDER BY reservations.start_date
    LIMIT $2;
  `;
  const queryParams = [guest_id, limit];

  // Run query on database
  return pool
    .query(queryString, queryParams)
    .then((result) => result.rows) // Return array of reservation objects from query
    .catch((error) => console.log(error.message)); // If query is wrong or database issues (ex. wrong creditials)
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */


// Refactored getAllProperties function 
const getAllProperties = function(options, limit = 10) {
  // 1. Setup an array to hold any parameters that may be available for the query.
  const queryParams = [];

  // 2. Start the query with all information that comes before the WHERE clause.
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE owner_id = $1
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $2;
  
  `;

  // 3. Add any filters that the user passed in to the queryParams array and build the WHERE clause accordingly.
  let whereClause = '';
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    whereClause += `WHERE city LIKE $${queryParams.length} `;
  }
  if (options.owner_id) {
    queryParams.push(options.owner_id);
    whereClause += `${whereClause.length > 0 ? 'AND' : 'WHERE'} owner_id = $${queryParams.length} `;
  }
  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night);
    whereClause += `${whereClause.length > 0 ? 'AND' : 'WHERE'} cost_per_night >= $${queryParams.length} `;
  }
  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night);
    whereClause += `${whereClause.length > 0 ? 'AND' : 'WHERE'} cost_per_night <= $${queryParams.length} `;
  }
  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    whereClause += `${whereClause.length > 0 ? 'AND' : 'WHERE'} property_reviews.rating >= $${queryParams.length} `;
    queryString += `
      GROUP BY properties.id
      HAVING avg(property_reviews.rating) >= $${queryParams.length}
    `;
  } else {
    queryString += `
      GROUP BY properties.id
    `;
  }

  // 4. Add any query that comes after the WHERE clause.
  queryParams.push(limit);
  queryString += `
    ${whereClause}
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
  `;

  // 5. Log the query string and params array for debugging purposes.
  console.log(queryString, queryParams);

  // 6. Run the query and return the results.
  return pool.query(queryString, queryParams)
    .then(res => res.rows);
};



/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,

};
