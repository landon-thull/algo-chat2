Algo Chat

# OVERVIEW

ALGO CHAT is an Algorand-powered protocol to implement decentralized chat broadcasting with an optional profile pic

## SDK NOTE:
Pipeline is an Algorand connector sdk developed by HEADLINE INC. The Pipeline code examples provided both assemble and send transactions, as well as prompt signing of transactions via MyAlgo wallet, WalletConnect, or AlgoSigner.

## Flow

To create a profile, an individual deploys the app. After deployment the user can then change the profile picture txid or change the global message via simple app calls. All other individuals can see the picture and latest message. However in order to be added to a live chat log, users must send an app call that creates an inner transaction to the app itself with a note that contains the id of the joiners own app. For verification, the teal must check that the joiners teal is == to the current teal. The front-end code then querries the indexer for inner transactions that send 0 algos to itself, then passes the app id from the note fields of these transactions to the message fetcher.