#backend https://github.com/b1team/trada
# vuewebchat

## Project setup
```
npm install && npm audit fix --force
```

### Compiles and hot-reloads for development
```
cp .env.template .env
change API_URL in .env file

npm run serve 
```

### run with docker
```
cp .env.template .env
docker-compose -f "docker-compose.yml" up -d --build```

