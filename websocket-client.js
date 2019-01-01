var webSocket = null;

function connectDisconnect() {
    // Get URL text box
    var urlBox = document.getElementById('url');

    try {
        if (!webSocket) {
            // If we don't have a connection, try to connect
            webSocket = new WebSocket(urlBox.value);
            webSocket.onclose = event => onDisconnect(event.reason);
            webSocket.onerror = event => onError(event.target);
            webSocket.onmessage = event => onMessage(event.data);
        } else {
            // We have a connection, so disconnect
            webSocket.close();
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

    addMessageToFeed('sendFeed', message);
}

function onMessage(message) {
    addMessageToFeed('receiveFeed', message);
}

function onError(error) {
    addMessageToFeed('errorFeed', error);
}

function onDisconnect() {
    updateReadyToSend();
}

function addMessageToFeed(feedName, message) {
    // Create the new row
    var newRow = document.getElementById('rowTemplate').cloneNode(true);
    newRow.removeAttribute('id');
    newRow.querySelector('#message').innerText = message;

    // Add the message to the receive feed
    feed = document.getElementById(feedName);
    var row = feed.insertRow(0);
    row.appendChild(newRow);

    // // Add the message to the receive feed
    // table = document.getElementById(feedName);
    // var row = table.insertRow(0);
    // var newCell = document.createTextNode(message);
    // row.appendChild(newCell);
}

function updateReadyToSend() {
    // Get page elements
    var urlBox = document.getElementById('url');
    var textToSendBox = document.getElementById('textToSend');
    var sendButton = document.getElementById('sendButton');
    var connectionStatusLabel = document.getElementById('status');
    var connectDisconnectButton = document.getElementById('connectDisconnectButton');

    // If we're ready to send, disable the URL text box, enable the send box and enable the send button (otherwise, do the opposite)
    if (webSocket) {
        urlBox.disabled = true;
        textToSendBox.disabled = false;
        sendButton.disabled = false;

        connectDisconnectButton.innerText = 'Disconnect';

        connectionStatusLabel.style.color = 'green';
        connectionStatusLabel.innerText = 'Connected';
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