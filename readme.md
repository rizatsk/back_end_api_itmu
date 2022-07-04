## Getting Started
1. Create database "itindosolution_api" in your database postgres
2. Change .envProd => .env
3. Fill in .env data as needed
4. For Access Token And Refresh Token , user node : "require('crypto').randomBytes(64).toString('hex')"
5. Install node package "npm install"
6. Migration in your database "npm migrate up"
7. Running program "npm run start-dev"
8. Collection Postman import in your postman for tester, file in folder "postman".
9. Create Environtmen Postman for use in collection. 

## Fitur
- Login
- Register
- User admins
- Log activity
- Package service

## Environment postman
- accessToken
- refreshToken