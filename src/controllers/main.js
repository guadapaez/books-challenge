const bcryptjs = require('bcryptjs');
const db = require('../database/models');
const { Sequelize } = require("../database/models");
const Op = Sequelize.Op;
const { validationResult } = require('express-validator');
const session = require('express-session');


const mainController = {
  home: (req, res) => {
    db.Book.findAll({
      include: [{ association: 'authors' }]
    })
      .then((books) => {
        res.render("home", { books, message: req.session.message });
      })
      .catch((error) => console.log(error));
  },
  bookDetail: (req, res) => {
    // Implement look for details in the database
    let idReference = req.params.id;
    db.Book.findByPk(idReference, {
      include: [{ association: "authors" }],
    })
      .then((book) => {
        res.render("bookDetail", { book, message: req.session.message });
      })
    
      .catch((error) => console.log(error));
  },
  bookSearch: (req, res) => {
    res.render("search", { books: [] , message: req.session.message });
  },
  bookSearchResult: (req, res) => {
    // Implement search by title
    let keyword = req.body.title
    console.log(keyword)
    if (keyword.length == 0) {
      res.render("search", { books: [] });
    }
    db.Book.findAll({
      include: [{ association: "authors" }],
      where: {
        title: {
          [Op.like]: `%${keyword}%`
        }
      }
    })
      .then((books) => {
        res.render("search", { books, message: req.session.message });
      })
      .catch((error) => console.log(error));
  },
  deleteBook: (req, res) => {
    db.Book.findAll({
      include: [{ association: "authors" }],
      where: {
        id: {
          [Op.ne]: req.params.id
        }
      }
    })
    db.Book.findAll({
      include: [{ association: "authors" }],
    })
    .then( books => {
      res.render('home', { books, message: req.session.message })
    } )
      
      .catch((error) => console.log(error));
  },
  authors: (req, res) => {
    db.Author.findAll()
      .then((authors) => {
        res.render("authors", { authors, message: req.session.message });
      })
      .catch((error) => console.log(error));
  },
  authorBooks: (req, res) => {
    db.Author.findAll({
      include: [{ association: "books" }],
      where: {
  id: req.params.id,
      },
    })
 .then((authorBooks) => {
        res.render("authorBooks", { books: authorBooks[0].books, message: req.session.message });
      })
      .catch((error) => console.log(error));
  },
  register: (req, res) => {
    res.render("register", {message: req.session.message});
  },
  processRegister: async (req, res) => {
    let errors = validationResult(req);
    if (errors.isEmpty()) {
      await db.User.create({
        Name: req.body.name,
        Email: req.body.email,
        Country: req.body.country,
        Pass: bcryptjs.hashSync(req.body.password, 10),
        CategoryId: req.body.category,
      });
      res.redirect('/');
    } else {
      return res.render('register', {
        messageError: errors.mapped(),
        old: req.body,
        session: req.session,
      });
    }
  },
  login: (req, res) => {
    // Implement login process
    const cookieValue = req.cookies.usuario

    if(cookieValue){
      res.render("login", { email: cookieValue , message: req.session.message });
    }else{
      res.render("login", { email:"" , message: req.session.message });
    }
  },
  
    // Implement login process
    

    processLogin: async (req, res) => {
      const userToValidate = {
        email: req.body.email,
        password: req.body.password,
      };
    
      if (userToValidate.email.length !== 0) {
        res.cookie('usuario', userToValidate.email);
      }
    
      try {
        const userFound = await db.User.findOne({
          where: {
            email: userToValidate.email,
          },
        });
    
        if (userFound) {
          const comparePassword = bcryptjs.compareSync(userToValidate.password, userFound.Pass);
    
          if (comparePassword) {
            req.session.message = {
              success: `Welcome ${userFound.Name}`,
              rol: `${userFound.CategoryId}`,
            };
            res.json({ success: true, user: userFound.Name });
          } else {
            console.log('Datos Incorrectos');
            req.session.message = {
              error: 'Datos Incorrectos, verifique por favor',
            };
            res.json({ success: false, message: 'Datos Incorrectos, verifique por favor' });
          }
        } else {
          req.session.message = {
            error: 'Datos Incorrectos, verifique por favor',
          };
          res.json({ success: false, message: 'Datos Incorrectos, verifique por favor' });
        }
      } catch (error) {
        console.error('Error en el proceso de inicio de sesión:', error);
        res.json({ success: false, message: 'Ocurrió un error al procesar la solicitud. Por favor, inténtelo de nuevo.' });
      }
    },
    
      logout: async(req , res) =>{
        const books = await db.Book.findAll({ include: [{ association: "authors" }]})
        req.session.destroy()
        res.redirect('/')
        
  },
  edit: (req, res) => {
    // Implement edit book
    let idReference = req.params.id;
    db.Book.findByPk(idReference).then((book) => {
      res.render("editBook", { book , message: req.session.message });
    });
  
  },
  processEdit: (req, res) => {
    const { title, cover, description } = req.body;
  
    let editedBook = {
      title,
      cover,
      description
    };
  
    db.Book.update(editedBook, {
      where: {
        id: req.params.id
      }
    })
    .then(() => {
      return db.Book.findAll({
        include: [{ association: "authors" }],
      });
    })
    .then((books) => {
      res.redirect('/');
    })
    .catch((error) => {
      console.log(error);
    });
  }
};

module.exports = mainController;
