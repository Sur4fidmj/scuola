const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api';

// Utilities
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const log = (msg) => console.log(`[TEST] ${msg}`);

async function runTest() {
    try {
        log('Starting API Verification...');

        // 1. Register Student (Lucia)
        log('1. Registering Student Lucia...');
        const studentEmail = `lucia_${Date.now()}@test.com`;
        await axios.post(`${API_URL}/auth/register`, {
            nome: 'Lucia', cognome: 'Bianchi',
            email: studentEmail, password: 'password123', ruolo: 'studente'
        });
        log('   - Lucia Registered');

        // 2. Login as Admin
        log('2. Logging in as Admin...');
        const adminRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@school.test', password: 'password123'
        });
        const adminToken = adminRes.data.token;
        log('   - Admin Logged In');

        // 3. Find Lucia and Promote
        log('3. Promoting Lucia to Professor...');
        const usersRes = await axios.get(`${API_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const luciaUser = usersRes.data.find(u => u.email === studentEmail);
        if (!luciaUser) throw new Error('Lucia not found');

        await axios.put(`${API_URL}/admin/users/${luciaUser.id}/role`,
            { ruolo: 'professore' },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        log('   - Lucia Promoted');

        // 4. Login as Lucia (now Professor)
        log('4. Logging in as Professor Lucia...');
        const luciaRes = await axios.post(`${API_URL}/auth/login`, {
            email: studentEmail, password: 'password123'
        });
        const luciaToken = luciaRes.data.token;
        if (luciaRes.data.user.ruolo !== 'professore') throw new Error('Role update failed');
        log('   - Lucia Logged In as Professor');

        // 5. Upload File
        log('5. Uploading File...');
        // Create dummy file if not exists
        if (!fs.existsSync('dummy.pdf')) fs.writeFileSync('dummy.pdf', 'Dummy Content');

        // Get Categories first
        const catRes = await axios.get(`${API_URL}/appunti/categories`, {
            headers: { Authorization: `Bearer ${luciaToken}` }
        });
        const catId = catRes.data[0].id;

        const form = new FormData();
        form.append('titolo', 'Dispensa Test API');
        form.append('descrizione', 'Test automatico');
        form.append('categoria_id', catId);
        form.append('file', fs.createReadStream('dummy.pdf'));

        await axios.post(`${API_URL}/appunti`, form, {
            headers: {
                Authorization: `Bearer ${luciaToken}`,
                ...form.getHeaders()
            }
        });
        log('   - File Uploaded');

        // 6. Register another student (Marco) and check content
        log('6. Student Marco checking content...');
        const marcoEmail = `marco_${Date.now()}@test.com`;
        await axios.post(`${API_URL}/auth/register`, {
            nome: 'Marco', cognome: 'Verdi',
            email: marcoEmail, password: 'password123', ruolo: 'studente'
        });
        const marcoRes = await axios.post(`${API_URL}/auth/login`, {
            email: marcoEmail, password: 'password123'
        });
        const marcoToken = marcoRes.data.token;

        const appuntiRes = await axios.get(`${API_URL}/appunti`, {
            headers: { Authorization: `Bearer ${marcoToken}` }
        });

        const found = appuntiRes.data.find(a => a.titolo === 'Dispensa Test API');
        if (!found) throw new Error('Uploaded note not visible to student');

        log('   - Note found by Marco');
        log('✅ VERIFICATION SUCCESSFUL');

    } catch (error) {
        console.error('❌ TEST FAILED:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
            console.error('Status:', error.response.status);
        }
    }
}

runTest();
