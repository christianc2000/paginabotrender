const { request, response } = require('express');
const { default: mongoose } = require('mongoose');
const Contacto = require('../models/Contacto');
const Ingreso = require('../models/Ingreso');
const Persona = require('../models/Persona');
const Prospecto = require('../models/Prospecto');
const Usuario = require('../models/Usuario');

// =====_____*****_____***** Método POST :: Estado 1 *****_____*****_____*****=====
const getProspecto = async( req, res ) => {
    // 
    let prospectoInicial = [];
    let total = await Prospecto.find();
    let i = 0;
    while ( i < total.length ) {
        let inicial = total[i];
        console.log(inicial.correo);
        if ( inicial.estado === 1 ) {
            let [entrada, numeroVeces, ultimoIngreso] = await Promise.all([
                Ingreso.find({ prospecto: inicial._id }),
                Ingreso.countDocuments({ prospecto: inicial._id }),
                Ingreso.find().sort( { $natural: -1 } ).limit( 1 ),
            ]) 
            let objProspecto = {
                prospecto: inicial,
                numeroVeces,
                ultimoIngreso
            };
            prospectoInicial.push( objProspecto );
        }
        i++;
    }
    res.json({ prospectoInicial });
}
// =====_____*****_____***** Método POST :: Estado 2 *****_____*****_____*****=====
const postProspecto = async(req, res) => {
    console.log(req.body);
    // const { id } = req.params;
    const { contactar, medio, mensaje, prospecto, id } = req.body;
    
    try {
        const fecha = new Date().toLocaleDateString('es-ES', {
            timeZone: 'America/La_Paz',
        });
        const hora = new Date().toLocaleTimeString('es-ES', {
            timeZone: 'America/La_Paz',
        });
        const usuario = new mongoose.Types.ObjectId( id );//
        const idPros = new mongoose.Types.ObjectId( prospecto );
        // Nuevo contacto
        const cont = new Contacto({ contactar, medio, mensaje, fecha, hora, idPros, usuario  });
        cont.save();
        res.json({
            cont
        });
    } catch (error) {
        return res.status( 400 ).json({ msg: error.message });
    }

};
const getProspectoContactar = async( req, res ) => {
    let prospectoInicial = [];
    let total = await Prospecto.find();
    let i = 0;
    while ( i < total.length ) {
        let inicial = total[i];
        if ( inicial.estado === 2 ) {
            let [ numeroVeces, fechaInicial, fechaUltima ] = await Promise.all([
                Contacto.countDocuments({ idPros: inicial._id }),
                Contacto.findOne({ idPros: inicial._id }),
                Contacto.findOne({ idPros: inicial._id }).sort( { $natural: -1 } ).limit( 1 ).populate('usuario').populate('idPros'),
            ])
            let objProspecto = {
                prospecto: inicial,
                numeroVeces,
                fechaInicial: fechaInicial.fecha,
                fechaUltima: fechaUltima.fecha
            };
            prospectoInicial.push( objProspecto );
        }
        i++;
    }
    res.json({ prospectoInicial });
};
const moverEstado = async( req = request, res = response ) => {
    const { prospecto } = req.body;
    prospecto.forEach(async pro => {
        const { facebookId,  estado, posicion } = pro;
        const nuevo = await Prospecto.findOne({ facebookId });
        nuevo.estado = parseInt( estado );
        nuevo.posicion = parseInt( posicion );
        nuevo.save();
    });
    res.json({ msg: 'enviado' });
}
const postOneMensaje = async(req, res) => {
    const { id } = req.body;
    const nuevo = new mongoose.Types.ObjectId( id );
    const mensaje = await Contacto.find({ idPros: nuevo }).populate('usuario');
    let usuarios = [];
    let i = 0;
    while ( i < mensaje.length ) {
        let data = mensaje[i].usuario.persona;
        let persona = await Persona.findOne({ _id: data });
        usuarios.push(  persona  );
        i++;
    }
    res.json({ mensaje, usuarios })
};
module.exports = { getProspecto, postProspecto, getProspectoContactar, moverEstado, postOneMensaje };