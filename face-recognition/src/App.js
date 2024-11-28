import ParticlesBg from 'particles-bg';
import React, { Component } from 'react';
import './App.css';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Logo from './components/Logo/Logo';
import Navigation from './components/Navigation/Navigation';
import Rank from './components/Rank/Rank';
import Register from './components/Register/Register';
import Signin from './components/Signin/Signin';

///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////Application///////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: '',
      },
    };
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
      },
    });
  };

  calculateFaceLocation = (data) => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };

  displayFaceBox = (box) => {
    this.setState({ box: box });
  };

  onInputChange = (e) => {
    this.setState({ input: e.target.value });
  };

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });

    fetch('http://localhost:4000/clarifai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: this.state.input }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response) {
          fetch('http://localhost:4000/image', {
            method: 'put',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id,
            }),
          })
            .then((response) => response.json())
            .then((count) => {
              this.setState(Object.assign(this.state.user, { entries: count }));
            })
            .catch((err) => console.log('Error updating entries:', err));

          this.displayFaceBox(this.calculateFaceLocation(response));
        }
      })
      .catch((err) => console.log('Error with Clarifai API:', err));
  };

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({ isSignedIn: false });
    } else if (route === 'home') {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <>
        <div className='App'>
          <Navigation
            isSignedIn={isSignedIn}
            onRouteChange={this.onRouteChange}
          />
          {route === 'home' ? (
            <div>
              <Logo />
              <Rank
                name={this.state.user.name}
                entries={this.state.user.entries}
              />
              <ImageLinkForm
                onButtonSubmit={this.onButtonSubmit}
                onInputChange={this.onInputChange}
              />
              <FaceRecognition box={box} imageUrl={imageUrl} />
            </div>
          ) : route === 'signin' ? (
            <Signin
              loadUser={this.loadUser}
              onRouteChange={this.onRouteChange}
            />
          ) : (
            <Register
              loadUser={this.loadUser}
              onRouteChange={this.onRouteChange}
            />
          )}
        </div>
        <ParticlesBg type='tadpole' bg={true} />
      </>
    );
  }
}

export default App;
