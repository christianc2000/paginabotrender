const Detalle = require("../models/Detalle");
const Producto = require("../models/Producto");
const Promocion = require("../models/Promocion");
const FB = require('fb');
const { default: Axios } = require("axios");

const pageId="100581316141576";
const pageToken="EAAurHQeutjUBAIIvOW47uleGpOyY7tydoYZBOD0jZBOSwBwqUEdmHZAmljbuUf7SV2wHHLvOazlgc3sEohItEsIfo76IHKZCX2VzGWVfo9gTF3De7ENzq9uwK66FgrtHSzhsoq5LNc9Rg4gwqvGfZBMdHdz2bam1WJpe5gX3ZCAAZDZD";
const publicarPromo = async (req, res) => {
    const text = req.body.text;
    const img = req.body.img;

    Axios.post(
    `https://graph.facebook.com/${pageId}/feed?message=Hello Fans!&access_token=${pageToken}`, null).then(function (response) {
        console.log(response);
    }).catch(function (error) {
        console.log(error);
    });
    return res.json({ mensaje: "salio bien" });

}
const obtenerTodos = async (req, res) => {
    const detalle = await Detalle.find().populate('producto').populate('promocion').where();
    res.json({
        detalle
    });
}
const crearPromo = async (req, res) => {
    const { nombre, descuento, descripcion, cantidadSillas, cantidadMesas, producto } = req.body;
    const fecha = new Date().toLocaleDateString('es-ES', {
        timeZone: 'America/La_Paz',
    });
    const nuevaPromocion = new Promocion({
        nombre,
        descuento,
        descripcion,
        fecha,
        cantidadSillas,
        cantidadMesas
    });
    await nuevaPromocion.save();
    const detallePromocion = new Detalle({
        producto,
        promocion: nuevaPromocion._id
    });
    await detallePromocion.save();
    res.json({
        msg: 'creado exitosamente'
    })
}
const eliminarPromo = async (req, res) => {
    const { id } = req.params;
    const detalle = await Detalle.findOne({ _id: id });
    const promocion = await Promocion.findOne({ _id: detalle.promocion });
    await detalle.deleteOne();
    await promocion.deleteOne();
    res.json({
        msg: 'Eliminado con exito'
    })
    // const eliminar = await Promocion.
}
const obtenerProducto = async (req, res) => {
    const productos = await Producto.find();
    res.json({
        productos
    })
}
module.exports = {
    obtenerTodos, crearPromo, eliminarPromo, obtenerProducto, publicarPromo
}