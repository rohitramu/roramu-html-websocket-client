var webSocket = null;
var sendFeedName = 'sendFeed';
var receiveFeedName = 'receiveFeed';
var errorFeedName = 'errorFeed';

function connectDisconnect() {
    try {
        if (!webSocket ||
            (webSocket.readyState !== WebSocket.OPEN && webSocket.readyState !== WebSocket.CONNECTING)) {
            // If we don't have a connection, try to connect
            var urlBox = document.getElementById('url');
            webSocket = new WebSocket(urlBox.value);
            webSocket.onopen = event => updateReadyToSend();
            webSocket.onclose = event => onDisconnect(event.reason);
            webSocket.onerror = event => onError(event.target);
            webSocket.onmessage = event => onMessage(event.data);
        } else {
            // We have a connection, so disconnect
            if (webSocket) { webSocket.close(); }
            webSocket = null;
        }
    } catch (ex) {
        onError(ex);
    } finally {
        // Update the UI to reflect whether we successfully connected
        updateReadyToSend();
    }
}

function sendMessage() {
    var message = document.getElementById('textToSend').value;
    webSocket.send(message);

    addMessageToFeed(sendFeedName, message);
}

function onMessage(message) {
    addMessageToFeed(receiveFeedName, message);
}

function onError(error) {
    addMessageToFeed(errorFeedName, error);
}

function onDisconnect() {
    updateReadyToSend();
}

function addMessageToFeed(feedName, message) {
    // Prettify the message if it is valid JSON
    var toShow = null;
    try {
        toShow = JSON.stringify(JSON.parse(message), null, 4);
    } catch (ex) {
        toShow = message;
    }

    // Create the new row
    var newRow = document.getElementById('rowTemplate').cloneNode(true);

    var timestampCell = newRow.querySelector('#timestamp');
    timestampCell.querySelector('#value').innerText = new Date().toLocaleString().split(", ", 2).join("\n");

    var messageCell = newRow.querySelector('#message');
    messageCell.querySelector('#value').innerText = toShow;

    // Add the message to the receive feed
    feed = document.getElementById(feedName);
    var row = feed.insertRow(0);
    row.appendChild(timestampCell);
    row.appendChild(messageCell);
}

function updateReadyToSend() {
    // Get page elements
    var urlBox = document.getElementById('url');
    var textToSendBox = document.getElementById('textToSend');
    var sendButton = document.getElementById('sendButton');
    var connectionStatusLabel = document.getElementById('status');
    var connectDisconnectButton = document.getElementById('connectDisconnectButton');

    // If we're ready to send, disable the URL text box, enable the send box and enable the send button (otherwise, do the opposite)
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        urlBox.disabled = true;
        textToSendBox.disabled = false;
        sendButton.disabled = false;

        connectDisconnectButton.innerText = 'Disconnect';

        connectionStatusLabel.style.color = 'green';
        connectionStatusLabel.innerText = 'Connected';

        // Clear send/receive feeds
        clearFeed(sendFeedName);
        clearFeed(receiveFeedName);
    } else if (webSocket && webSocket.readyState == WebSocket.CONNECTING) {
        urlBox.disabled = true;
        textToSendBox.disabled = true;
        sendButton.disabled = true;

        connectDisconnectButton.innerText = 'Cancel';

        connectionStatusLabel.style.color = 'yellow';
        connectionStatusLabel.innerText = 'Connecting...';
    } else {
        urlBox.disabled = false;
        textToSendBox.disabled = true;
        sendButton.disabled = true;

        connectDisconnectButton.innerText = 'Connect';

        connectionStatusLabel.style.color = 'red';
        connectionStatusLabel.innerText = 'Disconnected';

        webSocket = null;
    }
}

function clearFeed(feedName) {
    document.getElementById(feedName).innerHTML = "";
}