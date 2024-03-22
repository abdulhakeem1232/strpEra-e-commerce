FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install bcrypt@5.1.1
RUN npm install --os=linuxmusl --cpu=x64 sharp
RUN npm install

COPY . .

ENV PORT=4545

EXPOSE 4545

CMD ["npm", "start"]
