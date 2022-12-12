const { Router } = require('express');
const { obtenerTodos, crearPromo, eliminarPromo, obtenerProducto, publicarPromo } = require('../controllers/promociones.controller');
const { route } = require('./usuarioAuth.routes');
const router = Router();

router.get('/', obtenerTodos);
router.post('/crear', crearPromo);
router.post('/eliminar/:id', eliminarPromo);
router.get('/productos', obtenerProducto);
router.get('/publicar', publicarPromo);

module.exports = router;