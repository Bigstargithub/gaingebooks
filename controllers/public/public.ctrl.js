const models = require('../../models');
const { Op } = require('sequelize');

const fs = require('fs');
var path = require('path');
const csv = require('csv-parser');
const { resolve } = require('path');
const xl = require('excel4node');

exports.get_index = (req,res) => {
    if(req.session.admin === undefined)
    {
        req.session.admin = false;
    }
    if(req.session.admin == false)
    {
        console.log('hihi');
        res.render('index');
    }
    else
    {
        const year = new Date().getFullYear();
        const today_month = new Date().getMonth() + 1;
        const next_month = new Date().getMonth() + 2;
        const two_month = new Date().getMonth() + 3;
        const premium = '프리미엄';
        
        let year_next = new Date().getFullYear();

        if(next_month == 1 || two_month == 1)
        {
            year_next++;
        }


        const one_date = new Date(year, today_month-1, 1,0,0,0);
        const one_date_last = new Date(year, today_month,0,23,59,59);

        const two_date = new Date(year_next, next_month-1, 1,0,0,0);
        const two_date_last = new Date(year_next, next_month, 0,23,59,59);

        const three_date = new Date(year_next, two_month-1, 1,0,0,0);
        const three_date_last = new Date(year_next, two_month, 0,23,59,59);

        models.books_member.count({ where: {end_date: {[Op.gte]: one_date, [Op.lte]: one_date_last}}}).then(c => {
                models.member_statistic.findOrCreate({where: {date: one_date},defaults: {total_user: c}});
            });
                // models.member_statistic.update({
                //     total_user: c,
                //     where:{date: one_date}
                // })

        models.books_member.count({ where: {end_date: {[Op.gte]: two_date, [Op.lte]: two_date_last}}}).then(e => {
                models.member_statistic.findOrCreate({where: {date: two_date},defaults: {total_user: e}});
                models.member_statistic.update({total_user: e},{where:{date: two_date}});
        });

        models.books_member.count({ where: {end_date: {[Op.gte]: three_date, [Op.lte]: three_date_last}}}).then(f => {
            models.member_statistic.findOrCreate({where: {date: three_date},defaults: {total_user: f}});
                models.member_statistic.update({total_user: f},{where:{date: three_date}});
        });
        
        models.member_statistic.findOne({ where: {date: one_date}}).then(c => {
                models.member_statistic.findOne({ where: {date: two_date}}).then(e => {                    
                        models.member_statistic.findOne({ where: {date: three_date}}).then(g => {
                                models.books_member.count({where: {grade: '프리미엄'}}).then(p => {
                                    models.books_member.count({ where: {grade: '북클럽'}}).then(bookclub => {
                                        models.books_member.count({ where: {grade: '세미나'}}).then(se => {
                                            models.books_member.count({ where: {grade: '종료'}}).then(gc => {
                                                res.render('main', {
                                                    today_month : today_month, 
                                                    next_month: next_month, 
                                                    two_month: two_month, 
                                                    all_one_count : c.total_user, 
                                                    all_two_count : e.total_user,
                                                    all_three_count : g.total_user,
                                                    renew_one_count: c.total_renewal,
                                                    renew_two_count: e.total_renewal,
                                                    renew_three_count: g.total_renewal,
                                                    premium_count : p,
                                                    club_count : bookclub,
                                                    seminar_count : se,
                                                    gaingeclub_count : gc,
                                                });
                                            })
                                        });
                                    });
                                });
                            });
                        });
                    });  
                }
            } 
    

    

exports.post_login = (req, res) => {
    const {id, pw} = req.body;
    if(id == process.env.admin_id && pw == process.env.admin_pw)
    {
        req.session.admin = true;
        res.redirect('/');
    }
    else
    {
        res.send('<script type="text/javascript">alert("아이디 또는 비밀번호가 일치하지 않습니다.");window.location.href="/"</script>');
    }
}

exports.post_logout = (req,res) => {
    req.session.admin = false;
    res.send("<script type='text/javascript'>alert('로그아웃되었습니다.'); window.location.href='/'</script>");
}

exports.get_memberlist = (req, res) => {
    let page_number = 0;
    let page = 0;

    if(req.params.id != undefined)
    {
        page_number = req.params.id;
    }

    page_number = ((page_number - 1) * 30);
    console.log(page_number);
    
    const count_member = models.books_member.count({}).then(pa => {
        const member_all = models.books_member.findAll({offset:page_number,limit: 30,order: [
            ['end_date','ASC']
        ]}).then(member => {
            page = (pa / 30) + 1;
            res.render('member_list', {
                page: page,
                Member: member,
            });
        });
    });
    
    
}

exports.get_member_regist = ( _ ,res) => {
    res.render('member_regist');
}

exports.post_registmember = (req, res) => {
    let {name, company, grade, start_date, end_date, phone, city, addr_num, address, tax_option, is_pay, pay_cost, pay_method, pay_date, online_id,is_wellcome,memo} = req.body;
    if(pay_cost == '')
    {
        pay_cost = 0;
    }
    models.books_member.create({
        name: name,
        company: company,
        grade: grade,
        start_date: start_date,
        end_date: end_date,
        phone: phone,
        city: city,
        addr_num: addr_num,
        address: address,
        tax: tax_option,
        is_pay: is_pay,
        pay_cost: pay_cost,
        pay_method: pay_method,
        pay_date: pay_date,
        online_id : online_id,
        is_wellcome: is_wellcome,
        memo: memo,
    }).then(
        res.send("<script type='text/javascript'>alert('저장되었습니다.'); window.location.href='/member/list/1'</script>")
    );
    
}

exports.post_excel = (req,res) => {
    
    var result = [];
   fs.createReadStream('upload/'+req.file.filename)
   .pipe(csv())
   .on('data',(data) => result.push(data))
   .on('end', () => {
       for(var results in result)
       {
           var is_wellcome = 0;
           var is_pay = 0;

           if(result[results].is_wellcome == '발송')
           {
                is_wellcome = 1;
           }
           if(result[results].is_pay == '결제')
           {
               is_pay = 1;
           }
           console.log(result);
           models.books_member.create({
               name: result[results].name,
               company: result[results].company,
               grade: result[results].grade,
               start_date: result[results].start_date,
               end_date: result[results].end_date,
               phone: result[results].phone,
               city: result[results].city,
               address: result[results].address,
               addr_num: result[results].addr_num,
               is_pay: is_pay,
               tax: result[results].tax,
               pay_method: result[results].pay_method,
               pay_date: result[results].pay_date,
               pay_cost: result[results].pay_cost,
               online_id: result[results].online_id,
               is_wellcome: is_wellcome,
               memo: result[results].memo,
           });
       }
   })
    
   res.send("<script type='text/javascript'>alert('저장되었습니다.'); window.location.href='/member/list/1'</script>")
}

exports.get_deliverlist = (req,res) => {
    let page_number = 0;
    let page = 0;

    if(req.params.id != undefined)
    {
        page_number = req.params.id;
    }

    page_number = ((page_number - 1) * 30);

    const count_books = models.books_apply.count({}).then(pa => {
        const books_all = models.books_apply.findAll({ where: {number: {[Op.gte]: page_number}},limit: 30}).then(books => {
            page = (pa / 30) + 1;
            res.render('deliver_list', {
                id: req.params.id,
                page: page,
                book_list: books,
            });
        });
    });
}

exports.get_deliverregist = (_,res) => {
    const year = new Date().getFullYear();
    const today_month = new Date().getMonth() + 1;
    const next_month = new Date().getMonth() + 2;

    let year_next = new Date().getFullYear();

    if(next_month == 1)
    {
        year_next++;
    }

    const one_date = new Date(year, today_month-1, 1,0,0,0);
    const two_date_last = new Date(year_next, next_month, 0,23,59,59);

    const option_books = models.books_list.findAll({
        where: {
            date: {[Op.gte]: one_date,[Op.lte]: two_date_last}
        }
    }).then(books_list => {
        res.render("deliver_regist",
        {
            bookslist: books_list,
        });
    })

    
}

exports.post_deliverregist = (req,res) => {
    const {name, regist_date, books_name} = req.body;
    const regist_apply = models.books_apply.create({
        name: name,
        date: regist_date,
        book_name: books_name,
    });

    res.send("<script type='text/javascript'>alert('저장되었습니다.'); window.location.href='/deliver/list/1'</script>")
}

exports.get_bookslist = (req,res) => {
    let page_number = 0;
    let page = 0;

    if(req.params.id != undefined)
    {
        page_number = req.params.id;
    }

    page_number = ((page_number - 1) * 30);

    var ttest = 0;

    const books_count = models.books_apply.count({}).then(count => {

    page = (count / 30) + 1;

    const year = new Date().getFullYear();
    const today_month = new Date().getMonth() + 1;
    const next_month = new Date().getMonth() + 2;

    let year_next = new Date().getFullYear();

    if(next_month == 1)
    {
        year_next++;
    }

    const one_date = new Date(year, today_month-1, 1,0,0,0);
    const two_date_last = new Date(year_next, next_month, 0,23,59,59);

    const books_list = models.books_list.findAll({
        order:[
            ['date','DESC']
        ]
        }).then(bookslist => {
            res.render('books_list',{
                books_list: bookslist,
                page: page
            })
        })
        
    });
}

exports.get_booksregist = (_,res) => {
    res.render('books_regist');
}

exports.post_booksregist = (req,res) => {
    let {regist_date, name1, name2, name3} = req.body;

    const regist_books = models.books_list.create({
        date: regist_date,
        books_name1: name1,
        books_name2: name2,
        books_name3: name3
    });

    res.send("<script type='text/javascript'>alert('저장되었습니다.'); window.location.href='/books/list/1'</script>")
}


exports.get_memberdetail = (req, res) => {
    const id = req.params.id;
    const search_member = models.books_member.findOne({where: {number : id}}).then(member => {
        res.render('member_detail', {member: member});
    })   
}

exports.post_membermodify = (req, res) => {
    let {name, company, grade, start_date, end_date, phone, city, addr_num, address, tax_option, is_pay, pay_cost, pay_method, pay_date, online_id,is_wellcome,memo} = req.body;
    if(pay_cost == '')
    {
        pay_cost = 0;
    }
    models.books_member.update({
        name: name,
        company: company,
        grade: grade,
        start_date: start_date,
        end_date: end_date,
        phone: phone,
        city: city,
        addr_num: addr_num,
        address: address,
        tax: tax_option,
        is_pay: is_pay,
        pay_cost: pay_cost,
        pay_method: pay_method,
        pay_date: pay_date,
        online_id : online_id,
        is_wellcome: is_wellcome,
        memo: memo,
    },{where: {number: req.params.id}}).then(
        res.send("<script type='text/javascript'>alert('저장되었습니다.'); window.location.href='/member/list/1'</script>")
    );
}

exports.post_deliver_excel = (req, res) => {
    var result = [];
    fs.createReadStream('upload/'+req.file.filename)
    .pipe(csv())
    .on('data',(data) => result.push(data))
    .on('end', () => {
        for(var results in result)
        {
            var is_send = 0;
            if(result[results].is_send == '발송')
            {
                is_send = 1;
            }

            models.books_apply.create({
                name: result[results].name,
                date: result[results].date,
                book_name: result[results].book_name,
                is_send: is_send,
                quantity: result[results].quantity
            });
        }
    })
     
    res.send("<script type='text/javascript'>alert('저장되었습니다.'); window.location.href='/deliver/list/1'</script>")
}

exports.get_memberrenewal = (req, res) => {
    models.books_member.findOne({where: {number : req.params.id}}).then(member => {
        var date = member.end_date;
        res.render('member_renewal',{
            member: member
        });
    })
}

exports.post_memberrenewal = (req, res) => {
    models.books_member.findOne({where: {
        number: req.params.id,
    }}).then(member => {
        var date = new Date(member.end_date);
        var Year = date.getFullYear();
        var month = date.getMonth();

        const renewal = new Date(Year, month, 1,0,0,0);
        console.log(renewal);

        models.member_statistic.findOne({where:{date: renewal}}).then(sta => {
            var re = 0;
            re = sta.total_renewal + 1;
            models.member_statistic.update({
                total_renewal: re},
                {where: {date: renewal}
            });
        });
    });
    models.books_member.update({ end_date: req.body.renewal_date, is_renewal: 1},{where: {
        number : req.params.id
    }});
    console.log(req.params.id, req.body.renewal_date);
    res.send("<script type='text/javascript'>alert('저장되었습니다.'); window.location.href='/member/list/1'</script>")
}

exports.get_delivermodify = (req, res) => {
    models.books_apply.findOne({
        where: { number: req.params.id}
    }).then(deliver_member => {
        models.books_list.findAll({}).then(bookslist => {
            res.render('deliver_modify', {
                id: req.params.id,
                deliver_member: deliver_member,
                bookslist: bookslist
            })
        })
    })
}

exports.get_deliversearch = (req, res) => {
    const search_word = req.params.search_word;
    const id = req.params.id;

    let page_number = 0;
    let page = 0;

    if(req.params.id != undefined)
    {
        page_number = req.params.id;
    }

    page_number = ((page_number - 1) * 30);

    const count_books = models.books_apply.count({}).then(pa => {
        const books_all = models.books_apply.findAll({ where: {number: {[Op.gte]: page_number}, name : {[Op.like]: '%'+search_word+'%'}},limit: 30}).then(books => {
            page = (pa / 30) + 1;
            res.render('deliver_list', {
                page: page,
                book_list: books,
            });
        });
    });
}

exports.get_membersearch = (req, res) => {
    const search_word = req.params.search_word;

    let page_number = 0;
    let page = 0;

    if(req.params.id != undefined)
    {
        page_number = req.params.id;
    }

    var is_grade = 0;

    if(req.params.search_word == '프리미엄' || req.params.search_word == '북클럽' || req.params.search_word == '세미나' || req.params.search_word == '종료')
    {
        is_grade = 1;
    }

    page_number = ((page_number - 1) * 30);

    models.books_member.count({where:{grade: search_word}}).then(pa => {
        if(is_grade == 1)
        {
            models.books_member.findAll({ where: {grade : search_word},offset:page_number,limit: 30,order:[
                ['end_date', 'ASC']
            ]}).then(member => {
                page = (pa / 30) + 1;
                console.log(page);
                res.render('member_list', {
                    page: page,
                    Member: member,
                    search_word: search_word,
                });
            });
        }
        else
        {
            models.books_member.findAll({ where: {[Op.or]:[{name : {[Op.like]: '%'+search_word+'%'}},{phone: {[Op.like]: '%'+search_word+'%'}}]},offset:page_number,limit: 30, order:[
                ['end_date', 'ASC']
            ]}).then(Member => {
                page = (pa / 30) + 1;
                res.render('member_list', {
                    page: page,
                    Member: Member,
                    search_word: search_word,
                });
            });
        }
        
    });

}

exports.get_excel_list = async (req, res) => {
    const member_list = await models.books_member.findAll({});
    if(member_list)
    {
        var wb = new xl.Workbook();

        var numbers = 2;
        var ws = wb.addWorksheet('Sheet 1');
        ws.cell(1,1)
        .string('번호');
        ws.cell(1,2)
        .string('이름');
        ws.cell(1,3)
        .string('기업명');
        ws.cell(1,4)
        .string('등급');
        ws.cell(1,5)
        .string('시작일자');
        ws.cell(1,6)
        .string('종료일자');
        ws.cell(1,7)
        .string('연락처');
        ws.cell(1,8)
        .string('주소');
        ws.cell(1,9)
        .string('웰컴키트 발송여부');
        ws.cell(1,10)
        .string('영상관 아이디');

        for(member_lists of member_list)
        {
            
            var data = member_lists.dataValues;
            var is_wellcome = '';
            if(data.is_wellcome == 0)
            {
                is_wellcome = '미발송';
            }
            else if(data.is_wellcome == 1)
            {
                is_wellcome = '발송';
            }
            ws.cell(numbers,1)
            .number(data.number);
            ws.cell(numbers,2)
            .string(data.name);
            ws.cell(numbers,3)
            .string(data.company);
            ws.cell(numbers,4)
            .string(data.grade);
            ws.cell(numbers,5)
            .date(data.start_date);
            ws.cell(numbers,6)
            .date(data.end_date);
            ws.cell(numbers,7)
            .string(data.phone);
            ws.cell(numbers,8)
            .string(data.address);
            ws.cell(numbers,9)
            .string(is_wellcome)
            ws.cell(numbers, 10)
            .string(data.online_id);

            numbers++;
        }

        wb.write('upload/member_list.xlsx');

        res.setHeader('Content-disposition', 'attachment; filename=member_list.xlsx'); // 다운받아질 파일명 설정
      res.setHeader('Content-type', 'xlsx'); // 파일 형식 지정
        res.download(`upload/member_list.xlsx`);
        res.send("<script>location.reload();</script>");
    }
}

exports.post_update_deliver = async (req, res) => {
    const id = req.params.id;
    const { name, regist_date, books_name, is_send, quantity} = req.body;
    const applies = await models.books_apply.update({
        name,
        date: regist_date,
        book_name: books_name,
        is_send,
        quantity
    }, {
        where: {
            number: id,
        }
    });

    if(applies)
    {
        res.send("<script>alert('수정되었습니다.');location.href='/deliver/list/1';</script>");
    }
}