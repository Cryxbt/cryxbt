
    self.onmessage = function(e) {
        fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: e.data })
        })
        .then(response => response.json())
        .then(data => self.postMessage(data.response))
        .catch(error => self.postMessage('Error: ' + error));
    };
    
