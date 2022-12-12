import { faker } from '@faker-js/faker';
import fs from 'fs';

const LIMIT = 100_000;
const BASE_USERS_QUERY = 'INSERT INTO users (username, email, password, created_at) VALUES ';
const BASE_ROLES_QUERY = 'INSERT INTO roles (role_name) VALUES ';
const BASE_USER_ROLES_QUERY = 'INSERT INTO user_roles (user_id, role_id) VALUES ';

const BASE_PATH = process.env.BASE_PATH || './src/database/seed';
const FILE_NAME = process.env.FILE_NAME || 'seed.sql';


const createRolesSql = () => {
  const roles = ['ROLE_USER', 'ROLE_PREMIUM', 'ROLE_ADMIN'];

  for (let i = 0; i < roles.length; i++) {
    let sql;
    if (i === roles.length - 1) sql = `('${roles[i]}');\n`;
    else sql = `('${roles[i]}'),`;

    fs.appendFileSync(`${BASE_PATH}/${FILE_NAME}`, sql);
  }
}

const createUsersSql = (id) => {
  const user = {
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    createdAt: faker.date.past(10),
  };
  const date = new Date(user.createdAt).toISOString().slice(0, 19).replace('T', ' ');

  let sql;
  if (id === LIMIT) sql = `('${user.username}${id}', '${id}${user.email}', '${user.password}', '${date}');\n`;
  else sql = `('${user.username}${id}', '${id}${user.email}', '${user.password}', '${date}'),`;

  fs.appendFileSync(`${BASE_PATH}/${FILE_NAME}`, sql);

}


const createRoles = () => {
  fs.writeFileSync(`${BASE_PATH}/${FILE_NAME}`, BASE_ROLES_QUERY);
  createRolesSql();
}

const createUsers = () => {
  fs.appendFileSync(`${BASE_PATH}/${FILE_NAME}`, BASE_USERS_QUERY);
  for (let id = 1; id <= LIMIT; id++) {
    createUsersSql(id);
  }
}

const createUserRoles = () => {
  fs.appendFileSync(`${BASE_PATH}/${FILE_NAME}`, BASE_USER_ROLES_QUERY);
  for (let id = 1; id <= LIMIT; id++) {
    const roleNumber = faker.datatype.number({ min: 1, max: 3 });
    const isLast = id === LIMIT;

    for (let i = 1; i <= roleNumber; i++) {
      const sql = `(${id}, ${i}),`;
      if (isLast && i === roleNumber) return fs.appendFileSync(`${BASE_PATH}/${FILE_NAME}`, sql.slice(0, -1) + ';\n');
      fs.appendFileSync(`${BASE_PATH}/${FILE_NAME}`, sql);
    }
  }
}

const main = () => {
  const fileExists = fs.existsSync(`${BASE_PATH}/${FILE_NAME}`);
  if (fileExists) fs.unlinkSync(`${BASE_PATH}/${FILE_NAME}`);

  createRoles();
  createUsers();
  createUserRoles()
}

main();