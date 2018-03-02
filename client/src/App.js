import React, {Component} from 'react';
import logo from './imgs/daisy.svg';
import './App.css';
import io from 'socket.io-client';
import JSMpeg from 'jsmpeg-player';


// const socket = io('10.0.0.244:5000');
const socket = io('localhost:5000');

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            value: '',
            wrong: false,
            watch: 0,
            stream: false
        };

        this.startStream = this.startStream.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

    }

    componentDidMount() {

        socket.on('liveStream', ( streamUrl ) => {
            this.setState({
                stream: true
            });
            this.startStream( streamUrl );
        });

        socket.on('watch', (watch) => {
            this.setState({
                watch: watch
            });
        });

        socket.on('wrong-password', () => {
            this.setState({
                wrong: true,
                value: ''
            })
        });
    }

    startStream( streamUrl ) {
        console.log (this.myCanvas);
        new JSMpeg.VideoElement( this.myCanvas, streamUrl, {
            loop: false,
            audio: false,
            pauseWhenHidden: false,
            aspectPercent: '65%'
        });
    }

    handleChange(event) {
        this.setState({
            value: event.target.value,
            wrong: false
        });
    }

    handleSubmit(event) {
        let password = this.state.value;
        socket.emit( 'start-stream', password );
        event.preventDefault();
    }

    handlePassword () {
        if ( this.state.stream ) {
            return (
                <div id='stream' ref={ canvas => { this.myCanvas = canvas; }} />
            )
        }
    }

    handleForm () {
        if ( !this.state.stream ) {
            return (
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Password:
                        <input type={'password'} value={this.state.value} className={ (this.state.wrong ? 'wrong': '') } onChange={this.handleChange}/>
                    </label>
                    <input className={'btn'} type="submit" value="Watch Now!"/>
                </form>
            )
        }
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h1 className={'App-title'}>Daisy Cam</h1>
                </header>
                { this.handlePassword() }
                { this.handleForm() }
                <div className={'counter'}>{ this.state.stream ? this.state.watch : this.state.watch -1 }</div>
            </div>
        );
    }
}

export default App;
