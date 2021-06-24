const { Sequelize } = require('sequelize');

module.exports = function(sequelize, DataTypes){
    const books_list = sequelize.define('books_list', {
        number: {type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},
        date: {type: Sequelize.DATEONLY},
        books_name1: {type: Sequelize.STRING(100)},
        books_name2: {type: Sequelize.STRING(100)},
        books_name3: {type: Sequelize.STRING(100)},
    });

    return books_list;
}