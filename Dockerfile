#source: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM arm32v7/node
WORKDIR /opt/flick-cost/
COPY . .
RUN npm install
CMD [ "node", "flick.js" ]

