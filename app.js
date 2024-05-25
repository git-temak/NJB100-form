const http = require('http');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');

const server = http.createServer((req, res) => {
    const reqUrl = req.url;
    const method = req.method;

    if (reqUrl === '/' && method === 'GET') {
        fs.readFile('index.html', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.write('Internal Server Error');
                res.end();
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(data);
                res.end();
            }
        });
    } else if (reqUrl === '/submit' && method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const formData = querystring.parse(body);

            // Validation
            let errors = [];
            const { firstName, lastName, otherNames, email, phone, gender } = formData;

            if (!firstName || !lastName) {
                errors.push("First name and last name are required.");
            }
            if (firstName.length < 1 || lastName.length < 1) {
                errors.push("The name cannot be less than 1 character.");
            }
            if (otherNames && !/^[a-zA-Z\s]*$/.test(otherNames)) {
                errors.push("Other names cannot contain numbers.");
            }
            if (!email.includes('@') || !email.includes('.')) {
                errors.push("Email must be valid with @ and .");
            }
            if (!phone || phone.length !== 10 || !/^\d+$/.test(phone)) {
                errors.push("Phone number must be 10 digits and contain only numbers.");
            }
            if (!gender) {
                errors.push("Gender is required.");
            }

            if (errors.length > 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ errors: errors }));
                res.end();
            } else {
                fs.readFile('database.json', (err, data) => {
                    let jsonData = [];
                    if (!err) {
                        jsonData = JSON.parse(data);
                    }
                    jsonData.push(formData);
                    fs.writeFile('database.json', JSON.stringify(jsonData), (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'text/html' });
                            res.write('Unable to write data to file');
                            res.end();
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.write('Form submitted successfully!');
                            res.end();
                        }
                    });
                });
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.write('Page not found');
        res.end();
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});