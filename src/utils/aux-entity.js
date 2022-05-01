class InexistentAsset {
    constructor(code) {
        this.code = code;
        this.message = 'Asset provided is inexistent'
    }
}

module.exports = { InexistentAsset }