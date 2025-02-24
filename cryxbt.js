// Cryxbt Chatbot Logic
const chatbox = document.getElementById('chatbox');
const input = document.getElementById('input');
const send = document.getElementById('send');

const elizaPatterns = {
    "i feel (.*)": ["Why do you feel {0}?", "Tell me more about feeling {0}."],
    "i am (.*)": ["Why are you {0}?", "How does being {0} affect you?"],
    "why (.*)": ["Good question! Have you considered {0}?", "Why do you think {0}?"],
    "(.*)": ["Interesting! Can you elaborate on {0}?", "Tell me more about {0}."]
};

let tickerData = {};
let responseCache = JSON.parse(localStorage.getItem('cryxbtCache')) || {};

// Fetch ticker data from CoinGecko
async function fetchTickers() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1');
        const data = await response.json();
        tickerData = data.reduce((acc, coin) => {
            acc[coin.symbol.toUpperCase()] = {
                price: coin.current_price,
                change: coin.price_change_percentage_24h || 0,
                volume: coin.total_volume
            };
            return acc;
        }, {});
    } catch (error) {
        console.error('Error fetching tickers:', error);
    }
}

function cryxbtChat(message) {
    if (responseCache[message]) return responseCache[message];

    // Eliza-like pattern matching
    for (let pattern in elizaPatterns) {
        const regex = new RegExp(pattern, 'i');
        const match = message.match(regex);
        if (match) {
            const response = elizaPatterns[pattern][Math.floor(Math.random() * elizaPatterns[pattern].length)];
            const reply = match[1] ? response.replace('{0}', match[1]) : response;
            responseCache[message] = reply;
            localStorage.setItem('cryxbtCache', JSON.stringify(responseCache));
            return reply;
        }
    }

    // Crypto ticker check
    for (let ticker in tickerData) {
        if (message.toUpperCase().includes(ticker)) {
            const data = tickerData[ticker];
            const sentiment = data.change > 0.1 ? 'bullish' : data.change < -0.1 ? 'bearish' : 'neutral';
            const reply = `${ticker}: $${data.price}, ${data.change.toFixed(1)}% change. Sentiment: ${sentiment}`;
            responseCache[message] = reply;
            localStorage.setItem('cryxbtCache', JSON.stringify(responseCache));
            return reply;
        }
    }

    // Fallback random response
    const fallbacks = [
        "Scanning the crypto cosmos... What’s on your mind?",
        "No data yet, but I’m learning! What else can I help with?",
        "The blockchain whispers secrets—tell me more!"
    ];
    const reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    responseCache[message] = reply;
    localStorage.setItem('cryxbtCache', JSON.stringify(responseCache));
    return reply;
}

// Event Listeners
send.onclick = () => {
    const message = input.value.trim();
    if (message) {
        chatbox.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
        const response = cryxbtChat(message);
        chatbox.innerHTML += `<p><strong>Cryxbt:</strong> ${response}</p>`;
        chatbox.scrollTop = chatbox.scrollHeight;
        input.value = '';
    }
};

input.onkeypress = (e) => {
    if (e.key === 'Enter') send.click();
};

// Initial fetch
fetchTickers();
setInterval(fetchTickers, 3600000); // Update every hour