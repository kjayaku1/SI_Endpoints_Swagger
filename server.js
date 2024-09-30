const express = require('express');
const app = express();
const port = 3000;
const mariadb = require('mariadb');
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'SAMPLE',
  port: 3306,
  connectionLimit: 5
});

app.use(express.json()); // Middleware to parse JSON request body

// Utility function to query DB
async function queryDB(query, params = []) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(query, params);
    return rows;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.end();
  }
}

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get all customers
 *     responses:
 *       200:
 *         description: A list of customers
 *       500:
 *         description: Server error
 */
app.get('/customers', async (req, res) => {
  try {
    const customers = await queryDB('SELECT * FROM customer');
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /customers/{cust_code}:
 *   get:
 *     summary: Get a specific customer by CUST_CODE
 *     parameters:
 *       - name: cust_code
 *         in: path
 *         required: true
 *         description: The customer's code
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A customer object
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */
app.get('/customers/:cust_code', async (req, res) => {
  try {
    const customer = await queryDB('SELECT * FROM customer WHERE CUST_CODE = ?', [req.params.cust_code]);
    if (customer.length > 0) {
      res.json(customer);
    } else {
      res.status(404).json({ error: 'Customer not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Add a new customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               CUST_CODE:
 *                 type: string
 *               CUST_NAME:
 *                 type: string
 *               CUST_CITY:
 *                 type: string
 *               WORKING_AREA:
 *                 type: string
 *               CUST_COUNTRY:
 *                 type: string
 *               GRADE:
 *                 type: integer
 *               OPENING_AMT:
 *                 type: number
 *               RECEIVE_AMT:
 *                 type: number
 *               PAYMENT_AMT:
 *                 type: number
 *               OUTSTANDING_AMT:
 *                 type: number
 *               PHONE_NO:
 *                 type: string
 *               AGENT_CODE:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer added successfully
 *       400:
 *         description: Required fields missing
 *       500:
 *         description: Server error
 */
app.post('/customers', async (req, res) => {
  const { CUST_CODE, CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE, OPENING_AMT, RECEIVE_AMT, PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO, AGENT_CODE } = req.body;

  // Sanitization and validation (basic example)
  if (!CUST_CODE || !CUST_NAME || !CUST_CITY) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    await queryDB(
      'INSERT INTO customer (CUST_CODE, CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE, OPENING_AMT, RECEIVE_AMT, PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO, AGENT_CODE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [CUST_CODE, CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE, OPENING_AMT, RECEIVE_AMT, PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO, AGENT_CODE]
    );
    res.status(201).json({ message: 'Customer added successfully', customerId: CUST_CODE });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /customers/{cust_code}:
 *   patch:
 *     summary: Update a specific customer
 *     parameters:
 *       - name: cust_code
 *         in: path
 *         required: true
 *         description: The customer's code
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */
app.patch('/customers/:cust_code', async (req, res) => {
  const updates = Object.keys(req.body).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(req.body), req.params.cust_code];

  try {
    const result = await queryDB(`UPDATE customer SET ${updates} WHERE CUST_CODE = ?`, values);
    if (result.affectedRows > 0) {
      res.json({ message: 'Customer updated successfully' });
    } else {
      res.status(404).json({ error: 'Customer not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /customers/{cust_code}:
 *   put:
 *     summary: Replace a specific customer
 *     parameters:
 *       - name: cust_code
 *         in: path
 *         required: true
 *         description: The customer's code
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               CUST_CODE:
 *                 type: string
 *               CUST_NAME:
 *                 type: string
 *               CUST_CITY:
 *                 type: string
 *               WORKING_AREA:
 *                 type: string
 *               CUST_COUNTRY:
 *                 type: string
 *               GRADE:
 *                 type: integer
 *               OPENING_AMT:
 *                 type: number
 *               RECEIVE_AMT:
 *                 type: number
 *               PAYMENT_AMT:
 *                 type: number
 *               OUTSTANDING_AMT:
 *                 type: number
 *               PHONE_NO:
 *                 type: string
 *               AGENT_CODE:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer replaced successfully
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */
app.put('/customers/:cust_code', async (req, res) => {
  const { CUST_CODE, CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE, OPENING_AMT, RECEIVE_AMT, PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO, AGENT_CODE } = req.body;

  try {
    await queryDB(
      'REPLACE INTO customer (CUST_CODE, CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE, OPENING_AMT, RECEIVE_AMT, PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO, AGENT_CODE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [CUST_CODE, CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE, OPENING_AMT, RECEIVE_AMT, PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO, AGENT_CODE]
    );
    res.json({ message: 'Customer replaced successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /customers/{cust_code}:
 *   delete:
 *     summary: Delete a specific customer
 *     parameters:
 *       - name: cust_code
 *         in: path
 *         required: true
 *         description: The customer's code
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */
app.delete('/customers/:cust_code', async (req, res) => {
  try {
    const result = await queryDB('DELETE FROM customer WHERE CUST_CODE = ?', [req.params.cust_code]);
    if (result.affectedRows > 0) {
      res.json({ message: 'Customer deleted successfully' });
    } else {
      res.status(404).json({ error: 'Customer not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Swagger setup
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Customer API',
      version: '1.0.0',
      description: 'API to manage customers',
    },
    servers: [
      {
        url: `http://167.71.163.198:${port}`,
      },
    ],
  },
  apis: ['./server.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(port, () => {
  console.log(`Server running on http://167.71.163.198:${port}`);
});

