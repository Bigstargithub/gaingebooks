const { Router } = require('express');
const router = Router();
const ctrl = require('./public.ctrl');
const db = require('../../models');
const multer = require('multer');

var storage = multer.diskStorage({
    destination: function(req, file, cb)
    {
        cb(null, 'upload/');
    },
    filename: function(req, file, cb)
    {
        cb(null, file.originalname);
    }
})

var upload = multer({storage: storage});




function is_login(req,res,next){
    if(req.session.admin == undefined || req.session.admin == false)
    {
        res.send('<script type="text/javascript">alert("로그인 후에 다시 접속시도 바랍니다.");window.location.href="/"</script>');
    }
    else
    {
        next();
    }   
}

router.get('/', ctrl.get_index);

router.post('/login', ctrl.post_login);

router.post('/logout', ctrl.post_logout);

router.get('/member/list/:id', ctrl.get_memberlist);

router.get('/member/regist', is_login, ctrl.get_member_regist);

router.post('/member/regist', is_login, ctrl.post_registmember);

router.post('/member/modify/:id', is_login, ctrl.post_membermodify);

router.post('/member/excel', is_login, upload.single('excel_file'),ctrl.post_excel);

router.get('/member/detail/:id',is_login, ctrl.get_memberdetail);

router.get('/deliver/list/:id', is_login, ctrl.get_deliverlist);

router.get('/deliver/regist', is_login, ctrl.get_deliverregist);

router.post('/deliver/regist', is_login, ctrl.post_deliverregist);

router.get('/books/list/:id',is_login, ctrl.get_bookslist);

router.get('/books/regist', is_login, ctrl.get_booksregist);

router.post('/books/regist',is_login, ctrl.post_booksregist);

router.post('/deliver/excel', is_login, upload.single('excel_file'), ctrl.post_deliver_excel);

router.get('/member/renewal/:id',is_login, ctrl.get_memberrenewal);

router.post('/member/renewal/:id', is_login, ctrl.post_memberrenewal);

router.get('/deliver/modify/:id',is_login,ctrl.get_delivermodify);

router.get('/deliver/list/:id/:search_word',is_login,ctrl.get_deliversearch);

router.get('/member/list/:id/:search_word',is_login, ctrl.get_membersearch);

router.get('/member/excel',is_login, ctrl.get_excel_list);

module.exports = router;