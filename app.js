const express = require('express');
const cookieParser = require('cookie-parser');
const nunjucks = require('nunjucks');
const session = require('express-session');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const { Sequelize } = require('./models');
const db = require('./models');

dotenv.config();

class App{
    constructor(){
        this.app = express();

        //뷰 엔진 셋팅
        this.setViewEngine();

        //미들웨어 셋팅
        this.setMiddleWare();
        
        //로컬 변수
        this.setStatic();

        //라우팅
        this.getRouting();

        //db connection
        this.dbConnection();

        //404 페이지를 찾을 수 없음
        this.status404();

        //에러처리
        this.errorHandler();
    }

    setMiddleWare() {
        this.app.use(morgan('dev'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false}));
        this.app.use(cookieParser(process.env.COOKIE_SECRET));
        this.app.use(session({
            resave: false,
            saveUninitialized: false,
            secret: process.env.COOKIE_SECRET,
            cookie: {
                httpOnly: true,
                secure: false,
            },
        }));
    }

    setViewEngine() {
        this.app.set('view engine', 'html');

        nunjucks.configure('Template', {
            autoescape: true,
            express: this.app,
            watch: true,
        });
    }

    setStatic() {
        this.app.use(express.static(path.join(__dirname,'public')));
        this.app.use(express.static('public/img'));
    }

    getRouting() {
        this.app.use(require('./controllers'));
    }

    dbConnection() {
        db.sequelize.authenticate()
        .then(() => {
            console.log('연결 성공');
            return db.sequelize.sync();
        })
        .catch((err) => {
            console.log('연결 실패');
            console.log(err);
        });
    }

    status404() {
        this.app.use((req,res,next)=> {
            const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
            error.status=404;
            next(error);
        });
    }

    errorHandler() {
        this.app.use((err,req,res,next) => {
            res.locals.message = err.message;
            res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
            res.status(err.status || 500);
            console.log(res.locals.message);
            res.render('error');
        });
    }
}

module.exports = new App().app;