const express = require('express');
const bodyParser = require('body-parser');
const X25519 = require('./X25519');

const app = express();
app.use(bodyParser.json());

// Endpoint to generate a public key
app.get('/generatePublicKey', (req, res) => {
    const { secret } = req.query;

    if (!secret || secret.length !== 32) {
        return res.status(400).json({ error: 'Secret must be 32 bytes long.' });
    }

    try {
        const secretBuffer = Buffer.from(secret, 'hex');
        const publicKey = X25519.getPublic(secretBuffer);
        res.json({ publicKey: Buffer.from(publicKey).toString('hex') });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to derive a shared key
app.post('/deriveSharedKey', (req, res) => {
    const { secretKey, publicKey } = req.body;

    if (!secretKey || !publicKey || secretKey.length !== 32 || publicKey.length !== 32) {
        return res.status(400).json({ error: 'Keys must be 32 bytes long.' });
    }

    try {
        const secretKeyBuffer = Buffer.from(secretKey, 'hex');
        const publicKeyBuffer = Buffer.from(publicKey, 'hex');
        const sharedKey = X25519.getSharedKey(secretKeyBuffer, publicKeyBuffer);
        res.json({ sharedKey: Buffer.from(sharedKey).toString('hex') });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
