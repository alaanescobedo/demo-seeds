import 'dotenv/config'
import { faker } from '@faker-js/faker';
import fs from 'fs';

const LIMIT = 10;
const BASE_USERS_QUERY = 'INSERT INTO users (username, email, password, created_at, avatar_id) VALUES ';
const BASE_ROLES_QUERY = 'INSERT INTO roles (role_name) VALUES ';
const BASE_USER_ROLES_QUERY = 'INSERT INTO user_roles (user_id, role_id) VALUES ';
const BASE_FILES_PUBLIC_QUERY = 'INSERT INTO files_public (url, key, public_name) VALUES ';

const BASE_PATH = process.env.BASE_PATH
const FILE_NAME = process.env.FILE_NAME

if (!BASE_PATH || !FILE_NAME) {
  throw new Error('Missing env variables! (BASE_PATH, FILE_NAME)');
}

const ROLES = ['ROLE_USER', 'ROLE_USER_PREMIUM', 'ROLE_ADMIN'];

const generateRolesSql = (i) => {
  const query = `('${ROLES[i]}')`
  return i === ROLES.length - 1 ? `${query};\n` : `${query},`;
}

const generateUsersSql = (id) => {
  const user = {
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    createdAt: faker.date.past(10),
  };
  const date = new Date(user.createdAt).toISOString().slice(0, 19).replace('T', ' ');

  const query = `('${user.username}${id}', '${id}${user.email}', '${user.password}', '${date}', ${id})`
  return id === LIMIT ? `${query};\n` : `${query},`;
}

const generateFilesPublicSql = (id) => {
  const file = {
    filename: faker.image.avatar(),
    key: faker.datatype.uuid(),
    publicName: faker.random.word(),
  };
  const query = `('${file.filename}', '${file.key}', '${file.publicName}')`
  return id === LIMIT ? `${query};\n` : `${query},`;
}

const generateUserRolesSql = (id) => {
  const roleNumber = faker.datatype.number({ min: 1, max: 3 });
  const userRoles = [];

  for (let i = 1; i <= roleNumber; i++) {
    let query = `(${id}, ${i})`;
    userRoles.push(id === LIMIT && i === roleNumber ? `${query};\n` : `${query},`);
  }
  return userRoles.join('');
}

const createQueries = () => {
  
  const rolesQuery = [];
  const usersSqlQuery = [];
  const filesPublicSqlQuery = [];
  const userRolesQuery = [];

  for (let i = 0; i < ROLES.length; i++) {
    rolesQuery.push(generateRolesSql(i));
  }
  for (let id = 1; id <= LIMIT; id++) {
    usersSqlQuery.push(generateUsersSql(id));
    filesPublicSqlQuery.push(generateFilesPublicSql(id));
    userRolesQuery.push(generateUserRolesSql(id));
  }
  fs.writeFileSync(`${BASE_PATH}/${FILE_NAME}`, `${BASE_ROLES_QUERY}${rolesQuery.join('')}`);
  fs.appendFileSync(`${BASE_PATH}/${FILE_NAME}`, `${BASE_FILES_PUBLIC_QUERY}${filesPublicSqlQuery.join('')}`);
  fs.appendFileSync(`${BASE_PATH}/${FILE_NAME}`, `${BASE_USERS_QUERY}${usersSqlQuery.join('')}`);
  fs.appendFileSync(`${BASE_PATH}/${FILE_NAME}`, `${BASE_USER_ROLES_QUERY}${userRolesQuery.join('')}`);
}

const main = () => {
  const fileExists = fs.existsSync(`${BASE_PATH}/${FILE_NAME}`);
  if (fileExists) fs.unlinkSync(`${BASE_PATH}/${FILE_NAME}`);

  createQueries()
}

main();