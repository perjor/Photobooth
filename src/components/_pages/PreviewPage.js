import React from 'react';
import Webcam from "react-webcam";
import CaptureButton from '../buttons/CaptureButton';
import Countdown from '../countdown/Countdown';
import axios from 'axios';

class PreviewPage extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            startCountdown: false,
        };
    }

    componentDidMount() {
      if(!this.props.location.state || !this.props.location.state.accessToken) {
        this.props.history.push('/login')
      }
      else if(!this.props.location.state.album) {
        this.props.history.push('/album')
      }
    }
    
     takePicture = async () => {
      const resp = await axios.get('http://192.168.0.105:8888/takePictureWithoutSaving')
      const picture = resp.data.image
      this.props.history.push('/review', { picture, accessToken: this.props.location.state.accessToken, album: this.props.location.state.album })
    }

    setRef = (webcam) => {
        this.webcam = webcam;
    };

    renderCountDown = () => {
        if (this.state.startCountdown)
        {
            return <Countdown onDone={ this.takePicture }/>
        }
        else 
        {
            return null;
        }
    }

    showPicture = () => {
        this.props.history.push({
            pathname: '/review',
            state: { picture: this.webcam.getScreenshot() }
        });
    }
    
    render = () => {
        return (
            <div className='PreviewPage'>
                <Webcam 
                    width='100%'
                    height='100%'
                    audio={ false }
                    ref={ this.setRef }
                />

                { this.renderCountDown() }

                <CaptureButton onClick={ (e) => this.setState({ startCountdown: true }) }/>
            </div>
        )
    }
}

export default PreviewPage;