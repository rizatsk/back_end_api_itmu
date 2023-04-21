## Getting Started

1. Create database "db_itindo" in your database postgres
   - psql -U postgres
   - create database db_itindo;
   - create user myuser with encrypted password 'yourpass';
   - grant all privileges on database db_itindo to myuser;
2. Change .envProd => .env
3. Fill in .env data as needed
4. For Access Token And Refresh Token , use node : "require('crypto').randomBytes(64).toString('hex')"
5. Install node package "npm install"
6. Migration in your database "npm migrate up"
7. Running program "npm run start:dev"
