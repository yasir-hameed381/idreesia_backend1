FROM node:16-alpine

WORKDIR /src

COPY package*.json ./

RUN npm install

RUN npm install -g apidoc open-cli

COPY . .

EXPOSE 3000

CMD ["npm", "run", "prod"]