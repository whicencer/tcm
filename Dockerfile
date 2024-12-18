FROM node:20.9.0

WORKDIR /app

COPY package*.json ./
COPY botconfig.env .env

RUN npm install --save

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]