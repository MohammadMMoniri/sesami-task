const express = require('express')
const bodyParser = require('body-parser');
const { AppointmentModel, } = require('./appointment-schema')
const { body, validationResult, check } = require('express-validator');
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
 *                 type: number
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

            if (!result.isEmpty()) return res.status(400).send({ errorList: result.array(), errorCode: "inputs-problem" });

            let { id, start, end } = req.body;
            start = new Date(start)
            end = new Date(end)

            if (start < new Date())
                return res.status(400).json({
                    message: "Failed to create appointment, this appointment is started sooner than now.", errorCode: "earlier-than-now"
                })

            if (end - start < 60 * 1000)
                return res.status(400).json({
                    message: "Failed to create appointment, this appointment is less than a minute.", errorCode: "Appointment-less-than-a-minute"
                })

            const existingAppointmentsCount = await AppointmentModel.countDocuments({
                $or: [{
                    start: { $lte: end },
                    end: { $gte: start }
                }, { id }]
            });

            if (existingAppointmentsCount > 0)
                return res.status(400).json({
                    message: 'Another appointment exists in the same time range or with the same id.', errorCode: "Another-appointment-exists"
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


// Endpoint for updating an appointment
/**
 * @swagger
 * /api/update-appointment:
 *   put:
 *     summary: update appointment
 *     description: Endpoint to update an appointment with id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
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
 *       '200':
 *         description: Appointment updated successfully
 */
app.put('/api/update-appointment',
    body('id').isInt().notEmpty(),
    body('start').isISO8601().optional(),
    body('end').isISO8601().optional(),
    async (req, res) => {
        try {
            const result = validationResult(req);

            if (!result.isEmpty()) return res.status(400).send({ errorList: result.array(), errorCode: "inputs-problem" });

            let { id, start, end } = req.body;

            start = start ? new Date(start) : null;
            end = end ? new Date(end) : null;

            if (!start && !end)
                return res.status(400).json({
                    message: "Failed to update appointment, bot start and end time are empty.", errorCode: "start-and-end-empty"
                })

            const appointment = await AppointmentModel.findOne({ id });

            if (!appointment)
                return res.status(400).json({
                    message: "Failed to update appointment, there is no appointment with this id to update.", errorCode: "appointment-dose-not-exists"
                })

            appointment.start = new Date(appointment.start);
            appointment.end = new Date(appointment.end);

            if (appointment.start < new Date() || appointment.end < new Date())
                return res.status(400).json({
                    message: "Failed to update appointment, this appointment is done.", errorCode: "appointment-finished"
                })

            if ((start || appointment.start) < new Date())
                return res.status(400).json({
                    message: "Failed to update appointment, this appointment is started sooner than now.", error: "earlier-than-now"
                })

            if ((end || appointment.end) - (start || appointment.start) < 60 * 1000)
                return res.status(400).json({
                    message: "Failed to update appointment, this appointment is less than a minute.", error: "Appointment-less-than-a-minute"
                })

            await AppointmentModel.findOneAndUpdate({ id }, {
                start: (start || appointment.start), end: (end || appointment.end)
            })

            return res.status(200).json({
                message: 'Appointment updated successfully',
                appointment: await AppointmentModel.findOne({ id })
            });
        } catch (error) {
            res.status(500).json({ message: 'Failed to update appointment', error: error });
        }
    }
);

// Endpoint for getting appointments
/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: get appointments
 *     description: Endpoint to get appointments in range of time
 *     parameters:
 *       - in: query
 *         name: start
 *         type: date
 *         required: true
 *         description: start date
 *       - in: query
 *         name: end
 *         type: string
 *         format: date-time
 *         required: true
 *         description: end date
 *     responses:
 *       '200':
 *         description: Appointment updated successfully
 */
app.get('/api/appointments',
    check('start').isISO8601(),
    check('end').isISO8601(),
    async (req, res) => {
        try {
            const result = validationResult(req);

            if (!result.isEmpty()) return res.status(400).send({ errorList: result.array(), errorCode: "inputs-problem" });

            if (!req.query.start || !req.query.end) {
                return req.status(400).json({
                    error: "need start and end for this request as query.",
                    errorCode: "no-start-end-query"
                })
            }
            console.log('hello');
            let start = new Date(req.query.start);
            let end = new Date(req.query.end);

            const appointments = await AppointmentModel.find({
                start: { $lte: end },
                end: { $gte: start }
            })

            return res.status(200).json({
                appointments
            });
        } catch (error) {
            res.status(500).json({ message: 'Failed to update appointment', error: error });
        }
    }
);


const specs = swaggerJsdoc(docsOptions.options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


app.listen(3000, (err) => {
    if (err) return "error"
    console.log(`Server is running on port 3000`);
})