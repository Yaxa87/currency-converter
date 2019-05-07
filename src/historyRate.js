import React from 'react';
import axios from 'axios';
import moment from 'moment';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class HistoryRate extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			historyDiff: null,
			fromCurrency: "GBP",
			toCurrency: "USD",
			selectCurrencies: ["GBP", "USD", "EUR", "SGD"],
			startDate: moment().toDate(),
			endDate: moment().toDate(),
			histRate1: null,
			histRate2: null
		};
        this.handleStartDateChange = this.handleStartDateChange.bind(this);
        this.handleEndDateChange = this.handleEndDateChange.bind(this);
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
                if (key === "startDate" || key === "endDate") {
                    this.setState({ [key]: moment(JSON.parse(localStorage.getItem(key))).toDate() });
                } else {
                    this.setState({ [key]: JSON.parse(localStorage.getItem(key)) });
                }
			};
		});
	}

    // updates dates in state after changing them in DatePicker
    handleStartDateChange(date) {
		this.setState({
			startDate: date
		});
    }
    handleEndDateChange(date) {
        this.setState({
			endDate: date
		});
    }

    // calls api to get exchange rate data from two date points and saves the information to state
	historyExchangeHandler = () => {
        if (this.state.fromCurrency !== this.state.toCurrency) {
            const promise1 = axios.get(`https://api.exchangeratesapi.io/${moment(this.state.startDate).format("YYYY-MM-DD")}?base=${this.state.fromCurrency}&symbols=${this.state.toCurrency}`);
            const promise2 = axios.get(`https://api.exchangeratesapi.io/${moment(this.state.endDate).format("YYYY-MM-DD")}?base=${this.state.fromCurrency}&symbols=${this.state.toCurrency}`);
            
            Promise.all([promise1, promise2])
                .then((response) => {          
                    this.setState({ histRate1: response[0].data.rates[this.state.toCurrency].toFixed(5), 
                                    histRate2: response[1].data.rates[this.state.toCurrency].toFixed(5),
                                    historyDiff: (response[1].data.rates[this.state.toCurrency] - response[0].data.rates[this.state.toCurrency]).toFixed(5), });
                })
                .catch((error) => {
                    console.log("Ooops, something went wrong", error.message);
                });
        } else {
            console.log("Can't compare the same currency");
        }
    }

    // event handler for currency dropdown change
    selectHandler = (event) => {
        if (event.target.name === "from") {
            this.setState({ fromCurrency: event.target.value })
        }
        if (event.target.name === "to") {
            this.setState({ toCurrency: event.target.value })
        }
	}
    
    render() {
		return (
			<div className="History-Rate">
                <h2 className="mb-4">Currency Historical Exchange Rate</h2>
                <div className="form-group form-inline">
                    <span>Base currency: </span>
                    <select
                        name="from"
                        className="form-control mx-sm-3"
                        onChange={(event) => this.selectHandler(event)}
                        value={this.state.fromCurrency}
                    >
                        {this.state.selectCurrencies.map((currency) => (
                            <option key={currency}>{currency}</option>
                        ))}
                    </select>
					<span>Currency to compare: </span>
                    <select
                        name="to"
                        className="form-control mx-sm-3"
                        onChange={(event) => this.selectHandler(event)}
                        value={this.state.toCurrency}
                    >
                        {this.state.selectCurrencies.map((currency) => (
                            <option key={currency}>{currency}</option>
                        ))}
                    </select>
                </div>

                <div className="row form-group">
                    <div className="col-sm-4 pt-1">
                        <DatePicker selected={this.state.startDate} onChange={this.handleStartDateChange} />
                    </div>
                    <div className="col-sm-4 pt-1">
                        <DatePicker selected={this.state.endDate} onChange={this.handleEndDateChange} />
                    </div>
                    <button className="btn btn-primary" onClick={this.historyExchangeHandler}>Compare</button>
                </div>

				<div className="row">
                    <div className="col-sm-4">Rate: <span className="bold">{this.state.histRate1}</span></div> 
                    <div className="col-sm-4">Rate: <span className="bold">{this.state.histRate2}</span></div>
                    <div>Diff: <span className={`bold ${this.state.historyDiff < 0 ? 'text-danger' : 'text-success'}`}>{this.state.historyDiff}</span></div>
                </div>	
            </div>
		);
	}
}

export default HistoryRate;