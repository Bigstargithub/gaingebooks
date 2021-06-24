const { Sequelize } = require('sequelize');

module.exports = function(sequelize, DataTypes){
    const books_member = sequelize.define('books_member', {
        number: {type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},
        name : {type: Sequelize.STRING(20)},
        company : {type: Sequelize.STRING(100)},
        grade: {type: Sequelize.STRING(20)},
        start_date : {type: Sequelize.DATEONLY},
        end_date: {type: Sequelize.DATEONLY},
        phone: {type: Sequelize.STRING(20)},
        city: {type: Sequelize.STRING(20)},
        address: {type: Sequelize.STRING(100)},
        addr_num: {type: Sequelize.STRING(10)},
        tax: {type: Sequelize.STRING(20)},
        pay_method: {type: Sequelize.STRING(20)},
        pay_date: {type: Sequelize.DATEONLY},
        is_pay: {type: Sequelize.INTEGER(1)},
        pay_cost: {type: Sequelize.INTEGER(11)},
        online_id: {type: Sequelize.STRING(20)},
        is_renewal: {type: Sequelize.INTEGER(1)},
        is_wellcome: {type: Sequelize.INTEGER(1)},
        memo: {type: Sequelize.STRING(500)}
    });

    return books_member;
}