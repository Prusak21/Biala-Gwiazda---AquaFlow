const pool = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'zapasowy_sekret_dla_testow_lokalnych';

const postLogowanie = async (req, res) => {
    const { email, haslo } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.redirect('/logowanie?error=1'); 
        
        const user = result.rows[0];

        if (user.status === 'pending') return res.send('Konto oczekuje na akceptację przez Administratora.');
        if (user.status === 'suspended') return res.send('Konto zostało zawieszone.');
        if (user.status !== 'active') return res.redirect('/logowanie?error=1');

        const isMatch = await bcrypt.compare(haslo, user.password_hash);
        if (!isMatch) return res.redirect('/logowanie?error=1'); 

        const permResult = await pool.query(`
            SELECT DISTINCT p.name 
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            JOIN user_roles ur ON rp.role_id = ur.role_id
            WHERE ur.user_id = $1
        `, [user.id]);
        
        const userPermissions = permResult.rows.map(row => row.name);

        const token = jwt.sign(
            { id: user.id, email: user.email, permissions: userPermissions }, 
            JWT_SECRET, 
            { expiresIn: '2h' }
        );

        res.cookie('token', token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });

        if (userPermissions.includes('manage:users')) return res.redirect('/admin');
        if (userPermissions.includes('manage:readings')) return res.redirect('/technik');
        return res.redirect('/ebok');

    } catch (err) {
        console.error('Błąd logowania:', err);
        res.status(500).send('Błąd wewnętrzny serwera');
    }
};

module.exports = postLogowanie;