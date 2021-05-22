import React, { useState } from 'react';
import './App.css';

import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import parse from 'html-react-parser';

const Axios = require('axios');
const axios = Axios.create({
  baseURL: 'https://mailclient-server-backend.herokuapp.com',
  // baseURL: 'http://localhost:8080',
  timeout: 10000
});

function App() {
  const [messages, setMessages] = useState([]); // All emails
  const [form, setForm] = useState({ // Pairs to send to backend
    serverType: 'imap',
    server: 'imap.fastmail.com',
    port: 993,
    username: '',
    password: '',
    secure: true
  });
  const [body, setBody] = useState('<p>Select an email</p>'); // Body of the email
  const [selectedEmail, setSelectedEmail] = useState(-1); // Selected email from the list
  const [token, setToken] = useState(''); // Access token generated when a user is connected
  const [connecting, setConnecting] = useState(false); // State of connection

  // Connect to the mail server through backend
  async function connect() {
    setConnecting(true);
    const response = await axios.post('/connect', {...form});
    const { data } = response;

    setToken(data.accessToken); // Set the access token for future requests
    setMessages(data.headers); // Set all emails
    setConnecting(false);
  }

  async function showEmail(index) {
    setSelectedEmail(index);

    const response = await axios.get('/email', {
      params: {
        ...form,
        emailIndex: index
      },
      headers: {
        'authorization': `Bearer ${token}`
      }
    });
    setBody(response.data.textAsHtml);
  }

  function handleFormChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  return (
    <div className="App">
      <Grid container className='root'>
          <Grid container justify='center' spacing={2}>
            <Grid item lg={6} xs={12} sm={12} md={12}>
              <Grid container justify='space-between'>
                <Grid item lg={6} xs={12} sm={12} md={12}>
                  <div className='input-list'>
                    <div>
                      <span>Server type</span>
                      <select id="serverType" name='serverType' onChange={handleFormChange} value={form.serverType}>
                        <option value="imap">IMAP</option>
                        <option value="pop3">POP3</option>
                      </select>
                    </div>
                    <div>
                      <span>Server</span>
                      <input name='server' type="text" value={form.server} onChange={handleFormChange}/>
                    </div>
                    <div>
                      <span>Port</span>
                      <input name='port' type="text" value={form.port} onChange={handleFormChange}/>
                    </div>
                  </div>
                </Grid>

                <Grid item lg={6} xs={12} sm={12} md={12}>
                  <div className='input-list'>
                    <div>
                      <span>Encryption</span>
                      <select id="encryption" name='secure' onChange={handleFormChange} defaultValue={true}>
                        <option value={false}>Unencrypted</option>
                        <option value={true}>SSL/TLS</option>
                        <option value={true}>STARTTLS</option>
                      </select>
                    </div>
                    <div>
                      <span>Username</span>
                      <input name='username' type="text" value={form.username} onChange={handleFormChange}/>
                    </div>
                    <div>
                      <span>Password</span>
                      <input name='password' type="password" value={form.password} onChange={handleFormChange}/>
                    </div>

                    <div className='startBtn'>
                      <Button onClick={connect} disabled={connecting}>Start</Button>
                    </div>
                  </div>
                </Grid>

                <Grid item xs={12} sm={12} md={12}>
                  <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><b>Date</b></TableCell>
                      <TableCell><b>From</b></TableCell>
                      <TableCell><b>Subject</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {messages.map((message, index) => (
                      <TableRow className={[(selectedEmail === index && 'selectedEmail')].join(' ')} key={index} onClick={() => showEmail(index)}>
                          <TableCell>
                              {message.date}
                          </TableCell>
                          <TableCell>
                              {message.from}
                          </TableCell>
                          <TableCell>
                              {message.subject}
                          </TableCell>
                      </TableRow>

                    ))}
                  </TableBody>
                  </Table>
                </Grid>
              </Grid>
            </Grid>

            <Grid item className='email-body' lg={6} xs={12} sm={12} md={12}>
              <div>
                {parse(body)}
              </div>
            </Grid>
          </Grid>
      </Grid>
    </div>
  );
}

export default App;
