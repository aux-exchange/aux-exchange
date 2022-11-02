# Contributing

Come and build the decentralized universal exchange with us! :rocket:

Fork this repo, make the changes, and send a PR to the main branch. Run into issues? Ping us on [discord](https://discord.gg/mxRa3fH72z) or [Telegram](https://t.me/AuxDAO) or raise an issue here on github.

## Prerequisite

- rust
  ```sh
  # Install rust (see https://www.rust-lang.org)
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  ```
- go (for utilities to deploy the contract and auto generate code etc)
  ```sh
  # Install go (see https://go.dev and https://github.com/stefanmaric/g)
  curl -sSL https://git.io/g-install | sh -s
  source ~/.bashrc
  g install latest
  ```
- node.js (for frontend)
  ```sh
  # Install and enable nvm (see https://github.com/nvm-sh/nvm#install--update-script)
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
  source ~/.bashrc
  nvm install 18
  nvm use 18
  corepack enable
  yarn set version berry
  echo 'nvm use 18; corepack enable' >> ~/.bashrc
  ```

Aptos cli is also needed, after rust is installed

```sh
RUSTFLAGS="--cfg tokio_unstable" cargo install --git https://github.com/aptos-labs/aptos-core.git --rev aptos-cli-v1.0.0 aptos
```

(rust is tricky and the dependencies often vary from platform/os to platform/os. Feel free to reach out to us on [discord](https://discord.gg/mxRa3fH72z) or raise an issue)

## Structure of the Code

- [aptos/contrat/aux](./aptos/contract/aux) contains the main contract code.
- [aptos/contract/deployer](./aptos/contract/deployer) contains the code/rust binary to deploy the code
- [aptos/api/aux-ts](./aptos/api/aux-ts) contains all the typescript/javascript/nodejs client.
- [aptos/testing](./aptos/testing) contains podman based containerized testing.
- [go-util](./go-util) contains deploy/code-gen utilities.
- [docs](./docs/) contains documentation on math behind some of the contracts.

## Other

Check out [Deployment](./Deployment.md) and [Quickstart](./Quickstart.md).
