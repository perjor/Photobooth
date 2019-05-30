import React from 'react';
import { connect } from 'react-redux';
import Webcam from 'react-webcam';
import axios from 'axios';
import { SyncLoader } from 'react-spinners';
import { css } from 'emotion';
import Countdown from '../countdown/Countdown';
import RegularButton from '../buttons/RegularButton';
import { checkRefresh } from '../services/refreshLogin';
import Heading from '../titles/Heading';

class PreviewPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startCountdown: false,
      loading: false,
      timer: 1,
      totalPictures: 4,
    };
  }

  componentDidMount = () => {
    const { album, history } = this.props;

    if (!album) {
      history.push('/album');
    }

    checkRefresh();
  }

  takePicture = async () => {
    const { history } = this.props;

    this.setState({ loading: true });

    const resp = await axios.get(`${process.env.REACT_APP_SERVER_URL}/takePicture`);
    const picture = resp.data.image;

    // const picture   = 'https://bit.ly/2VzPl0Q';

    if (picture !== null) {
      this.setState({ loading: false });
    }

    history.push('/review', { picture });
  }

  takeGif = async () => {
    const { history, frame } = this.props;
    const { totalPictures } = this.state;
    const [width, height] = [1200, 800];

    this.setState({ loading: true });

    try {
      await axios.post(`${process.env.REACT_APP_SERVER_URL}/createGif`, {
        frame: `${frame.baseUrl}=w${width}-h${height}`,
      });
    } catch (error) {
      console.log(error);
    }

    await this.setState({ loading: false });

    history.push('/review');

    await axios.get(`${process.env.REACT_APP_SERVER_URL}/takePicture`);

    this.setState({ totalPictures: totalPictures - 1 });

    console.log('TCL: PreviewPage -> takeGif -> totalPictures', totalPictures);

    if (totalPictures === 0) {
      await axios.post(`${process.env.REACT_APP_SERVER_URL}/createGif`, {
        frame,
      });
      this.setState({ loading: false });

      history.push('/review');
    } else {
      this.setState({ startCountdown: false });
      this.setState({ startCountdown: true });
    }

    this.setState({ loading: false });
  }

  setRef = (webcam) => {
    this.webcam = webcam;
  };

  renderCountDown = (option, timer) => {
    const { startCountdown } = this.state;

    if (startCountdown) return <Countdown onDone={option === 'gif' ? this.takeGif : this.takePicture} timer={timer} />;

    return true;
  }

  render = () => {
    const { loading, timer } = this.state;
    const { format, frame } = this.props;
    const overlay = `${frame.baseUrl}=w1920-h1080`;

    return (
      <div className="PreviewPage">
        <div
          className={css`
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        width: 100%;
        height: 100%;
        `}
        >
          <div
            className={css`
        position: absolute;
        top: 20vh;
        `}>
            <Heading
              type="heading--3"
            >
              Ready. Set.
            </Heading>
            <RegularButton
              text="Go!"
              size="large"
              onClick={() => this.setState({ startCountdown: true })}
            />
          </div>
          <Webcam
            height="100%"
            audio={false}
            ref={this.setRef}
            className={css`position: 'absolute'`}
          />
          <img src={overlay} alt="" style={{ position: 'absolute', height: '100%' }} />
        </div>

        {this.renderCountDown(format, timer || 3)}

        <SyncLoader
          color="#fff"
          size={50}
          loading={loading}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  album: state.album,
  format: state.format,
  frame: state.frame,
});

export default connect(mapStateToProps)(PreviewPage);
