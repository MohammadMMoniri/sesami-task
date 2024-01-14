const express = require('express')
const bodyParser = require('body-parser');
const { AppointmentModel, } = require('./appointment-schema')
const { body, validationResult } = require('express-validator');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const docsOptions = require('./docs-option')

const app = express();

app.use(bodyParser.json());

// Endpoint for creating an appointment
/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create a new appointment
 *     description: Endpoint to create a new appointment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: int
 *                 description: id of the appointment
 *               start:
 *                 type: string
 *                 format: date-time
 *                 description: Start time of the appointment
 *               end:
 *                 type: string
 *                 format: date-time
 *                 description: End time of the appointment
 *     responses:
 *       '201':
 *         description: Appointment created successfully
 */
app.post('/api/appointments',
    body('id').isInt().notEmpty(),
    body('start').isISO8601().notEmpty(),
    body('end').isISO8601().notEmpty(),
    async (req, res) => {
        try {
            const result = validationResult(req);

            if (!result.isEmpty()) return res.status(400).send({ errorList: result.array(), error: "inputs-problem" });

            let { id, start, end } = req.body;
            start = new Date(start)
            end = new Date(end)

            if (start < new Date())
                return res.status(400).json({
                    message: "Failed to create appointment, this appointment is started sooner than now.", error: "earlier-than-now"
                })

            if (end - start < 60 * 1000)
                return res.status(400).json({
                    message: "Failed to create appointment, this appointment is less than a minute.", error: "Appointment-less-than-a-minute"
                })

            const existingAppointmentsCount = await AppointmentModel.countDocuments({
                $or: [{
                    start: { $lte: end },
                    end: { $gte: start }
                }, { id }]

            });

            if (existingAppointmentsCount > 0)
                return res.status(400).json({
                    message: 'Another appointment exists in the same time range or with the same id.', error: "Another-appointment-exists"
                });

            const newAppointment = new AppointmentModel({ id, start, end });
            const savedAppointment = await newAppointment.save();

            return res.status(201).json({
                message: 'Appointment created successfully',
                appointment: savedAppointment
            });
        } catch (error) {
            res.status(500).json({ message: 'Failed to create appointment', error: error.message });
        }
    }
);

const specs = swaggerJsdoc(docsOptions.options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


app.listen(3000, (err) => {
    if (err) return "error"
    console.log(`Server is running on port 3000`);
})