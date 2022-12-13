const { request, response } = require('express');
const { default: mongoose } = require('mongoose');
const Cliente = require('../models/Cliente');
const Detalle = require('../models/Detalle');
const Notificaciones = require('../models/Notificaciones');
const Pedido = require('../models/Pedido');
const PedidoDetalle = require('../models/PedidoDetalle');

// =====_____*****_____***** Método POST :: Estado 1 *****_____*****_____*****=====
const getPedido = async( req, res ) => {
    let pedidos = [];
    let total = await Cliente.find().populate('idPros');
    let i = 0;
    while ( i < total.length ) {
        let inicial = total[i];
        if ( inicial.idPros.estado === 3 ) {
            let [ numeroVeces, fechaUltima ] = await Promise.all([
                Pedido.countDocuments({ cliente: inicial._id }),
                Pedido.find({ cliente: inicial._id }).sort( { $natural: -1 } ).limit( 1 ),
            ]) 
            let objProspecto = {
                cliente: inicial,
                numeroVeces,
                fechaUltima
            };
            pedidos.push( objProspecto );
        }
        i++;
    }
    res.json({ pedidos });
}
const getOneCliente = async( req, res ) => {
    const { id } = req.params;
    const cliente = await Cliente.findOne({ facebookId: id });
    const existePedido = await Pedido.find({ cliente: cliente._id });
    // const existePedido = await Pedido.find({ cliente: cliente._id }).sort( { $natural: -1 } ).limit( 1 );
    let i = 0;
    let pedidoDetalleCarrito = [];
    while ( i < existePedido.length ) {
        let pedido = existePedido[i];
        const pedidoDetalle = await PedidoDetalle.find({ pedido: pedido._id }).populate('producto');
        let objDetalle = {
            pedido,
            pedidoDetalle
        }
        pedidoDetalleCarrito.push( objDetalle );
        i++;
    }
    res.json({ pedidoDetalleCarrito });
}
const obtener4estado = async ( req, res ) => {
    let total = await Cliente.find().populate('idPros');
    let clientes = [];
    let i = 0;
    while ( i < total.length ) {
        let inicial = total[i];
        if ( inicial.idPros.estado === 4 ) {
            let obj = {
                correo: inicial.idPros.correo
            }
            clientes.push( obj );
        }
        i++;
    }
    const mas = clientes.length;
    res.json({ clientes, contador: mas });
}
const getMuchoPedido = async ( req, res ) => {
    // 01/11/2022
    // 3 dias
    // 04/11/2022
    // 5 dias
    // 09/11/2022
    // 2 dias
    // 11/11/2022
    // ===========
    // 10 / 3 = 3 dias
    let pedidos = [];
    let total = await Cliente.find().populate('idPros');
    let i = 0;
    while ( i < total.length ) {
        let inicial = total[i];
        if ( inicial.idPros.estado === 4 ) {
            let [ promedioCompra, fechaUltima ] = await Promise.all([
                Pedido.find({ cliente: inicial._id }),
                Pedido.find({ cliente: inicial._id }).sort( { $natural: -1 } ).limit( 1 )
            ])
            // Promedio de compras
            let promedio = 0, cantidad = 0;
            for (let i = 0; i < promedioCompra.length; i++) {
                promedio = promedio + promedioCompra[i].monto;
                cantidad = cantidad + 1;
            }
            // Promedio pedidos
            let promedioFecha = [];
            for (let j = 0; j < promedioCompra.length; j++) {
                let separarFecha = promedioCompra[j].fecha.split("/");
                let inicio = new Date(`${separarFecha[2]}-${separarFecha[1]}-${separarFecha[0]}`).getTime();
                promedioFecha.push({ inicio });           
            }
            let promedioPrincipal = [], cantidadFecha = 0;
            for (let h = 0; h < promedioFecha.length - 1; h++) {
                const fechaPrin = promedioFecha[h].inicio;
                const fechaFin = promedioFecha[h+1].inicio;
                let diferencia = fechaFin - fechaPrin;
                let resultado = diferencia / ( 1000 * 60 * 60 * 24 );
                cantidadFecha++;
                promedioPrincipal.push( resultado );
            }
            let suma = 0;
            for (let j = 0; j < promedioPrincipal.length; j++) {
                suma = suma + promedioPrincipal[j];
            }
            let totalFecha = suma / cantidadFecha;

           

            // Notificaciones
            const veces = await Notificaciones.countDocuments({ cliente: inicial._id });

            // Detalle de las notificaciones que le llego
            // const notificaciones = await Notificaciones.find();


            let objProspecto = {
                fecha: Math.round( totalFecha ),
                cliente: inicial,
                promedioCompra: promedio / cantidad,
                fechaUltima,
                vecesNotificado: veces
            };
            pedidos.push( objProspecto );
        }
        i++;
    }
    res.json({ pedidos });
};
const oneNotificacion = async (req, res) => {
    const { id } = req.params;
    const cliente = await Cliente.findOne({ facebookId: id });
    const notifaciones = await Notificaciones.find({ cliente: cliente });
    let i = 0;
    let promociones = [];
    while ( i < notifaciones.length ) {
        let notificacion = notifaciones[i];
        // console.log(notificacion.promocion);
        const notify = await Detalle.findOne({ promocion: notificacion.promocion }).populate('producto').populate('promocion');
        let objDetalle = {
            notify
        }
        promociones.push( objDetalle );
        i++;
    }
    res.json({
        promociones
    })

}
module.exports = { getPedido, getOneCliente, getMuchoPedido, obtener4estado, oneNotificacion };
// TODO
// var fixed = "01/11/2022".split("/");
// var fechaInicio = new Date(`${fixed[2]}-${fixed[1]}-${fixed[0]}`).getTime()

// var fixed2 = "05/11/2022".split("/"); 
// var fechaFin = new Date(`${fixed2[2]}-${fixed2[1]}-${fixed2[0]}`).getTime(); 

// var diff = fechaFin - fechaInicio;
// console.log(diff/(1000*60*60*24) );