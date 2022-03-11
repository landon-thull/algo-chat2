import React from 'react'

const faq = () => {

    function toggle() {
        if (!shown) {
            document.getElementById("modal-root-5").style.display = "block"
            shown = true
        }
        else {
            document.getElementById("modal-root-5").style.display = "none"
            shown = false
        }
    }

    let shown = false

    return (

        <div className="no-size mr-2">
            <button
                id="info"
                className="shoulder__item"
                data-bs-toggle="root-modal-5"
                data-target="#exampleModal"
                onClick={() => { toggle() }}
            >
                <svg
                    viewBox="0 0 16 16"
                    fill="current-color"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M15.9999 7.99984C15.9999 12.4182 12.4182 15.9999 7.99984 15.9999C3.58151 15.9999 -0.000244141 12.4182 -0.000244141 7.99984C-0.000244141 3.58151 3.58151 -0.000244141 7.99984 -0.000244141C12.4182 -0.000244141 15.9999 3.58151 15.9999 7.99984ZM10.2626 4.12777C10.6803 4.54337 10.9743 5.06685 11.1119 5.63981C11.2977 6.40624 11.1933 7.21434 10.8187 7.90834C10.444 8.60233 9.82578 9.13307 9.08305 9.39825C8.91905 9.45665 8.80305 9.60225 8.80305 9.77585V10.4015C8.80305 10.6141 8.71859 10.8179 8.56826 10.9683C8.41793 11.1186 8.21404 11.2031 8.00144 11.2031C7.78884 11.2031 7.58494 11.1186 7.43461 10.9683C7.28428 10.8179 7.19983 10.6141 7.19983 10.4015V8.79024C7.20256 8.57987 7.28806 8.37905 7.43779 8.23126C7.58749 8.0835 7.78937 8.00065 7.9997 8.00063H7.99424C8.87825 8.00063 9.59665 7.28223 9.59665 6.40062C9.58709 5.98173 9.41391 5.58323 9.1142 5.29043C8.81449 4.99762 8.41205 4.83379 7.99305 4.834C7.57406 4.83421 7.17179 4.99844 6.87237 5.29154C6.57295 5.58464 6.40017 5.98332 6.39102 6.40222C6.38942 6.84302 6.03102 7.20062 5.58941 7.20062C5.39196 7.19941 5.20206 7.12464 5.05679 6.9909C4.91152 6.85717 4.82132 6.67409 4.8038 6.47742L4.7998 6.35982C4.81341 4.35659 6.65662 2.81098 8.74624 3.28618C9.3199 3.42081 9.84487 3.71218 10.2626 4.12777ZM8.79984 12.7999C8.79984 13.2417 8.44167 13.5999 7.99984 13.5999C7.558 13.5999 7.19983 13.2417 7.19983 12.7999C7.19983 12.358 7.558 11.9999 7.99984 11.9999C8.44167 11.9999 8.79984 12.358 8.79984 12.7999Z"
                        fill="current-color"
                    />
                </svg>
            </button>
            <div
                id="modal-root-5"
                style={{ display: "none" }}
                className="modal-root-5 show"
            >
                <ul>
                    <div className="modal-content modal-content-size">
                        <div className="modal-topbar mb-0">
                            <h2 className="modal-title mb-0">How it works</h2>
                            <button id="info-close" className="modal-close" onClick={() => { toggle() }}>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M7.75732 7.75732L16.2426 16.2426" />
                                    <path d="M7.75739 16.2426L16.2427 7.75732" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>
                            <h3 className="modal-title sh mt-0 mb-1">
                            OVERVIEW</h3>
                                <b>ALGO CHAT</b> is an Algorand-powered protocol to implement decentralized chat broadcasting with an optional profile pic

                                SDK NOTE:
                                Pipeline is an Algorand connector sdk developed by HEADLINE INC. The Pipeline code examples provided both assemble and send transactions, as well as prompt signing of transactions via MyAlgo wallet, WalletConnect, or AlgoSigner.

                                Flow
                         
                            </p>
                            <p>
                            To create a profile, an individual deploys the app. After deployment the user can then change the profile picture txid or change the global message via simple app calls. All other individuals can see the picture and latest message. However in order to see other's messages in a live chat log, users must add the app id's of other users. The front-end code then querries global state of other users to fetch their profiles and messages.
                            </p>
                          
                        </div>
                    </div>

                </ul>
            </div>
        </div>
    )

}

export default faq