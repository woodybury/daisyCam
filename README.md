# Daisy Cam

![ daisy the dog ](https://raw.githubusercontent.com/WoodburyShortridge/daisyCam/master/client/src/imgs/mouse.png)

A Node.js server for Raspberry Pi camera stream with React.js font-end built for Daisy the dog

## Need

Node.js &
npm &
yarn

## Use

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

To serve client production

```
yarn global add serve
cd client
serve -s build
```