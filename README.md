# backend python https://github.com/b1team/trada
# backend nodejs https://github.com/b1team/nodejs_mongo_chat
# Description
- Using vue router, store, vuetify
- Connect API with axios
- Deploy with docker

## Setup
```
npm install && npm audit fix --force
```

### Compiles and hot-reloads for development
```
cp .env.template .env
change API_URL in .env file

npm run serve 
```

### docker
```
cp .env.template .env
docker-compose -f "docker-compose.yml" up -d --build
```

# Some images for web
## Register
![image](https://user-images.githubusercontent.com/43593736/154784136-92762eaa-61a0-41c9-9260-ef23024a2dc9.png)
## Login
![image](https://user-images.githubusercontent.com/43593736/154784185-3476328d-e15f-4e94-a83b-fc8503bac3f5.png)
## Chat
![image](https://user-images.githubusercontent.com/43593736/154784191-7e51ee85-0a39-49ea-887a-f55aa86f7e18.png)
## Options in room if member
![image](https://user-images.githubusercontent.com/43593736/154784236-170cdcac-4e8e-431d-95bb-398059df3454.png)
## Options in room if admin
![image](https://user-images.githubusercontent.com/43593736/154784248-f008bc6b-57f6-4225-a5d2-b4fb33d5435f.png)
## Edit profile
![image](https://user-images.githubusercontent.com/43593736/154784255-3cd4a42f-72b0-4022-831b-9f8ccd87a5a6.png)
