const { Sequelize } = require('sequelize');

module.exports = function(sequelize, DataTypes){
    const books_apply = sequelize.define('books_apply', {
        number: {type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},
        name: {type: Sequelize.STRING(20)},
        date: {type: Sequelize.DATEONLY},
        book_name: {type:Sequelize.STRING(30)},
        is_send: {type: Sequelize.INTEGER(1)},
        quantity: {type: Sequelize.INTEGER(11)},
    });

    return books_apply;
}