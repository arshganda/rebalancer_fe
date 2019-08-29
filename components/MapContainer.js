import React, { Component } from "react";
import { Map, InfoWindow, Marker, GoogleApiWrapper } from "google-maps-react";

export class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.state = {
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {}
    };
  }
  onMarkerClick(props, marker, e) {
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });
  }
  render() {
    if (!this.props.google) {
      return <div>Loading...</div>;
    }

    return (
      <div>
        <Map
          style={{
            minWidth: "600px",
            minHeight: "600px"
          }}
          google={this.props.google}
          initialCenter={{
            lat: this.props.lat,
            lng: this.props.lng
          }}
          zoom={16}
        >
          <Marker
            title={this.props.name}
            onClick={this.onMarkerClick}
            position={{lat: this.props.lat, lng: this.props.lng}}
            name={this.props.name}
          />
          <InfoWindow
            marker={this.state.activeMarker}
            visible={this.state.showingInfoWindow}
          >
            <div>
              <h1>{this.state.selectedPlace.name}</h1>
            </div>
          </InfoWindow>
        </Map>
      </div>
    );
  }
}
export default GoogleApiWrapper({
  apiKey: "AIzaSyA5qMGMwxyIYDLs3NjjRUP34bKm32lbtpA",
})(MapContainer);
