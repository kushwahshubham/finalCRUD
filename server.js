const express = require('express');
const bodyParser = require('body-parser');

const db = require('./db')


const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))
app.set('view engine', 'ejs')

// show all users 
app.get('/', (req, res) => {

    db.query('select * from users', (err, result) => {
        if (err) throw err;
        res.render('index', { users: result })
    })

})

app.post('/add', (req, res) => {
    const { name, email } = req.body;
    db.query('insert into users (name,email) values(?,?)', [name, email], () => {
        res.redirect('/')
    })
})


app.post('/deleteselected', (req, res) => {
    const ids = req.body.ids
    console.log(ids, 'ids are here')
    if (!ids) return res.redirect('/');
    const idArray = Array.isArray(ids) ? ids : [ids];
    const placeholders = idArray.map(() => '?').join(', ');
    db.query('delete from users where id in ?', [idArray], (err, result) => {
        db.query(`DELETE FROM users WHERE id IN (${placeholders})`, idArray, (err, result) => {
            if (err) {
                console.error('Error updating user:', err);
                return res.send('Error updating user');
            }
            res.redirect('/')
        })
    })
})


// app.post('/deleteselected', (req, res) => {
//     const ids = req.body.ids;
//     console.log(ids, 'ids are here');

//     if (!ids) return res.redirect('/');
//if (!ids) return res.redirect('/')

//     // Ensure ids is an array
//     const idArray = Array.isArray(ids) ? ids : [ids];

//     // Properly format the idArray for the SQL query
//     const placeholders = idArray.map(() => '?').join(', '); // Create ? placeholders for each id

//     // Now the query will be safe with the correct placeholders
//     db.query(`DELETE FROM users WHERE id IN (${placeholders})`, idArray, (err, result) => {
//         if (err) {
//             console.error('Error deleting users:', err);
//             return res.send('Error deleting users');
//         }
//         res.redirect('/');
//     });
// });



app.get('/edit/:id', (req, res) => {
    const userid = req.params.id
    console.log('edit with this id', userid)
    db.query('select * from users where id=?', [userid], (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            return res.send('User not found');
        }
        res.render('edit', { user: result[0] })
    })
})


app.post('/edit/:id', (req, res) => {
    const { name, email } = req.body;
    const userid = req.params.id
    console.log('update user post', userid, name, email)
    db.query('update users set name= ?,email=? where id =?', [name, email, userid], (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.send('Error updating user');
        }
        res.redirect('/')
    })
})



app.listen(3000, () => {
    console.log('server is  running on the http://localhost:3000')
})