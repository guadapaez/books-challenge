const path = require('path');
const bcryptjs = require('bcryptjs');
const db = require('../database/models');
const { check, body } = require('express-validator');
const isEmailAlreadyInUse = async (email) => {
  const existingUser = await db.User.findOne({
    where: {
      Email: email,
    },
  });

  return existingUser !== null;
};

module.exports = {
 

 
  validationRegister: [
    check('name').notEmpty().withMessage('Debes escribir un nombre'),
    
      check('email')
      .notEmpty()
      .withMessage('Escribe un email')
      .bail()
      .isEmail()
      .withMessage('Debes escribir un email válido')
      .custom(async (value) => {
        if (await isEmailAlreadyInUse(value)) {
          throw new Error('Email en uso. Por favor, usa otro.');
        }
        return true;
      }),
    check('country')
      .notEmpty()
      .withMessage('Debes indicar un país')
      .bail()
      .isLength({ min: 3 })
      .withMessage('Debes indicar un país'),
    check('password')
      .notEmpty()
      .withMessage('Escribe una contraseña')
      .isLength({ min: 8 })
      .withMessage('La contraseña es muy corta'),
      check('category').notEmpty().withMessage('Debes elegir una opción')
      
  ],
}
