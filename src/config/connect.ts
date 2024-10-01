import mysql from 'mysql'

const host = 'localhost',
      username= 'root',
      database = 'carrigresWebsite';

const config = {
    host: host,
    user: username,
    password: '',
    database: database,
}

const connection = mysql.createConnection(config);
  
  connection.connect((err) => {
    if (err) {
      console.error('Erreur de connexion : ' + err.stack);
      return;
    }
  });

export default connection