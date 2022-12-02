const { Schema, model, default: mongoose } = require('mongoose');
const generaIdRandom = require('../helpers/generar');

const ClienteSchema = Schema({
    nombre: {
        type: String,
        allowNull: false
    },
    correo: {
        type: String
    },
    celular: {
        type: String,
        allowNull: true
    },
    idPros: {
        type: mongoose.Types.ObjectId,
        ref: 'Prospecto'
    },
    facebookId: {
        allowNull: false,
        type: String
    }
}, {
    timestamps: true
});

module.exports = model( 'Cliente', ClienteSchema );