import React from 'react';
import axios from 'axios';

import HistoryRate from "./historyRate";

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			result: [],
			baseCurrency: "GBP",
			currencies: ["USD", "EUR", "SGD"],
			amount: 1
		};
	}

	// below 4 function deal with saving and retriving state to/from local storage to persist state
	componentDidMount() {
		this.getStateFromLocalStorage();
		window.addEventListener("beforeunload", this.saveStateToLocalStorage.bind(this));
	}
	componentWillUnmount() {
		window.removeEventListener("beforeunload", this.saveStateToLocalStorage.bind(this));
		this.saveStateToLocalStorage();
	}
	saveStateToLocalStorage() {
		Object.keys(this.state).forEach((key) => {
			localStorage.setItem(key, JSON.stringify(this.state[key]));
		});
	}
	getStateFromLocalStorage() {
		Object.keys(this.state).forEach((key) => {
			if (localStorage.getItem(key)) {
				this.setState({ [key]: JSON.parse(localStorage.getItem(key)) });
			};
		});
	}

	// calls api to get exchange rates and updates state
    convertHandler = () => {
		axios
			.get(`https://api.exchangeratesapi.io/latest?base=${this.state.baseCurrency}&symbols=${this.state.currencies.join()}`)
			.then((response) => {
				let results = [];
				Object.keys(response.data.rates).forEach((key) => {
					// gets data for all the currencies except base one since we dont need it
					if (key !== this.state.baseCurrency) {
						results.push({currencySymbol: key, exchangeRate: (this.state.amount * response.data.rates[key]).toFixed(5)});
					}
				});
				this.setState({ result: results });
			})
			.catch((error) => {
				console.log("Ooops, something went wrong", error.message);
			});
	};
	
	render() {
		return (
			<div className="App">
				<h2 className="mb-4">Currency Converter</h2>
				<div className="form-group form-inline">
					<span>GBP amount:</span>
					<input
						name="amount"
						type="text"
						className="form-control mx-sm-3"
						value={this.state.amount}
						onChange={event => this.setState({ amount: event.target.value })} 
					/>
					<button className="btn btn-primary" onClick={this.convertHandler}>Convert</button>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th>Currency</th>
							<th>Exchange rate</th>
						</tr>
					</thead>
					<tbody>
						{this.state.result.map((currency) => (
							<tr key={currency.currencySymbol}>
								<td>{currency.currencySymbol}</td>
								<td className="bold">{currency.exchangeRate}</td>
							</tr>
						))}
					</tbody>
				</table>

				<HistoryRate />
            </div>
		);
	}
}

export default App;