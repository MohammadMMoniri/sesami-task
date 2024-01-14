const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Appointment API',
            version: '1.0.0',
            description: 'API for managing appointments'
        },
    },
    apis: ['./main.js'], // Replace with actual path to your API file
};

module.exports = {
    options
}