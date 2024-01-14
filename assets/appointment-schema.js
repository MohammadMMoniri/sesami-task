const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://mongo:27017/';
mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

const appointmentSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
}, { timestamps: { createdAt: 'created_at' }, updatedAt: 'updated_at' });

const AppointmentModel = mongoose.model('Appointment', appointmentSchema);


module.exports = {
    AppointmentModel, appointmentSchema
}