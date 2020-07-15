import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import jwt_decode from 'jwt-decode'
import { setCurrentUser } from './actions/authActions'
import setAuthToken from './utils/setAuthToken'

import { Provider } from 'react-redux';
import store from './store';

import Navbar from './components/layouts/Navbar';
import Footer from './components/layouts/Footer';
import Landing from './components/layouts/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import './App.css';

// Check fro token
if (localStorage.jwtToken) {
	// Set auth token
	setAuthToken(localStorage.jwtToken)
	// Decode token to get user data
	const decoded = jwt_decode(localStorage.jwtToken)
	// set user and isAuthenticated
	store.dispatch(setCurrentUser(decoded))
}

class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<Router>
					<div className="App">
						<Navbar />
						<Route exact path="/" component={Landing} />
						<div className="container">
							<Route exact path="/register" component={Register} />
							<Route exact path="/login" component={Login} />
						</div>
						<Footer />
					</div>
				</Router>
			</Provider>

		);
	}
}

export default App;
