const { request, response } = require('express');
const { default: mongoose } = require('mongoose');
const Pusher = require("pusher");
const Contacto = require('../models/Contacto');
const Ingreso = require('../models/Ingreso');
const Persona = require('../models/Persona');
const Prospecto = require('../models/Prospecto');
const Usuario = require('../models/Usuario');
/*const Pusher = require("pusher");

const pusher = new Pusher({
    appId: "1515676",
    key: "9cb69b0c52d9af0d8ff3",
    secret: "018d85ef6715f586ec53",
    cluster: "us2",
    useTLS: true
});*/

// =====_____*****_____***** Método POST :: Estado 1 *****_____*****_____*****=====
const getProspecto = async (req, res) => {
    // 
    let prospectoInicial = [];
    let total = await Prospecto.find();
    let i = 0;
    while (i < total.length) {
        let inicial = total[i];
        // console.log(inicial.correo);
        if (inicial.estado === 1) {
            let [entrada, numeroVeces, ultimoIngreso] = await Promise.all([
                Ingreso.find({ prospecto: inicial._id }),
                Ingreso.countDocuments({ prospecto: inicial._id }),
                Ingreso.find().sort({ $natural: -1 }).limit(1),
            ])
            let objProspecto = {
                prospecto: inicial,
                numeroVeces,
                ultimoIngreso
            };
            prospectoInicial.push(objProspecto);
        }
        i++;
    }
    res.json({ prospectoInicial });
}
// =====_____*****_____***** Método POST :: Estado 2 *****_____*****_____*****=====
const postProspecto = async (req, res) => {
    // console.log(req.body);
    // const { id } = req.params;
    const { contactar, medio, mensaje, prospecto, id } = req.body;

    try {
        const fecha = new Date().toLocaleDateString('es-ES', {
            timeZone: 'America/La_Paz',
        });
        const hora = new Date().toLocaleTimeString('es-ES', {
            timeZone: 'America/La_Paz',
        });
        const usuario = new mongoose.Types.ObjectId(id);//
        const idPros = new mongoose.Types.ObjectId(prospecto);
        // Nuevo contacto
        const cont = new Contacto({ contactar, medio, mensaje, fecha, hora, idPros, usuario });
        cont.save();
        res.json({
            cont
        });
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }

};
const getProspectoContactar = async (req, res) => {
    let prospectoInicial = [];
    let total = await Prospecto.find();
    let i = 0;
    while (i < total.length) {
        let inicial = total[i];
        if (inicial.estado === 2) {
            let [numeroVeces, fechaInicial, fechaUltima] = await Promise.all([
                Contacto.countDocuments({ idPros: inicial._id }),
                Contacto.findOne({ idPros: inicial._id }),
                Contacto.findOne({ idPros: inicial._id }).sort({ $natural: -1 }).limit(1).populate('usuario').populate('idPros'),
            ])

            let objProspecto = {
                prospecto: inicial,
                numeroVeces,
                fechaInicial: fechaInicial.fecha,
                fechaUltima: fechaUltima.fecha
            };
            prospectoInicial.push(objProspecto);
        }
        i++;
    }
    res.json({ prospectoInicial });
};
const moverEstado = async (req = request, res = response) => {
    const { prospecto } = req.body;

    prospecto.forEach(async pro => {
        const { facebookId, estado, posicion } = pro;
        const nuevo = await Prospecto.findOne({ facebookId });
        nuevo.estado = parseInt(estado);
        nuevo.posicion = parseInt(posicion);
        nuevo.save();
    });
    /*pusher.trigger("canal-actualizar", "evento-actualizar", {
        message: "Luego de mover",
    });*/
    res.json({ msg: 'enviado' });
}
const postOneMensaje = async (req, res) => {
    const { id } = req.body;
    console.log('id',id);
    const nuevo = new mongoose.Types.ObjectId(id);
    console.log('idPros: ',nuevo);
    const mensaje = await Contacto.find({ idPros: nuevo }).populate('usuario');
    console.log('mensaje: ',mensaje);
    let usuarios = [];
    let i = 0;
    while (i < mensaje.length) {
        let data = mensaje[i].usuario.persona;
        let persona = await Persona.findOne({ _id: data });
        usuarios.push(persona);
        i++;
    }
    res.json({ mensaje, usuarios })
};
//crear Prospecto
//**************************************** */
const pusher = new Pusher({
    appId: "1515676",
    key: "9cb69b0c52d9af0d8ff3",
    secret: "018d85ef6715f586ec53",
    cluster: "us2",
    useTLS: true
});
// =====__**__*** Método POST :: Estado 1 **__**_______***** Método POST :: Estado 1 *****_____*****_____***=====
const getTest = async( req = request, res = response ) => {
    // const cliente = await Cliente.findOne({ facebookId: '5319732098134729' });
    // const existePedido = await Pedido.find({ cliente: { _id: cliente._id } });
    // console.log(existePedido);
    // const { facebookId } = req.body;
    // const cliente = await Cliente.findOne({ facebookId });
    // const cantidadPedidos = await Pedido.countDocuments({ cliente: cliente._id  });
    // // const cliente = await Cliente.findOne({ facebookId });
    // const prospecto = await Prospecto.findOne({ facebookId });
    await Prospecto.create({ 
        nombre: 'Prueba',
        imagen: 'Sinimagen',
        correo: 'fer@gmail.com',
        celular: '12345',
        facebookId: '123',
        estado: 1,
        posicion: 1
    });
    let titulop = "";
    titulop = `Un nuevo prospecto está registrado`
    pusher.trigger("actualizar-channel", "actualizar-event", {
        titulo: titulop,
    });
    res.json({ msg: 'creado exitosamente' });
};
module.exports = { getProspecto, postProspecto, getProspectoContactar, moverEstado, postOneMensaje, getTest };