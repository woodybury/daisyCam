# Daisy Cam
<img src="https://github.com/WoodburyShortridge/daisyCam/blob/master/client/src/imgs/daisyface.png?raw=true" width="200"/>

A Node.js server for Raspberry Pi camera stream with React.js font-end built for Daisy the dog.

Including a tensorflow classifier for daisy detection from raspi camera. See `/tensorflow`

Tensorflow made Daisy gallery and @todo email notifications for daisy detection

## Need

Node.js &
npm &
yarn &
python &
tensorflow &
opencv

## Use

```
cp example.env.json env.json && cp example.mailList.json mailList.json && cp client/src/example.env.json client/src/env.json
```

```
npm i nodemon -g
```

Install server and client dependencies

```
yarn
cd client
yarn
```

To start the dev server and client at the same time

```
yarn dev
```

To start server for production
```
yarn server
```

To build client production

```
cd client
yarn build
```
