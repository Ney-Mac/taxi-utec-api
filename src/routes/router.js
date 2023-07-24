const express = require('express');
const loginRoute = require('./loginRoute');
const registerRoute = require('./registerRoute');
const userRoutes = require('./userRoutes');
const veiculoRoutes = require('./veiculoRoutes');

const route = express.Router();

route.post('/register/', registerRoute);
route.post('/login/', loginRoute);

route.use('/user', userRoutes);

route.use('/veiculo', veiculoRoutes);

module.exports = route;