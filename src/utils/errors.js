class GenericError extends Error {
    constructor({ code, name, message }) {
        super(message);
        this.code = code;
        this.name = name;
        this.message = message;
    }
}

class InvalidExchangeError extends GenericError {
    constructor() {
        super({ code: 400, name: "Invalid exchange source", message: "Exchange provided is not valid. Valids Exchanges: B3, crypto" })
    }
}

class SearchFailed extends GenericError {
    constructor() {
        super({ code: 400, name: "Failed to search asset", message: "Failed to search asset" })
    }
}

class InvalidCurrencyError extends GenericError {
    constructor() {
        super({ code: 400, name: 'Invalid currency', message: "Currency is not valid or is not avaible for this search" })
    }
}

module.exports = {
    GenericError,
    InvalidExchangeError,
    SearchFailed,
    InvalidCurrencyError
}