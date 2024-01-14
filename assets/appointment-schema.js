const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://mongo:27017/';
mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, maxConnecting:6 })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));


const appointmentHistorySchema = new mongoose.Schema({
    id: { type: Number, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    objectId: { type: String, required: true },
}, { timestamps: { createdAt: 'created_at' } });

const AppointmentHistoryModel = mongoose.model('AppointmentHistory', appointmentHistorySchema);

const appointmentSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

appointmentSchema.pre('update', async function (next) {
    try {
        const appointment = AppointmentModel.findByIdAndUpdate({ _id: 'entityId' }, { updated_at: new Date() });

        const appointmentHistory = new AppointmentHistoryModel(
            { id: this.id, start: this.start, end: this.end, objectId: this._id }
        )
        await appointmentHistory.save()

    } catch (err) {
        console.log('error pre-save :', err);
    }
});

const AppointmentModel = mongoose.model('Appointment', appointmentSchema);

module.exports = {
    AppointmentModel, appointmentSchema
}