// Initialize a Token Definition with the attributes
class TokenDefinition {
  address;
  symbol;
  name;
  decimals;

  // Initialize a Token Definition with its attributes
  constructor(address, symbol, name, decimals) {
    this.address = address;
    this.symbol = symbol;
    this.name = name;
    this.decimals = decimals;
  }
}

module.exports = TokenDefinition;
