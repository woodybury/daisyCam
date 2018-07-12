import React, {Component} from 'react';
import logo from './imgs/daisy.svg';
import './App.css';
import env from './env.json';
import io from 'socket.io-client';
import JSMpeg from 'jsmpeg-player';
import ImageZoom from 'react-medium-image-zoom'
import {Linear, Sine, TweenLite, TweenMax} from "gsap";

const socket = io(env.socketioAddress);

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            value: '',
            chat: '',
            wrong: false,
            watch: 0,
            stream: false,
            chatMsg: [],
            id: ''
        };

        this.startStream = this.startStream.bind(this);

        this.handlePassChange = this.handlePassChange.bind(this);
        this.handlePassSubmit = this.handlePassSubmit.bind(this);

        this.handleChatChange = this.handleChatChange.bind(this);
        this.handleChatSubmit = this.handleChatSubmit.bind(this);

    }

    componentDidMount() {

        socket.on('liveStream', ( data ) => {
            this.setState({
                stream: true,
                id: data.id
            });
            this.startStream( data.camSocket );
        });

        socket.on('watch', (watch) => {
            this.setState({
                watch: watch
            });
        });

        socket.on('chatMsg', (data) => {
            let msgArray = this.state.chatMsg.slice();
            msgArray.push({
                chatMsg: data.chatText,
                id: data.id,
            });

            this.setState({
                chatMsg: msgArray
            });

            let msgBox = this.chatFrame;
            msgBox.scrollTop = msgBox.scrollHeight;

        });

        socket.on('wrong-password', () => {
            this.setState({
                wrong: true,
                value: ''
            })
        });

        this.animate(this.container);
    }

  importAll (r) {
    return r.keys().map(r);
  };


  animate (contain) {

        TweenLite.set(".App", {perspective: 600});
        TweenLite.set("img", {xPercent: "-50%", yPercent: "-50%"});

        const animm = (elm) => {
            TweenMax.to(elm, R(6, 15), {y: h + 100, ease: Linear.easeNone, repeat: -1, delay: -15});
            TweenMax.to(elm, R(4, 8), {x: '+=100', rotationZ: R(0, 180), repeat: -1, yoyo: true, ease: Sine.easeInOut});
            TweenMax.to(elm, R(2, 8), {
                rotationX: R(0, 360),
                rotationY: R(0, 360),
                repeat: -1,
                yoyo: true,
                ease: Sine.easeInOut,
                delay: -5
            });
        };

        const R = (min, max) => {
            return min + Math.random() * (max - min)
        };

        let total = 10;
        let container = contain, w = contain.scrollWidth, h = contain.scrollHeight;

        for (let i = 0; i < total; i++) {
            let Div = document.createElement('div');
            TweenLite.set(Div, {attr: {class: 'daisy'}, x: R(0, w), y: R(-200, -150), z: R(-200, 200)});
            container.appendChild(Div);
            animm(Div);
        }
    }

    startStream( camSocket ) {
        console.log (window.location.hostname);

        new JSMpeg.VideoElement( this.myCanvas, 'ws://' + window.location.hostname + camSocket, {
            loop: false,
            audio: false,
            pauseWhenHidden: false,
            aspectPercent: '65%'
        });
    }

    handlePassChange(event) {
        this.setState({
            value: event.target.value,
            wrong: false
        });
    }

    handlePassSubmit(event) {
        let password = this.state.value;
        socket.emit( 'start-stream', password );
        event.preventDefault();
    }

    handleChatChange(event) {
        this.setState({
            chat: event.target.value
        });
    }

    handleChatSubmit(event) {
        let chatText = this.state.chat;

        socket.emit( 'chatText', chatText );
        this.setState ({
            chat: '',
        });
        event.preventDefault();
    }

    takePhoto (event) {
        socket.emit( 'take-photo');
    }

    handlePassword () {
        if ( this.state.stream ) {

            let images = this.importAll(require.context('../../tensorflow/daisy_detection/capture/daisy', false, /\.(png|jpe?g|svg)$/));
            let overlayZoomStyle = { overlay: { backgroundImage: 'linear-gradient(-134deg, #FF87F1 0%, #FF5959 100%)', opacity: 0.9 } };
            return (
                <div>
                    <div id='stream' ref={ canvas => { this.myCanvas = canvas; }} />
                    <div id={'chatFrame'} ref={ chatFrame => { this.chatFrame = chatFrame; }}>
                        <ul>
                          { this.state.chatMsg.map(( msg ) => ( <li className={ (this.state.id === msg.id ? 'me' : '' )} key={ Math.random() } >{ msg.chatMsg }</li> ))}
                        </ul>
                    </div>
                    <form id={'chat'} onSubmit={this.handleChatSubmit}>
                            <input id={'chatBox'} aria-label={'chat'} type={'text'} value={this.state.chat} onChange={this.handleChatChange}/>
                            <input className={'btn'} type="submit" value="Chat!"/>
                    </form>
                    <h1>Tensorflow Detection</h1>
                    <ul className={"aiimgs"}>
                      { images.map((item) => (
                        <li key={item}>
                          <ImageZoom
                              image={{
                              src: item,
                              alt: 'daisy',
                            }}
                              defaultStyles={ overlayZoomStyle }
                            key={item}
                          />
                        </li>
                      ))}
                    </ul>
                </div>
            )
        }
    }

    handleForm () {
        if ( !this.state.stream ) {
            return (
                <form id={'pass'} onSubmit={this.handlePassSubmit}>
                    <label>
                        Password:
                        <input type={'password'} value={this.state.value} className={ (this.state.wrong ? 'wrong': '') } onChange={this.handlePassChange}/>
                    </label>
                    <input className={'btn'} type="submit" value="Watch Now!"/>
                </form>
            )
        }
    }

    render() {
        return (
            <div>
                <div className="App" ref={ container => { this.container = container; }}>
                    <header className="App-header">
                        <img src={logo} className="App-logo" alt="logo"/>
                        <h1 className={'App-title'}>Daisy Cam</h1>
                    </header>
                    { this.handlePassword() }
                    { this.handleForm() }
                </div>
                <div className={'counter'}>{ this.state.stream ? this.state.watch : this.state.watch -1 }</div>
            </div>
        );
    }
}

export default App;