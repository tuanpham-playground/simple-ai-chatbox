const chat = document.getElementById('chat');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');

const messages = [{ 
    role: 'system', 
    content: 'You are a friendly assistant, please give concise answers.' 
}];

const send = async () => {
  const text = input.value.trim();
  if (!text) return;
  
  messages.push({ 
    role: 'user', 
    content: text 
  });
  
  append('user', text);
  input.value = '';
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });
    
    const jsonResponse = await response.json();
    const reply = jsonResponse.reply || '(No response)';
    
    messages.push({ 
        role: 'assistant', 
        content: reply
    });
    append('assistant', reply);
  } catch (e) {
    append('assistant', 'API call error');
  }
}

const append = (role, text) => {
    const div = document.createElement('div');
    div.className = 'msg ' + (role === 'user' ? 'user' : 'bot');
    div.textContent = role.toUpperCase() + ': ' + text;
    
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}
  
sendBtn.addEventListener('click', send);

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) 
    send();
});
