const { Sequelize } = require('sequelize');

module.exports = function(sequelize, DataTypes){
    const member_statistic = sequelize.define('member_statistic', {
        number: {type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},
        date: {type: Sequelize.DATEONLY},
        total_user: {type:Sequelize.INTEGER(30)},
        total_renewal: {type:Sequelize.INTEGER(30)}
    });

    return member_statistic;
}