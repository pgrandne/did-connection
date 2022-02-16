import "./styles.css";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { getResolver as getKeyResolver } from "key-did-resolver";
import { getResolver as get3IDResolver } from "@ceramicnetwork/3id-did-resolver";
import { DID } from "dids";
import { EthereumAuthProvider, ThreeIdConnect } from "@3id/connect";

export default function App() {
  // Create a ThreeIdConnect connect instance as soon as possible in your app to start loading assets
  const threeID = new ThreeIdConnect();
  const CERAMIC_URL = 'https://ceramic-clay.3boxlabs.com';

  async function authenticateWithEthereum(ethereumProvider) {
    // Request accounts from the Ethereum provider
    const accounts = await ethereumProvider.request({
      method: "eth_requestAccounts"
    });
    // Create an EthereumAuthProvider using the Ethereum provider and requested account
    const authProvider = new EthereumAuthProvider(
      ethereumProvider,
      accounts[0]
    );
    // Connect the created EthereumAuthProvider to the 3ID Connect instance so it can be used to
    // generate the authentication secret
    await threeID.connect(authProvider);


    const ceramic = new CeramicClient(CERAMIC_URL);
    const did = new DID({
      // Get the DID provider from the 3ID Connect instance
      provider: threeID.getDidProvider(),
      resolver: {
        ...get3IDResolver(ceramic),
        ...getKeyResolver()
      }
    });

    // Authenticate the DID using the 3ID provider from 3ID Connect, this will trigger the
    // authentication flow using 3ID Connect and the Ethereum provider
    await did.authenticate();

    // The Ceramic client can create and update streams using the authenticated DID
    ceramic.did = did;
  }

  // When using extensions such as MetaMask, an Ethereum provider may be injected as `window.ethereum`
  async function tryAuthenticate() {
    if (window.ethereum == null) {
      throw new Error("No injected Ethereum provider");
    }
    await authenticateWithEthereum(window.ethereum);
    console.log('coucou');
  }

  return (
    <div className="App">
      <h1>Test de connection</h1>
      <button onClick={tryAuthenticate}>se connecter</button>
    </div>
  );
}
