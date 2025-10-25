export function txLink(chainId: number, hash: `0x${string}`) {
  switch (chainId) {
    case 84532:
      return `https://sepolia.basescan.org/tx/${hash}`
    case 80001:
      return `https://mumbai.polygonscan.com/tx/${hash}`
    case 80002:
      return `https://amoy.polygonscan.com/tx/${hash}`
    default:
      return `https://etherscan.io/tx/${hash}`
  }
}

export function addressLink(chainId: number, address: `0x${string}`) {
  switch (chainId) {
    case 84532:
      return `https://sepolia.basescan.org/address/${address}`
    case 80001:
      return `https://mumbai.polygonscan.com/address/${address}`
    case 80002:
      return `https://amoy.polygonscan.com/address/${address}`
    default:
      return `https://etherscan.io/address/${address}`
  }
}

